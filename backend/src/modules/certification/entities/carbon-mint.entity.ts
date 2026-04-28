import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('carbon_mints')
export class CarbonMintEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index() @Column({ name: 'device_id', length: 100 }) deviceId: string;
  @Column({ name: 'energy_kwh', type: 'decimal', precision: 18, scale: 6 }) energyKwh: number;
  @Column({ name: 'co2_equivalent', type: 'decimal', precision: 18, scale: 6 }) co2Equivalent: number;
  @Column({ name: 'emission_factor', type: 'decimal', precision: 10, scale: 6 }) emissionFactor: number;
  @Column({ name: 'token_amount', type: 'decimal', precision: 18, scale: 6 }) tokenAmount: number;
  @Column({ name: 'tx_hash', nullable: true, length: 66, type: 'varchar' }) txHash: string | null;
  @Column({ name: 'raw_data_hash', length: 66, type: 'varchar' }) rawDataHash: string;
  @Column({ name: 'validation_status', default: 'PENDING', length: 20, type: 'varchar' }) validationStatus: string;
  @Column({ name: 'confidence_score', type: 'decimal', precision: 5, scale: 4 }) confidenceScore: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
