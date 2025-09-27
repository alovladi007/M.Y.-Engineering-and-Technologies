#!/usr/bin/env python3
"""
Energy-optimized vLLM serving shim
Integrates with Energy Orchestrator for dynamic optimization
"""

import os
import time
import asyncio
import logging
from typing import Optional, List, Dict, Any
from contextlib import asynccontextmanager

import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from prometheus_client import Counter, Histogram, Gauge, generate_latest
import httpx

# vLLM imports
from vllm import LLM, SamplingParams
from vllm.engine.arg_utils import AsyncEngineArgs
from vllm.engine.async_llm_engine import AsyncLLMEngine

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Prometheus metrics
request_counter = Counter('vllm_requests_total', 'Total vLLM requests', ['model'])
request_duration = Histogram('vllm_request_duration_seconds', 'Request duration')
batch_size_gauge = Gauge('vllm_batch_size', 'Current batch size')
power_cap_gauge = Gauge('vllm_power_cap_watts', 'Current GPU power cap')
energy_per_request = Gauge('vllm_energy_per_request_joules', 'Energy per request')

# Configuration
MODEL_NAME = os.getenv("MODEL_NAME", "microsoft/DialoGPT-medium")
ENERGY_API_URL = os.getenv("ENERGY_API_URL", "http://energy-api.energy-system.svc.cluster.local:8000")
BATCH_HINT = int(os.getenv("ENERGY_BATCH_HINT", "4"))
POWER_CAP = int(os.getenv("ENERGY_POWER_CAP_W", "250"))
OPTIMIZATION_ENABLED = os.getenv("ENERGY_OPTIMIZATION_ENABLED", "true").lower() == "true"

# Global engine
engine: Optional[AsyncLLMEngine] = None

class GenerationRequest(BaseModel):
    prompt: str
    max_tokens: int = 100
    temperature: float = 0.7
    top_p: float = 0.9
    stream: bool = False

class GenerationResponse(BaseModel):
    text: str
    finish_reason: str
    usage: Dict[str, int]

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize and cleanup resources"""
    global engine
    
    logger.info("Initializing vLLM engine with energy optimization...")
    
    # Set initial power cap
    if OPTIMIZATION_ENABLED:
        await set_gpu_power_cap(POWER_CAP)
    
    # Initialize vLLM engine
    engine_args = AsyncEngineArgs(
        model=MODEL_NAME,
        tensor_parallel_size=1,
        gpu_memory_utilization=0.8,
        max_model_len=2048,
        trust_remote_code=True,
    )
    
    engine = AsyncLLMEngine.from_engine_args(engine_args)
    
    # Start background optimization task
    if OPTIMIZATION_ENABLED:
        asyncio.create_task(optimization_loop())
    
    logger.info("vLLM engine initialized successfully")
    
    yield
    
    # Cleanup
    logger.info("Shutting down vLLM engine...")

app = FastAPI(
    title="Energy-Optimized vLLM Server",
    version="0.5.0",
    lifespan=lifespan
)

async def set_gpu_power_cap(power_cap_w: int):
    """Set GPU power cap using nvidia-smi"""
    try:
        import subprocess
        result = subprocess.run([
            "nvidia-smi", "-i", "0", "-pl", str(power_cap_w)
        ], capture_output=True, text=True, check=True)
        logger.info(f"Set GPU power cap to {power_cap_w}W")
        power_cap_gauge.set(power_cap_w)
    except Exception as e:
        logger.error(f"Failed to set power cap: {e}")

async def get_energy_recommendations() -> Dict[str, Any]:
    """Get optimization recommendations from Energy API"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ENERGY_API_URL}/optimize/vllm")
            if response.status_code == 200:
                return response.json()
    except Exception as e:
        logger.error(f"Failed to get energy recommendations: {e}")
    return {}

async def optimization_loop():
    """Background task for continuous optimization"""
    while True:
        try:
            if not OPTIMIZATION_ENABLED:
                await asyncio.sleep(60)
                continue
                
            # Get recommendations
            recommendations = await get_energy_recommendations()
            
            if recommendations:
                for rec in recommendations:
                    if rec.get('service') == 'vllm-svc' and rec.get('confidence', 0) > 0.7:
                        # Update batch size
                        new_batch = rec.get('recommended_batch_size', BATCH_HINT)
                        if new_batch != BATCH_HINT:
                            global BATCH_HINT
                            BATCH_HINT = new_batch
                            batch_size_gauge.set(BATCH_HINT)
                            logger.info(f"Updated batch size to {BATCH_HINT}")
                        
                        # Update power cap
                        new_power = rec.get('recommended_power_cap', POWER_CAP)
                        if new_power != POWER_CAP:
                            global POWER_CAP
                            POWER_CAP = new_power
                            await set_gpu_power_cap(POWER_CAP)
                            logger.info(f"Updated power cap to {POWER_CAP}W")
            
            await asyncio.sleep(30)  # Check every 30 seconds
            
        except Exception as e:
            logger.error(f"Optimization loop error: {e}")
            await asyncio.sleep(60)

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "vllm-energy-optimized",
        "version": "0.5.0",
        "optimization_enabled": OPTIMIZATION_ENABLED,
        "current_batch_size": BATCH_HINT,
        "current_power_cap": POWER_CAP
    }

@app.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest()

@app.post("/generate", response_model=GenerationResponse)
async def generate(request: GenerationRequest):
    """Generate text with energy optimization"""
    if not engine:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    
    start_time = time.time()
    request_counter.labels(model=MODEL_NAME).inc()
    
    try:
        # Create sampling parameters
        sampling_params = SamplingParams(
            temperature=request.temperature,
            top_p=request.top_p,
            max_tokens=request.max_tokens,
        )
        
        # Generate response
        request_id = f"req_{int(time.time() * 1000)}"
        results_generator = engine.generate(
            request.prompt, sampling_params, request_id
        )
        
        # Collect results
        final_output = None
        async for request_output in results_generator:
            final_output = request_output
        
        if not final_output:
            raise HTTPException(status_code=500, detail="Generation failed")
        
        # Extract text and metadata
        output = final_output.outputs[0]
        text = output.text
        finish_reason = output.finish_reason
        
        # Calculate usage
        usage = {
            "prompt_tokens": len(request.prompt.split()),
            "completion_tokens": len(text.split()),
            "total_tokens": len(request.prompt.split()) + len(text.split())
        }
        
        # Update metrics
        duration = time.time() - start_time
        request_duration.observe(duration)
        
        # Estimate energy per request (simplified)
        estimated_energy = POWER_CAP * duration / 1000  # Convert to Joules
        energy_per_request.set(estimated_energy)
        
        return GenerationResponse(
            text=text,
            finish_reason=finish_reason,
            usage=usage
        )
        
    except Exception as e:
        logger.error(f"Generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate/stream")
async def generate_stream(request: GenerationRequest):
    """Streaming text generation"""
    if not engine:
        raise HTTPException(status_code=503, detail="Engine not initialized")
    
    async def generate_stream():
        sampling_params = SamplingParams(
            temperature=request.temperature,
            top_p=request.top_p,
            max_tokens=request.max_tokens,
        )
        
        request_id = f"stream_req_{int(time.time() * 1000)}"
        results_generator = engine.generate(
            request.prompt, sampling_params, request_id
        )
        
        async for request_output in results_generator:
            if request_output.outputs:
                output = request_output.outputs[0]
                if output.text:
                    yield f"data: {output.text}\n\n"
        
        yield "data: [DONE]\n\n"
    
    return StreamingResponse(
        generate_stream(),
        media_type="text/plain",
        headers={"Cache-Control": "no-cache"}
    )

@app.get("/health")
async def health():
    """Detailed health check"""
    return {
        "status": "healthy",
        "engine_ready": engine is not None,
        "optimization_enabled": OPTIMIZATION_ENABLED,
        "current_batch_size": BATCH_HINT,
        "current_power_cap": POWER_CAP,
        "model": MODEL_NAME
    }

if __name__ == "__main__":
    uvicorn.run(
        "energy_shim:app",
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
