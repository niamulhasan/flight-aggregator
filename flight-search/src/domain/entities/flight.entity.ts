import { Entity, PrimaryColumn, Column } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Flight {
  @PrimaryColumn()
  @ApiProperty()
  id: string; // Stable flight identifier (hash)

  @Column()
  @ApiProperty()
  carrier: string;

  @Column()
  @ApiProperty()
  flightNo: string;

  @Column()
  @ApiProperty()
  from: string; // IATA code

  @Column()
  @ApiProperty()
  to: string; // IATA code

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  depart: Date;

  @Column({ type: 'timestamptz' })
  @ApiProperty()
  arrive: Date;

  @Column()
  @ApiProperty()
  stops: number;

  @Column({ type: 'decimal' })
  @ApiProperty()
  price: number;

  @Column()
  @ApiProperty()
  currency: string;

  @Column('simple-array')
  @ApiProperty()
  providers: string[];

  @Column('jsonb', { nullable: true })
  @ApiProperty()
  providerData: Record<string, any>;

  // Returns duration in minutes
  getDuration(): number {
    return (this.arrive.getTime() - this.depart.getTime()) / (1000 * 60);
  }

  // Comparison logic for deduplication
  isSameFlight(other: Flight): boolean {
    return this.id === other.id;
  }
}
