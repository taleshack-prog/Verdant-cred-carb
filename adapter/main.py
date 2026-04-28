"""
Verdant Technologies - Motor de Normalizacao IA
FastAPI service para normalizacao universal de dados de inversores solares e sensores IoT.
"""
import os
import logging
import hashlib
import json
import time
import asyncio
from typing import Any, Optional
from collections import defaultdict

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

# Logging estruturado
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("normalizer.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("verdant.adapter")

# Clientes e config
openai_client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
_cache: dict[str, dict] = {}
metrics: dict[str, int] = {"normalizations": 0, "cache_hits": 0, "failures": 0}
rate_limits: dict[str, list[float]] = defaultdict(list)
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.85"))


# Schemas Pydantic
class NormalizeRequest(BaseModel):
    data: dict[str, Any]
    device_id: Optional[str] = None
    device_type: Optional[str] = None


class UniversalSchema(BaseModel):
    timestamp: str
    device_id: str
    device_type: str
    power_kw: float
    energy_kwh: float
    efficiency: float
    temperature_c: float
    status: str
    confidence: float
    raw_data_hash: str

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: str) -> str:
        if v not in ("OK", "ERROR", "OFFLINE"):
            raise ValueError("Status deve ser OK, ERROR ou OFFLINE")
        return v

    @field_validator("power_kw", "energy_kwh")
    @classmethod
    def validate_non_negative(cls, v: float) -> float:
        if v < 0:
            raise ValueError("Valores de energia nao podem ser negativos")
        return v

    @field_validator("efficiency")
    @classmethod
    def validate_efficiency(cls, v: float) -> float:
        if not (0.0 <= v <= 1.0):
            raise ValueError("Eficiencia deve estar entre 0 e 1")
        return v


class NormalizeResponse(BaseModel):
    normalized: UniversalSchema
    confidence: float
    flagged_for_review: bool
    raw_data_hash: str


class BatchRequest(BaseModel):
    items: list[NormalizeRequest]


class BatchResponse(BaseModel):
    results: list[NormalizeResponse]
    total: int
    successful: int
    failed: int


# FastAPI app
app = FastAPI(
    title="Verdant Universal Adapter - Motor de Normalizacao IA",
    description="Normaliza payloads de inversores e sensores IoT para Schema Universal Verdant",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def rate_limit_middleware(request: Request, call_next):
    if request.method == "POST":
        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        window, max_req = 3600, 500
        rate_limits[client_ip] = [t for t in rate_limits[client_ip] if now - t < window]
        if len(rate_limits[client_ip]) >= max_req:
            return JSONResponse({"detail": "Rate limit excedido"}, status_code=429)
        rate_limits[client_ip].append(now)
    return await call_next(request)


def hash_data(data: dict) -> str:
    return "0x" + hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()


def detect_type_heuristics(data: dict) -> tuple[str, float]:
    """Detecta o tipo de inversor por heuristica de campos - reduz chamadas a IA."""
    fields = {k.lower() for k in data.keys()}
    if "pac" in fields or "p_ac" in fields:
        return "SMA", 0.90
    if "wirkleistung" in fields or "gesamt" in fields:
        return "FRONIUS", 0.90
    if "gen_pow" in fields or "tot_en" in fields:
        return "WEG", 0.85
    if "p" in fields and "e_total" in fields:
        return "HUAWEI", 0.80
    if "active_power" in fields and "today_energy" in fields:
        return "SUNGROW", 0.82
    return "GENERIC", 0.50


SYSTEM_PROMPT = (
    "Voce e um especialista em engenharia eletrica e ativos ambientais. "
    "Normalize payloads brutos de inversores solares/sensores IoT para o Schema Universal Verdant. "
    "Regras: power_kw em kW (converter de W dividindo por 1000), energy_kwh em kWh, "
    "efficiency entre 0.0 e 1.0, temperature_c em Celsius, "
    "status apenas OK/ERROR/OFFLINE, confidence de 0.0 a 1.0, timestamp ISO-8601. "
    "Retorne APENAS JSON valido sem texto extra ou markdown."
)


async def normalize_with_gpt(raw_data: dict, device_id: str, device_type: str) -> dict:
    cache_key = hash_data(raw_data)

    if cache_key in _cache:
        metrics["cache_hits"] += 1
        logger.info(f"Cache hit | device={device_id}")
        result = _cache[cache_key].copy()
        result["device_id"] = device_id
        return result

    user_prompt = (
        f"Normalize os dados brutos do dispositivo '{device_id}' (tipo suspeito: {device_type}):\n"
        f"{json.dumps(raw_data, indent=2)}\n"
        "Retorne JSON com: timestamp, device_id, device_type, power_kw, energy_kwh, "
        "efficiency, temperature_c, status, confidence."
    )

    response = await openai_client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,
        max_tokens=400,
    )

    content = response.choices[0].message.content
    if not content:
        raise ValueError("Resposta vazia da IA")

    content = content.strip()
    if content.startswith("```"):
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]

    normalized = json.loads(content.strip())
    normalized["device_id"] = device_id
    normalized["raw_data_hash"] = cache_key
    _cache[cache_key] = normalized.copy()

    logger.info(
        f"GPT OK | device={device_id} | type={normalized.get('device_type')} "
        f"| confidence={normalized.get('confidence')} | power={normalized.get('power_kw')}kW"
    )
    return normalized


def build_fallback(raw_data: dict, device_id: str, device_type: str) -> dict:
    return {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "device_id": device_id,
        "device_type": device_type,
        "power_kw": 0.0,
        "energy_kwh": 0.0,
        "efficiency": 0.0,
        "temperature_c": 0.0,
        "status": "ERROR",
        "confidence": 0.0,
        "raw_data_hash": hash_data(raw_data),
    }


@app.get("/health")
async def health():
    return {"status": "healthy", "metrics": metrics, "cache_size": len(_cache)}


@app.post("/normalize", response_model=NormalizeResponse)
async def normalize(req: NormalizeRequest):
    metrics["normalizations"] += 1
    device_id = req.device_id or "unknown"
    heuristic_type, _ = detect_type_heuristics(req.data)
    device_type = req.device_type or heuristic_type

    try:
        raw = await normalize_with_gpt(req.data, device_id, device_type)
        confidence = float(raw.get("confidence", 0.0))
        flagged = confidence < CONFIDENCE_THRESHOLD

        if flagged:
            logger.warning(f"Confianca baixa ({confidence}) para {device_id} - sinalizando para revisao manual")

        schema = UniversalSchema(**raw)
        return NormalizeResponse(
            normalized=schema,
            confidence=confidence,
            flagged_for_review=flagged,
            raw_data_hash=raw.get("raw_data_hash", hash_data(req.data)),
        )
    except Exception as exc:
        metrics["failures"] += 1
        logger.error(f"Falha normalizacao {device_id}: {exc}")
        fallback = build_fallback(req.data, device_id, device_type)
        return NormalizeResponse(
            normalized=UniversalSchema(**fallback),
            confidence=0.0,
            flagged_for_review=True,
            raw_data_hash=fallback["raw_data_hash"],
        )


@app.post("/batch-normalize", response_model=BatchResponse)
async def batch_normalize(req: BatchRequest):
    tasks = [normalize(item) for item in req.items]
    results_raw = await asyncio.gather(*tasks, return_exceptions=True)

    successful, failed_count = [], 0
    for r in results_raw:
        if isinstance(r, Exception):
            failed_count += 1
            logger.error(f"Erro no batch: {r}")
        else:
            successful.append(r)

    return BatchResponse(results=successful, total=len(req.items), successful=len(successful), failed=failed_count)


@app.get("/supported-types")
async def supported_types():
    return {
        "inverters": ["WEG", "FRONIUS", "SUNGROW", "ABB", "HUAWEI", "SMA", "GENERIC"],
        "sensors": ["BIOGAS_FLOW", "PRESSURE", "GAS_ANALYZER", "ENERGY_METER"],
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
