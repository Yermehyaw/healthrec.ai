import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Package, 
  Sparkles, 
  Plus, 
  Search, 
  ChevronLeft, 
  Calendar, 
  Trash2, 
  Upload, 
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
  Clock,
  Activity,
  Zap,
  ArrowRight
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { analyzePatient, generateWardReport } from '../lib/gemini';

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  medications: string;
  lastVisit: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

interface DashboardProps {
  onBack: () => void;
}

const INITIAL_INVENTORY: InventoryItem[] = [
  { id: '1', name: 'IV Infusion Bags', quantity: 4, category: 'Fluids' },
  { id: '2', name: 'Sterile Gloves (M)', quantity: 3, category: 'PPE' },
  { id: '3', name: 'Paracetamol 500mg', quantity: 14, category: 'Meds' },
  { id: '4', name: 'Surgical Masks', quantity: 450, category: 'PPE' },
  { id: '5', name: 'Adrenaline Vials', quantity: 6, category: 'Meds' },
  { id: '6', name: 'Cannula 22G', quantity: 35, category: 'Tools' },
  { id: '7', name: 'Bandages 10cm', quantity: 22, category: 'Tools' },
  { id: '8', name: 'Saline Solution', quantity: 4, category: 'Fluids' },
  { id: '9', name: 'Aspirin 75mg', quantity: 80, category: 'Meds' },
  { id: '10', name: 'Syringes 5ml', quantity: 15, category: 'Tools' },
];

const PREFILL_PATIENTS: Patient[] = [
  { id: 'p1', name: 'Michael Chen', age: 42, diagnosis: 'Severe Hypertension, History of Renal Impairment', medications: 'Lisinopril, Amlodipine', lastVisit: '2026-04-20' },
  { id: 'p2', name: 'Sarah Miller', age: 29, diagnosis: 'Post-Op Recovery (Appendectomy)', medications: 'Paracetamol, Ibuprofen', lastVisit: '2026-04-21' },
];

export default function Dashboard({ onBack }: DashboardProps) {
  const [patients, setPatients] = useState<Patient[]>(PREFILL_PATIENTS);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [wardReport, setWardReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.get('name') as string,
      age: Number(formData.get('age')),
      diagnosis: formData.get('diagnosis') as string,
      medications: formData.get('medications') as string,
      lastVisit: formData.get('lastVisit') as string,
    };
    setPatients([...patients, newPatient]);
    setShowPatientForm(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const bstr = event.target?.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet) as any[];

      const importedPatients = data.map(row => ({
        id: Math.random().toString(36).substr(2, 9),
        name: row.name || row.Name || 'Unknown',
        age: Number(row.age || row.Age || 0),
        diagnosis: row.diagnosis || row.Diagnosis || 'None',
        medications: row.medications || row.Medications || 'None',
        lastVisit: row.lastVisit || row.LastVisit || new Date().toISOString().split('T')[0],
      }));

      setPatients([...patients, ...importedPatients]);
    };
    reader.readAsBinaryString(file);
  };

  const runPatientAnalysis = async (patient: Patient) => {
    setAnalysisLoading(true);
    const result = await analyzePatient(patient, inventory);
    setActiveAnalysis(result);
    setAnalysisLoading(false);
  };

  const runWardReport = async () => {
    setReportLoading(true);
    const result = await generateWardReport(patients, inventory);
    setWardReport(result);
    setReportLoading(false);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden p-6 gap-4">
      {/* Bento Header */}
      <header className="flex items-center justify-between h-14 shrink-0 px-4">
        <div className="flex items-center gap-2 cursor-pointer" onClick={onBack}>
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-white font-bold">H+</div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">healthrec.<span className="text-emerald-600">ai</span></h1>
        </div>
        <div className="flex items-center gap-6">
          <p className="text-[10px] text-slate-400 max-w-xs text-right hidden lg:block uppercase tracking-wider font-bold">
            Predictive inventory & AI patient analysis powered by <span className="text-slate-900">Gemini 1.5 Flash</span>
          </p>
          <div className="h-8 w-[1px] bg-slate-200 hidden lg:block" />
          <button 
            onClick={runWardReport}
            className="px-5 py-2 bg-slate-900 text-white rounded-full text-xs font-bold hover:bg-slate-800 transition-all flex items-center gap-2 shadow-lg"
          >
            {reportLoading ? <Clock className="w-3 h-3 animate-spin" /> : <BrainCircuit className="w-3 h-3 text-emerald-400" />}
            Generate Ward Report
          </button>
        </div>
      </header>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-12 grid-rows-6 gap-4 flex-1 overflow-hidden">
        
        {/* Patient Intake - col-span-3 */}
        <section className="col-span-3 row-span-4 glass-card bg-white rounded-2xl p-5 border border-slate-200 custom-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Intake</h2>
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
            >
              <Upload className="w-3 h-3" /> Import
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.xls,.csv" />
          </div>
          
          <form onSubmit={addPatient} className="space-y-4 flex-1">
            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
              <input required name="name" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all" placeholder="Patient Name" />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Age</label>
                <input required name="age" type="number" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" placeholder="45" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Visit Date</label>
                <input required name="lastVisit" type="date" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Diagnosis</label>
              <textarea required name="diagnosis" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold h-20 resize-none" placeholder="Primary complaint..." />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Medications</label>
              <input required name="medications" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" placeholder="Meds list..." />
            </div>

            <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-2 shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all">
              Add Record
            </button>
          </form>
        </section>

        {/* Inventory Monitor - col-span-6 */}
        <section className="col-span-6 row-span-4 glass-card bg-white rounded-2xl p-5 border border-slate-200 custom-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Medical Supply Chain</h2>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
              <span className="text-[10px] font-black text-slate-400">LIVE STOCK MONITOR</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide border border-slate-100 rounded-2xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 sticky top-0 backdrop-blur-sm">
                <tr className="border-b border-slate-100">
                  <th className="p-4 font-black text-slate-400 tracking-widest">ITEM NAME</th>
                  <th className="p-4 font-black text-slate-400 tracking-widest text-center">QTY</th>
                  <th className="p-4 font-black text-slate-400 tracking-widest text-center">STATUS</th>
                  <th className="p-4 font-black text-slate-400 tracking-widest">PRIORITY</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50/50">
                {inventory.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-700">{item.name}</td>
                    <td className="p-4 text-center font-black text-sm tabular-nums text-slate-900">{item.quantity}</td>
                    <td className="p-4 text-center">
                      <span className={cn(
                        "px-2 py-1 rounded text-[9px] font-black uppercase tracking-tighter",
                        item.quantity < 5 ? "status-red" : item.quantity < 20 ? "status-amber" : "status-green"
                      )}>
                        {item.quantity < 5 ? 'CRITICAL' : item.quantity < 20 ? 'LOW' : 'STABLE'}
                      </span>
                    </td>
                    <td className="p-4 group">
                      <div className="flex items-center justify-between">
                         <span className={cn(
                           "text-[9px] font-bold italic",
                           item.quantity < 5 ? "text-red-600" : item.quantity < 20 ? "text-amber-600" : "text-slate-400"
                         )}>
                           {item.quantity < 5 ? 'Immediate Restock' : item.quantity < 20 ? 'Standard Lead' : 'No Action'}
                         </span>
                         <ArrowRight className="w-3 h-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 flex items-center justify-between bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/50">
            <div className="flex items-center gap-3">
              <Zap className="w-4 h-4 text-emerald-500 fill-emerald-500 animate-pulse" />
              <p className="text-[10px] text-emerald-800 font-bold italic">Gemini is monitoring stock patterns based on scheduled arrivals.</p>
            </div>
            <button className="px-4 py-1.5 bg-emerald-600 text-white rounded-lg text-[9px] font-black uppercase tracking-wider hover:bg-emerald-700 transition-all">Optimization Run</button>
          </div>
        </section>

        {/* AI Insights Sidebar - col-span-3 */}
        <section className="col-span-3 row-span-6 glass-card bg-slate-900 rounded-3xl p-6 border border-slate-800 shadow-2xl flex flex-col">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2.5 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-[10px] font-black text-white uppercase tracking-[0.2em]">AI Insights</h2>
              <p className="text-[8px] text-emerald-500 font-mono tracking-widest font-bold">GEMINI 1.5 FLASH ACTIVE</p>
            </div>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto scrollbar-hide">
            <AnimatePresence mode="wait">
              {analysisLoading || reportLoading ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="py-20 flex flex-col items-center justify-center gap-4 text-slate-600"
                >
                  <BrainCircuit className="w-10 h-10 text-emerald-500 animate-spin" />
                  <p className="text-[9px] font-black uppercase tracking-widest">Neural Compute...</p>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-4"
                >
                  {(activeAnalysis || wardReport) ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700/50">
                        <div className="flex items-center gap-2 mb-3">
                           <div className="w-1 h-3 bg-emerald-500 rounded-full" />
                           <h3 className="text-emerald-400 text-[10px] font-black uppercase tracking-widest">Analysis Engine</h3>
                        </div>
                        <div className="text-[11px] text-slate-300 leading-relaxed font-medium whitespace-pre-wrap">
                          {wardReport || activeAnalysis}
                        </div>
                      </div>
                      <button 
                        onClick={() => { setActiveAnalysis(null); setWardReport(null); }}
                        className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-slate-300 transition-all"
                      >
                        Clear Results
                      </button>
                    </div>
                  ) : (
                    <div className="py-20 text-center space-y-4 border border-dashed border-slate-800 rounded-3xl">
                       <AlertCircle className="w-8 h-8 text-slate-700 mx-auto" />
                       <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest max-w-[150px] mx-auto">Select a patient card to trigger AI analysis</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-8 space-y-3">
             <div className="grid grid-cols-2 gap-2">
               <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/30 text-center">
                  <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Queue Size</p>
                  <p className="text-xl font-black text-white">{patients.length}</p>
               </div>
               <div className="p-3 bg-slate-800/50 rounded-2xl border border-slate-700/30 text-center">
                  <p className="text-[8px] font-bold text-slate-500 uppercase mb-1">Critical Stock</p>
                  <p className="text-xl font-black text-rose-500">{inventory.filter(i => i.quantity < 5).length}</p>
               </div>
             </div>
             <p className="text-[8px] text-slate-500 text-center font-bold italic tracking-widest uppercase opacity-50">HL7 Encrypted Data Sync</p>
          </div>
        </section>

        {/* Patient Queue - col-span-9 */}
        <section className="col-span-9 row-span-2 glass-card bg-white rounded-3xl p-6 border border-slate-200 custom-shadow flex flex-col overflow-hidden">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Active Patient Queue</h2>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all">Scheduler</button>
              <button 
                onClick={runWardReport}
                className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all"
              >
                Analyze All
              </button>
            </div>
          </div>
          
          <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 h-full items-center">
            {patients.map((p) => (
              <motion.div 
                key={p.id}
                whileHover={{ y: -4 }}
                className="min-w-[280px] p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 shadow-sm"
                onClick={() => runPatientAnalysis(p)}
              >
                <div>
                  <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{p.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">{p.age}y • {p.diagnosis.split(',')[0]}</p>
                </div>
                <div className="p-2 bg-white rounded-2xl text-emerald-500 shadow-sm border border-slate-100 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                   <Sparkles className="w-4 h-4" />
                </div>
              </motion.div>
            ))}
            <div 
              onClick={() => setShowPatientForm(true)}
              className="min-w-[240px] h-[72px] border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center group cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all"
            >
              <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] group-hover:text-emerald-500">+ Add to Queue</p>
            </div>
          </div>
        </section>

      </div>

      {/* Bento Footer */}
      <footer className="flex justify-between items-center h-8 shrink-0 px-4 text-[9px] text-slate-400 font-extrabold tracking-widest uppercase">
        <div className="flex gap-8 items-center">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            <span>SYSTEM: OPTIMAL</span>
          </div>
          <span>LATENCY: 24ms</span>
          <span className="text-emerald-600">● ENCRYPTED HL7 TUNNEL</span>
        </div>
        <div>© 2026 HEALTHREC.AI • INTELLIGENT MEDICAL SYSTEMS</div>
      </footer>

      {/* Patient Form Modal - Adapted for Bento scheme */}
      <AnimatePresence>
        {showPatientForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={() => setShowPatientForm(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => setShowPatientForm(false)} className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 transition-all">
                   <ChevronLeft className="w-5 h-5 rotate-180" />
                 </button>
              </div>
              
              <div className="mb-8">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold mb-4">H+</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Admission Form</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Ward Admission Unit 4A</p>
              </div>
              
              <form onSubmit={addPatient} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Name</label>
                  <input required name="name" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="e.g. Robert Smith" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Age</label>
                    <input required name="age" type="number" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="35" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Last Visit</label>
                    <input required name="lastVisit" type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Diagnosis</label>
                  <input required name="diagnosis" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="e.g. Type II Diabetes" />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Prescribed Medications</label>
                  <textarea name="medications" rows={2} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold resize-none" placeholder="e.g. Metformin 500mg" />
                </div>

                <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2">
                  <Plus className="w-5 h-5 shrink-0" />
                  Confirm Admission
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
