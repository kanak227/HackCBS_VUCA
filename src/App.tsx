import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { WalletContextProvider } from './contexts/WalletContext'
import Navbar from './components/Navbar'
import ModeratorNavbar from './components/ModeratorNavbar'
import Landing from './pages/Landing'
import ChallengesDashboard from './pages/ChallengesDashboard'
import ChallengeDetail from './pages/ChallengeDetail'
import SubmitModel from './pages/SubmitModel'
import LeaderboardPage from './pages/LeaderboardPage'
import ModeratorDashboard from './pages/ModeratorDashboard'
import UserDashboard from './pages/UserDashboard'
import CreateChallenge from './pages/CreateChallenge'

// User Layout Component
const UserLayout = () => {
  return (
    <div className="min-h-screen bg-cyber-darker">
      <Navbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/challenges" element={<ChallengesDashboard />} />
          <Route path="/challenges/:challengeId" element={<ChallengeDetail />} />
          <Route path="/challenges/:challengeId/submit" element={<SubmitModel />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/dashboard" element={<UserDashboard />} />
        </Routes>
      </div>
    </div>
  )
}

// Moderator Layout Component (completely separate)
const ModeratorLayout = () => {
  return (
    <div className="min-h-screen bg-cyber-darker">
      <ModeratorNavbar />
      <div className="pt-20">
        <Routes>
          <Route path="/" element={<ModeratorDashboard />} />
          <Route path="/submissions" element={<ModeratorDashboard />} />
          <Route path="/create-challenge" element={<CreateChallenge />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <WalletContextProvider>
      <Router>
        <Routes>
          {/* Moderator Routes - completely separate, no user content */}
          <Route path="/moderator/*" element={<ModeratorLayout />} />
          
          {/* User Routes - regular interface */}
          <Route path="/*" element={<UserLayout />} />
        </Routes>
      </Router>
    </WalletContextProvider>
  )
}

export default App

