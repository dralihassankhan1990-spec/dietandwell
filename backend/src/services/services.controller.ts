import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ServicesService } from './services.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '../entities';

@ApiTags('Services')
@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  // @Post() - DISABLED: Services are static (frontend-only)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Create a new service (Admin only)' })
  // create(@Body() createServiceDto: CreateServiceDto) {
  //   return this.servicesService.create(createServiceDto);
  // }

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

  // @Patch(':id') - DISABLED: Services are static (frontend-only)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Update a service (Admin only)' })
  // update(@Param('id') id: string, @Body() updateServiceDto: UpdateServiceDto) {
  //   return this.servicesService.update(id, updateServiceDto);
  // }

  // @Delete(':id') - DISABLED: Services are static (frontend-only)
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  // @ApiBearerAuth()
  // @ApiOperation({ summary: 'Delete a service (Admin only)' })
  // remove(@Param('id') id: string) {
  //   return this.servicesService.remove(id);
  // }
}
