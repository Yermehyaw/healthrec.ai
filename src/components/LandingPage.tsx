import React from 'react';
import { motion } from 'motion/react';
import { Activity, Shield, Zap, ArrowRight, Bluetooth as Tooth, Pill, FlaskConical, ClipboardList } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
}

export default function LandingPage({ onStart }: LandingPageProps) {
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
            <a href="#" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Security</a>
            <a href="#" className="hover:text-emerald-600 transition-colors">Supply Chain</a>
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
              <button className="inline-flex items-center gap-2 bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-slate-100 transition-all">
                Watch Demo
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
            />
            <FeatureCard 
              icon={<Activity className="w-6 h-6" />}
              title="Predictive Supply"
              desc="Gemini-powered forecasting for essential medical supplies and medications."
            />
            <FeatureCard 
              icon={<Shield className="w-6 h-6" />}
              title="Secure Handling"
              desc="Enterprise-grade encryption for all medical data and patient histories."
            />
          </div>
        </section>
      </main>
      
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

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="space-y-4">
      <div className="p-3 bg-cyan-600 rounded-xl w-fit text-white shadow-lg shadow-cyan-100">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900">{title}</h3>
      <p className="text-slate-600 leading-relaxed">{desc}</p>
    </div>
  );
}
