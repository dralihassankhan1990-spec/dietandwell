import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ServicesService } from './services.service';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // NOTE: Admin create/update/delete are intentionally NOT exposed —
  // services are treated as static content managed via the seed data.
  // ServicesService.create/update/remove still exist if admin CRUD is
  // ever re-enabled; add the guarded routes back then.

  @Get()
  @ApiOperation({ summary: 'Get all active services' })
  findAll() {
    return this.servicesService.findAll();
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a single service by slug' })
  findOne(@Param('slug') slug: string) {
    return this.servicesService.findOne(slug);
  }
}
