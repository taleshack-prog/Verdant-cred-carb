# SCHEMA_MASTER - Verdant Technologies
> Documento vivo de especificacao tecnica. Atualizado: 2026-04-27

## Schema Universal (Saida do Adapter)

```json
{
  "timestamp": "2026-04-27T10:30:00Z",
  "device_id": "INV-WEG-001",
  "device_type": "WEG",
  "power_kw": 12.5,
  "energy_kwh": 450.2,
  "efficiency": 0.98,
  "temperature_c": 42.5,
  "status": "OK",
  "confidence": 0.99,
  "raw_data_hash": "0x7f8e..."
}
```

## Formula CO2e

```
CO2_saved (tCO2e) = energy_kwh x 0.0000817
Fator MCTI/IPCC Brasil: ~0.0817 tCO2/MWh
Metano (CH4): GWP 28-30x maior que CO2
```

## Pipeline dMRV

1. Ingesta -> POST /api/v1/adapter/ingest (NestJS + HMAC)
2. Normalizacao -> POST /normalize (FastAPI + GPT-4o-mini)
3. Validacao -> NASA POWER API (variancia < 5%)
4. Certificacao -> Calculo CO2e + persist PostgreSQL
5. Tokenizacao -> mint() VerdantCredit (Polygon)

## Contratos

| Contrato | Funcao |
|----------|--------|
| VerdantCredit (VCC) | ERC-20, 1 token = 1 tCO2e |
| AssetRegistry | Audit trail imutavel |
| CarbonCreditPool | Agregacao de pequenos produtores |

## Inversores Suportados

| Fabricante | Protocolo | Complexidade |
|-----------|----------|-------------|
| WEG | JSON/Webhook | Media |
| Fronius | Solar.API Push | Baixa |
| Sungrow | iSolarCloud API | Alta |
| Huawei | FusionSolar API | Alta |
| GENERIC | MQTT/Modbus | Variavel (IA detecta) |
