import { Controller, Get, Post, Delete, Patch, Param, Body, Req, Query, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto, AddAssetDto, UpdateAssetDto } from 'src/dto/portfolio.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { SnapshotService } from './snapshot.service';

@UseGuards(AuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService, private readonly snapshotService: SnapshotService){}

  @Get()
  getAllPortfolio(@Req() req: any){
    return this.portfolioService.getAllPortfolio(req.user.sub);
  }

  @Get(':id')
  getSinglePortfolio(@Param('id') id: string, @Req() req: any){
    return this.portfolioService.getSinglePortfolio(id, req.user.sub);
  }

  @Post()
  createPortfolio(@Body() dto: CreatePortfolioDto, @Req() req: any){
     return this.portfolioService.createPortfolio(dto, req.user.sub);
  }

  @Delete(':id')
  deletePortfolio(@Param('id') id: string, @Req() req: any){
    return this.portfolioService.deletePortfolio(id, req.user.sub);
  }

  @Post(':id/assets')
  addAsset(@Param('id') id: string, @Body() dto: AddAssetDto, @Req() req: any){
    return this.portfolioService.addAsset(id, dto, req.user.sub);
  }

  @Patch('assets/:assetId')
  updateAsset(@Param('assetId') assetId: string, @Body() dto: UpdateAssetDto, @Req() req: any){
    return this.portfolioService.updateAsset(assetId, dto, req.user.sub);
  }

  @Delete('assets/:assetId')
  deleteAsset(@Param('assetId') assetId: string, @Req() req: any){
    return this.portfolioService.deleteAsset(assetId, req.user.sub);
  }

  @Post(':id/snapshot')
  saveSnapshot(@Param('id') id: string){
    return this.snapshotService.saveSnapshot(id);
  }

  @Get(':id/snapshots')
  getSnapshots(
    @Param('id') id: string,
    @Query('range') range: string = '1M'
  ){
    return this.snapshotService.getSnapshots(id, range);
  }

}
