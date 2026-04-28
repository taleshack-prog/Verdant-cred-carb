import {
  Controller, Post, Get, Body, Headers, Query,
  HttpException, HttpStatus, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import * as crypto from 'crypto';
import { UniversalAdapterService } from './adapter.service';
import { ConfigService } from '@nestjs/config';

type DeviceType = 'WEG' | 'FRONIUS' | 'SUNGROW' | 'ABB' | 'HUAWEI' | 'GENERIC';

class ConnectDto {
  @IsString() @IsNotEmpty() device_id: string;
  @IsOptional() @IsEnum(['WEG','FRONIUS','SUNGROW','ABB','HUAWEI','GENERIC']) device_type?: DeviceType;
  @IsObject() credentials: Record<string, unknown>;
}

@ApiTags('Universal Adapter')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('adapter')
export class UniversalAdapterController {
  constructor(
    private readonly service: UniversalAdapterService,
    private readonly config: ConfigService,
  ) {}

  @Post('connect')
  @ApiOperation({ summary: 'Registra um novo inversor/sensor com credenciais criptografadas' })
  connect(@Body() dto: ConnectDto) {
    return this.service.connect(dto.device_id, dto.device_type, dto.credentials);
  }

  @Post('ingest')
  @ApiOperation({ summary: 'Recebe payload bruto e normaliza via IA' })
  async ingest(
    @Body() rawData: unknown,
    @Headers('x-signature') signature?: string,
    @Query('device_id') deviceId?: string,
    @Query('device_type') deviceType?: string,
  ) {
    const secret = this.config.get<string>('SIGNATURE_SECRET');
    if (signature && secret) {
      const expected = crypto.createHmac('sha256', secret).update(JSON.stringify(rawData)).digest('hex');
      if (expected !== signature) throw new HttpException('Assinatura invalida', HttpStatus.UNAUTHORIZED);
    }
    return this.service.normalize(rawData, deviceId, deviceType);
  }

  @Get('devices')
  @ApiOperation({ summary: 'Lista dispositivos conectados' })
  devices() { return this.service.getDevices(); }

  @Get('health')
  @ApiOperation({ summary: 'Verifica conectividade com o motor Python' })
  health() { return { status: 'ok', pythonAdapter: this.config.get('PYTHON_ADAPTER_URL') }; }
}
