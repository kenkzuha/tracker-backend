import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn } from 'typeorm';
import { UserEntity } from './users.entity';
import { AssetEntity } from './asset.entity';

@Entity()
export class PortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => UserEntity, user => user.portfolios, { onDelete: 'CASCADE', eager: true })
  user: UserEntity;

  @OneToMany(() => AssetEntity, asset => asset.portfolio, { cascade: true })
  assets: AssetEntity[];

  @CreateDateColumn()
  createdAt: Date;
}