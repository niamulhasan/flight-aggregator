import { ApiProperty } from '@nestjs/swagger';
import { FlightResponseDto } from './flight-response.dto';

class SearchMetaProvidersDto {
  @ApiProperty()
  available: string[];

  @ApiProperty()
  success: string[];

  @ApiProperty()
  failed: string[];
}

class SearchMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  providers: SearchMetaProvidersDto;

  @ApiProperty()
  completeness: string;

  @ApiProperty()
  timestamp: string;
}

export class SearchResponseDto {
  @ApiProperty({ type: [FlightResponseDto] })
  flights: FlightResponseDto[];

  @ApiProperty()
  meta: SearchMetaDto;
}
