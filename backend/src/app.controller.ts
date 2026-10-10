import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  getHealth(): object {
    return this.appService.getHealth();
  }

  @Get('api')
  @ApiOperation({ summary: 'API status endpoint' })
  getApiStatus(): object {
    return {
      status: 'ok',
      message: 'DietAndWell API is running',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
