import { useState, useEffect } from 'react';
import { Monitor, Smartphone, LayoutGrid } from 'lucide-react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';

export default function App() {
  const [view, setView] = useState<'landing' | 'app'>('landing');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (isMobile) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-8 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="grid grid-cols-8 gap-4 p-4 h-full">
            {Array.from({ length: 64 }).map((_, i) => (
              <div key={i} className="aspect-square bg-slate-700/30 rounded-xl animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
            ))}
          </div>
        </div>
        
        <div className="relative z-10 space-y-8 max-w-sm">
          <div className="inline-flex items-center justify-center p-6 bg-emerald-500 rounded-[2.5rem] shadow-2xl shadow-emerald-500/20 mb-4 scale-110">
            <LayoutGrid className="w-12 h-12 text-white" />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-3xl font-black text-white tracking-tighter leading-none">
              healthrec.<span className="text-emerald-500">ai</span>
            </h1>
            <p className="text-slate-400 text-xs font-black uppercase tracking-[0.3em]">Desktop Only Experience</p>
          </div>

          <div className="p-8 bg-slate-800/50 backdrop-blur-xl rounded-[2rem] border border-slate-700/50 space-y-6">
            <div className="flex justify-center items-center gap-8 text-slate-500">
              <Smartphone className="w-8 h-8 opacity-40" />
              <div className="w-8 h-[2px] bg-slate-700 rounded-full" />
              <Monitor className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.3)]" />
            </div>
            
            <p className="text-sm font-bold text-slate-300 leading-relaxed px-2">
              Our clinical bento-grid dashboard is designed for high-density medical monitoring and professional ward administration.
            </p>
            
            <div className="pt-4">
               <span className="inline-block px-6 py-3 bg-slate-700 text-slate-300 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-600">
                 Please switch to a desktop browser
               </span>
            </div>
          </div>

          <div className="pt-2 opacity-50">
             <p className="text-[9px] font-black uppercase tracking-widest text-slate-600">Secure Ward Access • HIPAA Compliant</p>
          </div>
        </div>
      </div>
    );
  }

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
