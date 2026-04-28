import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Billing')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('billing')
export class BillingController {
  @Get('plans')
  getPlans() {
    return [
      { tier: 'SEED', name: 'Plano Semente', monthlyPrice: 29.90, takeRate: '15%', target: 'Residencial / Micro-Agro' },
      { tier: 'HARVEST', name: 'Plano Safra', monthlyPrice: 199.00, takeRate: '10%', target: 'PMEs / Fazendas Medias' },
      { tier: 'ECOSYSTEM', name: 'Plano Ecossistema', monthlyPrice: null, takeRate: '5%', target: 'Cooperativas / Associacoes' },
    ];
  }
}
