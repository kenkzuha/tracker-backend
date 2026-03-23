import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { PortfolioEntity } from 'src/entities/portfolio.entity';
import { AssetEntity } from 'src/entities/asset.entity';
import { CreatePortfolioDto, AddAssetDto, UpdateAssetDto } from 'src/dto/portfolio.dto';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(PortfolioEntity)
    private portfolioRepository: Repository<PortfolioEntity>,
    @InjectRepository(AssetEntity)
    private assetRepository: Repository<AssetEntity>
  ){}

  async getAllPortfolio(userId: string){
    return this.portfolioRepository.find({
      where: { user: { id: userId } },
      relations: ['assets'],
    })
  }

  async getSinglePortfolio(id: string, userId: string){
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
      relations: ['assets', 'user'],
    });

    if(!portfolio) throw new NotFoundException('Portfolio Not Found');
    if (portfolio.user.id !== userId) throw new ForbiddenException('Access Denied');

    return portfolio;
  }

  async createPortfolio(dto: CreatePortfolioDto, userId: string){
    const portfolio = this.portfolioRepository.create({
      name: dto.name,
      user: { id: userId },
    });

    return this.portfolioRepository.save(portfolio);
  }

  async deletePortfolio(id: string, userId: string){
    const portfolio = await this.getSinglePortfolio(id, userId);
    await this.portfolioRepository.remove(portfolio);
    return { message: 'Portfolio deleted successfully' };
  }

  async addAsset(portfolioId: string, dto: AddAssetDto, userId: string){
    const portfolio = await this.getSinglePortfolio(portfolioId, userId);

    const asset = this.assetRepository.create({
      ...dto,
      portfolio,
    });

    const saved = await this.assetRepository.save(asset);
    return {
      id: saved.id,
      symbol: saved.symbol,
      name: saved.name,
      quantity: saved.quantity,
      buyPrice: saved.buyPrice,
      type: saved.type,
      portfolioId: portfolioId,
      createdAt: saved.createdAt,
    };
  }

  async updateAsset(assetId: string, dto: UpdateAssetDto, userId: string){
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
      relations: ['portfolio', 'portfolio.user'],
    })

    if(!asset) throw new NotFoundException('Asset not Found');
    if(asset.portfolio.user.id !== userId) throw new ForbiddenException('Access denied');

    asset.quantity = dto.quantity;
    asset.buyPrice = dto.buyPrice;

    return this.assetRepository.save(asset);
  }

  async deleteAsset(assetId: string, userId: string){
    const asset = await this.assetRepository.findOne({
      where: { id: assetId },
      relations: ['portfolio', 'portfolio.user']
    });

    if(!asset) throw new NotFoundException('Asset not Found');
    if(asset.portfolio.user.id !== userId) throw new ForbiddenException('Access denied');

    await this.assetRepository.remove(asset);
    return { message: 'Asset deleted successfully' };
  }
}
