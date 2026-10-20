import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth(): object {
    return {
      status: 'healthy',
      service: 'DietAndWell API',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    };
  }
}
