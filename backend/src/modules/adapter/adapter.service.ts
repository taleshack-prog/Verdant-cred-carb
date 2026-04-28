import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { firstValueFrom } from 'rxjs';

type DeviceType = 'WEG' | 'FRONIUS' | 'SUNGROW' | 'ABB' | 'HUAWEI' | 'GENERIC';

interface StoredDevice { type: DeviceType; encryptedCreds: string; }

export interface UniversalSchema {
  timestamp: string;
  device_id: string;
  device_type: string;
  power_kw: number;
  energy_kwh: number;
  efficiency: number;
  temperature_c: number;
  status: 'OK' | 'ERROR' | 'OFFLINE';
  confidence: number;
  raw_data_hash: string;
  flagged_for_review: boolean;
}

@Injectable()
export class UniversalAdapterService {
  private readonly logger = new Logger(UniversalAdapterService.name);
  private readonly devices = new Map<string, StoredDevice>();
  private readonly key: Buffer;
  private readonly IV_LENGTH = 16;
  private readonly pythonAdapterUrl: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    const hexKey = config.get<string>('ENCRYPTION_KEY', '0'.repeat(64));
    this.key = Buffer.from(hexKey, 'hex');
    this.pythonAdapterUrl = config.get('PYTHON_ADAPTER_URL', 'http://localhost:8000');
  }

  private encrypt(text: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv('aes-256-cbc', this.key, iv);
    let enc = cipher.update(text, 'utf8', 'hex');
    enc += cipher.final('hex');
    return `${iv.toString('hex')}:${enc}`;
  }

  private decrypt(value: string): string {
    const [ivHex, encHex] = value.split(':');
    const iv = Buffer.from(ivHex!, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', this.key, iv);
    const decBuffer = Buffer.concat([
      decipher.update(Buffer.from(encHex!, 'hex')),
      decipher.final(),
    ]);
    return decBuffer.toString('utf8');
  }

  connect(deviceId: string, deviceType: DeviceType = 'GENERIC', credentials: Record<string, unknown>) {
    const encryptedCreds = this.encrypt(JSON.stringify(credentials));
    this.devices.set(deviceId, { type: deviceType, encryptedCreds });
    this.logger.log(`Dispositivo conectado: ${deviceId} (${deviceType})`);
    return { success: true, device_id: deviceId, device_type: deviceType };
  }

  async normalize(rawData: unknown, deviceId?: string, deviceType?: string): Promise<UniversalSchema> {
    try {
      const response = await firstValueFrom(
        this.http.post<UniversalSchema>(
          `${this.pythonAdapterUrl}/normalize`,
          { data: rawData, device_id: deviceId || 'unknown', device_type: deviceType },
          { timeout: 15000 },
        ),
      );
      const { normalized, confidence, flagged_for_review, raw_data_hash } = response.data as any;
      this.logger.log(`Normalizado: ${deviceId} | confianca: ${confidence}`);
      return { ...normalized, flagged_for_review, raw_data_hash };
    } catch (error: any) {
      this.logger.error(`Falha na normalizacao: ${error.message}`);
      return {
        timestamp: new Date().toISOString(),
        device_id: deviceId || 'unknown',
        device_type: deviceType || 'GENERIC',
        power_kw: 0, energy_kwh: 0, efficiency: 0, temperature_c: 0,
        status: 'ERROR', confidence: 0,
        raw_data_hash: '0x' + crypto.createHash('sha256').update(JSON.stringify(rawData)).digest('hex'),
        flagged_for_review: true,
      };
    }
  }

  getDevices() { return Array.from(this.devices.entries()).map(([id, d]) => ({ id, type: d.type })); }
}
