import { IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePassengerDto {
  @ApiProperty({ example: 'John' })
  @IsString()
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @IsString()
  lastName: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  email: string;
}

export class CreateBookingDto {
  @ApiProperty({ description: 'Stable flight identifier' })
  @IsString()
  flightId: string;

  @ApiProperty({ type: [CreatePassengerDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePassengerDto)
  passengers: CreatePassengerDto[];
}
