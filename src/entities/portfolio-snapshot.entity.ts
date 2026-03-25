import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from "typeorm";
import { PortfolioEntity } from "./portfolio.entity";

@Entity('portfolio_snapshot')
export class PortfolioSnapshotEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('decimal', { precision: 18, scale: 2 })
  totalValue: number;

  @Column({ type: 'date' })
  date: string;

  @ManyToOne(() => PortfolioEntity, { onDelete: 'CASCADE' })
  portfolio: PortfolioEntity;

  @CreateDateColumn()
  createdAt: Date;
}