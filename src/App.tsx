import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletContextProvider } from './contexts/WalletContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import ChallengesDashboard from './pages/ChallengesDashboard'
import ChallengeDetail from './pages/ChallengeDetail'
import SubmitModel from './pages/SubmitModel'
import LeaderboardPage from './pages/LeaderboardPage'
import ModeratorDashboard from './pages/ModeratorDashboard'
import UserDashboard from './pages/UserDashboard'

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <div className="min-h-screen bg-cyber-darker">
          <Navbar />
          <div className="pt-20">
            <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/challenges" element={<ChallengesDashboard />} />
            <Route path="/challenges/:challengeId" element={<ChallengeDetail />} />
            <Route path="/challenges/:challengeId/submit" element={<SubmitModel />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/moderator" element={<ModeratorDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
            </Routes>
          </div>
        </div>
      </Router>
    </WalletContextProvider>
  )
}

export default App

