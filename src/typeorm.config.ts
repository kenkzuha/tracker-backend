import { DataSource } from 'typeorm';
import { User } from './users/users.entity';
import * as dotenv from 'dotenv'

dotenv.config()

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  migrations: ['src/migrations/*.ts'],
  ssl: true,
});

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source Initialized');
  })
  .catch((err) => {
    console.log('Error during Data Source initialization: ', err);
  });

