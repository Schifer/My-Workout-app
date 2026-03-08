/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dumbbell, Utensils, Activity, ChevronRight, ChevronLeft, ChevronDown, ChevronUp,
  Moon, Sun, Pencil, Check, X, Plus, Timer, Repeat, 
  PlayCircle, CheckCircle, Circle, Play, Pause, 
  RotateCcw, Minus, TrendingUp, Edit3,
  Settings, Info, Trash2, Save
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- UTILS ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- DATA DEFAULTS ---
const DEFAULT_WORKOUT_SPLIT = [
  {
    day: "Day 1 (Push)",
    exercises: [
      { name: "Flat DB Press", weight: "10kg", sets: "4", reps: "10", tempo: "4-1-1-0" },
      { name: "L-Sit DB Press", weight: "10kg", sets: "3", reps: "8", tempo: "3-0-1-1" },
      { name: "Lateral Raises", weight: "5kg", sets: "4", reps: "12", tempo: "3-0-1-2" },
      { name: "Overhead Tricep Ext", weight: "10kg", sets: "3", reps: "10", tempo: "4-1-1-0" }
    ]
  },
  {
    day: "Day 2 (Pull)",
    exercises: [
      { name: "One-Arm DB Row", weight: "10kg", sets: "4", reps: "10", tempo: "3-0-1-2" },
      { name: "Bent-Over Flyes", weight: "5kg", sets: "4", reps: "10", tempo: "3-0-1-2" },
      { name: "Hammer Curls", weight: "10kg", sets: "3", reps: "8", tempo: "4-0-1-1" },
      { name: "Standard Curls", weight: "7.5kg", sets: "3", reps: "10", tempo: "4-1-1-1" }
    ]
  },
  {
    day: "Day 3 (Legs)",
    exercises: [
      { name: "Goblet Squat", weight: "10kg", sets: "3", reps: "10", tempo: "4-2-1-0" },
      { name: "Romanian DL", weight: "10kg", sets: "4", reps: "10", tempo: "4-1-1-1" },
      { name: "Reverse Lunges", weight: "10kg", sets: "4", reps: "6", tempo: "3-1-1-0" },
      { name: "Calf Raises", weight: "10kg", sets: "3", reps: "12", tempo: "2-2-1-2" },
      { name: "Floor Plank", weight: "BW", sets: "3", reps: "60s", tempo: "N/A" }
    ]
  }
];

const DEFAULT_DIET_PLAN = [
  { time: "Pre-Workout", items: "1 Red Banana + 2 Boiled Eggs", calories: 250, protein: 13 },
  { time: "Post-Workout", items: "Whey Shake, Oats, PB, Banana, Dates", calories: 570, protein: 35 },
  { time: "Lunch", items: "Rice + Dal + Veggies", calories: 450, protein: 15 },
  { time: "Evening", items: "Whey + Water", calories: 120, protein: 24 },
  { time: "Dinner", items: "Poha, Ghee, 1 Boiled Egg", calories: 650, protein: 14 }
];

const MOCK_HISTORY = [
  { date: new Date(Date.now() - 35 * 86400000).toISOString(), score: 50, name: 'Day 1 (Push)' },
  { date: new Date(Date.now() - 28 * 86400000).toISOString(), score: 65, name: 'Day 2 (Pull)' },
  { date: new Date(Date.now() - 20 * 86400000).toISOString(), score: 80, name: 'Day 3 (Legs)' },
  { date: new Date(Date.now() - 10 * 86400000).toISOString(), score: 75, name: 'Day 1 (Push)' },
  { date: new Date(Date.now() - 5 * 86400000).toISOString(), score: 90, name: 'Day 2 (Pull)' },
  { date: new Date(Date.now() - 1 * 86400000).toISOString(), score: 100, name: 'Day 3 (Legs)' },
];

const getSavedData = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// --- COMPONENTS ---

const WorkoutTimer = ({ label, isDark, defaultSeconds }: { label: string, isDark: boolean, defaultSeconds: number }) => {
  const [timeLeft, setTimeLeft] = useState(defaultSeconds);
  const [isRunning, setIsRunning] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [inputMins, setInputMins] = useState(Math.floor(defaultSeconds / 60));
  const [inputSecs, setInputSecs] = useState(defaultSeconds % 60);

  useEffect(() => {
    let interval: any;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => { setIsRunning(false); setTimeLeft(inputMins * 60 + inputSecs); };
  
  const saveEdit = () => {
    const total = (Number(inputMins || 0) * 60) + Number(inputSecs || 0);
    setTimeLeft(total);
    setIsEditing(false);
    setIsRunning(false);
  };

  const format = (t: number) => {
    const m = Math.floor(t / 60).toString().padStart(2, '0');
    const s = (t % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <div className={cn(
      "flex-1 p-4 rounded-3xl flex flex-col items-center justify-center gap-2 transition-all duration-300",
      isDark ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-zinc-200 shadow-sm"
    )}>
      <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</div>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input type="number" value={inputMins} onChange={e => setInputMins(Number(e.target.value))} className="w-10 text-center bg-transparent outline-none font-bold text-lg" />
          <span className="font-bold">:</span>
          <input type="number" value={inputSecs} onChange={e => setInputSecs(Number(e.target.value))} className="w-10 text-center bg-transparent outline-none font-bold text-lg" />
          <button onClick={saveEdit} className="p-1 text-emerald-500"><Check size={16}/></button>
        </div>
      ) : (
        <div onClick={() => { setIsEditing(true); setIsRunning(false); }} className={cn(
          "text-2xl font-bold tracking-tighter cursor-pointer",
          timeLeft === 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-zinc-900'
        )}>{format(timeLeft)}</div>
      )}
      <div className="flex gap-2">
        <button onClick={toggleTimer} className="p-2 rounded-full hover:bg-zinc-500/10 transition-colors">
          {isRunning ? <Pause size={16} className="text-amber-500" /> : <Play size={16} className="text-emerald-500" />}
        </button>
        <button onClick={resetTimer} className="p-2 rounded-full hover:bg-zinc-500/10 transition-colors text-red-500">
          <RotateCcw size={16} />
        </button>
      </div>
    </div>
  );
};

// --- MAIN APP ---

export default function App() {
  const [activeTab, setActiveTab] = useState('workout');
  const [isDark, setIsDark] = useState(() => getSavedData('myfit_isDark', false));
  const [weight, setWeight] = useState(() => getSavedData('myfit_weight', '68'));
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [workoutSplit, setWorkoutSplit] = useState(() => getSavedData('myfit_workoutSplit', DEFAULT_WORKOUT_SPLIT));
  const [dietPlan, setDietPlan] = useState(() => getSavedData('myfit_dietPlan', DEFAULT_DIET_PLAN));
  const [activeSession, setActiveSession] = useState<any>(null);
  const [activeSessionIdx, setActiveSessionIdx] = useState<number | null>(null);
  const [activeExerciseIdx, setActiveExerciseIdx] = useState<number | null>(null);
  const [sessionProgress, setSessionProgress] = useState<any>({});
  const [allSessionsProgress, setAllSessionsProgress] = useState(() => getSavedData('myfit_allSessionsProgress', {}));
  const [workoutHistory, setWorkoutHistory] = useState(() => getSavedData('myfit_workoutHistory', MOCK_HISTORY));
  const [timeframe, setTimeframe] = useState('month');
  const [showFinishPrompt, setShowFinishPrompt] = useState(false);
  const [expandedSplits, setExpandedSplits] = useState<number[]>(() => getSavedData('myfit_expandedSplits', [0]));
  const [editingSplitIdx, setEditingSplitIdx] = useState<number | null>(null);
  const [editingSplitName, setEditingSplitName] = useState("");
  const [editingExercise, setEditingExercise] = useState<{ splitIdx: number, exerciseIdx: number } | null>(null);
  const [editingExerciseData, setEditingExerciseData] = useState<any>(null);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('myfit_isDark', JSON.stringify(isDark)); }, [isDark]);
  useEffect(() => { localStorage.setItem('myfit_weight', JSON.stringify(weight)); }, [weight]);
  useEffect(() => { localStorage.setItem('myfit_workoutSplit', JSON.stringify(workoutSplit)); }, [workoutSplit]);
  useEffect(() => { localStorage.setItem('myfit_dietPlan', JSON.stringify(dietPlan)); }, [dietPlan]);
  useEffect(() => { localStorage.setItem('myfit_allSessionsProgress', JSON.stringify(allSessionsProgress)); }, [allSessionsProgress]);
  useEffect(() => { localStorage.setItem('myfit_workoutHistory', JSON.stringify(workoutHistory)); }, [workoutHistory]);
  useEffect(() => { localStorage.setItem('myfit_expandedSplits', JSON.stringify(expandedSplits)); }, [expandedSplits]);

  useEffect(() => { 
    if (activeSessionIdx !== null) {
      setAllSessionsProgress((p: any) => ({ ...p, [activeSessionIdx]: sessionProgress }));
    }
  }, [sessionProgress, activeSessionIdx]);

  const closeSession = () => { setActiveSession(null); setActiveSessionIdx(null); setActiveExerciseIdx(null); setShowFinishPrompt(false); };
  
  const confirmAndLogSession = () => {
    let target = 0; let done = 0;
    activeSession.exercises.forEach((ex: any, i: number) => {
      target += (parseInt(ex.reps) || 0) * (parseInt(ex.sets) || 1);
      const exData = sessionProgress[i];
      if (exData) done += (exData.setsCompleted?.filter(Boolean).length || 0) * (exData.reps || 0);
    });
    const score = target > 0 ? Math.round((done / target) * 100) : 0;
    setWorkoutHistory((prev: any) => [...prev, { date: new Date().toISOString(), score, name: activeSession.day }]);
    closeSession();
  };

  const toggleExpandSplit = (idx: number) => {
    setExpandedSplits(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
  };

  const addSplit = () => {
    const newSplit = { day: "New Day", exercises: [] };
    const newWorkoutSplit = [...workoutSplit, newSplit];
    setWorkoutSplit(newWorkoutSplit);
    setExpandedSplits(prev => [...prev, workoutSplit.length]);
    setEditingSplitIdx(workoutSplit.length);
    setEditingSplitName("New Day");
  };

  const deleteSplit = (idx: number) => {
    setWorkoutSplit((prev: any) => prev.filter((_: any, i: number) => i !== idx));
    setExpandedSplits(prev => prev.filter(i => i !== idx).map(i => i > idx ? i - 1 : i));
  };

  const addExercise = (splitIdx: number) => {
    const newEx = { name: "New Exercise", weight: "0kg", sets: "3", reps: "10", tempo: "3-0-1-0" };
    const newSplit = [...workoutSplit];
    newSplit[splitIdx].exercises.push(newEx);
    setWorkoutSplit(newSplit);
    setEditingExercise({ splitIdx, exerciseIdx: newSplit[splitIdx].exercises.length - 1 });
    setEditingExerciseData(newEx);
  };

  const deleteExercise = (splitIdx: number, exerciseIdx: number) => {
    const newSplit = [...workoutSplit];
    newSplit[splitIdx].exercises = newSplit[splitIdx].exercises.filter((_: any, i: number) => i !== exerciseIdx);
    setWorkoutSplit(newSplit);
  };

  const saveSplitName = (idx: number) => {
    const newSplit = [...workoutSplit];
    newSplit[idx].day = editingSplitName;
    setWorkoutSplit(newSplit);
    setEditingSplitIdx(null);
  };

  const cancelSplitEdit = (idx: number) => {
    if (workoutSplit[idx].day === "New Day" && workoutSplit[idx].exercises.length === 0) {
      deleteSplit(idx);
    }
    setEditingSplitIdx(null);
  };

  const saveExercise = (splitIdx: number, exerciseIdx: number) => {
    const newSplit = [...workoutSplit];
    newSplit[splitIdx].exercises[exerciseIdx] = editingExerciseData;
    setWorkoutSplit(newSplit);
    setEditingExercise(null);
  };

  const cancelExerciseEdit = (splitIdx: number, exerciseIdx: number) => {
    if (workoutSplit[splitIdx].exercises[exerciseIdx].name === "New Exercise") {
      deleteExercise(splitIdx, exerciseIdx);
    }
    setEditingExercise(null);
  };

  const startSession = (day: any, idx: number) => {
    setActiveSession(day);
    setActiveSessionIdx(idx);
    setActiveExerciseIdx(null);
    setActiveTab('session');
    
    const existingProgress = allSessionsProgress[idx];
    const isCompleted = existingProgress && Object.values(existingProgress).every((ex: any) => ex.setsCompleted?.every(Boolean));

    // If no progress exists OR the session was already completed, start fresh
    if (!existingProgress || isCompleted) {
      const freshProg: any = {}; 
      day.exercises.forEach((ex: any, i: number) => {
        freshProg[i] = { 
          reps: parseInt(ex.reps) || 10, 
          setsCompleted: Array(parseInt(ex.sets) || 1).fill(false) 
        };
      });
      setSessionProgress(freshProg);
    } else {
      // Resume existing progress, but ensure new exercises are accounted for to prevent crashes
      const mergedProg = { ...existingProgress };
      day.exercises.forEach((ex: any, i: number) => {
        if (!mergedProg[i]) {
          mergedProg[i] = { 
            reps: parseInt(ex.reps) || 10, 
            setsCompleted: Array(parseInt(ex.sets) || 1).fill(false) 
          };
        }
      });
      setSessionProgress(mergedProg);
    }
  };

  const startSessionFromPlan = (idx: number) => {
    startSession(workoutSplit[idx], idx);
  };

  const filteredHistory = useMemo(() => {
    return workoutHistory.filter((h: any) => {
      if (timeframe === 'max') return true;
      const diff = (new Date().getTime() - new Date(h.date).getTime()) / 86400000;
      return timeframe === 'week' ? diff <= 7 : diff <= 30;
    }).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [workoutHistory, timeframe]);

  const chartData = useMemo(() => {
    return filteredHistory.map((h: any) => ({
      date: new Date(h.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: h.score
    }));
  }, [filteredHistory]);

  return (
    <div className={cn(
      "min-h-screen font-sans pb-12 transition-colors duration-500",
      isDark ? "bg-zinc-950 text-zinc-100" : "bg-zinc-50 text-zinc-900"
    )}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-transparent px-4 py-3 max-w-md mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
            <Activity size={16} />
          </div>
          <h1 className="text-base font-bold tracking-tight">MyFit</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsEditingWeight(!isEditingWeight)}
            className={cn(
              "px-3 py-1 rounded-full text-[10px] font-bold transition-all",
              isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
            )}
          >
            {isEditingWeight ? (
              <input 
                autoFocus
                type="number" 
                value={weight} 
                onChange={e => setWeight(e.target.value)}
                onBlur={() => setIsEditingWeight(false)}
                className="w-8 bg-transparent outline-none text-center"
              />
            ) : `${weight}kg`}
          </button>
          
          <button 
            onClick={() => setIsDark(!isDark)}
            className={cn(
              "p-2 rounded-full transition-all",
              isDark ? "bg-zinc-900 border border-zinc-800 text-amber-400" : "bg-white border border-zinc-200 shadow-sm text-zinc-500"
            )}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      <main className="px-4 pt-2 pb-24 max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'workout' && (
            <motion.div 
              key="workout"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-bold tracking-tight">Workout Plan</h2>
                <button 
                  onClick={addSplit}
                  className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-xs font-bold"
                >
                  <Plus size={16} /> Add Split
                </button>
              </div>

              {workoutSplit.map((day: any, idx: number) => {
                const isExpanded = expandedSplits.includes(idx);
                const isEditingName = editingSplitIdx === idx;

                return (
                  <div key={idx} className={cn(
                    "rounded-3xl overflow-hidden transition-all",
                    isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
                  )}>
                    <div 
                      className={cn(
                        "p-6 flex justify-between items-center cursor-pointer",
                        isExpanded && "border-b border-zinc-800/50"
                      )}
                      onClick={() => toggleExpandSplit(idx)}
                    >
                      <div className="flex items-center gap-3 flex-1" onClick={e => e.stopPropagation()}>
                        {isEditingName ? (
                          <div className="flex items-center gap-2 flex-1">
                            <input 
                              autoFocus
                              value={editingSplitName}
                              onChange={e => setEditingSplitName(e.target.value)}
                              onKeyDown={e => e.key === 'Enter' && saveSplitName(idx)}
                              className={cn(
                                "flex-1 bg-transparent border-b-2 border-emerald-500 outline-none text-lg font-bold text-emerald-500",
                                isDark ? "text-white" : "text-zinc-900"
                              )}
                            />
                            <button onClick={() => saveSplitName(idx)} className="p-1 text-emerald-500"><Check size={16} /></button>
                            <button onClick={() => cancelSplitEdit(idx)} className="p-1 text-red-500"><X size={16} /></button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <h3 className="text-lg font-bold tracking-tight text-emerald-500">{day.day}</h3>
                            <button 
                              onClick={() => {
                                setEditingSplitIdx(idx);
                                setEditingSplitName(day.day);
                              }}
                              className="p-1 text-zinc-500 hover:text-emerald-500 transition-all"
                            >
                              <Edit3 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => { e.stopPropagation(); startSessionFromPlan(idx); }}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500 text-white text-[10px] font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1"
                        >
                          <Play size={12} fill="currentColor" /> Start
                        </button>
                        <button 
                          onClick={(e) => { e.stopPropagation(); deleteSplit(idx); }}
                          className="p-2 rounded-lg text-zinc-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                          {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </div>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="p-6 pt-0 space-y-3"
                        >
                          <div className="space-y-3 mt-4">
                            {day.exercises.map((ex: any, i: number) => {
                              const isEditingEx = editingExercise?.splitIdx === idx && editingExercise?.exerciseIdx === i;
                              
                              if (isEditingEx) {
                                return (
                                  <div key={i} className={cn(
                                    "p-4 rounded-2xl space-y-4",
                                    isDark ? "bg-zinc-800" : "bg-zinc-50"
                                  )}>
                                    <div className="space-y-2">
                                      <label className="text-[10px] font-bold text-zinc-500 uppercase">Exercise Name</label>
                                      <input 
                                        autoFocus
                                        value={editingExerciseData.name}
                                        onChange={e => setEditingExerciseData({...editingExerciseData, name: e.target.value})}
                                        className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                                      />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Weight</label>
                                        <input 
                                          value={editingExerciseData.weight}
                                          onChange={e => setEditingExerciseData({...editingExerciseData, weight: e.target.value})}
                                          className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Tempo</label>
                                        <input 
                                          value={editingExerciseData.tempo}
                                          onChange={e => setEditingExerciseData({...editingExerciseData, tempo: e.target.value})}
                                          className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                                        />
                                      </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Sets</label>
                                        <input 
                                          type="number"
                                          value={editingExerciseData.sets}
                                          onChange={e => setEditingExerciseData({...editingExerciseData, sets: e.target.value})}
                                          className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <label className="text-[10px] font-bold text-zinc-500 uppercase">Reps</label>
                                        <input 
                                          value={editingExerciseData.reps}
                                          onChange={e => setEditingExerciseData({...editingExerciseData, reps: e.target.value})}
                                          className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                                        />
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <button 
                                        onClick={() => saveExercise(idx, i)}
                                        className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold"
                                      >
                                        Save
                                      </button>
                                      <button 
                                        onClick={() => cancelExerciseEdit(idx, i)}
                                        className="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-bold"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                );
                              }

                              return (
                                <div key={i} className={cn(
                                  "flex justify-between items-center p-4 rounded-2xl group",
                                  isDark ? "bg-zinc-800/50" : "bg-zinc-50"
                                )}>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <div className="text-sm font-bold">{ex.name}</div>
                                      <button 
                                        onClick={() => {
                                          setEditingExercise({ splitIdx: idx, exerciseIdx: i });
                                          setEditingExerciseData(ex);
                                        }}
                                        className="p-1 text-zinc-500 hover:text-emerald-500 transition-all"
                                      >
                                        <Edit3 size={12} />
                                      </button>
                                    </div>
                                    <div className="text-[10px] text-zinc-500 font-medium">Tempo: {ex.tempo}</div>
                                  </div>
                                  <div className="text-right flex items-center gap-4">
                                    <div>
                                      <div className="text-sm font-bold text-emerald-500">{ex.weight}</div>
                                      <div className="text-[10px] text-zinc-500 font-medium">{ex.sets} Sets × {ex.reps}</div>
                                    </div>
                                    <button 
                                      onClick={() => deleteExercise(idx, i)}
                                      className="p-2 text-zinc-400 hover:text-red-500 transition-all"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          <button 
                            onClick={() => addExercise(idx)}
                            className="w-full py-3 rounded-2xl border-2 border-dashed border-zinc-800 text-zinc-500 hover:border-emerald-500/50 hover:text-emerald-500 transition-all flex items-center justify-center gap-2 text-xs font-bold mt-4"
                          >
                            <Plus size={16} /> Add Exercise
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </motion.div>
          )}

          {activeTab === 'diet' && (
            <motion.div 
              key="diet"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={cn(
                "rounded-3xl p-6 overflow-hidden relative",
                isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
              )}>
                <div className="flex justify-around p-6 rounded-3xl mb-8 bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold opacity-80">Daily Kcal</div>
                    <div className="text-2xl font-bold">{dietPlan.reduce((a,c) => a+(c.calories||0),0)}</div>
                  </div>
                  <div className="w-px h-10 bg-white/20 self-center" />
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold opacity-80">Protein</div>
                    <div className="text-2xl font-bold">{dietPlan.reduce((a,c) => a+(c.protein||0),0)}g</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {dietPlan.map((meal, idx) => (
                    <div key={idx} className={cn(
                      "p-4 rounded-2xl border transition-all",
                      isDark ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-50 border-zinc-100"
                    )}>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{meal.time}</span>
                        <span className="text-[10px] font-bold text-zinc-500">{meal.calories} kcal | {meal.protein}g P</span>
                      </div>
                      <div className="text-sm font-medium leading-snug">{meal.items}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'session' && (
            <motion.div 
              key="session"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {!activeSession ? (
                <div className="space-y-4">
                  <div className={cn("p-4 rounded-2xl text-center", isDark ? "bg-zinc-900/50" : "bg-emerald-50")}>
                    <p className="text-xs font-medium text-emerald-600">Ready to crush it? Select a split to start.</p>
                  </div>
                  {workoutSplit.map((day: any, idx: number) => (
                    <button 
                      key={idx} 
                      onClick={() => startSession(day, idx)} 
                      className={cn(
                        "w-full p-6 rounded-3xl flex justify-between items-center transition-all group",
                        isDark ? "bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50" : "bg-white border border-zinc-200 shadow-sm hover:border-emerald-500/50"
                      )}
                    >
                      <span className="text-lg font-bold">{day.day}</span>
                      <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                        <Play size={20} fill="currentColor" />
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-emerald-500">{activeSession.day}</h2>
                    <div className="flex gap-2">
                      <button onClick={closeSession} className="p-2 rounded-xl bg-red-500/10 text-red-500"><X size={20} /></button>
                      <button onClick={() => setShowFinishPrompt(true)} className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"><Check size={20} /></button>
                    </div>
                  </div>

                  {showFinishPrompt ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "p-8 rounded-3xl text-center",
                        isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200 shadow-xl"
                      )}
                    >
                      <div className="w-16 h-16 bg-emerald-500 text-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-500/20">
                        <CheckCircle size={32} />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Session Complete?</h3>
                      <p className="text-sm text-zinc-500 mb-8">Great work! Ready to log your progress?</p>
                      <div className="flex gap-3">
                        <button onClick={closeSession} className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-900 font-bold text-sm">Discard</button>
                        <button onClick={confirmAndLogSession} className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20">Log Session</button>
                      </div>
                    </motion.div>
                  ) : activeExerciseIdx === null ? (
                    <div className="space-y-3">
                      {activeSession.exercises.map((ex: any, i: number) => {
                        const done = sessionProgress[i]?.setsCompleted?.every(Boolean);
                        return (
                          <button 
                            key={i} 
                            onClick={() => setActiveExerciseIdx(i)} 
                            className={cn(
                              "w-full flex justify-between items-center p-5 rounded-2xl border transition-all",
                              done 
                                ? "bg-emerald-500/5 border-emerald-500/20 opacity-60" 
                                : isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                            )}
                          >
                            <div className="text-left">
                              <div className={cn("text-sm font-bold", done && "line-through")}>{ex.name}</div>
                              <div className="text-[10px] text-zinc-500">{ex.sets} sets • {ex.reps} reps</div>
                            </div>
                            <div className={cn(
                              "w-8 h-8 rounded-full flex items-center justify-center",
                              done ? "bg-emerald-500 text-white" : "bg-zinc-500/10 text-zinc-400"
                            )}>
                              {done ? <Check size={16} /> : <ChevronRight size={16} />}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (() => {
                    const ex = activeSession.exercises[activeExerciseIdx];
                    const prog = sessionProgress[activeExerciseIdx];
                    const allDone = prog.setsCompleted.every(Boolean);
                    return (
                      <motion.div 
                        initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                        className={cn(
                          "p-6 rounded-3xl",
                          isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
                        )}
                      >
                        <button onClick={() => setActiveExerciseIdx(null)} className="mb-6 flex items-center gap-1 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                          <ChevronLeft size={14}/> Back to list
                        </button>
                        
                        <div className="mb-8">
                          <h3 className="text-2xl font-bold tracking-tight mb-1">{ex.name}</h3>
                          <p className="text-xs text-zinc-500 font-medium tracking-wide uppercase">Target: {ex.sets} sets of {ex.reps} • {ex.weight}</p>
                        </div>

                        <div className={cn(
                          "flex justify-between items-center p-6 rounded-2xl mb-8",
                          isDark ? "bg-zinc-800/50" : "bg-zinc-50"
                        )}>
                          <span className="text-xs font-bold uppercase tracking-widest text-zinc-500">Reps this set</span>
                          <div className="flex items-center gap-6">
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, reps: Math.max(0, prog.reps-1)}}))} 
                              className="w-12 h-12 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-500"
                            >
                              <Minus size={20}/>
                            </motion.button>
                            <span className="text-3xl font-bold w-8 text-center">{prog.reps}</span>
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, reps: prog.reps+1}}))} 
                              className="w-12 h-12 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white"
                            >
                              <Plus size={20}/>
                            </motion.button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mb-8">
                          {prog.setsCompleted.map((s: boolean, si: number) => (
                            <motion.button 
                              key={si} 
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                const newSets = [...prog.setsCompleted]; 
                                newSets[si] = !newSets[si];
                                setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, setsCompleted: newSets}}));
                              }} 
                              className={cn(
                                "py-5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2",
                                s 
                                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                  : isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                              )}
                            >
                              {s ? <CheckCircle size={16} /> : <Circle size={16} />}
                              SET {si+1}
                            </motion.button>
                          ))}
                        </div>

                        {allDone ? (
                          <button 
                            onClick={() => setActiveExerciseIdx(null)} 
                            className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-bold shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2"
                          >
                            Next Exercise <ChevronRight size={18} />
                          </button>
                        ) : (
                          <div className="flex gap-3">
                            <WorkoutTimer label="Rest" isDark={isDark} defaultSeconds={90}/>
                            <WorkoutTimer label="Long Rest" isDark={isDark} defaultSeconds={180}/>
                          </div>
                        )}
                      </motion.div>
                    );
                  })()}
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'tracker' && (
            <motion.div 
              key="tracker"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className={cn(
                "p-6 rounded-3xl",
                isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
              )}>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500">Performance Trend</h3>
                  <div className={cn("flex p-1 rounded-xl", isDark ? "bg-zinc-800" : "bg-zinc-100")}>
                    {['week', 'month', 'max'].map(t => (
                      <button 
                        key={t} 
                        onClick={() => setTimeframe(t)} 
                        className={cn(
                          "px-3 py-1 rounded-lg text-[10px] font-bold uppercase transition-all",
                          timeframe === t ? "bg-emerald-500 text-white shadow-sm" : "text-zinc-500"
                        )}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark ? "#27272a" : "#f4f4f5"} />
                      <XAxis 
                        dataKey="date" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fill: '#71717a' }}
                        dy={10}
                      />
                      <YAxis hide domain={[0, 100]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: isDark ? '#18181b' : '#ffffff', 
                          borderColor: isDark ? '#27272a' : '#e4e4e7',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="score" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorScore)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-500 px-2">Recent Sessions</h3>
                {filteredHistory.slice().reverse().map((h: any, i: number) => (
                  <div key={i} className={cn(
                    "flex justify-between items-center p-5 rounded-2xl",
                    isDark ? "bg-zinc-900/50 border border-zinc-800" : "bg-white border border-zinc-200 shadow-sm"
                  )}>
                    <div>
                      <div className="text-sm font-bold">{h.name}</div>
                      <div className="text-[10px] text-zinc-500 font-medium">{new Date(h.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div className="flex flex-col items-end">
                      <div className="text-lg font-bold text-emerald-500">{h.score}%</div>
                      <div className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">Intensity</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 max-w-md mx-auto pointer-events-none">
        <div className={cn(
          "flex p-1.5 rounded-2xl pointer-events-auto backdrop-blur-xl shadow-2xl",
          isDark ? "bg-zinc-900/90 border border-zinc-800" : "bg-white/90 border border-zinc-200"
        )}>
          {[
            { id: 'workout', icon: Dumbbell, label: 'Plan' },
            { id: 'diet', icon: Utensils, label: 'Diet' },
            { id: 'session', icon: PlayCircle, label: 'Train' },
            { id: 'tracker', icon: TrendingUp, label: 'Stats' }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button 
                key={tab.id} 
                onClick={() => setActiveTab(tab.id)} 
                className={cn(
                  "flex-1 py-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all active:scale-90",
                  activeTab === tab.id 
                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                    : "text-zinc-500 hover:text-zinc-400"
                )}
              >
                <Icon size={18} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
