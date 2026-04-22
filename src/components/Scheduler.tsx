import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Calendar as CalendarIcon,
  Search,
  User,
  Package
} from 'lucide-react';
import { cn } from '../lib/utils';

interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  status: 'confirmed' | 'pending';
}

interface SchedulerProps {
  patients: any[];
  inventory: any[];
  appointments: Appointment[];
  onSchedule: (app: Appointment) => void;
  prefillPatient?: any;
}

const TIME_SLOTS = [
  "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", 
  "11:00 AM", "11:30 AM", "01:00 PM", "01:30 PM",
  "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM"
];

export default function Scheduler({ patients, inventory, appointments, onSchedule, prefillPatient }: SchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(prefillPatient?.id || '');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  const [showSuccess, setShowSuccess] = useState(false);

  const selectedPatient = patients.find(p => p.id === selectedPatientId);

  const getInventoryWarning = (patient: any) => {
    if (!patient) return null;
    const warnings: string[] = [];
    patient.prescriptions.forEach((p: any) => {
      const item = inventory.find(i => i.name.toLowerCase().includes(p.name.toLowerCase()));
      if (item && item.quantity < 5) {
        warnings.push(`${p.name} is low in stock.`);
      } else if (!item) {
        warnings.push(`${p.name} not found in inventory.`);
      }
    });
    return warnings.length > 0 ? warnings : null;
  };

  const warnings = getInventoryWarning(selectedPatient);

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const startOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1));

  const handleSchedule = () => {
    if (!selectedPatient || !selectedTime) return;
    
    const newApp: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTime,
      status: 'confirmed'
    };
    
    setShowSuccess(true);
    setTimeout(() => {
      onSchedule(newApp);
      setSelectedTime(null);
      setShowSuccess(false);
    }, 1500);
  };

  return (
    <div className="grid lg:grid-cols-12 gap-6 h-full p-4 overflow-y-auto scrollbar-hide">
      
      {/* Left: Calendar - col-span-5 */}
      <div className="lg:col-span-5 glass-card bg-white rounded-3xl p-6 border border-slate-200 custom-shadow flex flex-col">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Select Date</h2>
          <div className="flex items-center gap-4">
            <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
              <ChevronLeft className="w-4 h-4 text-slate-500" />
            </button>
            <span className="text-sm font-black text-slate-800 tracking-tighter min-w-[120px] text-center">
              {viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
            </span>
            <button onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-xl transition-all">
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center text-[10px] font-black text-slate-300 uppercase tracking-widest">{day}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 flex-1">
          {Array.from({ length: startOfMonth(viewDate) }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {Array.from({ length: daysInMonth(viewDate) }).map((_, i) => {
            const day = i + 1;
            const isToday = new Date().toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
            const isSelected = selectedDate.toDateString() === new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toDateString();
            
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedDate(new Date(viewDate.getFullYear(), viewDate.getMonth(), day))}
                className={cn(
                  "aspect-square rounded-2xl flex items-center justify-center text-xs font-black cursor-pointer transition-all border",
                  isSelected ? "bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/20" : 
                  isToday ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                  "hover:bg-slate-50 border-transparent text-slate-600"
                )}
              >
                {day}
              </motion.div>
            );
          })}
        </div>

        {/* Upcoming Appointments List below Calendar */}
        <div className="mt-8 pt-8 border-t border-slate-100 flex-1 overflow-hidden flex flex-col min-h-[300px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 font-sans leading-none">Upcoming Appointments</h2>
            <div className="px-2 py-1 bg-emerald-50 rounded-lg">
               <span className="text-[8px] font-black text-emerald-600">{appointments.length} TOTAL</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto scrollbar-hide space-y-2">
            {appointments.length > 0 ? (
              [...appointments].reverse().map((app) => (
                <div key={app.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between group hover:bg-white hover:border-emerald-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm border border-slate-100">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-900 leading-tight">{app.patientName}</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{app.date} • {app.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[7px] font-black uppercase tracking-tighter px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded-full">{app.status}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 flex flex-col items-center justify-center gap-2 opacity-30">
                <CalendarIcon className="w-8 h-8 text-slate-300" />
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">No appointments scheduled</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Right: Slots & Patient - col-span-7 */}
      <div className="lg:col-span-7 flex flex-col gap-6 overflow-hidden relative">
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="absolute inset-0 z-50 bg-emerald-500/90 backdrop-blur-sm rounded-3xl flex flex-col items-center justify-center text-white p-10 text-center"
            >
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-6 shadow-2xl shadow-emerald-500/50"
              >
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </motion.div>
              <motion.h3 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-black tracking-tighter mb-2"
              >
                Appointment Confirmed!
              </motion.h3>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-emerald-50 text-[10px] font-black uppercase tracking-[0.2em]"
              >
                Syncing with Clinical Queue...
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Patient Selection & Status */}
        <div className="glass-card bg-white rounded-3xl p-6 border border-slate-200 custom-shadow">
          <div className="flex gap-6 items-start">
            <div className="flex-1 space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest pl-1">Assign Patient</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                  <select 
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 border-none rounded-2xl text-sm font-bold focus:ring-2 focus:ring-emerald-500 transition-all appearance-none"
                  >
                    <option value="">Choose a patient...</option>
                    {patients.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedPatient && (
                <div className="flex gap-4 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Active Prescriptions</p>
                    <div className="flex flex-wrap gap-2">
                       {selectedPatient.prescriptions.map((p: any, idx: number) => (
                         <span key={idx} className="px-2 py-1 bg-white rounded-lg text-[9px] font-bold text-slate-600 border border-emerald-100">
                           {p.name} {p.dosage}
                         </span>
                       ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Inventory Warning Box */}
            <div className="w-64">
              <div className={cn(
                "p-4 rounded-3xl h-full border transition-all",
                warnings ? "bg-rose-50 border-rose-100" : "bg-slate-50 border-slate-100"
              )}>
                <div className="flex flex-col h-full justify-between gap-3">
                  <div className="flex items-center gap-2">
                    {warnings ? <AlertTriangle className="w-5 h-5 text-rose-500" /> : <Package className="w-5 h-5 text-emerald-500" />}
                    <span className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      warnings ? "text-rose-500" : "text-emerald-500"
                    )}>
                      Inventory status
                    </span>
                  </div>
                  {warnings ? (
                    <div className="space-y-1">
                      {warnings.map((w, idx) => (
                        <p key={idx} className="text-[10px] font-bold text-rose-600 leading-tight">• {w}</p>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] font-bold text-emerald-600">All prescribed medications are in stock for this follow-up.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Time Selection */}
        <div className="glass-card bg-white rounded-3xl p-6 border border-slate-200 custom-shadow flex-1 flex flex-col overflow-hidden">
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 mb-6 underline decoration-emerald-500 underline-offset-8">Available Time Slots</h2>
          
          <div className="grid grid-cols-4 gap-3 flex-1 overflow-y-auto scrollbar-hide pr-2 py-2">
            {TIME_SLOTS.map(slot => {
              const isTaken = appointments.some(a => a.date === selectedDate.toISOString().split('T')[0] && a.time === slot);
              return (
                <button
                  key={slot}
                  disabled={isTaken}
                  onClick={() => setSelectedTime(slot)}
                  className={cn(
                    "p-4 rounded-2xl border text-xs font-black transition-all flex flex-col items-center justify-center gap-1",
                    isTaken ? "bg-slate-100 text-slate-300 border-slate-200 cursor-not-allowed" :
                    selectedTime === slot ? "bg-emerald-500 text-white border-emerald-500 shadow-xl shadow-emerald-500/20" :
                    "bg-slate-50 text-slate-600 border-slate-100 hover:border-emerald-300 hover:bg-white"
                  )}
                >
                  <Clock className={cn("w-4 h-4", selectedTime === slot ? "text-emerald-200" : "text-slate-400")} />
                  {slot}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between gap-6 pt-6 border-t border-slate-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Selected Slot</span>
              <p className="text-lg font-black text-slate-900 tracking-tighter">
                {selectedDate.toLocaleDateString('default', { day: 'numeric', month: 'short' })} • {selectedTime || '---'}
              </p>
            </div>
            <button 
              disabled={!selectedPatient || !selectedTime}
              onClick={handleSchedule}
              className="px-10 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 disabled:opacity-50 disabled:grayscale"
            >
              Confirm Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
