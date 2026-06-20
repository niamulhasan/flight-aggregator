import { ApiProperty } from '@nestjs/swagger';

export class Passenger {
  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;
}
