import {
  IsString,
  IsInt,
  Min,
  IsOptional,
  IsEnum,
  IsArray,
  IsNumber,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type, Transform } from 'class-transformer';

export enum SortBy {
  PRICE = 'price',
  DURATION = 'duration',
  DEPARTURE = 'departure',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class SearchFlightsDto {
  @ApiProperty({ description: 'Origin IATA code', example: 'DAC' })
  @IsString()
  from: string;

  @ApiProperty({ description: 'Destination IATA code', example: 'DXB' })
  @IsString()
  to: string;

  @ApiProperty({
    description: 'Travel date (YYYY-MM-DD)',
    example: '2026-07-01',
  })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Number of passengers', minimum: 1, example: 2 })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  passengers: number;

  @ApiPropertyOptional({ enum: SortBy, example: SortBy.PRICE })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy;

  @ApiPropertyOptional({ enum: SortOrder, example: SortOrder.ASC })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;

  @ApiPropertyOptional({ description: 'Maximum number of stops', example: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  maxStops?: number;

  @ApiPropertyOptional({
    description: 'List of carrier codes',
    example: ['AA', 'EK'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((s) => s.trim());
    }
    return value;
  })
  carriers?: string[];

  @ApiPropertyOptional({ description: 'Minimum price', example: 200 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minPrice?: number;

  @ApiPropertyOptional({ description: 'Maximum price', example: 500 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  maxPrice?: number;
}
