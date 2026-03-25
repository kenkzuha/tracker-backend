import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { dbConfig } from './db.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { DashboardController } from './dashboard/dashboard.controller';
import { PricesModule } from './prices/prices.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    AuthModule, 
    dbConfig, 
    ConfigModule.forRoot({isGlobal: true}), 
    PricesModule, 
    PortfolioModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController, UsersController, DashboardController],
  providers: [AppService],
})
export class AppModule {}
