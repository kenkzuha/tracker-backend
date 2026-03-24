import { Test, TestingModule } from '@nestjs/testing';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';

describe('PricesController', () => {
  let controller: PricesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PricesController],
      providers: [
        {
          provide: PricesService,
          useValue: {
            getPrice: jest.fn(),
            getPrices: jest.fn(),
            searchSymbol: jest.fn(),
            getChart: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PricesController>(PricesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
