import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { PortfolioEntity } from './portfolio.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => PortfolioEntity, portfolio => portfolio.user)
  portfolios: PortfolioEntity[];
}