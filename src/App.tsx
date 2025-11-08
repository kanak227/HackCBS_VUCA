import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletContextProvider } from './contexts/WalletContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import ContributorDashboard from './pages/ContributorDashboard'
import ModelTrainerDashboard from './pages/ModelTrainerDashboard'
import NetworkExplorer from './pages/NetworkExplorer'
import RewardsPage from './pages/RewardsPage'

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <div className="min-h-screen bg-cyber-darker">
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/contributor" element={<ContributorDashboard />} />
            <Route path="/trainer" element={<ModelTrainerDashboard />} />
            <Route path="/explorer" element={<NetworkExplorer />} />
            <Route path="/rewards" element={<RewardsPage />} />
          </Routes>
        </div>
      </Router>
    </WalletContextProvider>
  )
}

export default App

