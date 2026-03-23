import { IsNumber, IsPositive, IsEnum, IsString, IsNotEmpty } from "class-validator";

export class CreatePortfolioDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class AddAssetDto {
  @IsString()
  @IsNotEmpty()
  symbol: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @IsNumber()
  @IsNotEmpty()
  buyPrice: number;

  @IsEnum(['crypto', 'stock', 'idx'])
  type: string;
}

export class UpdateAssetDto {
  @IsNumber()
  @IsPositive()
  quantity: number;

  @IsNumber()
  @IsPositive()
  buyPrice: number;
}