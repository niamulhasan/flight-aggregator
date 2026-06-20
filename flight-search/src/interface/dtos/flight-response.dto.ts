import { ApiProperty } from '@nestjs/swagger';

export class FlightResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  carrier: string;

  @ApiProperty()
  flightNo: string;

  @ApiProperty()
  from: string;

  @ApiProperty()
  to: string;

  @ApiProperty()
  depart: string;

  @ApiProperty()
  arrive: string;

  @ApiProperty()
  stops: number;

  @ApiProperty()
  price: number;

  @ApiProperty()
  currency: string;

  @ApiProperty()
  providers: string[];
}
