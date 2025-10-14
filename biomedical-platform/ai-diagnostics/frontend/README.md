# AI-Powered Diagnostics - Frontend

Next.js 14 frontend application for the AI-Powered Diagnostics platform. Provides clinicians with an intuitive interface for submitting diagnostic requests, viewing AI-powered results, and managing patient histories.

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (@tanstack/react-query)
- **Charts**: Recharts
- **Icons**: Lucide React
- **HTTP Client**: Axios

## Features

### 1. Dashboard
- Real-time statistics (total diagnostics, pending reviews, high-risk patients, accuracy)
- Recent diagnostics activity feed
- Quick navigation to key features

### 2. Diagnostic Request Form (`/diagnostics/new`)
- Comprehensive patient data input:
  - Basic information (Patient ID, analysis type, urgency)
  - Vital signs (blood pressure, heart rate, temperature, etc.)
  - Laboratory results (dynamic list with reference ranges)
  - Symptoms (tag-based input)
  - Current medications
  - Medical history
  - Allergies
  - Additional clinical notes
- Real-time form validation
- Loading states during analysis
- Error handling with user-friendly messages

### 3. Diagnostic Results Viewer (`/diagnostics/[id]`)
- **Visualizations**:
  - Disease detection confidence (bar chart)
  - Risk assessment scores (bar chart with thresholds)
  - Biomarker analysis (radar chart)
  - Risk score trends over time (line chart)

- **Clinical Information**:
  - Critical alerts (highlighted)
  - Treatment recommendations with evidence levels
  - Clinical guidelines from trusted sources
  - Drug interaction warnings
  - Patient education materials

- **Drug Discovery Insights**:
  - Candidate compounds table
  - Binding affinity metrics
  - Safety scores

- **Export Functionality**:
  - Export results to PDF or JSON
  - Download diagnostic reports

### 4. Patient History (`/patients/[id]`)
- **Summary Statistics**:
  - Total diagnostics
  - Recent diagnostics (last 30 days)
  - High-risk findings count
  - Average risk trend

- **Trend Analysis**:
  - Risk score trends over time (line chart)
  - Biomarker trends (area chart)
  - Key findings summary

- **Diagnostic Timeline**:
  - Chronological list of all diagnostics
  - Status and urgency indicators
  - Quick access to detailed results
  - Critical alert notifications

### 5. Patients List (`/patients`)
- **Search and Filter**:
  - Search by name or patient ID
  - Filter by status (active, monitoring)

- **Patient Cards**:
  - Demographics (age, gender)
  - Last visit date
  - Diagnostic count
  - High-risk alert badges
  - Current conditions

- **Statistics Dashboard**:
  - Total patients
  - Active patients count
  - Patients under monitoring
  - Total high-risk alerts

## Project Structure

```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── layout.tsx          # Root layout with Providers
│   │   ├── page.tsx            # Homepage
│   │   ├── globals.css         # Global styles
│   │   ├── providers.tsx       # React Query provider setup
│   │   ├── dashboard/
│   │   │   └── page.tsx        # Dashboard page
│   │   ├── diagnostics/
│   │   │   ├── new/
│   │   │   │   └── page.tsx    # Diagnostic request form
│   │   │   └── [id]/
│   │   │       └── page.tsx    # Results viewer
│   │   └── patients/
│   │       ├── page.tsx        # Patients list
│   │       └── [id]/
│   │           └── page.tsx    # Patient history
│   └── lib/
│       └── api.ts              # API client and axios configuration
├── public/                     # Static assets
├── next.config.js              # Next.js configuration
├── tailwind.config.ts          # Tailwind CSS configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies
```

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

For production:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

## Development

```bash
# Start development server
npm run dev

# Open http://localhost:3000
```

## Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## API Integration

The frontend connects to the AI Diagnostics backend via the API client in `src/lib/api.ts`:

### Endpoints Used

- `POST /api/v1/diagnostics/analyze` - Submit diagnostic request
- `GET /api/v1/diagnostics/:id` - Get diagnostic result by ID
- `GET /api/v1/diagnostics/patient/:patientId` - Get all diagnostics for patient
- `GET /api/v1/diagnostics/patient/:patientId/history` - Get patient history with trends
- `POST /api/v1/diagnostics/:id/export` - Export diagnostic report

### Authentication

The API client automatically includes JWT tokens from `localStorage`:

```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
```

## Data Fetching Strategy

Uses React Query for all API calls:

- **Automatic caching** with 60-second stale time
- **Background refetching** disabled (set to `false`)
- **Loading and error states** handled automatically
- **Optimistic updates** for better UX

Example:
```typescript
const { data, isLoading, error } = useQuery({
  queryKey: ['diagnostic', id],
  queryFn: () => diagnosticsApi.getById(id),
})
```

## Chart Components

### Disease Detection Confidence (Bar Chart)
Shows ML confidence scores for detected diseases.

### Risk Assessment (Bar Chart with Thresholds)
Compares patient risk scores against risk thresholds.

### Biomarker Analysis (Radar Chart)
Visualizes biomarker levels against normal ranges.

### Trend Charts (Line/Area Charts)
- Risk score trends over time
- Biomarker trends over time

## Styling

### Tailwind CSS Classes

- **Colors**: Blue (primary), Red (alerts/high risk), Yellow (warnings), Green (success)
- **Shadows**: `shadow`, `shadow-md`, `shadow-lg`
- **Rounded corners**: `rounded-md`, `rounded-lg`
- **Spacing**: Consistent use of `gap-4`, `gap-6`, `px-4`, `py-2`, etc.

### Responsive Design

- Mobile-first approach
- Breakpoints: `sm:`, `md:`, `lg:`, `xl:`
- Grid layouts with responsive columns: `grid md:grid-cols-2 lg:grid-cols-4`

## Form Validation

- Required fields marked with asterisk (*)
- Real-time validation on submit
- User-friendly error messages
- Dynamic arrays for lab results, symptoms, medications, etc.

## Error Handling

- Network errors displayed with retry options
- API errors shown with specific error messages
- Loading states prevent duplicate submissions
- 404 handling for missing resources

## Accessibility

- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus states on interactive elements
- Color contrast compliance

## Performance Optimizations

- **Code splitting**: Automatic with Next.js App Router
- **Image optimization**: Next.js Image component (when images added)
- **React Query caching**: Reduces unnecessary API calls
- **Lazy loading**: Components loaded on demand

## Future Enhancements

1. **Real-time Updates**: WebSocket integration for live diagnostic status
2. **Advanced Filtering**: Multi-criteria patient search
3. **Notifications**: Toast notifications for important events
4. **Dark Mode**: Theme switching capability
5. **Offline Support**: Service worker for offline access
6. **Mobile App**: React Native version
7. **Internationalization**: Multi-language support
8. **Advanced Analytics**: Custom dashboard builder

## Testing

```bash
# Run unit tests (when added)
npm test

# Run E2E tests with Playwright (when added)
npm run test:e2e
```

## Deployment

### Vercel (Recommended)
```bash
vercel deploy
```

### Docker
```bash
docker build -t ai-diagnostics-frontend .
docker run -p 3000:3000 ai-diagnostics-frontend
```

### Static Export
```bash
npm run build
# Deploy the `out/` directory to any static hosting
```

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## License

Proprietary - M.Y. Engineering and Technologies

## Support

For issues or questions, contact the development team.
