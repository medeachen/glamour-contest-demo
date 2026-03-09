
import { useGameStore } from './store/gameStore';
import { LobbyPage } from './pages/LobbyPage';
import { PetSelectPage } from './pages/PetSelectPage';
import { FeedingPage } from './pages/FeedingPage';
import { ConfirmPage } from './pages/ConfirmPage';
import { PerformancePage } from './pages/PerformancePage';
import { SettlementPage } from './pages/SettlementPage';

export default function App() {
  const { currentPhase } = useGameStore();
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
