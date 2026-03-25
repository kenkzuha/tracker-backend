import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PortfolioSnapshotEntity } from 'src/entities/portfolio-snapshot.entity';
import { PortfolioEntity } from 'src/entities/portfolio.entity';
import { PricesService } from 'src/prices/prices.service';

@Injectable()
export class SnapshotService {
  private readonly logger = new Logger(SnapshotService.name);
  constructor(
    @InjectRepository(PortfolioSnapshotEntity)
    private snapshotRepository: Repository<PortfolioSnapshotEntity>,
    @InjectRepository(PortfolioEntity)
    private portfolioRepository: Repository<PortfolioEntity>,
    private pricesService: PricesService,
  ){}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async saveAllSnapshots(){
    this.logger.log('Running daily portfolio snapshot...');
    const portfolios = await this.portfolioRepository.find({
      relations: ['assets'],
    });

    for(const portfolio of portfolios){
      await this.saveSnapshot(portfolio.id);
    }
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_MIDNIGHT)
  async cleanOldSnapshots(){
    const cutoff = new Date();
    cutoff.setFullYear(cutoff.getFullYear() - 2);
    const cutOffStr = cutoff.toISOString().split('T')[0];

    await this.snapshotRepository
      .createQueryBuilder()
      .delete()
      .where('date < :cutoff', { cutoff: cutOffStr })
      .execute();
    
      this.logger.log(`Cleaned snapshots older than ${cutOffStr}`);
  }

  async saveSnapshot(portfolioId: string): Promise<void> {
    const today = new Date().toISOString().split('T')[0];

    const existing = await this.snapshotRepository.findOne({
      where: {
        portfolio: { id: portfolioId },
        date: today,
      },
    });

    if(existing) {
      this.logger.log(`Snapshot already exists for ${portfolioId} on ${today}`);
      return;
    }

    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
      relations: ['assets'],
    })

    if(!portfolio || portfolio.assets.length === 0) return;

    const symbols = portfolio.assets.map(a => a.symbol);
    const prices = await this.pricesService.getPrice(symbols);

    let totalValue = 0;
    portfolio.assets.forEach(asset => {
      const price = prices.find((p: any) => p.symbol === asset.symbol);
      if(price && !price.error){
        totalValue += Number(price.price) * Number(asset.quantity);
      }
    });

    const snapshot = this.snapshotRepository.create({
      totalValue,
      date: today,
      portfolio: { id: portfolioId },
    });

    await this.snapshotRepository.save(snapshot);
    this.logger.log(`Snapshot saved for ${portfolioId}: $${totalValue}`);

  }

  async getSnapshots(portfolioId: string, range: string = '1M'){
    const days = this.getRangeDays(range);
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);
    const fromDateStr = fromDate.toISOString().split('T')[0];

    const snapshots = await this.snapshotRepository
      .createQueryBuilder('snapshot')
      .where('snapshot.portfolioId = :portfolioId', { portfolioId })
      .andWhere('snapshot.date >= :fromDate', { fromDate: fromDateStr })
      .orderBy('snapshot.date', 'ASC')
      .getMany();

    return snapshots.map(s => ({
      date: s.date,
      totalValue: Number(s.totalValue),
    }));
  }

  private getRangeDays(range: string): number {
    const map: Record<string, number> = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '1Y': 365,
      'ALL': 1825,
    };
    return map[range] || 30; 
  }
}