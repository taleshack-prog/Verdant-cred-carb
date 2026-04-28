import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole { PRODUCER = 'PRODUCER', ADMIN = 'ADMIN', BUYER = 'BUYER' }

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Index({ unique: true }) @Column({ length: 255, type: 'varchar' }) email: string;
  @Column({ name: 'password_hash', type: 'varchar' }) passwordHash: string;
  @Column({ name: 'full_name', length: 255, type: 'varchar' }) fullName: string;
  @Column({ type: 'enum', enum: UserRole, default: UserRole.PRODUCER }) role: UserRole;
  @Column({ name: 'wallet_address', nullable: true, length: 42, type: 'varchar' }) walletAddress: string | null;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @Column({ name: 'kyc_verified', default: false }) kycVerified: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
