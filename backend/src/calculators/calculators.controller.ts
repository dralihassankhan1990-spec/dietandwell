import {
  Controller,
  Post,
  Body,
  Get,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CalculatorsService } from './calculators.service';
import { CalculateDto } from './dto/calculate.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Calculators')
@Controller('calculators')
export class CalculatorsController {
  constructor(private readonly calculatorsService: CalculatorsService) {}

  @Post('calculate')
  @ApiOperation({ summary: 'Perform a health calculation (Static - Frontend only)' })
  calculate(@Body() calculateDto: CalculateDto) {
    return this.calculatorsService.calculate(calculateDto);
  }

  @Post('calculate/save')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Perform calculation and save result (requires login - Static - Frontend only)' })
  calculateAndSave(@Body() calculateDto: CalculateDto, @Request() req) {
    calculateDto.saveResult = true;
    return this.calculatorsService.calculate(calculateDto, req.user);
  }

  // NOTE: Calculators are static (frontend-only) - no admin edit/delete endpoints
  // No POST/PATCH/DELETE endpoints for calculator management

  @Get('my-results')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my saved calculation results' })
  @ApiQuery({ name: 'type', required: false })
  getMyResults(@Request() req, @Query('type') type?: string) {
    return this.calculatorsService.getMyResults(req.user.id, type);
  }
}
