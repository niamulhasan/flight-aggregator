import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

interface FlightData {
  carrier: string;
  flightNo: string;
  depart: Date | string;
}

@Injectable()
export class FlightIdGeneratorService {
  generateFlightId(flightData: FlightData): string {
    // Round depart time to nearest minute to ensure consistency
    const departDate = new Date(flightData.depart);
    departDate.setSeconds(0, 0);

    const dataString = `${flightData.carrier}-${flightData.flightNo}-${departDate.toISOString()}`;

    return crypto
      .createHash('sha256')
      .update(dataString)
      .digest('hex')
      .slice(0, 32); // 32-char hex string
  }
}
