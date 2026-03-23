import { Module } from '@nestjs/common';
import { PricesService } from './prices.service';
import { PricesController } from './prices.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [JwtModule],
  controllers: [PricesController],
  providers: [PricesService],
  exports: [PricesService]
})
export class PricesModule {}
