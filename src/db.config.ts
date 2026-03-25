import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from './entities/users.entity';
import * as dotenv from 'dotenv';
import { PortfolioEntity } from './entities/portfolio.entity';
import { AssetEntity } from './entities/asset.entity';
import { PortfolioSnapshotEntity } from './entities/portfolio-snapshot.entity';

dotenv.config();

export const dbConfig = TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [UserEntity, PortfolioEntity, AssetEntity, PortfolioSnapshotEntity],
  ssl: true,  
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
});