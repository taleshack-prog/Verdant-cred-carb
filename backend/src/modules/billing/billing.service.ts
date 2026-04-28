import { Injectable } from '@nestjs/common';

export enum SubscriptionTier { SEED = 'SEED', HARVEST = 'HARVEST', ECOSYSTEM = 'ECOSYSTEM' }
const TAKE_RATES: Record<SubscriptionTier, number> = { SEED: 0.15, HARVEST: 0.10, ECOSYSTEM: 0.05 };

@Injectable()
export class BillingService {
  getTakeRate(tier: SubscriptionTier): number { return TAKE_RATES[tier]; }

  calculateRevenueShare(gross: number, tier: SubscriptionTier) {
    const fee = gross * this.getTakeRate(tier);
    return { netForProducer: gross - fee, platformFee: fee };
  }
}
