import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Shield, 
  Zap, 
  ArrowRight, 
  Bluetooth as Tooth, 
  Pill, 
  FlaskConical, 
  ClipboardList, 
  X, 
  Lock, 
  Server, 
  Box, 
  TrendingUp, 
  BrainCircuit,
  Database,
  History
} from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

type ModalType = 'features' | 'security' | 'supply-chain' | null;

export default function LandingPage({ onStart }: LandingPageProps) {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const ModalContent = () => {
    switch (activeModal) {
      case 'features':
        return (
          <div className="space-y-8">
            <div className="flex border-b border-slate-100 pb-4">
              <div className="p-3 bg-blue-500 rounded-2xl text-white mr-4">
                <BrainCircuit className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Advanced Platforms Features</h2>
                <p className="text-slate-500 text-sm">Empowering healthcare providers with localized intelligence.</p>
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Smart EMR Integration</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Automated patient intake with AI-driven extraction from unstructured notes and legacy Excel imports.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Intelligent Triage</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Real-time vital sign analysis used to prioritize patient queues based on clinical severity.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Predictive Diagnostics</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Gemini 1.5 Flash analyzes patient profiles to suggest potential inventory needs before clinical confirmation.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                <h3 className="font-bold text-slate-900 mb-2">Unified Scheduler</h3>
                <p className="text-xs text-slate-600 leading-relaxed">Interactive calendar that locks appointments only when required medical inventory is verified in stock.</p>
              </div>
            </div>
          </div>
        );
      case 'security':
        return (
          <div className="space-y-8">
            <div className="flex border-b border-slate-100 pb-4">
              <div className="p-3 bg-emerald-500 rounded-2xl text-white mr-4">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Privacy & Data Governance</h2>
                <p className="text-slate-500 text-sm">Security that evolves with modern clinical standards.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4 p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100/50">
                <Lock className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">End-to-End Encryption</h3>
                  <p className="text-xs text-slate-600">All patient data is encrypted at rest and in transit via TLS 1.3 and AES-256 protocols.</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 bg-blue-50/50 rounded-3xl border border-blue-100/50">
                <Database className="w-5 h-5 text-blue-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">HL7 & HIPAA Compliance</h3>
                  <p className="text-xs text-slate-600">Architected for standard health data interoperability while maintaining strict localized data sovereignty.</p>
                </div>
              </div>
              <div className="flex gap-4 p-5 bg-slate-50 rounded-3xl border border-slate-100">
                <History className="w-5 h-5 text-slate-600 shrink-0" />
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Immutable Audit Logs</h3>
                  <p className="text-xs text-slate-600">System-wide event tracking ensures every access request and pharmaceutical movement is recorded.</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'supply-chain':
        return (
          <div className="space-y-8">
            <div className="flex border-b border-slate-100 pb-4">
              <div className="p-3 bg-amber-500 rounded-2xl text-white mr-4">
                <TrendingUp className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Supply Chain Optimization</h2>
                <p className="text-slate-500 text-sm">Advanced logistics modeling for medical resource stability.</p>
              </div>
            </div>
            <div className="grid gap-4">
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                <Server className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900">Predictive Stockpiling</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">Leveraging seasonal health data and clinical intake trends to automate re-order points before shortages occur.</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                <Box className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900">Just-In-Time (JIT) Delivery</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">Reducing warehouse overhead by synchronizing inventory arrivals with scheduled clinical procedures.</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                <Zap className="w-6 h-6 text-amber-600 shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-slate-900">Automated Tendering</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">AI-assisted supplier evaluation to ensure quality standards and cost-efficiency in procurement.</p>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="relative overflow-hidden bg-white">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-cyan-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      <header className="relative z-10 border-b border-slate-100 backdrop-blur-md bg-white/50 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">H+</div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">healthrec.<span className="text-emerald-600">ai</span></h1>
          </div>
          <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
            <button 
              onClick={() => setActiveModal('features')}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              Features
            </button>
            <button 
              onClick={() => setActiveModal('security')}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              Security
            </button>
            <button 
              onClick={() => setActiveModal('supply-chain')}
              className="hover:text-emerald-600 transition-colors cursor-pointer"
            >
              Supply Chain
            </button>
          </nav>
          <button 
            onClick={onStart}
            className="bg-slate-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-slate-800 transition-all shadow-lg"
          >
            Try Now
          </button>
        </div>
      </header>

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-50 border border-cyan-100 rounded-full text-cyan-700 text-xs font-bold mb-6">
              <Zap className="w-3 h-3 fill-cyan-500" />
              <span>POWERED BY GEMINI 1.5 FLASH</span>
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Intelligent Health <br />
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent italic">Inventory Optimization</span>
            </h1>
            <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
              Seamlessly bridge the gap between patient care and medical supply logistics. 
              Real-time insights, automated restocking, and AI-driven diagnosis tracking.
            </p>
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onStart}
                className="group inline-flex items-center gap-2 bg-cyan-600 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-cyan-700 transition-all shadow-xl shadow-cyan-100"
              >
                Launch Application
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button 
                onClick={() => setActiveModal('features')}
                className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-100 transition-all"
              >
                Learn More
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative"
          >
            <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden group">
              <div className="flex justify-between items-start mb-8">
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Inventory Status</p>
                  <h3 className="text-2xl font-bold">Critical Supplies</h3>
                </div>
                <Activity className="text-cyan-600 animate-pulse" />
              </div>
              <div className="space-y-4">
                {[
                  { name: 'IV Infusion Bags', qty: 4, color: 'bg-rose-500', icon: Pill },
                  { name: 'Sterile Gloves', qty: 124, color: 'bg-emerald-500', icon: Shield },
                  { name: 'Paracetamol', qty: 18, color: 'bg-amber-500', icon: FlaskConical },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className={`p-3 rounded-xl ${item.color.replace('bg-', 'bg-opacity-10 text-')}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-500">Last updated 2m ago</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-black text-slate-900">{item.qty}</p>
                      <div className={`h-1.5 w-12 rounded-full mt-1 ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="py-20 border-t border-slate-100">
          <div className="grid md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<ClipboardList className="w-6 h-6" />}
              title="Smart EMR"
              desc="Comprehensive patient records with AI-assisted clinical note extraction."
              onClick={() => setActiveModal('features')}
            />
            <FeatureCard 
              icon={<Activity className="w-6 h-6" />}
              title="Predictive Supply"
              desc="Gemini-powered forecasting for essential medical supplies and medications."
              onClick={() => setActiveModal('supply-chain')}
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Secure Handling"
              desc="Enterprise-grade encryption for all medical data and patient histories."
              onClick={() => setActiveModal('security')}
            />
          </div>
        </section>
      </main>

      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] p-10 shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-8 right-8 p-3 hover:bg-slate-50 rounded-full text-slate-400 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              <ModalContent />
              <button 
                onClick={() => { setActiveModal(null); onStart(); }}
                className="w-full mt-10 py-5 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
              >
                Access Platform Now
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <footer className="bg-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 grayscale brightness-50">
            <Activity className="w-5 h-5" />
            <span className="font-bold">healthrec.ai</span>
          </div>
          <p className="text-slate-400 text-sm">© 2026 healthrec.ai Medical Systems. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, desc, onClick }: { icon: React.ReactNode, title: string, desc: string, onClick?: () => void }) {
  return (
    <div 
      className="group space-y-4 cursor-pointer"
      onClick={onClick}
    >
      <div className="p-3 bg-cyan-600 rounded-xl w-fit text-white shadow-lg shadow-cyan-100 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 group-hover:text-cyan-600 transition-colors">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
