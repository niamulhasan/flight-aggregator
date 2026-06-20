import { ApiProperty } from '@nestjs/swagger';
import { Passenger } from '../../domain/value-objects/passenger';

class BookingPassengerResponseDto {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}

export class BookingResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  reference: string;

  @ApiProperty()
  flightId: string;

  @ApiProperty({ type: [BookingPassengerResponseDto] })
  passengers: Passenger[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
