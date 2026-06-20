import { Module } from '@nestjs/common';
import { ProvidersModule } from '../infrastructure/providers/providers.module';
import { FlightSearchService } from './use-cases/flight-search.service';
import { FlightSorterService } from './services/flight-sorter.service';
import { FlightFilterService } from './services/flight-filter.service';
import { FlightDeduplicatorService } from '../domain/services/flight-deduplicator.service';
import { SearchController } from '../interface/controllers/search.controller';

@Module({
  imports: [ProvidersModule],
  providers: [
    FlightSearchService,
    FlightSorterService,
    FlightFilterService,
    FlightDeduplicatorService,
  ],
  controllers: [SearchController],
  exports: [FlightSearchService],
})
export class SearchModule {}
