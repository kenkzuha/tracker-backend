import { Controller, Get, Param, Query } from '@nestjs/common';
import { PricesService } from './prices.service';

@Controller('prices')
export class PricesController {
  constructor(private readonly pricesService: PricesService){}

  @Get('quote/:symbol')
  getPriceFromCache(@Param('symbol') symbol: string){
    return this.pricesService.getPriceFromCache(symbol);
  }

  @Get('quotes')
  getPrice(@Query('symbol') symbol: string){
    const symbolList = symbol.split(',').map((symbol) => symbol.trim());
    return this.pricesService.getPrice(symbolList);
  }

  @Get('search')
  searchSymbol(@Query('q') query: string){
    return this.pricesService.searchSymbol(query);
  }

  @Get('chart/:symbol')
  getChart(@Param('symbol') symbol: string, @Query('range') range: string = '1M'){
    return this.pricesService.getChart(symbol, range);
  }
}
