import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class BookingReferenceGeneratorService {
  generateReference(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = crypto.randomBytes(3).toString('hex').toUpperCase();
    return `FB-${timestamp}${random}`;
  }
}
