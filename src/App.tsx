import { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-cyan-100 selection:text-cyan-900">
      {view === 'landing' ? (
        <LandingPage onStart={() => setView('app')} />
      ) : (
        <Dashboard onBack={() => setView('landing')} />
      )}
    </div>
  );
}
