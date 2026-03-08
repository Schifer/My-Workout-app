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
const DEFAULT_WORKOUT_SPLIT: any[] = [];
const DEFAULT_DIET_PLAN: any[] = [];
const MOCK_HISTORY: any[] = [];

const getSavedData = (key: string, defaultValue: any) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  } catch (e) {
    return defaultValue;
  }
};

// --- COMPONENTS ---

const WorkoutTimer = ({ label, isDark, defaultSeconds, size = 'md' }: { label: string, isDark: boolean, defaultSeconds: number, size?: 'sm' | 'md' }) => {
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

  const isSmall = size === 'sm';

  return (
    <div className={cn(
      "flex-1 rounded-3xl flex flex-col items-center justify-center transition-all duration-300",
      isSmall ? "p-2 gap-1" : "p-4 gap-2",
      isDark ? "bg-zinc-800/50 border border-zinc-700" : "bg-white border border-zinc-200 shadow-sm"
    )}>
      <div className={cn("font-bold uppercase tracking-widest text-zinc-500", isSmall ? "text-[8px]" : "text-[10px]")}>{label}</div>
      {isEditing ? (
        <div className="flex items-center gap-1">
          <input type="number" value={inputMins} onChange={e => setInputMins(Number(e.target.value))} className={cn("text-center bg-transparent outline-none font-bold", isSmall ? "w-6 text-sm" : "w-10 text-lg")} />
          <span className="font-bold">:</span>
          <input type="number" value={inputSecs} onChange={e => setInputSecs(Number(e.target.value))} className={cn("text-center bg-transparent outline-none font-bold", isSmall ? "w-6 text-sm" : "w-10 text-lg")} />
          <button onClick={saveEdit} className="p-1 text-emerald-500"><Check size={isSmall ? 12 : 16}/></button>
        </div>
      ) : (
        <div onClick={() => { setIsEditing(true); setIsRunning(false); }} className={cn(
          "font-bold tracking-tighter cursor-pointer",
          isSmall ? "text-lg" : "text-2xl",
          timeLeft === 0 ? 'text-red-500' : isDark ? 'text-white' : 'text-zinc-900'
        )}>{format(timeLeft)}</div>
      )}
      <div className="flex gap-2">
        <button onClick={toggleTimer} className="p-1 rounded-full hover:bg-zinc-500/10 transition-colors">
          {isRunning ? <Pause size={isSmall ? 12 : 16} className="text-amber-500" /> : <Play size={isSmall ? 12 : 16} className="text-emerald-500" />}
        </button>
        <button onClick={resetTimer} className="p-1 rounded-full hover:bg-zinc-500/10 transition-colors text-red-500">
          <RotateCcw size={isSmall ? 12 : 16} />
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
  const [finishStep, setFinishStep] = useState(1); // 1: Done for day?, 2: Move to tracker?
  const [expandedSplits, setExpandedSplits] = useState<number[]>(() => getSavedData('myfit_expandedSplits', []));
  const [persistentFeedback, setPersistentFeedback] = useState(() => getSavedData('myfit_persistentFeedback', {}));
  const [editingSplitIdx, setEditingSplitIdx] = useState<number | null>(null);
  const [editingSplitName, setEditingSplitName] = useState("");
  const [editingExercise, setEditingExercise] = useState<{ splitIdx: number, exerciseIdx: number } | null>(null);
  const [editingExerciseData, setEditingExerciseData] = useState<any>(null);
  const [editingMealIdx, setEditingMealIdx] = useState<number | null>(null);
  const [editingMealData, setEditingMealData] = useState<any>(null);

  // Sync to LocalStorage
  useEffect(() => { localStorage.setItem('myfit_isDark', JSON.stringify(isDark)); }, [isDark]);
  useEffect(() => { localStorage.setItem('myfit_weight', JSON.stringify(weight)); }, [weight]);
  useEffect(() => { localStorage.setItem('myfit_persistentFeedback', JSON.stringify(persistentFeedback)); }, [persistentFeedback]);
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

  const closeSession = (log: boolean = false) => { 
    if (log) {
      confirmAndLogSession();
    }
    setActiveSession(null); 
    setActiveSessionIdx(null); 
    setActiveExerciseIdx(null); 
    setShowFinishPrompt(false); 
    setFinishStep(1);
  };
  
  const confirmAndLogSession = () => {
    let target = 0; let done = 0;
    activeSession.exercises.forEach((ex: any, i: number) => {
      target += (parseInt(ex.reps) || 0) * (parseInt(ex.sets) || 1);
      const exData = sessionProgress[i];
      if (exData) done += (exData.setsCompleted?.filter(Boolean).length || 0) * (exData.reps || 0);
    });
    const score = target > 0 ? Math.round((done / target) * 100) : 0;
    const newEntry = { date: new Date().toISOString(), score, name: activeSession.day };
    setWorkoutHistory((prev: any) => [...prev, newEntry]);
    
    // Clear the progress for this split so it's fresh next time
    if (activeSessionIdx !== null) {
      setAllSessionsProgress((p: any) => {
        const newP = { ...p };
        delete newP[activeSessionIdx];
        return newP;
      });
    }
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

  const addMeal = () => {
    const newMeal = { time: "Time", items: "New Meal", calories: 0, protein: 0 };
    setDietPlan((prev: any) => [...prev, newMeal]);
    setEditingMealIdx(dietPlan.length);
    setEditingMealData(newMeal);
  };

  const saveMeal = (idx: number) => {
    const newPlan = [...dietPlan];
    newPlan[idx] = { 
      ...editingMealData, 
      calories: parseInt(editingMealData.calories) || 0,
      protein: parseInt(editingMealData.protein) || 0
    };
    setDietPlan(newPlan);
    setEditingMealIdx(null);
  };

  const cancelMealEdit = (idx: number) => {
    if (dietPlan[idx].items === "New Meal" && dietPlan[idx].calories === 0) {
      deleteMeal(idx);
    }
    setEditingMealIdx(null);
  };

  const deleteMeal = (idx: number) => {
    setDietPlan((prev: any) => prev.filter((_: any, i: number) => i !== idx));
  };

  const startSession = (day: any, idx: number) => {
    setActiveSession(day);
    setActiveSessionIdx(idx);
    setActiveExerciseIdx(null);
    setActiveTab('session');
    
    // Always start fresh as per user request, but keep feedback
    const freshProg: any = {}; 
    day.exercises.forEach((ex: any, i: number) => {
      const feedbackKey = `${idx}-${i}`;
      freshProg[i] = { 
        reps: parseInt(ex.reps) || 10, 
        setsCompleted: Array(parseInt(ex.sets) || 1).fill(false),
        feedback: persistentFeedback[feedbackKey] || null // 'easy' | 'hard' | 'tough'
      };
    });
    setSessionProgress(freshProg);
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
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold tracking-tight">Diet Plan</h2>
                  <button 
                    onClick={addMeal}
                    className="p-2 rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 flex items-center gap-2 text-xs font-bold"
                  >
                    <Plus size={16} /> Add Meal
                  </button>
                </div>

                <div className="flex justify-around p-6 rounded-3xl mb-8 bg-emerald-500 text-white shadow-xl shadow-emerald-500/20">
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold opacity-80">Daily Kcal</div>
                    <div className="text-2xl font-bold">{dietPlan.reduce((a: any,c: any) => a+(c.calories||0),0)}</div>
                  </div>
                  <div className="w-px h-10 bg-white/20 self-center" />
                  <div className="text-center">
                    <div className="text-[10px] uppercase font-bold opacity-80">Protein</div>
                    <div className="text-2xl font-bold">{dietPlan.reduce((a: any,c: any) => a+(c.protein||0),0)}g</div>
                  </div>
                </div>

                <div className="space-y-4">
                  {dietPlan.map((meal: any, idx: number) => {
                    const isEditing = editingMealIdx === idx;

                    if (isEditing) {
                      return (
                        <div key={idx} className={cn(
                          "p-4 rounded-2xl space-y-4",
                          isDark ? "bg-zinc-800" : "bg-zinc-50"
                        )}>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Time</label>
                              <input 
                                autoFocus
                                value={editingMealData.time}
                                onChange={e => setEditingMealData({...editingMealData, time: e.target.value})}
                                className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Calories</label>
                              <input 
                                type="number"
                                value={editingMealData.calories}
                                onChange={e => setEditingMealData({...editingMealData, calories: e.target.value})}
                                className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-zinc-500 uppercase">Meal Items</label>
                            <input 
                              value={editingMealData.items}
                              onChange={e => setEditingMealData({...editingMealData, items: e.target.value})}
                              className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-zinc-500 uppercase">Protein (g)</label>
                              <input 
                                type="number"
                                value={editingMealData.protein}
                                onChange={e => setEditingMealData({...editingMealData, protein: e.target.value})}
                                className={cn("w-full bg-transparent border-b border-zinc-700 outline-none text-sm font-bold", isDark ? "text-white" : "text-zinc-900")}
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button 
                              onClick={() => saveMeal(idx)}
                              className="flex-1 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold"
                            >
                              Save
                            </button>
                            <button 
                              onClick={() => cancelMealEdit(idx)}
                              className="flex-1 py-2 rounded-xl bg-zinc-100 text-zinc-500 text-xs font-bold"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={idx} className={cn(
                        "p-4 rounded-2xl border transition-all group relative",
                        isDark ? "bg-zinc-800/30 border-zinc-800" : "bg-zinc-50 border-zinc-100"
                      )}>
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">{meal.time}</span>
                            <button 
                              onClick={() => {
                                setEditingMealIdx(idx);
                                setEditingMealData(meal);
                              }}
                              className="p-1 text-zinc-500 hover:text-emerald-500 transition-all"
                            >
                              <Edit3 size={12} />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-zinc-500">{meal.calories} kcal | {meal.protein}g P</span>
                            <button 
                              onClick={() => deleteMeal(idx)}
                              className="p-1 text-zinc-400 hover:text-red-500 transition-all"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="text-sm font-medium leading-snug">{meal.items}</div>
                      </div>
                    );
                  })}
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
                  <div className="grid gap-3">
                    {workoutSplit.length === 0 ? (
                      <div className="text-center p-8 text-zinc-500 text-sm italic">
                        No splits found. Go to the Plan tab to create one!
                      </div>
                    ) : (
                      workoutSplit.map((day: any, idx: number) => (
                        <button 
                          key={idx} 
                          onClick={() => startSession(day, idx)} 
                          className={cn(
                            "w-full p-6 rounded-3xl flex justify-between items-center transition-all group",
                            isDark ? "bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/50" : "bg-white border border-zinc-200 shadow-sm hover:border-emerald-500/50"
                          )}
                        >
                          <div className="text-left">
                            <span className="text-lg font-bold block">{day.day}</span>
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">{day.exercises.length} Exercises</span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <Play size={20} fill="currentColor" />
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start pt-2 px-1">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-black text-emerald-500 tracking-tight leading-none">{activeSession.day}</h2>
                        <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] opacity-60">Active Session</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            if (activeExerciseIdx !== null) {
                              setActiveExerciseIdx(null);
                            } else {
                              closeSession(false);
                            }
                          }} 
                          className={cn(
                            "px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider transition-all",
                            isDark ? "bg-zinc-900 text-zinc-400 hover:bg-zinc-800" : "bg-zinc-100 text-zinc-500 hover:bg-zinc-200"
                          )}
                        >
                          Back
                        </button>
                        <button 
                          onClick={() => {
                            setShowFinishPrompt(true);
                            setFinishStep(1);
                          }} 
                          className="px-5 py-2.5 rounded-2xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 text-[11px] font-black uppercase tracking-wider hover:scale-105 transition-transform"
                        >
                          End Session
                        </button>
                      </div>
                    </div>
                    
                    {activeExerciseIdx === null && (
                      <div className="px-1">
                        <WorkoutTimer label="Long Rest" isDark={isDark} defaultSeconds={180} />
                      </div>
                    )}
                  </div>

                  {showFinishPrompt ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "p-8 rounded-3xl text-center",
                        isDark ? "bg-zinc-900 border border-zinc-800" : "bg-white border border-zinc-200 shadow-xl"
                      )}
                    >
                      {finishStep === 1 ? (
                        <>
                          <div className="w-16 h-16 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Info size={32} />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Done for the day?</h3>
                          <p className="text-sm text-zinc-500 mb-8">Are you sure you want to finish this session now?</p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => setShowFinishPrompt(false)} 
                              className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-900 font-bold text-sm"
                            >
                              No
                            </button>
                            <button 
                              onClick={() => setFinishStep(2)} 
                              className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20"
                            >
                              Yes
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <TrendingUp size={32} />
                          </div>
                          <h3 className="text-xl font-bold mb-2">Move to tracker?</h3>
                          <p className="text-sm text-zinc-500 mb-8">Would you like to save your progress to the stats tracker?</p>
                          <div className="flex gap-3">
                            <button 
                              onClick={() => closeSession(false)} 
                              className="flex-1 py-4 rounded-2xl bg-zinc-100 text-zinc-900 font-bold text-sm"
                            >
                              No
                            </button>
                            <button 
                              onClick={() => closeSession(true)} 
                              className="flex-1 py-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-500/20"
                            >
                              Yes
                            </button>
                          </div>
                        </>
                      )}
                    </motion.div>
                  ) : activeExerciseIdx === null ? (
                    <div className="space-y-3">
                      {activeSession.exercises.map((ex: any, i: number) => {
                        const prog = sessionProgress[i];
                        const done = prog?.setsCompleted?.every(Boolean);
                        const feedback = prog?.feedback;
                        
                        return (
                          <button 
                            key={i} 
                            onClick={() => setActiveExerciseIdx(i)} 
                            className={cn(
                              "w-full flex justify-between items-center p-5 rounded-2xl border transition-all",
                              done 
                                ? "bg-emerald-500/5 border-emerald-500/20" 
                                : isDark ? "bg-zinc-900/50 border-zinc-800" : "bg-white border-zinc-100 shadow-sm"
                            )}
                          >
                            <div className="text-left flex items-center gap-3">
                              <div className={cn(
                                "w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold",
                                done ? "bg-emerald-500 text-white" : isDark ? "bg-zinc-800 text-zinc-500" : "bg-zinc-100 text-zinc-400"
                              )}>
                                {i + 1}
                              </div>
                              <div>
                                <div className={cn("text-sm font-bold", done && "text-emerald-500")}>{ex.name}</div>
                                <div className="text-[10px] text-zinc-500 font-medium">{ex.sets} sets • {ex.reps} reps • {ex.weight}</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {feedback && (
                                <span className={cn(
                                  "text-[10px] font-black uppercase tracking-widest",
                                  feedback === 'easy' ? "text-emerald-500" : feedback === 'hard' ? "text-red-500" : "text-amber-500"
                                )}>
                                  {feedback}
                                </span>
                              )}
                              <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                done ? "bg-emerald-500/20 text-emerald-500" : "bg-zinc-500/10 text-zinc-400"
                              )}>
                                {done ? <Check size={16} /> : <ChevronRight size={16} />}
                              </div>
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
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-2xl font-bold tracking-tight">{ex.name}</h3>
                            <span className="text-sm font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg">
                              Set {ex.sets} x Rep {ex.reps}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-2 py-1 rounded-lg bg-zinc-500/10 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">{ex.weight}</span>
                            <span className="px-2 py-1 rounded-lg bg-zinc-500/10 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">Tempo: {ex.tempo}</span>
                          </div>
                        </div>

                        <div className={cn(
                          "flex justify-between items-center p-6 rounded-2xl mb-8",
                          isDark ? "bg-zinc-800/50" : "bg-zinc-50"
                        )}>
                          <div className="space-y-1">
                            <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 block">Reps this set</span>
                            <span className="text-[10px] font-bold text-zinc-400">Max: {ex.reps}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, reps: Math.max(0, prog.reps-1)}}))} 
                              className="w-10 h-10 rounded-full bg-white dark:bg-zinc-800 shadow-sm flex items-center justify-center text-zinc-500"
                            >
                              <Minus size={18}/>
                            </motion.button>
                            
                            <input 
                              type="number"
                              value={prog.reps}
                              onChange={(e) => {
                                const val = parseInt(e.target.value) || 0;
                                const max = parseInt(ex.reps) || 999;
                                setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, reps: Math.min(val, max)}}));
                              }}
                              className="w-16 text-3xl font-bold bg-transparent text-center outline-none border-b-2 border-emerald-500/30 focus:border-emerald-500 transition-colors"
                            />

                            <motion.button 
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                const max = parseInt(ex.reps) || 999;
                                if (prog.reps < max) {
                                  setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, reps: prog.reps+1}}));
                                }
                              }} 
                              className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center text-white transition-all",
                                prog.reps >= (parseInt(ex.reps) || 999) ? "bg-zinc-500 opacity-50 cursor-not-allowed" : "bg-emerald-500 shadow-lg shadow-emerald-500/20"
                              )}
                            >
                              <Plus size={18}/>
                            </motion.button>
                          </div>
                        </div>

                        <div className="space-y-4 mb-8">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Track Sets</span>
                            <span className="text-[10px] font-bold text-emerald-500">{prog.setsCompleted.filter(Boolean).length} / {prog.setsCompleted.length} Completed</span>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {prog.setsCompleted.map((s: boolean, si: number) => (
                              <motion.button 
                                key={si} 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  const newSets = [...prog.setsCompleted]; 
                                  newSets[si] = !newSets[si];
                                  setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, setsCompleted: newSets}}));
                                }} 
                                className={cn(
                                  "p-5 rounded-2xl text-sm font-bold transition-all flex items-center justify-between",
                                  s 
                                    ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                    : isDark ? "bg-zinc-800 text-zinc-400" : "bg-zinc-100 text-zinc-500"
                                )}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={cn(
                                    "w-6 h-6 rounded-full flex items-center justify-center border",
                                    s ? "border-white/50" : "border-zinc-500/30"
                                  )}>
                                    {s ? <Check size={12} /> : <span className="text-[10px]">{si+1}</span>}
                                  </div>
                                  <span>Set {si+1}</span>
                                </div>
                                <div className="flex items-center gap-4">
                                  <span className="text-xs opacity-60">{prog.reps} Reps</span>
                                  {s ? <CheckCircle size={20} /> : <Circle size={20} className="opacity-20" />}
                                </div>
                              </motion.button>
                            ))}
                          </div>
                        </div>

                        {allDone && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 pt-4 border-t border-zinc-800/50"
                          >
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 text-center">How did it go?</p>
                            <div className="grid grid-cols-3 gap-2">
                              {[
                                { id: 'easy', label: 'Easy', color: 'bg-emerald-500', textColor: 'text-emerald-500', icon: CheckCircle },
                                { id: 'hard', label: 'Hard', color: 'bg-red-500', textColor: 'text-red-500', icon: Activity },
                                { id: 'tough', label: 'Tough', color: 'bg-amber-500', textColor: 'text-amber-500', icon: TrendingUp }
                              ].map(f => (
                                <button 
                                  key={f.id}
                                  onClick={() => {
                                    const newFeedback = f.id;
                                    setSessionProgress((p: any) => ({...p, [activeExerciseIdx]: {...prog, feedback: newFeedback}}));
                                    const feedbackKey = `${activeSessionIdx}-${activeExerciseIdx}`;
                                    setPersistentFeedback((prev: any) => ({...prev, [feedbackKey]: newFeedback}));
                                  }}
                                  className={cn(
                                    "flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2",
                                    prog.feedback === f.id 
                                      ? `border-${f.id === 'easy' ? 'emerald' : f.id === 'hard' ? 'red' : 'amber'}-500/50 bg-${f.id === 'easy' ? 'emerald' : f.id === 'hard' ? 'red' : 'amber'}-500/10` 
                                      : "border-transparent bg-zinc-500/5 grayscale opacity-50 hover:grayscale-0 hover:opacity-100"
                                  )}
                                >
                                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center text-white", f.color)}>
                                    <f.icon size={16} />
                                  </div>
                                  <span className={cn("text-[10px] font-bold uppercase tracking-tighter", prog.feedback === f.id ? f.textColor : "text-zinc-500")}>{f.label}</span>
                                </button>
                              ))}
                            </div>
                            
                            <button 
                              onClick={() => setActiveExerciseIdx(null)} 
                              className="w-full py-5 rounded-2xl bg-emerald-500 text-white font-bold shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 mt-4"
                            >
                              Next Exercise <ChevronRight size={18} />
                            </button>
                          </motion.div>
                        )}

                        {!allDone && (
                          <div className="flex gap-3">
                            <WorkoutTimer label="Rest" isDark={isDark} defaultSeconds={90}/>
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
