import { Test, TestingModule } from '@nestjs/testing';
import { SnapshotService } from './snapshot.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { PortfolioSnapshotEntity } from 'src/entities/portfolio-snapshot.entity';
import { PortfolioEntity } from 'src/entities/portfolio.entity';
import { PricesService } from 'src/prices/prices.service';

describe('SnapshotService', () => {
  let service: SnapshotService;

  const mockPortfolioId = 'portfolio-123';
  const today = new Date().toISOString().split('T')[0];

  const mockPortfolio = {
    id: mockPortfolioId,
    name: 'My Crypto Portfolio',
    assets: [
      {
        id: 'asset-123',
        symbol: 'BTC-USD',
        quantity: 0.5,
        buyPrice: 65000,
        type: 'crypto',
      },
    ],
  };

  const mockSnapshot = {
    id: 'snapshot-123',
    totalValue: 35000,
    date: today,
    portfolio: { id: mockPortfolioId },
    createdAt: new Date(),
  };

  const mockSnapshotRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockPortfolioRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
  };

  const mockPricesService = {
    getPrice: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotService,
        {
          provide: getRepositoryToken(PortfolioSnapshotEntity),
          useValue: mockSnapshotRepository,
        },
        {
          provide: getRepositoryToken(PortfolioEntity),
          useValue: mockPortfolioRepository,
        },
        {
          provide: PricesService,
          useValue: mockPricesService,
        },
      ],
    }).compile();

    service = module.get<SnapshotService>(SnapshotService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('saveSnapshot', () => {
    it('✅ should save snapshot if none exists today', async () => {
      mockSnapshotRepository.findOne.mockResolvedValue(null); 
      mockPortfolioRepository.findOne.mockResolvedValue(mockPortfolio);
      mockPricesService.getPrice.mockResolvedValue([
        { symbol: 'BTC-USD', price: 70000, error: null },
      ]);
      mockSnapshotRepository.create.mockReturnValue(mockSnapshot);
      mockSnapshotRepository.save.mockResolvedValue(mockSnapshot);

      await service.saveSnapshot(mockPortfolioId);

      expect(mockSnapshotRepository.save).toHaveBeenCalledTimes(1);
      expect(mockSnapshotRepository.create).toHaveBeenCalledWith({
        totalValue: 35000,
        date: today,
        portfolio: { id: mockPortfolioId },
      });
    });

    it('❌ should skip if snapshot already exists today', async () => {
      mockSnapshotRepository.findOne.mockResolvedValue(mockSnapshot);

      await service.saveSnapshot(mockPortfolioId);

      expect(mockSnapshotRepository.save).not.toHaveBeenCalled(); 
    });

    it('❌ should skip if portfolio has no assets', async () => {
      mockSnapshotRepository.findOne.mockResolvedValue(null);
      mockPortfolioRepository.findOne.mockResolvedValue({
        ...mockPortfolio,
        assets: [],
      });

      await service.saveSnapshot(mockPortfolioId);

      expect(mockSnapshotRepository.save).not.toHaveBeenCalled();
    });

    it('✅ should calculate total value correctly', async () => {
      mockSnapshotRepository.findOne.mockResolvedValue(null);
      mockPortfolioRepository.findOne.mockResolvedValue({
        ...mockPortfolio,
        assets: [
          { symbol: 'BTC-USD', quantity: 0.5 },
          { symbol: 'ETH-USD', quantity: 2 },
        ],
      });
      mockPricesService.getPrice.mockResolvedValue([
        { symbol: 'BTC-USD', price: 70000 },
        { symbol: 'ETH-USD', price: 3500 },
      ]);
      mockSnapshotRepository.create.mockReturnValue(mockSnapshot);
      mockSnapshotRepository.save.mockResolvedValue(mockSnapshot);

      await service.saveSnapshot(mockPortfolioId);

      expect(mockSnapshotRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalValue: 42000, 
        })
      );
    });
  });

  describe('getSnapshots', () => {
    it('✅ should return snapshots for a given range', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockSnapshot]),
      };

      mockSnapshotRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getSnapshots(mockPortfolioId, '1M');

      expect(result).toEqual([
        { date: today, totalValue: 35000 },
      ]);
      expect(mockQueryBuilder.orderBy).toHaveBeenCalledWith('snapshot.date', 'ASC');
    });

    it('✅ should return empty array if no snapshots', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockSnapshotRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const result = await service.getSnapshots(mockPortfolioId, '1M');

      expect(result).toEqual([]);
    });

    it('✅ should use correct days for each range', async () => {
      const mockQueryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      mockSnapshotRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);

      const ranges = ['1D', '1W', '1M', '3M', '1Y', 'ALL'];
      const expectedDays = [1, 7, 30, 90, 365, 1825];

      for (let i = 0; i < ranges.length; i++) {
        await service.getSnapshots(mockPortfolioId, ranges[i]);

        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - expectedDays[i]);
        const expectedFromDate = fromDate.toISOString().split('T')[0];

        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          'snapshot.date >= :fromDate',
          { fromDate: expectedFromDate }
        );

        jest.clearAllMocks();
        mockSnapshotRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      }
    });
  });

  describe('saveAllSnapshots', () => {
    it('✅ should save snapshots for all portfolios', async () => {
      mockPortfolioRepository.find.mockResolvedValue([
        { id: 'portfolio-1', assets: [] },
        { id: 'portfolio-2', assets: [] },
      ]);

      mockSnapshotRepository.findOne.mockResolvedValue(mockSnapshot);

      await service.saveAllSnapshots();

      expect(mockPortfolioRepository.find).toHaveBeenCalledTimes(1);
    });
  });
});