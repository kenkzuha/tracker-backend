import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { PortfolioEntity } from './portfolio.entity';

@Entity()
export class AssetEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  symbol: string;

  @Column()
  name: string;

  @Column('decimal', { precision: 18, scale: 8 })
  quantity: number;

  @Column('decimal', { precision: 18, scale: 8 })
  buyPrice: number;

  @Column()
  type: string;

  @ManyToOne(() => PortfolioEntity, portfolio => portfolio.assets, { onDelete: 'CASCADE' })
  portfolio: PortfolioEntity;

  @CreateDateColumn()
  createdAt: Date;

}