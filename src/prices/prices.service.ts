import { Injectable, Logger } from '@nestjs/common';
import YahooFinance from 'yahoo-finance2';

@Injectable()
export class PricesService {
  private readonly yf = new YahooFinance();
  private readonly logger = new Logger(PricesService.name);
  private cache = new Map<string, {data: any; timestamp: number}>();
  private readonly CACHE_TTL = 60 * 1000;

  async getPriceFromCache(symbol: string){
    const upperCaseSymbol = symbol.toUpperCase();
    const cached = this.cache.get(upperCaseSymbol);

    if(cached && Date.now() - cached.timestamp < this.CACHE_TTL){
      return cached.data;
    }

    try {
      const quote = await this.yf.quote(upperCaseSymbol);
      const data = {
        symbol: upperCaseSymbol,
        name: quote.longName || quote.shortName || upperCaseSymbol,
        price: quote.regularMarketPrice,
        change: quote.regularMarketChange,
        changePercent: quote.regularMarketChangePercent,
        high: quote.regularMarketDayHigh,
        low: quote.regularMarketDayLow,
        volume: quote.regularMarketVolume,
        currency: quote.currency,
        marketCap: quote.marketCap,
      };
      
      this.cache.set(upperCaseSymbol, {data, timestamp: Date.now()});
      return data;
    } catch (error) {
      this.logger.error(`Failed to fetch price for ${upperCaseSymbol}`, error);
      throw new Error(`Could not fetch price for symbol: ${upperCaseSymbol}`);
    }
  }

  async getPrice(symbol: string[]){
    const results = await Promise.allSettled(
      symbol.map((symbol) => this.getPriceFromCache(symbol))
    );

    return results.map((result, index) => {
      if (result.status === 'fulfilled') return result.value;
      return { symbol: symbol[index], error: 'Failed to fetch' };
    });
  }

  async searchSymbol(query: string){
    try {
      const results = await this.yf.search(query);
      return results.quotes.filter((q: any) => q.symbol ** q.longname || q.shortname).slice(0, 10).map((query: any) => ({
        symbol: query.symbol,
        name: query.longname || query.shortname,
        type: query.quoteType,
        exchange: query.exchange,
      }));
    } catch (error) {
      this.logger.error(`Search failed for ${query}`, error);
      throw new Error(`Search failed for ${query}`);
    }
  }

  async getChart(symbol:string, range: string = '1M'){
    try {
      const { period1, interval } = this.getRangeConfig(range);

      const chart = await this.yf.chart(symbol.toUpperCase(), {
        period1,
        interval: interval as any,
      });

      return {
        symbol: symbol.toUpperCase(),
        range,
        interval,
        data: chart.quotes.map((q: any) => ({
          date: q.date,
          open: q.open,
          close: q.close,
          high: q.high,
          low: q.low,
          volume: q.volume,
        })),
      };
    } catch (error){
      this.logger.error(`Chart fetch failed for ${symbol}`, error);
      throw new Error(`Chart fetch failed for ${symbol}`);
    }
  }

  private getRangeConfig(range: string): { period1: Date; interval: string } {
    const now = new Date();
    const map: Record<string, { days: number; interval: string }> = {
      '1D':  { days: 1,   interval: '5m'  },
      '1W':  { days: 7,   interval: '1h'  },
      '1M':  { days: 30,  interval: '1d'  },
      '3M':  { days: 90,  interval: '1d'  },
      '1Y':  { days: 365, interval: '1wk' },
      'ALL': { days: 1825, interval: '1mo' }, 
    };

    const config = map[range] || map['1M'];
    const period1 = new Date();
    period1.setDate(now.getDate() - config.days);

    return { period1, interval: config.interval }
  }
}
