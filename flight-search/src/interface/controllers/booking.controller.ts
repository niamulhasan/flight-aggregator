import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiParam,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { BookingService } from '../../application/use-cases/booking.service';
import { CreateBookingDto } from '../dtos/create-booking.dto';
import { BookingResponseDto } from '../dtos/booking-response.dto';

@ApiTags('bookings')
@Controller('api/bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new booking' })
  @ApiBody({ type: CreateBookingDto })
  @ApiCreatedResponse({
    description: 'Booking created successfully',
    type: BookingResponseDto,
  })
  async createBooking(
    @Body(ValidationPipe) dto: CreateBookingDto,
  ): Promise<BookingResponseDto> {
    return this.bookingService.createBooking(dto);
  }

  @Get(':reference')
  @ApiOperation({ summary: 'Get a booking by reference' })
  @ApiParam({ name: 'reference', description: 'Booking reference' })
  @ApiOkResponse({
    description: 'Booking found',
    type: BookingResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Booking not found' })
  async getBooking(
    @Param('reference') reference: string,
  ): Promise<BookingResponseDto> {
    return this.bookingService.getBookingByReference(reference);
  }
}
