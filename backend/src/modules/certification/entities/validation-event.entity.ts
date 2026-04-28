import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('validation_events')
export class ValidationEventEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'device_id', length: 100, type: 'varchar' }) deviceId: string;
  @Column({ name: 'reported_energy_kwh', type: 'decimal', precision: 18, scale: 6 }) reportedEnergyKwh: number;
  @Column({ name: 'nasa_irradiance', type: 'decimal', precision: 10, scale: 4, nullable: true }) nasaIrradiance: number | null;
  @Column({ name: 'variance_pct', type: 'decimal', precision: 8, scale: 4, nullable: true }) variancePct: number | null;
  @Column({ name: 'passed', default: false }) passed: boolean;
  @Column({ name: 'rejection_reason', nullable: true, type: 'text', default: null }) rejectionReason: string | null;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
