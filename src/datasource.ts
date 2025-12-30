import { readFileSync } from 'fs';
import 'reflect-metadata';
import { DataSource } from 'typeorm';

const datasource = JSON.parse(
  readFileSync(process.cwd() + '/ormconfig.json', 'utf8'),
);

export const AppDataSource = new DataSource(datasource);
