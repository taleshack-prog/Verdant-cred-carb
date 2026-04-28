import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNumber, Min, IsDateString, IsObject } from 'class-validator';
import { CertificationService } from './certification.service';

class CertifyDto {
  @IsString() deviceId: string;
  @IsNumber() @Min(0) energyKwh: number;
  @IsNumber() latitude: number;
  @IsNumber() longitude: number;
  @IsDateString() timestamp: string;
  @IsObject() rawData: Record<string, unknown>;
  @IsNumber() @Min(0) confidenceScore: number;
}

@ApiTags('Certification')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('certification')
export class CertificationController {
  constructor(private readonly svc: CertificationService) {}

  @Post('process')
  @ApiOperation({ summary: 'Pipeline dMRV completo: valida e minta token de carbono' })
  process(@Body() dto: CertifyDto) { return this.svc.processCertification(dto); }
}
