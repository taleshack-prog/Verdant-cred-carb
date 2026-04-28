import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

const VERDANT_CREDIT_ABI = [
  'function mint(address to, uint256 amount, bytes32 auditHash) external',
  'function burnForRetirement(uint256 amount, string calldata reason) external',
  'event Transfer(address indexed from, address indexed to, uint256 value)',
];

@Injectable()
export class BlockchainService implements OnModuleInit {
  private readonly logger = new Logger(BlockchainService.name);
  private provider: ethers.JsonRpcProvider;
  private wallet: ethers.Wallet;
  private creditContract: ethers.Contract;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    try {
      this.provider = new ethers.JsonRpcProvider(this.config.get('POLYGON_RPC_URL', 'https://polygon-rpc.com'));
      this.wallet = new ethers.Wallet(this.config.getOrThrow('DEPLOYER_PRIVATE_KEY'), this.provider);
      this.creditContract = new ethers.Contract(this.config.getOrThrow('VERDANT_CREDIT_ADDRESS'), VERDANT_CREDIT_ABI, this.wallet);
      this.logger.log('Blockchain service inicializado na Polygon');
    } catch (err) {
      this.logger.warn('Blockchain service nao inicializado (modo dev sem chaves): ' + err);
    }
  }

  async mintCarbonCredit(params: { deviceId: string; amount: number; auditHash: string }): Promise<string> {
    if (!this.creditContract) throw new Error('Blockchain service nao inicializado');
    const amountWei = ethers.parseEther(params.amount.toFixed(18));
    const hashBytes = ethers.zeroPadBytes(ethers.toUtf8Bytes(params.auditHash), 32);
    const tx = await this.creditContract.mint(this.wallet.address, amountWei, hashBytes);
    const receipt = await tx.wait();
    this.logger.log(`Mint confirmado: TX=${receipt.hash}`);
    return receipt.hash;
  }
}
