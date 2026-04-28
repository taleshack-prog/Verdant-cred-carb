export interface UniversalSchema {
  timestamp: string; device_id: string; device_type: string;
  power_kw: number; energy_kwh: number; efficiency: number;
  temperature_c: number; status: 'OK' | 'ERROR' | 'OFFLINE';
  confidence: number; raw_data_hash: string;
}

export interface CarbonMint {
  id: string; deviceId: string; energyKwh: number;
  co2Equivalent: number; tokenAmount: number;
  txHash: string | null; validationStatus: 'PENDING' | 'APPROVED' | 'REJECTED'; createdAt: string;
}

export interface User {
  id: string; email: string; fullName: string;
  role: 'PRODUCER' | 'ADMIN' | 'BUYER'; walletAddress: string | null;
}
