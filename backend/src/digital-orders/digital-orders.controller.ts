import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
  Res,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery, ApiResponse } from '@nestjs/swagger';
import type { Response } from 'express';
import { DigitalOrdersService } from './digital-orders.service';
import { CreateDigitalOrderDto } from './dto/create-digital-order.dto';
import { UpdateDigitalOrderDto } from './dto/update-digital-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { OptionalJwtAuthGuard } from './optional-jwt-auth.guard';
import { UserRole } from '../entities';

@ApiTags('Digital Orders')
@Controller('digital-orders')
export class DigitalOrdersController {
  constructor(private readonly digitalOrdersService: DigitalOrdersService) {}

  @Post()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiOperation({
    summary: 'Request a digital product (public). Attaches the caller when a valid JWT is present.',
  })
  @ApiResponse({ status: 201, description: 'Order requested' })
  create(@Body() dto: CreateDigitalOrderDto, @Req() req: any) {
    return this.digitalOrdersService.create(dto, req.user ?? undefined);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List digital orders (Admin only)' })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'granted', 'rejected'] })
  findAll(@Query('status') status?: string) {
    return this.digitalOrdersService.findAll(status);
  }

  // Declared before :id so it is not swallowed by the param route.
  @Get('mine')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'My digital orders (matched by userId or email)' })
  findMine(@Req() req: any) {
    return this.digitalOrdersService.findMine(req.user);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Grant or reject a digital order (Admin only)' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateDigitalOrderDto) {
    return this.digitalOrdersService.updateStatus(id, dto);
  }

  @Get(':id/download')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Download the digital file. Requires a granted order you own (or admin).',
  })
  @ApiResponse({ status: 403, description: 'Order not granted or not yours' })
  async download(@Param('id') id: string, @Req() req: any, @Res({ passthrough: true }) res: Response) {
    const { stream, filename, contentType } =
      await this.digitalOrdersService.getDownloadStream(id, req.user);
    const safeName = String(filename).replace(/"/g, '');
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${safeName}"`,
    });
    return stream;
  }
}
