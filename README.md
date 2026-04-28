# 🌿 Verdant Technologies

Plataforma SaaS de Tokenização de Ativos Ambientais com dMRV

## Stack

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Frontend | Next.js 14 + TailwindCSS | Dashboards |
| Backend | NestJS + TypeScript | API e orquestração |
| IA Adapter | FastAPI + GPT-4o-mini | Normalização universal |
| Contratos | Solidity + Hardhat | ERC-20 na Polygon |
| Banco | PostgreSQL + TimescaleDB | Séries temporais |

## Quick Start

```bash
# 1. Infraestrutura
docker-compose up -d db redis

# 2. Backend
cd backend && npm install && npm run start:dev

# 3. Adapter Python
cd adapter && pip install -r requirements.txt && uvicorn main:app --reload --port 8000

# 4. Smart Contracts (local)
cd smart-contracts && npm install && npx hardhat node

# 5. Frontend
cd frontend && npm install && npm run dev
```

URLs: Frontend :3000 | API :3001 | Swagger :3001/docs | Adapter :8000
