import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class OracleService {
  private readonly logger = new Logger(OracleService.name);
  private readonly nasaUrl: string;

  constructor(private readonly http: HttpService, private readonly config: ConfigService) {
    this.nasaUrl = config.get('NASA_POWER_BASE_URL', 'https://power.larc.nasa.gov/api/temporal/daily/point');
  }

  async getSolarIrradiance(params: { latitude: number; longitude: number; date: string }): Promise<number | null> {
    const d = params.date.replace(/-/g, '');
    const url = `${this.nasaUrl}?parameters=ALLSKY_SFC_SW_DWN&community=RE&longitude=${params.longitude}&latitude=${params.latitude}&start=${d}&end=${d}&format=JSON`;
    try {
      const res = await firstValueFrom(this.http.get(url, { timeout: 10000 }));
      const val = res.data?.properties?.parameter?.ALLSKY_SFC_SW_DWN?.[d];
      if (val === undefined || val === -999) return null;
      this.logger.log(`NASA POWER: ${val} kWh/m2/dia`);
      return val;
    } catch (err: any) {
      this.logger.error(`NASA POWER falhou: ${err.message}`);
      return null;
    }
  }
}
