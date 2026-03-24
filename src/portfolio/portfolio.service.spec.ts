import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioService } from './portfolio.service';
import { PortfolioEntity } from 'src/entities/portfolio.entity';
import { AssetEntity } from 'src/entities/asset.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('PortfolioService', () => {
  let service: PortfolioService;

  const mockUserId = 'user-123';

  const mockPortfolio = {
    id: 'portfolio-123',
    name: 'My Crypto Portfolio',
    user: { id: mockUserId },
    assets: [],
    createdAt: new Date(),
  };

  const mockAsset = {
    id: 'asset-123',
    symbol: 'BTC-USD',
    name: 'Bitcoin',
    quantity: 0.5,
    buyPrice: 65000,
    type: 'crypto',
    portfolio: mockPortfolio,
    createdAt: new Date(),
  };

  const mockPortfolioRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockAssetRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PortfolioService,
        {
          provide: getRepositoryToken(PortfolioEntity),
          useValue: mockPortfolioRepository,
        },
        {
          provide: getRepositoryToken(AssetEntity),
          useValue: mockAssetRepository,
        },
      ],
    }).compile();

    service = module.get<PortfolioService>(PortfolioService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllPortfolio', () => {
    it('✅ should return all portfolios for a user', async () => {
      mockPortfolioRepository.find.mockResolvedValue([mockPortfolio]);

      const result = await service.getAllPortfolio(mockUserId);

      expect(result).toEqual([mockPortfolio]);
      expect(mockPortfolioRepository.find).toHaveBeenCalledWith({
        where: { user: { id: mockUserId } },
        relations: ['assets'],
      });
    });

    it('✅ should return empty array if no portfolios', async () => {
      mockPortfolioRepository.find.mockResolvedValue([]);

      const result = await service.getAllPortfolio(mockUserId);

      expect(result).toEqual([]);
    });
  });

  describe('getSinglePortfolio', () => {
    it('✅ should return a portfolio by id', async () => {
      mockPortfolioRepository.findOne.mockResolvedValue(mockPortfolio);

      const result = await service.getSinglePortfolio('portfolio-123', mockUserId);

      expect(result).toEqual(mockPortfolio);
    });

    it('❌ should throw NotFoundException if portfolio not found', async () => {
      mockPortfolioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.getSinglePortfolio('wrong-id', mockUserId)
      ).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user does not own portfolio', async () => {
      mockPortfolioRepository.findOne.mockResolvedValue({
        ...mockPortfolio,
        user: { id: 'different-user' },
      });

      await expect(
        service.getSinglePortfolio('portfolio-123', mockUserId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('createPortfolio', () => {
    it('✅ should create a portfolio successfully', async () => {
      mockPortfolioRepository.create.mockReturnValue(mockPortfolio);
      mockPortfolioRepository.save.mockResolvedValue(mockPortfolio);

      const result = await service.createPortfolio(
        { name: 'My Crypto Portfolio' },
        mockUserId,
      );

      expect(result).toEqual(mockPortfolio);
      expect(mockPortfolioRepository.create).toHaveBeenCalledWith({
        name: 'My Crypto Portfolio',
        user: { id: mockUserId },
      });
      expect(mockPortfolioRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletePortfolio', () => {
    it('✅ should delete a portfolio successfully', async () => {
      mockPortfolioRepository.findOne.mockResolvedValue(mockPortfolio);
      mockPortfolioRepository.remove.mockResolvedValue(mockPortfolio);

      const result = await service.deletePortfolio('portfolio-123', mockUserId);

      expect(result).toEqual({ message: 'Portfolio deleted successfully' });
      expect(mockPortfolioRepository.remove).toHaveBeenCalledTimes(1);
    });

    it('❌ should throw NotFoundException if portfolio not found', async () => {
      mockPortfolioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deletePortfolio('wrong-id', mockUserId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('addAsset', () => {
    const addAssetDto = {
      symbol: 'BTC-USD',
      name: 'Bitcoin',
      quantity: 0.5,
      buyPrice: 65000,
      type: 'crypto',
    };

    it('✅ should add an asset to a portfolio', async () => {
      mockPortfolioRepository.findOne.mockResolvedValue(mockPortfolio);
      mockAssetRepository.create.mockReturnValue(mockAsset);
      mockAssetRepository.save.mockResolvedValue(mockAsset);

      const result = await service.addAsset('portfolio-123', addAssetDto, mockUserId);

      expect(result).toBeDefined();
      expect(mockAssetRepository.save).toHaveBeenCalledTimes(1);
    });

    it('❌ should throw NotFoundException if portfolio not found', async () => {
      mockPortfolioRepository.findOne.mockResolvedValue(null);

      await expect(
        service.addAsset('wrong-id', addAssetDto, mockUserId)
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateAsset', () => {
    it('✅ should update an asset successfully', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetRepository.save.mockResolvedValue({
        ...mockAsset,
        quantity: 1.5,
        buyPrice: 60000,
      });

      const result = await service.updateAsset(
        'asset-123',
        { quantity: 1.5, buyPrice: 60000 },
        mockUserId,
      );

      expect(result.quantity).toBe(1.5);
      expect(result.buyPrice).toBe(60000);
    });

    it('❌ should throw NotFoundException if asset not found', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateAsset('wrong-id', { quantity: 1, buyPrice: 60000 }, mockUserId)
      ).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user does not own asset', async () => {
      mockAssetRepository.findOne.mockResolvedValue({
        ...mockAsset,
        portfolio: {
          ...mockPortfolio,
          user: { id: 'different-user' }, 
        },
      });

      await expect(
        service.updateAsset('asset-123', { quantity: 1, buyPrice: 60000 }, mockUserId)
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteAsset', () => {
    it('✅ should delete an asset successfully', async () => {
      mockAssetRepository.findOne.mockResolvedValue(mockAsset);
      mockAssetRepository.remove.mockResolvedValue(mockAsset);

      const result = await service.deleteAsset('asset-123', mockUserId);

      expect(result).toEqual({ message: 'Asset deleted successfully' });
      expect(mockAssetRepository.remove).toHaveBeenCalledTimes(1);
    });

    it('❌ should throw NotFoundException if asset not found', async () => {
      mockAssetRepository.findOne.mockResolvedValue(null);

      await expect(
        service.deleteAsset('wrong-id', mockUserId)
      ).rejects.toThrow(NotFoundException);
    });

    it('❌ should throw ForbiddenException if user does not own asset', async () => {
      mockAssetRepository.findOne.mockResolvedValue({
        ...mockAsset,
        portfolio: {
          ...mockPortfolio,
          user: { id: 'different-user' },
        },
      });

      await expect(
        service.deleteAsset('asset-123', mockUserId)
      ).rejects.toThrow(ForbiddenException);
    });
  });
});