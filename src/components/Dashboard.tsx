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
  ArrowRight,
  FileText
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { cn } from '../lib/utils';
import { analyzePatient, generateWardReport } from '../lib/gemini';
import Scheduler from './Scheduler';

interface Prescription {
  name: string;
  dosage: string;
  frequency: string;
}

interface Vitals {
  bp: string;
  hr: number;
  temp: number;
  oxygen: number;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  diagnosis: string;
  prescriptions: Prescription[];
  vitals: Vitals;
  lastVisit: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  category: string;
}

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending';
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
  { 
    id: 'p1', 
    name: 'Michael Chen', 
    age: 42, 
    diagnosis: 'Severe Hypertension, Renal Impairment', 
    prescriptions: [
      { name: 'Lisinopril', dosage: '10mg', frequency: 'OD' },
      { name: 'Amlodipine', dosage: '5mg', frequency: 'OD' }
    ],
    vitals: { bp: '160/95', hr: 88, temp: 36.8, oxygen: 98 },
    lastVisit: '2026-04-20',
    priority: 'high'
  },
  { 
    id: 'p2', 
    name: 'Sarah Miller', 
    age: 29, 
    diagnosis: 'Post-Op Recovery', 
    prescriptions: [
      { name: 'Paracetamol', dosage: '1g', frequency: 'QDS' }
    ],
    vitals: { bp: '110/70', hr: 72, temp: 37.2, oxygen: 99 },
    lastVisit: '2026-04-21',
    priority: 'low'
  },
];

export default function Dashboard({ onBack }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments'>('dashboard');
  const [patients, setPatients] = useState<Patient[]>(PREFILL_PATIENTS);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [activeAnalysis, setActiveAnalysis] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [wardReport, setWardReport] = useState<string | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);
  const [meds, setMeds] = useState<Prescription[]>([{ name: '', dosage: '', frequency: '' }]);
  const [searchTerm, setSearchTerm] = useState('');
  
  const editingPatient = patients.find(p => p.id === editingPatientId);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addMed = () => setMeds([...meds, { name: '', dosage: '', frequency: '' }]);
  const removeMed = (index: number) => setMeds(meds.filter((_, i) => i !== index));
  const updateMed = (index: number, field: keyof Prescription, value: string) => {
    const newMeds = [...meds];
    newMeds[index][field] = value;
    setMeds(newMeds);
  };

  const restock = (itemId: string) => {
    setInventory(prev => prev.map(item => 
      item.id === itemId ? { ...item, quantity: item.quantity + 50 } : item
    ));
  };

  const openEditForm = (patient: Patient) => {
    setEditingPatientId(patient.id);
    setMeds(patient.prescriptions);
    setShowPatientForm(true);
  };

  const deletePatient = (id: string) => {
    if (window.confirm('Are you sure you want to remove this patient?')) {
      setPatients(prev => prev.filter(p => p.id !== id));
    }
  };

  const addPatient = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const patientData = {
      name: formData.get('name') as string,
      age: Number(formData.get('age')),
      diagnosis: formData.get('diagnosis') as string,
      prescriptions: meds.filter(m => m.name),
      vitals: {
        bp: formData.get('bp') as string,
        hr: Number(formData.get('hr')),
        temp: Number(formData.get('temp')),
        oxygen: Number(formData.get('oxygen')),
      },
      lastVisit: formData.get('lastVisit') as string,
      priority: (formData.get('priority') as any) || 'medium',
    };

    if (editingPatientId) {
      setPatients(prev => prev.map(p => p.id === editingPatientId ? { ...p, ...patientData } : p));
    } else {
      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        ...patientData
      };
      setPatients([...patients, newPatient]);
    }
    
    setShowPatientForm(false);
    setEditingPatientId(null);
    setMeds([{ name: '', dosage: '', frequency: '' }]);
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

      const importedPatients: Patient[] = data.map(row => ({
        id: Math.random().toString(36).substr(2, 9),
        name: row.name || row.Name || 'Unknown',
        age: Number(row.age || row.Age || 0),
        diagnosis: row.diagnosis || row.Diagnosis || 'None',
        prescriptions: row.prescriptions ? JSON.parse(row.prescriptions) : [],
        vitals: {
          bp: row.bp || '120/80',
          hr: Number(row.hr || 72),
          temp: Number(row.temp || 37.0),
          oxygen: Number(row.oxygen || 98),
        },
        lastVisit: row.lastVisit || row.LastVisit || new Date().toISOString().split('T')[0],
        priority: (row.priority || row.Priority || 'medium').toLowerCase() as any,
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
          <nav className="flex bg-slate-200/50 p-1 rounded-2xl gap-1">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'dashboard' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Clinical
            </button>
            <button 
              onClick={() => setActiveTab('appointments')}
              className={cn("px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", activeTab === 'appointments' ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700")}
            >
              Appointments
            </button>
          </nav>
          <div className="h-8 w-[1px] bg-slate-200 hidden lg:block" />
          <div className="relative group">
            <div className={cn(
              "p-2 rounded-xl transition-all cursor-pointer",
              inventory.filter(i => i.quantity < 5).length > 0 ? "bg-rose-50 text-rose-500 animate-pulse" : "bg-slate-100 text-slate-400"
            )}>
              <Package className="w-5 h-5" />
              {inventory.filter(i => i.quantity < 5).length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full font-black">
                  {inventory.filter(i => i.quantity < 5).length}
                </span>
              )}
            </div>
            {/* Tooltip on hover */}
            <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <h4 className="text-[10px] font-black uppercase text-slate-400 mb-3 tracking-widest">Inventory Alerts</h4>
              <div className="space-y-2">
                {inventory.filter(i => i.quantity < 20).map(item => (
                  <div key={item.id} className="flex justify-between items-center text-[10px]">
                    <span className="font-bold text-slate-700">{item.name}</span>
                    <span className={cn("font-black", item.quantity < 5 ? "text-rose-500" : "text-amber-500")}>{item.quantity} units</span>
                  </div>
                ))}
                {inventory.filter(i => i.quantity < 20).length === 0 && (
                  <p className="text-[10px] italic text-slate-400">All systems optimal.</p>
                )}
              </div>
            </div>
          </div>
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

      {/* Main Content View */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'dashboard' ? (
          <div className="grid grid-cols-12 grid-rows-6 gap-4 h-full">
            
            {/* Patient Intake - col-span-3 */}
            <section className="col-span-3 row-span-4 glass-card bg-white rounded-2xl p-0 border border-slate-200 custom-shadow flex flex-col overflow-hidden">
              <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-10 shrink-0">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Patient Intake</h2>
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-emerald-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Upload className="w-3 h-3" /> Import
                </button>
                <input type="file" ref={fileInputRef} onChange={handleImport} className="hidden" accept=".xlsx,.xls,.csv" />
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-hide p-5">
                <form onSubmit={addPatient} className="space-y-6">
                  {/* Bio Section */}
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Full Name</label>
                      <input required name="name" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all shadow-inner" placeholder="Patient Name" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Age</label>
                        <input required name="age" type="number" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold shadow-inner" placeholder="45" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Triage</label>
                        <select name="priority" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold shadow-inner accent-emerald-500">
                          <option value="low">Low Priority</option>
                          <option value="medium">Medium</option>
                          <option value="high">Urgent</option>
                          <option value="critical">Critical</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Vitals Section */}
                  <div className="space-y-4">
                    <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em] border-b border-slate-50 pb-1">Vitals & Assessment</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">BP (mmHg)</label>
                        <input required name="bp" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" placeholder="120/80" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">HR (bpm)</label>
                        <input required name="hr" type="number" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" placeholder="72" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Temp (°C)</label>
                        <input required name="temp" step="0.1" type="number" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" placeholder="37.0" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">SpO2 (%)</label>
                        <input required name="oxygen" type="number" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" placeholder="98" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Diagnosis</label>
                    <textarea required name="diagnosis" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold h-20 resize-none shadow-inner" placeholder="Primary clinical complaint..." />
                  </div>

                  {/* Enhanced Prescription Section */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-50 pb-1">
                      <h4 className="text-[8px] font-black text-slate-300 uppercase tracking-[0.2em]">Prescriptions</h4>
                      <button type="button" onClick={addMed} className="p-1 hover:bg-slate-50 rounded-lg text-emerald-500 transition-all">
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {meds.map((med, idx) => (
                        <div key={idx} className="relative p-3 bg-slate-50 rounded-xl border border-slate-100 group">
                          <div className="space-y-2">
                            <input required value={med.name} onChange={(e) => updateMed(idx, 'name', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-xs font-bold" placeholder="Medication Name" />
                            <div className="grid grid-cols-2 gap-2">
                              <input required value={med.dosage} onChange={(e) => updateMed(idx, 'dosage', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-[10px] font-bold" placeholder="Dosage (eg 500mg)" />
                              <input required value={med.frequency} onChange={(e) => updateMed(idx, 'frequency', e.target.value)} className="w-full bg-white border-none rounded-lg p-2 text-[10px] font-bold" placeholder="Freq (eg TDS)" />
                            </div>
                          </div>
                          {meds.length > 1 && (
                            <button type="button" onClick={() => removeMed(idx)} className="absolute -top-1 -right-1 p-1 bg-white shadow-sm border border-slate-100 text-rose-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <Trash2 className="w-2.5 h-2.5" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest pl-1">Visit Date</label>
                    <input required name="lastVisit" type="date" className="w-full bg-slate-100 border-none rounded-xl p-3 text-sm font-bold" />
                  </div>

                  <button type="submit" className="w-full bg-emerald-500 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest mt-2 shadow-lg shadow-emerald-100 hover:bg-emerald-600 transition-all sticky bottom-0">
                    Confirm Admission
                  </button>
                </form>
              </div>
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
                          <div className="flex items-center justify-between gap-2">
                            <span className={cn("text-[9px] font-bold italic truncate flex-1", item.quantity < 5 ? "text-red-600" : item.quantity < 20 ? "text-amber-600" : "text-slate-400")}>
                               {item.quantity < 5 ? 'Immediate Restock' : item.quantity < 20 ? 'Standard Lead' : 'No Action'}
                            </span>
                            {item.quantity < 20 && (
                              <button 
                                onClick={() => restock(item.id)}
                                className="px-2 py-1 bg-amber-100 text-amber-700 rounded-lg text-[8px] font-black uppercase tracking-widest hover:bg-amber-200 transition-all flex items-center gap-1"
                              >
                                <Plus className="w-2.5 h-2.5" /> Order
                              </button>
                            )}
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
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="py-20 flex flex-col items-center justify-center gap-4 text-slate-600">
                      <BrainCircuit className="w-10 h-10 text-emerald-500 animate-spin" />
                      <p className="text-[9px] font-black uppercase tracking-widest">Neural Compute...</p>
                    </motion.div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
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
                          <button onClick={() => { setActiveAnalysis(null); setWardReport(null); }} className="w-full py-3 bg-slate-800 border border-slate-700 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-700 hover:text-slate-300 transition-all">Clear Results</button>
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
              <div className="flex justify-between items-center mb-5 gap-4">
                <div className="flex flex-1 items-center gap-4">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 shrink-0">Active Patient Queue</h2>
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search name or diagnosis..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-100 rounded-xl py-1.5 pl-9 pr-4 text-[10px] font-bold focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => setActiveTab('appointments')}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all text-slate-600"
                  >
                    Planner View
                  </button>
                  <button onClick={runWardReport} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100 transition-all">Analyze All</button>
                </div>
              </div>
              
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 h-full items-center">
                {patients.filter(p => 
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                  p.diagnosis.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((p) => (
                  <motion.div key={p.id} whileHover={{ y: -4 }} className="min-w-[280px] p-5 bg-slate-50/50 rounded-3xl border border-slate-100 flex items-center justify-between group cursor-pointer hover:bg-white hover:border-emerald-200 transition-all hover:shadow-xl hover:shadow-emerald-500/5 shadow-sm" onClick={() => runPatientAnalysis(p)}>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-black text-slate-900 group-hover:text-emerald-600 transition-colors">{p.name}</p>
                        <span className={cn("text-[7px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter", p.priority === 'critical' ? "bg-rose-500 text-white" : p.priority === 'high' ? "bg-amber-500 text-white" : "bg-slate-100 text-slate-500")}>{p.priority}</span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-1">{p.age}y • {p.diagnosis.split(',')[0]}</p>
                      <div className="flex gap-2 text-[8px] font-bold text-slate-400">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">BP: {p.vitals.bp}</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">HR: {p.vitals.hr}</span>
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded">Meds: {p.prescriptions.length}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100">
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          runPatientAnalysis(p);
                        }}
                        className="p-2 bg-white rounded-xl text-emerald-500 shadow-sm border border-slate-100 hover:bg-emerald-50 transition-colors" 
                        title="AI Analysis"
                      >
                         <Sparkles className="w-4 h-4" />
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditForm(p);
                        }}
                        className="p-2 bg-white rounded-xl text-blue-500 shadow-sm border border-slate-100 hover:bg-blue-50 transition-colors" 
                        title="Edit Patient"
                      >
                         <FileText className="w-4 h-4" />
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveTab('appointments');
                        }}
                        className="p-2 bg-white rounded-xl text-slate-400 shadow-sm border border-slate-100 hover:bg-slate-50 hover:text-emerald-500 transition-all" 
                        title="Schedule Appointment"
                      >
                         <Calendar className="w-4 h-4" />
                      </div>
                      <div 
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePatient(p.id);
                        }}
                        className="p-2 bg-white rounded-xl text-rose-400 shadow-sm border border-slate-100 hover:bg-rose-50 hover:text-rose-600 transition-all" 
                        title="Delete Patient"
                      >
                         <Trash2 className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div onClick={() => setShowPatientForm(true)} className="min-w-[240px] h-[72px] border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-center group cursor-pointer hover:border-emerald-300 hover:bg-emerald-50/30 transition-all">
                  <p className="text-[9px] text-slate-400 font-black uppercase tracking-[0.2em] group-hover:text-emerald-500">+ Add to Queue</p>
                </div>
              </div>
            </section>
          </div>
        ) : (
          <Scheduler 
            patients={patients} 
            inventory={inventory} 
            appointments={appointments}
            onSchedule={(app) => {
              setAppointments([...appointments, app]);
              // Ensure patient is in queue (they are, but we could move to front if desired)
              const patient = patients.find(p => p.id === app.patientId);
              if (patient) {
                setPatients(prev => [patient, ...prev.filter(p => p.id !== patient.id)]);
              }
              setActiveTab('dashboard');
            }}
          />
        )}
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
              onClick={() => {
                setShowPatientForm(false);
                setEditingPatientId(null);
              }}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl p-10 overflow-hidden border border-slate-100"
            >
              <div className="absolute top-0 right-0 p-8">
                 <button onClick={() => {
                   setShowPatientForm(false);
                   setEditingPatientId(null);
                 }} className="p-3 hover:bg-slate-50 rounded-full text-slate-300 hover:text-slate-900 transition-all">
                   <ChevronLeft className="w-5 h-5 rotate-180" />
                 </button>
              </div>
              
              <div className="mb-8">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold mb-4">H+</div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">{editingPatientId ? 'Edit Patient' : 'Admission Form'}</h3>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{editingPatientId ? 'Update clinical records' : 'Ward Admission Unit 4A'}</p>
              </div>
              
              <form onSubmit={addPatient} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Full Name</label>
                  <input required name="name" defaultValue={editingPatient?.name} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="e.g. Robert Smith" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Age</label>
                    <input required name="age" type="number" defaultValue={editingPatient?.age} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="35" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Last Visit</label>
                    <input required name="lastVisit" type="date" defaultValue={editingPatient?.lastVisit} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Primary Diagnosis</label>
                    <input required name="diagnosis" defaultValue={editingPatient?.diagnosis} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="e.g. Type II Diabetes" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Triage</label>
                    <select name="priority" defaultValue={editingPatient?.priority} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold">
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">Urgent</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">BP (mmHg)</label>
                    <input required name="bp" defaultValue={editingPatient?.vitals.bp} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="120/80" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">HR (bpm)</label>
                    <input required name="hr" type="number" defaultValue={editingPatient?.vitals.hr} className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 transition-all font-bold" placeholder="72" />
                  </div>
                </div>

                {/* Enhanced Prescription Area in Modal */}
                <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Prescriptions</label>
                     <button type="button" onClick={addMed} className="text-emerald-500 hover:text-emerald-700 font-black text-[10px] uppercase tracking-widest">+ Add</button>
                   </div>
                   <div className="space-y-2 max-h-[150px] overflow-y-auto scrollbar-hide">
                     {meds.map((med, idx) => (
                       <div key={idx} className="flex gap-2 items-center">
                         <input required value={med.name} onChange={(e) => updateMed(idx, 'name', e.target.value)} className="flex-1 px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold" placeholder="Med" />
                         <input required value={med.dosage} onChange={(e) => updateMed(idx, 'dosage', e.target.value)} className="w-20 px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold" placeholder="Dose" />
                         <input required value={med.frequency} onChange={(e) => updateMed(idx, 'frequency', e.target.value)} className="w-20 px-4 py-2 bg-slate-50 border-none rounded-xl text-xs font-bold" placeholder="Freq" />
                         {meds.length > 1 && <button type="button" onClick={() => removeMed(idx)} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>}
                       </div>
                     ))}
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest pl-1">Visit Date</label>
                      <input required name="lastVisit" type="date" className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl font-bold" />
                   </div>
                   <div className="flex items-end">
                      <button type="submit" className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20">
                        Admission Complete
                      </button>
                   </div>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
