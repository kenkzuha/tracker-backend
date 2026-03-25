import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioEntity } from 'src/entities/portfolio.entity';
import { AssetEntity } from 'src/entities/asset.entity';
import { JwtModule } from '@nestjs/jwt';
import { PortfolioSnapshotEntity } from 'src/entities/portfolio-snapshot.entity';
import { ScheduleModule } from '@nestjs/schedule';
import { PricesModule } from 'src/prices/prices.module';
import { SnapshotService } from './snapshot.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PortfolioEntity,
      AssetEntity, 
      PortfolioSnapshotEntity
    ]), 
    JwtModule, 
    ScheduleModule.forRoot(),
    PricesModule,
  ],
  providers: [PortfolioService, SnapshotService],
  controllers: [PortfolioController],
  exports: [PortfolioService, SnapshotService]
})
export class PortfolioModule {}
