import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersController } from './users/users.controller';
import { dbConfig } from './db.config';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { HomepageController } from './homepage/homepage.controller';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from './auth/auth.guard';

@Module({
  imports: [AuthModule, dbConfig, ConfigModule.forRoot({isGlobal: true})],
  controllers: [AppController, UsersController, HomepageController],
  providers: [AppService],
})
export class AppModule {}
