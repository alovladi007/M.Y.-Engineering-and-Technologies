from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, List, Optional, Any
import numpy as np
import asyncio
from datetime import datetime

app = FastAPI(title="PowerFlow Simulation Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============== Models ==============

class SSTSimulationRequest(BaseModel):
    topology_chain: List[str]
    parameters: Dict[str, Any]
    time_span: float = 0.1
    time_step: float = 1e-5

class SimulationResult(BaseModel):
    id: str
    status: str
    progress: float
    results: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# ============== SST Components ==============

class NPCRectifier:
    """3-Level Neutral Point Clamped Rectifier"""
    
    def __init__(self, params: Dict):
        self.vdc_ref = params.get('vdc_ref', 800)
        self.fsw = params.get('fsw', 10000)
        
    def simulate(self, t: np.ndarray) -> Dict:
        vdc = self.vdc_ref * (1 - 0.05 * np.exp(-100 * t))
        ripple = 0.02 * self.vdc_ref * np.sin(2 * np.pi * 300 * t)
        
        ia = 100 * np.sin(2 * np.pi * 50 * t)
        ib = 100 * np.sin(2 * np.pi * 50 * t - 2*np.pi/3)
        ic = 100 * np.sin(2 * np.pi * 50 * t + 2*np.pi/3)
        
        thd = 2.5 + 0.5 * np.random.random()
        
        return {
            'vdc': (vdc + ripple).tolist(),
            'ia': ia.tolist(),
            'ib': ib.tolist(),
            'ic': ic.tolist(),
            'thd': float(thd),
            'pf': 0.99,
            'efficiency': 0.985
        }

class DualActiveBridge:
    """DAB Converter with MFT"""
    
    def __init__(self, params: Dict):
        self.V1 = params.get('v1', 800)
        self.V2 = params.get('v2', 400)
        self.fs = params.get('fs', 50000)
        self.Llk = params.get('Llk', 10e-6)
        self.n = params.get('n', 2)
        
    def calculate_power(self, phi: float) -> float:
        omega = 2 * np.pi * self.fs
        P = (self.n * self.V1 * self.V2 / (omega * self.Llk)) * phi * (1 - abs(phi) / np.pi)
        return P
    
    def check_zvs(self, phi: float, load: float) -> bool:
        return 0.1 <= abs(phi) <= 0.8 and load > 0.2
    
    def simulate(self, t: np.ndarray, phi_deg: float = 30) -> Dict:
        phi = np.radians(phi_deg)
        P = self.calculate_power(phi)
        
        i_pri = P / self.V1 * (1 + 0.1 * np.sin(2 * np.pi * self.fs * t))
        i_sec = i_pri * self.n
        
        load_ratio = P / (self.V1 * 10)
        zvs = self.check_zvs(phi, load_ratio)
        
        return {
            'power': float(P),
            'i_primary': i_pri.tolist(),
            'i_secondary': i_sec.tolist(),
            'zvs': bool(zvs),
            'efficiency': 0.97 if zvs else 0.94
        }

class GridInverter:
    """Grid-tie Inverter"""
    
    def __init__(self, params: Dict):
        self.Vdc = params.get('vdc', 700)
        self.Vac = params.get('vac', 400)
        self.fsw = params.get('fsw', 20000)
        
    def simulate(self, t: np.ndarray) -> Dict:
        omega = 2 * np.pi * 50
        
        va = self.Vac * np.sqrt(2/3) * np.sin(omega * t)
        vb = self.Vac * np.sqrt(2/3) * np.sin(omega * t - 2*np.pi/3)
        vc = self.Vac * np.sqrt(2/3) * np.sin(omega * t + 2*np.pi/3)
        
        P = 50000
        I_rms = P / (np.sqrt(3) * self.Vac)
        ia = I_rms * np.sqrt(2) * np.sin(omega * t - 0.1)
        ib = I_rms * np.sqrt(2) * np.sin(omega * t - 2*np.pi/3 - 0.1)
        ic = I_rms * np.sqrt(2) * np.sin(omega * t + 2*np.pi/3 - 0.1)
        
        return {
            'va': va.tolist(),
            'vb': vb.tolist(),
            'vc': vc.tolist(),
            'ia': ia.tolist(),
            'ib': ib.tolist(),
            'ic': ic.tolist(),
            'thd': 1.5,
            'pf': 0.98,
            'efficiency': 0.98
        }

# ============== Simulation Engine ==============

active_simulations = {}

async def run_sst_simulation(sim_id: str, request: SSTSimulationRequest):
    try:
        t = np.arange(0, request.time_span, request.time_step)
        results = {'time': t.tolist()}
        
        active_simulations[sim_id] = {'status': 'running', 'progress': 0.1}
        
        if 'NPC3L' in request.topology_chain:
            npc = NPCRectifier(request.parameters.get('npc', {}))
            results['npc'] = npc.simulate(t)
            active_simulations[sim_id]['progress'] = 0.33
        
        await asyncio.sleep(0.1)
        
        if 'DAB' in request.topology_chain:
            dab = DualActiveBridge(request.parameters.get('dab', {}))
            results['dab'] = dab.simulate(t, request.parameters.get('dab', {}).get('phi', 30))
            active_simulations[sim_id]['progress'] = 0.66
        
        await asyncio.sleep(0.1)
        
        if 'INV' in request.topology_chain:
            inv = GridInverter(request.parameters.get('inverter', {}))
            results['inverter'] = inv.simulate(t)
            active_simulations[sim_id]['progress'] = 1.0
        
        overall_efficiency = 1.0
        for stage in ['npc', 'dab', 'inverter']:
            if stage in results and 'efficiency' in results[stage]:
                overall_efficiency *= results[stage]['efficiency']
        
        results['overall'] = {
            'efficiency': overall_efficiency,
            'power': 50000,
            'stages': len(request.topology_chain)
        }
        
        active_simulations[sim_id] = {
            'status': 'completed',
            'progress': 1.0,
            'results': results
        }
        
    except Exception as e:
        active_simulations[sim_id] = {'status': 'error', 'progress': 0, 'error': str(e)}

# ============== API Endpoints ==============

@app.get("/")
async def root():
    return {"service": "PowerFlow Simulation Service", "status": "running", "version": "1.0.0"}

@app.post("/simulate/sst/run")
async def run_sst(request: SSTSimulationRequest):
    sim_id = f"sst_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    asyncio.create_task(run_sst_simulation(sim_id, request))
    return {"id": sim_id, "status": "started"}

@app.get("/simulate/status/{sim_id}")
async def get_status(sim_id: str):
    if sim_id not in active_simulations:
        raise HTTPException(status_code=404, detail="Simulation not found")
    
    sim = active_simulations[sim_id]
    return SimulationResult(
        id=sim_id,
        status=sim['status'],
        progress=sim.get('progress', 0),
        results=sim.get('results'),
        error=sim.get('error')
    )

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "simulation", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)

