import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { OracleService } from './oracle.service';

@Module({ imports: [HttpModule], providers: [OracleService], exports: [OracleService] })
export class OracleModule {}
