import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioEntity } from 'src/entities/portfolio.entity';
import { AssetEntity } from 'src/entities/asset.entity';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [TypeOrmModule.forFeature([PortfolioEntity, AssetEntity]), JwtModule],
  providers: [PortfolioService],
  controllers: [PortfolioController],
  exports: [PortfolioService]
})
export class PortfolioModule {}
