import { ethers } from 'hardhat';

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log('\nVerdant - Deploy iniciado');
  console.log(`Deployer: ${deployer.address}`);

  const VerdantCredit = await ethers.getContractFactory('VerdantCredit');
  const credit = await VerdantCredit.deploy(deployer.address);
  await credit.waitForDeployment();
  const creditAddr = await credit.getAddress();
  console.log(`VerdantCredit: ${creditAddr}`);

  const AssetRegistry = await ethers.getContractFactory('AssetRegistry');
  const registry = await AssetRegistry.deploy(deployer.address);
  await registry.waitForDeployment();
  const registryAddr = await registry.getAddress();
  console.log(`AssetRegistry: ${registryAddr}`);

  // USDC na Polygon Mainnet
  const USDC_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';
  const CarbonCreditPool = await ethers.getContractFactory('CarbonCreditPool');
  const pool = await CarbonCreditPool.deploy(USDC_POLYGON, 1000, deployer.address);
  await pool.waitForDeployment();
  const poolAddr = await pool.getAddress();
  console.log(`CarbonCreditPool: ${poolAddr}`);

  console.log('\n--- Adicione ao seu .env ---');
  console.log(`VERDANT_CREDIT_ADDRESS=${creditAddr}`);
  console.log(`ASSET_REGISTRY_ADDRESS=${registryAddr}`);
  console.log(`POOL_ADDRESS=${poolAddr}`);
}

main().catch((err) => { console.error('Deploy falhou:', err); process.exit(1); });
