
import { useState } from 'react';
import { useGameStore } from './store/gameStore';
import { LobbyPage } from './pages/LobbyPage';
import { PetSelectPage } from './pages/PetSelectPage';
import { FeedingPage } from './pages/FeedingPage';
import { ConfirmPage } from './pages/ConfirmPage';
import { PerformancePage } from './pages/PerformancePage';
import { SettlementPage } from './pages/SettlementPage';
import { PasswordPage, SESSION_KEY } from './pages/PasswordPage';

export default function App() {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === '1'
  );
  const { currentPhase } = useGameStore();

  if (!authenticated) {
    return <PasswordPage onAuthenticated={() => setAuthenticated(true)} />;
  }

  switch (currentPhase) {
    case 'lobby': return <LobbyPage />;
    case 'petSelect': return <PetSelectPage />;
    case 'feeding': return <FeedingPage />;
    case 'confirm': return <ConfirmPage />;
    case 'performance': return <PerformancePage />;
    case 'settlement': return <SettlementPage />;
    default: return <LobbyPage />;
  }
}
