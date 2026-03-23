import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv'
import { UserEntity } from './entities/users.entity';
import { PortfolioEntity } from './entities/portfolio.entity';
import { AssetEntity } from './entities/asset.entity';

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  migrations: ['src/migrations/*.ts'],
  ssl: true,
  entities: [UserEntity, PortfolioEntity, AssetEntity],
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source Initialized');
  })
  .catch((err) => {
    console.log('Error during Data Source initialization: ', err);
  });

