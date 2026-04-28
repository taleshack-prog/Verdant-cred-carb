import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@modules/auth/auth.module';
import { UniversalAdapterModule } from '@modules/adapter/adapter.module';
import { CertificationModule } from '@modules/certification/certification.module';
import { OracleModule } from '@modules/oracle/oracle.module';
import { BillingModule } from '@modules/billing/billing.module';
import { BlockchainModule } from '@modules/blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get('DB_USER', 'verdant'),
        password: config.get('DB_PASS', 'verdant_secret'),
        database: config.get('DB_NAME', 'verdant_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: config.get('NODE_ENV') !== 'production',
        logging: config.get('NODE_ENV') === 'development',
      }),
    }),
    AuthModule,
    UniversalAdapterModule,
    CertificationModule,
    OracleModule,
    BillingModule,
    BlockchainModule,
  ],
})
export class AppModule {}
