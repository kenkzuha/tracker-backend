import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';

describe('PortfolioController', () => {
  let controller: PortfolioController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PortfolioController],
      providers: [
        {
          provide: PortfolioService,
          useValue: {
            getAllPortfolio: jest.fn(),
            getSinglePortfolio: jest.fn(),
            createPortfolio: jest.fn(),
            deletePortfolio: jest.fn(),
            addAsset: jest.fn(),
            updateAsset: jest.fn(),
            deleteAsset: jest.fn(),
          },
        },
        {
          provide: AuthGuard,
          useValue: { canActivate: jest.fn(() => true) }, 
        },
        {
          provide: JwtService,
          useValue: { verifyAsync: jest.fn() }, 
        },
      ],
    }).compile();

    controller = module.get<PortfolioController>(PortfolioController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
