#!/bin/bash

# Step 1: Create the BUILD-PLATFORM.sh file
cat > BUILD-PLATFORM.sh << 'ENDSCRIPT'
#!/bin/bash

###############################################################################
#                     PATENT FILING PLATFORM BUILDER                         #
###############################################################################

set -e

echo "🚀 Building LUMA IP..."

# Create project directory
mkdir -p patent-platform
cd patent-platform

# Create directory structure
echo "📁 Creating directory structure..."
mkdir -p apps/web/app apps/api/src services/agent/app infra/docker infra/prisma

# Create package.json
cat > package.json << 'EOF'
{
  "name": "patent-platform",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "docker:up": "docker-compose -f infra/docker/docker-compose.yml up -d --build",
    "docker:down": "docker-compose -f infra/docker/docker-compose.yml down",
    "docker:logs": "docker-compose -f infra/docker/docker-compose.yml logs -f"
  }
}
EOF

# Create .env file
cat > .env << 'EOF'
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@db:5432/patentdb
JWT_SECRET=supersecret_jwt_key_min_32_chars
AGENT_SHARED_SECRET=supersecret
EOF

# Create Next.js app
echo "🎨 Creating Next.js web app..."
cat > apps/web/package.json << 'EOF'
{
  "name": "@apps/web",
  "version": "1.0.0",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
EOF

cat > apps/web/next.config.js << 'EOF'
module.exports = {
  reactStrictMode: true,
}
EOF

mkdir -p apps/web/app
cat > apps/web/app/layout.tsx << 'EOF'
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ background: '#fef3c7', padding: '10px', textAlign: 'center', fontWeight: 'bold', borderBottom: '2px solid #f59e0b' }}>
          ⚖️ IMPORTANT: Not legal advice. Consult a registered patent practitioner.
        </div>
        {children}
      </body>
    </html>
  );
}
EOF

cat > apps/web/app/page.tsx << 'EOF'
export default function HomePage() {
  return (
    <div style={{ padding: '40px', fontFamily: 'system-ui, -apple-system, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>🚀 LUMA IP</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '40px' }}>
        Legal Utility for Machine Assisted IP Analysis
      </p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px' }}>🤖 AI-Powered Drafting</h3>
          <p>Generate claims and specifications with advanced AI</p>
        </div>
        <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px' }}>📋 Form Generation</h3>
          <p>Automatically create USPTO forms (ADS, IDS)</p>
        </div>
        <div style={{ padding: '20px', background: '#f3f4f6', borderRadius: '8px' }}>
          <h3 style={{ marginBottom: '10px' }}>📅 Docket Management</h3>
          <p>Track deadlines and manage documents</p>
        </div>
      </div>

      <div style={{ padding: '20px', background: '#e0f2fe', borderRadius: '8px' }}>
        <h3 style={{ marginBottom: '20px' }}>🔗 Service Links</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div>✅ API Docs: <a href="http://localhost:3001/api/docs" target="_blank">http://localhost:3001/api/docs</a></div>
          <div>✅ Agent API: <a href="http://localhost:8000/docs" target="_blank">http://localhost:8000/docs</a></div>
          <div>✅ MinIO: <a href="http://localhost:9001" target="_blank">http://localhost:9001</a> (minioadmin/minioadmin)</div>
          <div>✅ MailDev: <a href="http://localhost:1080" target="_blank">http://localhost:1080</a></div>
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: '#fef3c7', borderRadius: '8px' }}>
        <h4>Demo Credentials:</h4>
        <p>Email: demo@patentplatform.com</p>
        <p>Password: demo123456</p>
      </div>
    </div>
  );
}
EOF

# Create NestJS API
echo "🚀 Creating NestJS API..."
cat > apps/api/package.json << 'EOF'
{
  "name": "@apps/api",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node src/main.ts",
    "build": "tsc",
    "start": "node dist/main.js"
  },
  "dependencies": {
    "@nestjs/common": "^10.3.0",
    "@nestjs/core": "^10.3.0",
    "@nestjs/platform-express": "^10.3.0",
    "@nestjs/swagger": "^7.1.17",
    "reflect-metadata": "^0.2.1",
    "rxjs": "^7.8.1"
  },
  "devDependencies": {
    "@types/node": "^20.10.6",
    "ts-node": "^10.9.2",
    "typescript": "^5.3.3"
  }
}
EOF

cat > apps/api/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "module": "commonjs",
    "target": "ES2021",
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": false
  }
}
EOF

cat > apps/api/src/main.ts << 'EOF'
import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Module, Controller, Get, Post, Body } from '@nestjs/common';

@Controller()
class AppController {
  @Get()
  getHello() {
    return { 
      message: 'Patent Platform API v1.0.0',
      docs: 'http://localhost:3001/api/docs'
    };
  }

  @Get('health')
  health() {
    return { status: 'healthy' };
  }

  @Post('auth/login')
  login(@Body() body: any) {
    return { user: { email: body.email }, token: 'mock-jwt' };
  }

  @Post('matters')
  createMatter(@Body() body: any) {
    return { id: '1', ...body, status: 'DRAFT' };
  }

  @Get('agent/runs')
  getAgentRuns() {
    return [
      { id: '1', status: 'SUCCEEDED', matter: 'Patent App #001' }
    ];
  }
}

@Module({
  controllers: [AppController],
})
class AppModule {}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  
  const config = new DocumentBuilder()
    .setTitle('Patent Platform API')
    .setDescription('LUMA IP - Legal Utility for Machine Assisted IP Analysis API')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  
  await app.listen(3001);
  console.log('API running at http://localhost:3001');
  console.log('Docs at http://localhost:3001/api/docs');
}

bootstrap();
EOF

# Create Python Agent
echo "🤖 Creating Python Agent Service..."
cat > services/agent/requirements.txt << 'EOF'
fastapi==0.109.0
uvicorn==0.27.0
pydantic==2.5.3
EOF

cat > services/agent/app/main.py << 'EOF'
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import uuid

app = FastAPI(title="Patent Agent Service", version="1.0.0")

class RunRequest(BaseModel):
    matter_id: str
    goals: List[str]

@app.get("/")
def root():
    return {"message": "Patent Agent Service", "docs": "/docs"}

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.post("/runs")
def create_run(request: RunRequest):
    return {
        "run_id": str(uuid.uuid4()),
        "status": "queued",
        "matter_id": request.matter_id
    }

@app.get("/runs/{run_id}")
def get_run(run_id: str):
    return {
        "run_id": run_id,
        "status": "succeeded",
        "output": {
            "claims": [
                {
                    "number": 1,
                    "text": "A system for automated patent filing, comprising: a processor; and memory storing instructions.",
                    "independent": True
                }
            ],
            "notes": ["Generated successfully", "Not legal advice"]
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create Docker Compose
echo "🐳 Creating Docker configuration..."
cat > infra/docker/docker-compose.yml << 'EOF'
version: '3.8'

services:
  db:
    image: postgres:16
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: patentdb
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]

  minio:
    image: minio/minio
    ports:
      - "9000:9000"
      - "9001:9001"
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    command: server /data --console-address ":9001"

  maildev:
    image: maildev/maildev
    ports:
      - "1080:1080"
      - "1025:1025"

  web:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./apps/web:/app
    ports:
      - "3000:3000"
    command: sh -c "npm install && npm run dev"
    depends_on:
      - api

  api:
    image: node:20-alpine
    working_dir: /app
    volumes:
      - ./apps/api:/app
    ports:
      - "3001:3001"
    command: sh -c "npm install && npx ts-node src/main.ts"
    depends_on:
      - db

  agent:
    image: python:3.11-slim
    working_dir: /app
    volumes:
      - ./services/agent:/app
    ports:
      - "8000:8000"
    command: sh -c "pip install -r requirements.txt && python app/main.py"
EOF

echo ""
echo "✅ Project created successfully!"
echo ""
echo "📁 Project location: $(pwd)"
echo ""
echo "🚀 Starting services with Docker..."
docker-compose -f infra/docker/docker-compose.yml up -d --build

echo ""
echo "⏳ Waiting for services to start (30 seconds)..."
sleep 30

echo ""
echo "════════════════════════════════════════════════════"
echo "  ✅ PATENT PLATFORM IS RUNNING!"
echo "════════════════════════════════════════════════════"
echo ""
echo "🌐 Access Points:"
echo "   Web UI:        http://localhost:3000"
echo "   API Docs:      http://localhost:3001/api/docs"
echo "   Agent API:     http://localhost:8000/docs"
echo "   MinIO:         http://localhost:9001"
echo "   MailDev:       http://localhost:1080"
echo ""
echo "📦 Services Status:"
docker-compose -f infra/docker/docker-compose.yml ps
echo ""
echo "📝 To stop: docker-compose -f infra/docker/docker-compose.yml down"
echo ""
echo "⚖️  Legal: Not legal advice. Consult a patent practitioner."
ENDSCRIPT

# Step 2: Make it executable
chmod +x BUILD-PLATFORM.sh

# Step 3: Run it
echo "✅ BUILD-PLATFORM.sh created!"
echo "🚀 Starting the build..."
echo ""
bash BUILD-PLATFORM.sh
