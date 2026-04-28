"""
Verdant Technologies - Motor de Normalizacao IA
FastAPI com Claude (Anthropic) para normalizacao universal de inversores solares e sensores IoT.
"""
import os
import logging
import hashlib
import json
import time
import asyncio
from typing import Any, Optional
from collections import defaultdict

import anthropic
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, field_validator
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[logging.StreamHandler(), logging.FileHandler("normalizer.log", encoding="utf-8")],
)
logger = logging.getLogger("verdant.adapter")

claude_client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
_cache: dict = {}
metrics: dict = {"normalizations": 0, "cache_hits": 0, "failures": 0}
rate_limits: dict = {}
CONFIDENCE_THRESHOLD = float(os.getenv("CONFIDENCE_THRESHOLD", "0.85"))

class NormalizeRequest(BaseModel):
    data: dict
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
    def validate_status(cls, v):
        if v not in ("OK", "ERROR", "OFFLINE"):
            raise ValueError("Status deve ser OK, ERROR ou OFFLINE")
        return v

    @field_validator("efficiency")
    @classmethod
    def validate_efficiency(cls, v):
        if not (0.0 <= v <= 1.0):
            return max(0.0, min(1.0, v))
        return v

    @field_validator("power_kw", "energy_kwh")
    @classmethod
    def validate_non_negative(cls, v):
        return max(0.0, v)

class NormalizeResponse(BaseModel):
    normalized: UniversalSchema
    confidence: float
    flagged_for_review: bool
    raw_data_hash: str

class BatchRequest(BaseModel):
    items: list

class BatchResponse(BaseModel):
    results: list
    total: int
    successful: int
    failed: int

app = FastAPI(title="Verdant Adapter - Claude", version="2.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

def hash_data(data):
    return "0x" + hashlib.sha256(json.dumps(data, sort_keys=True).encode()).hexdigest()

def detect_type_heuristics(data):
    fields = {k.lower() for k in data.keys()}
    if "pac" in fields or "p_ac" in fields: return "SMA", 0.90
    if "wirkleistung" in fields: return "FRONIUS", 0.90
    if "gen_pow" in fields or "tot_en" in fields: return "WEG", 0.85
    if "p" in fields and "e_total" in fields: return "HUAWEI", 0.80
    if "active_power" in fields and "today_energy" in fields: return "SUNGROW", 0.82
    return "GENERIC", 0.50

SYSTEM_PROMPT = (
    "Voce e um especialista em engenharia eletrica e ativos ambientais. "
    "Normalize payloads brutos de inversores solares e sensores IoT para o Schema Universal Verdant. "
    "Regras: power_kw em kW (W/1000), energy_kwh em kWh (Wh/1000), efficiency entre 0.0 e 1.0, "
    "temperature_c em Celsius, status apenas OK/ERROR/OFFLINE, confidence de 0.0 a 1.0, timestamp ISO-8601. "
    "Retorne APENAS JSON valido sem markdown."
)

def normalize_with_claude(raw_data, device_id, device_type):
    cache_key = hash_data(raw_data)
    if cache_key in _cache:
        metrics["cache_hits"] += 1
        result = _cache[cache_key].copy()
        result["device_id"] = device_id
        return result

    user_prompt = (
        f"Normalize os dados do dispositivo {device_id} (tipo: {device_type}):\n"
        f"{json.dumps(raw_data, indent=2)}\n"
        "Retorne JSON com: timestamp, device_id, device_type, power_kw, energy_kwh, efficiency, temperature_c, status, confidence."
    )

    response = claude_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=400,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
    )

    content = response.content[0].text.strip()
    if "```" in content:
        content = content.split("```")[1]
        if content.startswith("json"):
            content = content[4:]
    content = content.strip()

    normalized = json.loads(content)
    normalized["device_id"] = device_id
    normalized["raw_data_hash"] = cache_key
    _cache[cache_key] = normalized.copy()
    logger.info(f"Claude OK | {device_id} | power={normalized.get('power_kw')}kW | confidence={normalized.get('confidence')}")
    return normalized

def build_fallback(raw_data, device_id, device_type):
    return {
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "device_id": device_id, "device_type": device_type,
        "power_kw": 0.0, "energy_kwh": 0.0, "efficiency": 0.0,
        "temperature_c": 0.0, "status": "ERROR", "confidence": 0.0,
        "raw_data_hash": hash_data(raw_data),
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "model": "claude-sonnet-4-6", "metrics": metrics}

@app.post("/normalize", response_model=NormalizeResponse)
async def normalize(req: NormalizeRequest):
    metrics["normalizations"] += 1
    device_id = req.device_id or "unknown"
    heuristic_type, _ = detect_type_heuristics(req.data)
    device_type = req.device_type or heuristic_type
    try:
        raw = await asyncio.get_event_loop().run_in_executor(None, normalize_with_claude, req.data, device_id, device_type)
        confidence = float(raw.get("confidence", 0.0))
        flagged = confidence < CONFIDENCE_THRESHOLD
        if flagged:
            logger.warning(f"Confianca baixa ({confidence}) para {device_id}")
        schema = UniversalSchema(**raw)
        return NormalizeResponse(normalized=schema, confidence=confidence, flagged_for_review=flagged, raw_data_hash=raw.get("raw_data_hash", hash_data(req.data)))
    except Exception as exc:
        metrics["failures"] += 1
        logger.error(f"Falha {device_id}: {exc}")
        fallback = build_fallback(req.data, device_id, device_type)
        return NormalizeResponse(normalized=UniversalSchema(**fallback), confidence=0.0, flagged_for_review=True, raw_data_hash=fallback["raw_data_hash"])

@app.get("/supported-types")
async def supported_types():
    return {"inverters": ["WEG","FRONIUS","SUNGROW","ABB","HUAWEI","SMA","GENERIC"], "model": "claude-sonnet-4-6"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
