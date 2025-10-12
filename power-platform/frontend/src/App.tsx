import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './lib/store'
import Nav from './components/Nav'
import Dashboard from './pages/Dashboard'
import NewRun from './pages/NewRun'
import RunDetail from './pages/RunDetail'
import Compliance from './pages/Compliance'
import HIL from './pages/HIL'
import Login from './pages/Login'

function App() {
  const { user } = useAuthStore()

  if (!user) {
    return <Login />
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Nav />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/new-run" element={<NewRun />} />
            <Route path="/run/:runId" element={<RunDetail />} />
            <Route path="/compliance" element={<Compliance />} />
            <Route path="/hil" element={<HIL />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default App
