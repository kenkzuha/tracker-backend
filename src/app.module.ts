import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { AppDataSource } from './datasource';
import { readFileSync } from 'fs';

const datasource = JSON.parse(
  readFileSync(process.cwd() + '/ormconfig.json', 'utf8'),
) as TypeOrmModuleOptions;

@Module({
  imports: [
    TypeOrmModule.forRoot(datasource),
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule { }
