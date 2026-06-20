import { Controller, Get, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { FlightSearchService } from '../../application/use-cases/flight-search.service';
import { SearchFlightsDto } from '../dtos/search-flights.dto';
import { SearchResponseDto } from '../dtos/search-response.dto';

@ApiTags('flights')
@Controller('api/flights')
export class SearchController {
  constructor(private readonly searchService: FlightSearchService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search flights across multiple providers' })
  @ApiOkResponse({
    description: 'Search results with completeness information',
    type: SearchResponseDto,
  })
  async search(
    @Query(ValidationPipe) params: SearchFlightsDto,
  ): Promise<SearchResponseDto> {
    return this.searchService.searchFlights(params);
  }
}
