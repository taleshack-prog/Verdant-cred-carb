import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { CarbonMintEntity } from './entities/carbon-mint.entity';
import { ValidationEventEntity } from './entities/validation-event.entity';
import { OracleService } from '@modules/oracle/oracle.service';
import { BlockchainService } from '@modules/blockchain/blockchain.service';

// Fator de emissao da rede eletrica brasileira (MCTI/IPCC): ~0.0817 tCO2/MWh = 0.0000817 tCO2/kWh
const BRAZIL_EMISSION_FACTOR = 0.0000817;
const MAX_VARIANCE_PCT = 5.0;

@Injectable()
export class CertificationService {
  private readonly logger = new Logger(CertificationService.name);

  constructor(
    @InjectRepository(CarbonMintEntity) private readonly mintRepo: Repository<CarbonMintEntity>,
    @InjectRepository(ValidationEventEntity) private readonly validationRepo: Repository<ValidationEventEntity>,
    private readonly oracleService: OracleService,
    private readonly blockchainService: BlockchainService,
  ) {}

  async processCertification(params: {
    deviceId: string; energyKwh: number; latitude: number; longitude: number;
    timestamp: string; rawData: Record<string, unknown>; confidenceScore: number;
  }): Promise<CarbonMintEntity> {
    const { deviceId, energyKwh, latitude, longitude, timestamp, rawData, confidenceScore } = params;
    this.logger.log(`Iniciando certificacao: ${deviceId} | ${energyKwh} kWh`);

    const validation = await this.validateNasa({ deviceId, energyKwh, latitude, longitude, timestamp });
    if (!validation.passed) throw new BadRequestException(`dMRV falhou: ${validation.rejectionReason}`);

    const co2Equivalent = energyKwh * BRAZIL_EMISSION_FACTOR;
    const rawDataHash = '0x' + crypto.createHash('sha256').update(JSON.stringify(rawData)).digest('hex');

    const mint = await this.mintRepo.save(this.mintRepo.create({
      deviceId, energyKwh, co2Equivalent,
      emissionFactor: BRAZIL_EMISSION_FACTOR,
      tokenAmount: co2Equivalent, rawDataHash,
      validationStatus: 'PENDING', confidenceScore,
    }));

    try {
      const txHash = await this.blockchainService.mintCarbonCredit({ deviceId, amount: co2Equivalent, auditHash: rawDataHash });
      mint.txHash = txHash;
      mint.validationStatus = 'APPROVED';
      await this.mintRepo.save(mint);
      this.logger.log(`Token mintado: TX=${txHash} | CO2e=${co2Equivalent.toFixed(6)}t`);
    } catch (err) {
      mint.validationStatus = 'REJECTED';
      await this.mintRepo.save(mint);
      throw err;
    }

    return mint;
  }

  private async validateNasa(p: { deviceId: string; energyKwh: number; latitude: number; longitude: number; timestamp: string }) {
    const irradiance = await this.oracleService.getSolarIrradiance({ latitude: p.latitude, longitude: p.longitude, date: p.timestamp.substring(0, 10) });
    let variancePct: number | null = null, passed = true, rejectionReason: string | null = null;

    if (irradiance !== null) {
      variancePct = Math.abs((p.energyKwh - irradiance) / (irradiance || 1)) * 100;
      if (variancePct > MAX_VARIANCE_PCT) { passed = false; rejectionReason = `Variancia ${variancePct.toFixed(2)}% excede ${MAX_VARIANCE_PCT}%`; }
    } else {
      this.logger.warn(`NASA POWER indisponivel para ${p.deviceId}`);
    }

    await this.validationRepo.save(this.validationRepo.create({
      deviceId: p.deviceId, reportedEnergyKwh: p.energyKwh, nasaIrradiance: irradiance, variancePct, passed, rejectionReason,
    }));

    return { passed, variancePct, rejectionReason };
  }
}
