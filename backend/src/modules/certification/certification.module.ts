import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CertificationController } from './certification.controller';
import { CertificationService } from './certification.service';
import { CarbonMintEntity } from './entities/carbon-mint.entity';
import { ValidationEventEntity } from './entities/validation-event.entity';
import { OracleModule } from '@modules/oracle/oracle.module';
import { BlockchainModule } from '@modules/blockchain/blockchain.module';

@Module({
  imports: [TypeOrmModule.forFeature([CarbonMintEntity, ValidationEventEntity]), OracleModule, BlockchainModule],
  controllers: [CertificationController],
  providers: [CertificationService],
  exports: [CertificationService],
})
export class CertificationModule {}
