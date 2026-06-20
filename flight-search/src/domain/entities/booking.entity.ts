import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Passenger } from '../value-objects/passenger';

@Entity()
export class Booking {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty()
  id: string;

  @Column({ unique: true })
  @ApiProperty()
  reference: string;

  @Column()
  @ApiProperty()
  flightId: string;

  @Column('jsonb')
  @ApiProperty({ type: [Passenger] })
  passengers: Passenger[];

  @CreateDateColumn()
  @ApiProperty()
  createdAt: Date;

  @UpdateDateColumn()
  @ApiProperty()
  updatedAt: Date;
}
