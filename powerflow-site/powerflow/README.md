# PowerFlow - Power Electronics Control Platform

A modern, full-stack platform for power electronics control, simulation, and hardware-in-the-loop testing.

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and pnpm
- Docker and Docker Compose (optional)
- Git

### Installation

1. Clone the repository:
```bash
cd /workspace/powerflow
```

2. Install dependencies:
```bash
pnpm install
```

3. Start the application:

**Option 1: Quick Start (Recommended)**
```bash
./start.sh
```

**Option 2: Using pnpm commands**
```bash
# Terminal 1 - Start API
cd apps/api
pnpm dev

# Terminal 2 - Start Frontend
cd apps/web
pnpm dev
```

**Option 3: Using Docker**
```bash
docker-compose up
```

## 📍 Access Points

Once running, you can access:

- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:4000
- **API Documentation**: http://localhost:4000/api/docs
- **Database**: localhost:5432 (when using Docker)
- **Redis**: localhost:6379 (when using Docker)

## 🏗️ Project Structure

```
powerflow/
├── apps/
│   ├── web/                 # Next.js 14 frontend
│   ├── api/                 # NestJS API gateway
│   └── docs/                # Documentation site
├── services/
│   ├── sim/                 # Python simulation service
│   ├── ml/                  # Python ML service
│   ├── hil-agent/          # Hardware-in-loop agent
│   └── stream/             # Real-time streaming service
├── packages/
│   ├── shared/             # Shared TypeScript code
│   ├── ui/                 # Shared UI components
│   └── database/           # Database schemas
├── firmware/
│   └── control-fw/         # STM32 firmware
└── infra/
    ├── docker/
    ├── kubernetes/
    └── terraform/
```

## 🎯 Features

### Current Features
- ✅ Real-time power electronics simulation
- ✅ Interactive dashboard with live data visualization
- ✅ Hardware device management
- ✅ WebSocket real-time communication
- ✅ RESTful API with Swagger documentation
- ✅ Modern, responsive UI with dark mode support

### Planned Features
- 🔄 Machine learning predictions
- 🔄 Hardware-in-the-loop testing
- 🔄 Advanced control algorithms (MPPT, Grid-tie)
- 🔄 Multi-user collaboration
- 🔄 Cloud deployment

## 🛠️ Technology Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Radix UI** - Headless UI components
- **React Query** - Data fetching
- **Chart.js** - Data visualization
- **Socket.io Client** - Real-time communication

### Backend
- **NestJS** - Node.js framework
- **TypeScript** - Type safety
- **Socket.io** - WebSocket server
- **PostgreSQL** - Primary database
- **Redis** - Caching and pub/sub
- **TypeORM** - Database ORM

### DevOps
- **Docker** - Containerization
- **pnpm** - Package management
- **Turbo** - Monorepo build system

## 📝 Development

### Running Tests
```bash
pnpm test
```

### Building for Production
```bash
pnpm build
```

### Linting
```bash
pnpm lint
```

## 🔧 Configuration

### Environment Variables

Create `.env.local` files in each app:

**apps/web/.env.local**
```env
NEXT_PUBLIC_API_URL=http://localhost:4000
```

**apps/api/.env**
```env
PORT=4000
DATABASE_URL=postgresql://powerflow:powerflow123@localhost:5432/powerflow
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
```

## 📊 API Documentation

The API documentation is automatically generated and available at:
http://localhost:4000/api/docs

### Main Endpoints

- `GET /api/simulations` - List all simulations
- `POST /api/simulations` - Create new simulation
- `POST /api/simulations/:id/start` - Start simulation
- `POST /api/simulations/:id/stop` - Stop simulation
- `GET /api/hardware/devices` - List connected devices
- `GET /api/hardware/devices/:id/data` - Get device real-time data

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, please open an issue in the GitHub repository.

---

Built with ❤️ for the power electronics community