FROM nvcr.io/nvidia/tensorrt:23.10-py3

WORKDIR /app

# Install TensorRT-LLM and dependencies
RUN pip install tensorrt-llm==0.8.0
RUN pip install fastapi uvicorn prometheus-client

# Copy energy optimization shim
COPY energy_shim.py .
COPY requirements.txt .

RUN pip install -r requirements.txt

# Environment variables for energy optimization
ENV ENERGY_BATCH_HINT=4
ENV ENERGY_POWER_CAP_W=250
ENV ENERGY_OPTIMIZATION_ENABLED=true

EXPOSE 8000

CMD ["python", "energy_shim.py"]
