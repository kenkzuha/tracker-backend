import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/users.entity';
import * as dotenv from 'dotenv';

dotenv.config();

export const dbConfig = TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [User],
  ssl: true,  
  migrations: ['dist/migrations/*.js'],
  migrationsRun: false,
});