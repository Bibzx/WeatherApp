import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sun, Moon, Cloud, CloudRain, CloudFog, Snowflake, CloudLightning, AlertCircle, LogOut, Plus, Trash2, CheckCircle2, Edit2, X, Check, Home, Layout, Calendar, User as UserIcon, ArrowRight, RefreshCw, Shield } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { WeatherData, getWeatherData } from '../services/weatherService';
import { Task, subscribeToTasks, createTask, toggleTask, deleteTask, updateTaskTitle } from '../services/taskService';
import { cn } from '../lib/utils';
import { format } from 'date-fns';
import { toast } from 'sonner';

import { Geolocation } from '@capacitor/geolocation';

const weatherIcons: Record<string, any> = {
  Sun,
  Cloud,
  CloudRain,
  CloudFog,
  Snowflake,
  CloudLightning,
  AlertCircle
};

// --- WEATHER ANIMATIONS ---

const WeatherBackground = ({ weather, isDark }: { weather: WeatherData | null, isDark: boolean }) => {
  if (!weather) return null;

  const getCondition = () => {
    const id = weather.id;
    if (id >= 200 && id < 300) return 'thunderstorm';
    if (id >= 300 && id < 600) return 'rain';
    if (id >= 600 && id < 700) return 'snow';
    if (id === 800) return 'clear';
    return 'clouds';
  };

  const condition = getCondition();

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* Dynamic Background Gradient Overlay */}
      <div className={cn(
        "absolute inset-0 transition-all duration-1000 bg-gradient-to-br opacity-30",
        condition === 'thunderstorm' ? "from-indigo-900 via-purple-900 to-black" :
        condition === 'rain' ? "from-blue-800 to-slate-900" :
        condition === 'snow' ? "from-blue-50 to-blue-200" :
        condition === 'clear' ? "from-orange-400/20 via-amber-200/10 to-transparent" :
        "from-indigo-500/10 to-purple-500/10"
      )} />

      {/* simplified texture for performance */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none" />
      
      {/* Animated Elements (Limited for performance) */}
      <AnimatePresence>
        {condition === 'thunderstorm' && (
          <motion.div 
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0, 0.1, 0, 0.2, 0, 0] }}
            transition={{ duration: 8, repeat: Infinity, times: [0, 0.8, 0.82, 0.84, 0.86, 0.88, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Clear/Sunny Effect */}
      {condition === 'clear' && (
        <div className="absolute inset-0">
          <motion.div
            className={cn(
              "absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full blur-[80px] sm:blur-[120px]",
              isDark ? "bg-amber-400/10" : "bg-amber-400/30"
            )}
            animate={{ 
              scale: [1, 1.2, 1], 
              opacity: [0.3, 0.6, 0.3],
              rotate: [0, 90, 180, 270, 360]
            }}
            transition={{ 
              duration: 20, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <motion.div
            className={cn(
              "absolute top-20 left-20 w-40 h-40 rounded-full blur-[50px] sm:blur-[80px]",
              isDark ? "bg-cyan-400/5" : "bg-cyan-400/10"
            )}
            animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const { user, logOut, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  const [weather, setWeather] = React.useState<WeatherData | null>(null);
  const [citySearch, setCitySearch] = React.useState('');
  const [isWeatherLoading, setIsWeatherLoading] = React.useState(false);
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [newTaskTitle, setNewTaskTitle] = React.useState('');
  const [newTaskTime, setNewTaskTime] = React.useState('');
  const [newTaskDate, setNewTaskDate] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Edit State
  const [editingTaskId, setEditingTaskId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState('');
  const [editTime, setEditTime] = React.useState('');
  const [editDate, setEditDate] = React.useState('');

  // Navigation State
  const [activeTab, setActiveTab] = React.useState<'home' | 'schedule' | 'board' | 'profile'>('home');
  const [isCompactMode, setIsCompactMode] = React.useState(false);

  const fetchWeather = async (city?: string) => {
    setIsWeatherLoading(true);
    try {
      if (city) {
        const data = await getWeatherData(undefined, undefined, city);
        setWeather(data);
      } else {
        try {
          const coordinates = await Geolocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 5000
          });
          const data = await getWeatherData(coordinates.coords.latitude, coordinates.coords.longitude);
          setWeather(data);
        } catch (geoError) {
          console.warn('Geolocation failed, falling back to default', geoError);
          const data = await getWeatherData(); // Default to Bandung
          setWeather(data);
        }
      }
    } catch (e) {
      console.error('Error fetching weather', e);
      const data = await getWeatherData(); // Default fallback
      setWeather(data);
      toast.error('Gagal mengambil cuaca lokal, menampilkan Bandung secara otomatis.');
    } finally {
      setIsWeatherLoading(false);
    }
  };

  React.useEffect(() => {
    fetchWeather();

    if (user) {
      const unsubscribe = subscribeToTasks(user.uid, setTasks);
      return () => unsubscribe();
    }
  }, [user]);

  const handleCitySearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (citySearch.trim()) {
      fetchWeather(citySearch.trim());
      setCitySearch('');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createTask(newTaskTitle.trim(), user.uid, newTaskTime, newTaskDate);
      setNewTaskTitle('');
      setNewTaskTime('');
      setNewTaskDate('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const startEditing = (task: Task) => {
    if (!task.id) return;
    setEditingTaskId(task.id);
    setEditValue(task.title);
    setEditTime(task.scheduledTime || '');
    setEditDate(task.dueDate || '');
  };

  const saveEdit = async () => {
    if (!editingTaskId || !editValue.trim()) return;
    try {
      await updateTaskTitle(editingTaskId, editValue.trim(), editTime, editDate);
      setEditingTaskId(null);
    } catch (error) {
      console.error(error);
    }
  };

  const WeatherIcon = weather ? weatherIcons[weather.icon] || AlertCircle : AlertCircle;

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const [showPrivacyPolicy, setShowPrivacyPolicy] = React.useState(false);

  // --- RENDERING HELPERS ---

  const renderPrivacyPolicy = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/60">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className={cn(
          "w-full max-w-lg max-h-[80vh] overflow-y-auto p-8 rounded-[2.5rem] border shadow-2xl relative",
          isDark ? "bg-slate-900 border-white/10 text-white" : "bg-white border-slate-200 text-slate-900"
        )}
      >
        <button 
          onClick={() => setShowPrivacyPolicy(false)}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-purple-500/20 rounded-2xl">
              <Shield size={24} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tight">Kebijakan Privasi</h2>
              <p className={cn("text-[10px] font-bold uppercase tracking-widest opacity-40")}>Terakhir diperbarui: Mei 2026</p>
            </div>
          </div>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">1. Pengumpulan Data</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Kami mengumpulkan data minimal yang diperlukan untuk fungsionalitas aplikasi, termasuk nama, email, dan foto profil Anda melalui layanan otentikasi.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">2. Penggunaan Data</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Data Anda digunakan hanya untuk sinkronisasi tugas di berbagai perangkat dan personalisasi pengalaman cuaca lokal Anda.
            </p>
          </section>

          <section className="space-y-2">
            <h3 className="text-xs font-bold uppercase text-cyan-400 tracking-wider">3. Keamanan</h3>
            <p className="text-sm opacity-70 leading-relaxed">
              Semua data disimpan dengan aman menggunakan standar industri keamanan cloud. Kami tidak membagikan data pribadi Anda dengan pihak ketiga mana pun.
            </p>
          </section>

          <section className="space-y-2 border-t border-white/5 pt-4 opacity-40">
            <p className="text-[10px] text-center italic">
              Dengan menggunakan aplikasi ini, Anda menyetujui praktik data kami.
            </p>
          </section>

          <button 
            onClick={() => setShowPrivacyPolicy(false)}
            className="w-full py-4 mt-4 bg-cyan-500 text-white font-black rounded-2xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all"
          >
            SAYA MENGERTI
          </button>
        </div>
      </motion.div>
    </div>
  );

  const renderHome = () => (
    <div className="space-y-6">
      {/* Weather Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          "bg-gradient-to-br rounded-[2.5rem] p-8 text-white shadow-[0_20px_50px_rgba(37,99,235,0.2)] relative overflow-hidden transition-all duration-700",
          isDark 
            ? "from-indigo-600 via-blue-600 to-violet-700 shadow-black/40" 
            : "from-blue-600 via-indigo-600 to-blue-700"
        )}
      >
        {/* City Search Bar */}
        <form onSubmit={handleCitySearch} className="mb-6 relative z-10">
          <input
            type="text"
            value={citySearch}
            onChange={(e) => setCitySearch(e.target.value)}
            placeholder="Cari Kota (Contoh: Bandung, Surabaya...)"
            className={cn(
              "w-full bg-white/10 border border-white/20 rounded-full py-2 pl-4 pr-10 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 text-[11px] placeholder:text-white/60 backdrop-blur-sm transition-all",
              !isDark && "bg-white/20 border-white/30"
            )}
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-white/60 hover:text-cyan-400"
          >
            {isWeatherLoading ? (
              <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <ArrowRight size={14} />
            )}
          </button>
        </form>

        {/* Quick City Chips */}
        <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-1 relative z-10">
          {['Jakarta', 'Bandung', 'Surabaya', 'Medan', 'Bali', 'Yogyakarta', 'Makassar'].map(city => (
            <button
              key={city}
              onClick={() => fetchWeather(city)}
              className={cn(
                "flex-shrink-0 px-3 py-1 border rounded-full text-[9px] font-bold uppercase tracking-tight transition-all",
                isDark 
                  ? "bg-white/5 border-white/10 hover:bg-white/10" 
                  : "bg-white/20 border-white/30 hover:bg-white/30"
              )}
            >
              {city}
            </button>
          ))}
        </div>

        <div className="relative z-10 flex justify-between items-start drop-shadow-md">
          <div>
            <p className="text-sm font-bold mb-1">{weather?.location || 'Jakarta'}</p>
            <h2 className="text-4xl font-black mb-1">{weather ? `${weather.temp}°C` : '--'}</h2>
            <p className="text-xs font-bold uppercase tracking-widest">{weather?.condition || 'Updating...'}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button 
              onClick={() => fetchWeather()}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-all border border-white/10"
              title="Gunakan Lokasi Saat Ini"
            >
              <RefreshCw size={16} className={cn("text-cyan-400", isWeatherLoading && "animate-spin")} />
            </button>
            <WeatherIcon size={48} className="text-cyan-400 opacity-80 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
          </div>
        </div>
        <div className="mt-6 flex justify-between border-t border-white/10 pt-4 relative z-10">
          <div className="text-center">
            <p className="text-[10px] opacity-40 uppercase tracking-tighter mb-1">Day</p>
            <p className="text-[11px] font-semibold">{format(new Date(), 'EEEE')}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] opacity-40 uppercase tracking-tighter mb-1">Date</p>
            <p className="text-[11px] font-semibold">{format(new Date(), 'dd MMM')}</p>
          </div>
          <div className="text-center">
            <p className="text-[10px] opacity-40 uppercase tracking-tighter mb-1">Humidity</p>
            <p className="text-[11px] font-semibold text-cyan-400">Stable</p>
          </div>
        </div>
      </motion.div>

      {/* Forecast Preview */}
      {weather && weather.forecast && weather.forecast.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {weather.forecast.map((day, i) => {
            const ForecastIcon = weatherIcons[day.icon] || Cloud;
            return (
              <motion.div
                key={day.date}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={cn(
                  "p-3 rounded-2xl text-center transition-all",
                  isDark ? "bg-white/5" : "bg-white shadow-sm"
                )}
              >
                <p className={cn("text-[8px] font-black uppercase tracking-widest mb-2", isDark ? "text-white/80" : "text-slate-900/80")}>
                  {format(new Date(day.date), 'EEE')}
                </p>
                <ForecastIcon size={20} className="mx-auto mb-2 text-cyan-500 drop-shadow-sm" />
                <p className="text-sm font-black">{day.temp}°</p>
                <p className={cn("text-[7px] uppercase font-bold truncate", isDark ? "text-white/60" : "text-slate-600")}>{day.condition}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Task Input */}
      <div className="space-y-4">
        <form onSubmit={handleCreateTask} className="flex flex-col gap-3">
          <div className="relative group">
            <input
              type="text"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="Apa yang ingin kamu kerjakan?"
              className={cn(
                "w-full rounded-2xl py-4 pl-5 pr-14 backdrop-blur-lg focus:outline-none focus:ring-1 transition-all text-sm shadow-xl",
                isDark 
                  ? "bg-white/5 focus:ring-cyan-500/50 focus:border-cyan-500/40 placeholder:text-white/20" 
                  : "bg-slate-900/5 focus:ring-cyan-500/30 focus:border-cyan-500/40 placeholder:text-slate-400"
              )}
            />
            <button
              type="submit"
              disabled={!newTaskTitle.trim() || isSubmitting}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl flex items-center justify-center transition-all shadow-lg",
                isDark 
                  ? "bg-cyan-500/80 text-white hover:bg-cyan-500 disabled:bg-white/5 disabled:text-white/20" 
                  : "bg-cyan-500 text-white hover:bg-cyan-600 disabled:bg-slate-200 disabled:text-slate-400"
              )}
            >
              <Plus size={20} />
            </button>
          </div>
          <div className="flex flex-wrap items-center gap-3 px-1">
            <div className="flex items-center gap-2">
              <label className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "opacity-40" : "opacity-50")}>Pukul:</label>
              <input 
                type="time"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                className={cn(
                  "rounded-xl px-4 py-2 text-[11px] text-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30",
                  isDark ? "bg-white/10" : "bg-slate-900/5"
                )}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className={cn("text-[10px] font-bold uppercase tracking-wider", isDark ? "opacity-40" : "opacity-50")}>Deadline:</label>
              <input 
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className={cn(
                  "rounded-xl px-4 py-2 text-[11px] text-cyan-500 focus:outline-none focus:ring-1 focus:ring-cyan-500/30",
                  isDark ? "bg-white/10" : "bg-slate-900/5"
                )}
              />
            </div>
            <span className="text-[9px] opacity-30 italic">(Opsional)</span>
          </div>
        </form>

        <div className="relative">
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tugas kamu..."
            className={cn(
              "w-full border rounded-xl py-3 px-4 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-all",
              isDark ? "bg-white/5 border-white/10 placeholder:text-white/20" : "bg-slate-900/5 border-slate-100 placeholder:text-slate-400"
            )}
          />
        </div>
      </div>

      {/* Main List Header */}
      <div className="flex justify-between items-center px-1">
        <h3 className={cn("text-[11px] font-bold uppercase tracking-[0.2em]", isDark ? "text-white/40" : "text-slate-400")}>Priority Tasks</h3>
        <span className={cn(
          "text-[10px] border px-2 py-0.5 rounded-full font-mono font-bold",
          isDark ? "bg-white/10 border-white/10 text-white/60" : "bg-slate-100 border-slate-200 text-slate-500"
        )}>
          {tasks.filter(t => !t.completed).length} Pending
        </span>
      </div>

      <div className="space-y-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {filteredTasks.length === 0 ? (
            <motion.div className="py-16 flex flex-col items-center text-center opacity-40"><p className="text-[10px] uppercase tracking-[0.3em]">No tasks found</p></motion.div>
          ) : (
            filteredTasks.map(renderTaskItem)
          )}
        </AnimatePresence>
      </div>
    </div>
  );


  const renderTaskItem = (task: Task) => (
    <motion.div
      key={task.id}
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "flex items-center gap-4 transition-all group shadow-[0_8px_30px_rgb(0,0,0,0.04)]",
        isDark 
          ? "bg-white/[0.03] hover:bg-white/[0.06] backdrop-blur-md" 
          : "bg-white/40 hover:bg-white/60 backdrop-blur-md",
        isCompactMode ? "p-3 rounded-2xl gap-3" : "p-5 rounded-[2rem] gap-4",
        task.completed && editingTaskId !== task.id && "opacity-40"
      )}
    >
      {editingTaskId === task.id ? (
        <div className="flex-1 flex flex-col gap-2">
          <input 
            className={cn(
              "bg-transparent border-b border-cyan-400 focus:outline-none text-sm font-medium w-full px-2 py-1",
              isDark ? "text-white" : "text-slate-900"
            )}
            value={editValue}
            autoFocus
            onChange={(e) => setEditValue(e.target.value)}
          />
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <input 
                type="time"
                className={cn(
                  "bg-transparent border rounded-lg text-[10px] text-cyan-400 p-1 focus:outline-none",
                  isDark ? "border-white/20" : "border-slate-200"
                )}
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
              />
              <input 
                type="date"
                className={cn(
                  "bg-transparent border rounded-lg text-[10px] text-cyan-400 p-1 focus:outline-none",
                  isDark ? "border-white/20" : "border-slate-200"
                )}
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={saveEdit} className="p-1.5 bg-cyan-500/20 text-cyan-400 rounded-lg hover:bg-cyan-500/30 ml-auto"><Check size={16} /></button>
              <button onClick={() => setEditingTaskId(null)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30"><X size={16} /></button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <button 
            onClick={() => task.id && toggleTask(task.id, task.completed)}
            className={cn(
              "flex-shrink-0 w-6 h-6 rounded-lg border flex items-center justify-center transition-all",
              task.completed ? "bg-cyan-400 border-cyan-400 text-slate-900" : (isDark ? "border-white/30 text-transparent hover:border-cyan-400" : "border-slate-300 text-transparent hover:border-cyan-400")
            )}
          >
            <CheckCircle2 size={14} strokeWidth={3} />
          </button>
          <div className="flex-1 min-w-0 text-left">
            <p className={cn("text-sm font-bold truncate", task.completed && "line-through opacity-60")}>{task.title}</p>
            <div className="flex items-center gap-2 mt-0.5">
              {task.scheduledTime && (
                <span className="text-[10px] font-black text-cyan-400 bg-cyan-400/10 px-1.5 rounded-md uppercase tracking-wider">
                  {task.scheduledTime}
                </span>
              )}
              {task.dueDate && (
                <span className="text-[10px] font-black text-purple-400 bg-purple-400/10 px-1.5 rounded-md uppercase tracking-wider">
                  {task.dueDate}
                </span>
              )}
              <p className={cn("text-[9px] italic font-bold uppercase tracking-wider", isDark ? "opacity-30" : "opacity-40")}>
                {task.updatedAt ? format((task.updatedAt as any).toDate(), 'HH:mm') : '--:--'}
              </p>
            </div>
          </div>
          <div className="flex gap-1 shrink-0">
            <button onClick={() => startEditing(task)} className={cn("p-2 transition-colors", isDark ? "text-white/40 hover:text-cyan-400" : "text-slate-400 hover:text-cyan-500")}><Edit2 size={16} /></button>
            <button onClick={() => task.id && deleteTask(task.id)} className={cn("p-2 transition-colors", isDark ? "text-white/40 hover:text-red-400" : "text-slate-400 hover:text-red-500")}><Trash2 size={16} /></button>
          </div>
        </>
      )}
    </motion.div>
  );

  const renderSchedule = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-xl font-bold tracking-tight">Timeline</h2>
        <div className="flex items-center gap-4">
          <div className={cn(
            "w-8 h-8 rounded-full overflow-hidden border",
            isDark ? "border-white/20" : "border-slate-200 shadow-sm"
          )}>
            <img src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} className="w-full h-full object-cover" alt="User" />
          </div>
          <div className="flex gap-2">
            {['T', 'W', 'T', 'F', 'S', 'S', 'M'].map((day, i) => (
              <div key={i} className={cn(
                "w-8 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold border",
                i === 1 
                  ? "bg-cyan-500 text-white border-cyan-400 shadow-lg shadow-cyan-500/20" 
                  : (isDark ? "bg-white/5 border-white/10 opacity-40 text-white" : "bg-slate-100 border-slate-200 opacity-60 text-slate-500")
              )}>{day}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Local search in tab */}
      <div className="relative">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari jadwal kedepan..."
          className={cn(
            "w-full border rounded-xl py-3 px-4 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors",
            isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-slate-900/5 border-slate-200 text-slate-900 placeholder:text-slate-400"
          )}
        />
      </div>
      
      <div className={cn(
        "relative ml-3 pl-6 space-y-8",
        isDark ? "opacity-40" : "opacity-60"
      )}>
        {filteredTasks.length === 0 ? (
          <p className="text-[10px] uppercase tracking-widest opacity-30 py-10">Tidak ada jadwal ditemukan</p>
        ) : (
          filteredTasks.map((task, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              key={task.id} 
              className="relative"
            >
              <div className="absolute -left-[31px] top-6 w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.5)] border-2 border-[#0f172a]" />
              <div className="text-[10px] font-bold uppercase tracking-widest text-cyan-400/60 mb-2 px-1">
                {task.createdAt ? format((task.createdAt as any).toDate(), 'HH:mm') : 'Recently'}
              </div>
              {renderTaskItem(task)}
            </motion.div>
          ))
        )}
      </div>
    </div>
  );

  const renderBoard = () => (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">Task Board</h2>
        <div className={cn(
          "w-8 h-8 rounded-full overflow-hidden border",
          isDark ? "border-white/20" : "border-slate-200"
        )}>
          <img src={user?.photoURL || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100'} className="w-full h-full object-cover" alt="User" />
        </div>
      </div>
      
      <div className="relative">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari tugas di board..."
          className={cn(
            "w-full border rounded-xl py-3 px-4 text-[11px] focus:outline-none focus:ring-1 focus:ring-cyan-500/50 transition-colors",
            isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/20" : "bg-slate-900/5 border-slate-200 text-slate-900 placeholder:text-slate-400"
          )}
        />
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-5 px-5 h-full">
        {/* Column: To Do */}
        <div className="flex-shrink-0 w-72 space-y-4">
          <div className={cn(
            "flex justify-between items-center p-3 rounded-2xl transition-colors",
            isDark ? "bg-white/5" : "bg-slate-100"
          )}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">To Do</h4>
            <span className={cn("text-[10px] font-bold opacity-40", isDark ? "text-white" : "text-slate-500")}>{filteredTasks.filter(t => !t.completed).length}</span>
          </div>
          <div className="space-y-3">
            {filteredTasks.filter(t => !t.completed).length === 0 ? (
              <p className={cn("text-[9px] text-center py-10 uppercase tracking-widest", isDark ? "opacity-20" : "opacity-30")}>Kosong</p>
            ) : (
              filteredTasks.filter(t => !t.completed).map(task => renderTaskItem(task))
            )}
          </div>
        </div>

        {/* Column: Done */}
        <div className="flex-shrink-0 w-72 space-y-4">
          <div className={cn(
            "flex justify-between items-center p-3 rounded-2xl transition-colors",
            isDark ? "bg-white/5" : "bg-slate-100"
          )}>
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500">Completed</h4>
            <span className={cn("text-[10px] font-bold opacity-40", isDark ? "text-white" : "text-slate-500")}>{filteredTasks.filter(t => t.completed).length}</span>
          </div>
          <div className="space-y-3">
            {filteredTasks.filter(t => t.completed).length === 0 ? (
              <p className={cn("text-[9px] text-center py-10 uppercase tracking-widest", isDark ? "opacity-20" : "opacity-30")}>Belum ada yang selesai</p>
            ) : (
              filteredTasks.filter(t => t.completed).map(task => renderTaskItem(task))
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = React.useState(false);
  const [profileName, setProfileName] = React.useState(user?.displayName || '');
  const [profilePhoto, setProfilePhoto] = React.useState(user?.photoURL || '');

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return;
    try {
      await updateUserProfile(profileName.trim(), profilePhoto.trim());
      setIsEditingProfile(false);
    } catch (error) {
      alert('Gagal memperbarui profil');
    }
  };

  const handleLogout = async () => {
    await logOut();
    toast.info('Kamu telah keluar akun');
  };

  const renderProfile = () => (
    <div className="space-y-8">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={cn(
          "w-24 h-24 rounded-full border-4 p-1 relative transition-colors duration-500",
          isDark ? "border-white/10" : "border-slate-100 shadow-xl"
        )}>
          <div className="w-full h-full rounded-full overflow-hidden bg-gradient-to-tr from-cyan-400 to-blue-500">
            {user?.photoURL ? (
              <img className="w-full h-full object-cover" src={user.photoURL} alt="Profile" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-black">{user?.displayName?.[0] || 'U'}</div>
            )}
          </div>
          <div className={cn(
            "absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
            isDark ? "bg-cyan-400 border-[#0f172a] text-slate-900" : "bg-cyan-500 border-white text-white"
          )}><Check size={12} strokeWidth={4} /></div>
        </div>
        
        {isEditingProfile ? (
          <form onSubmit={handleUpdateProfile} className="w-full space-y-3">
            <input 
              className={cn(
                "border rounded-xl px-4 py-2 w-full text-center text-sm focus:outline-none focus:border-cyan-400 shadow-sm transition-colors",
                isDark ? "bg-white/5 border-white/20 text-white" : "bg-slate-900/5 border-slate-200 text-slate-900"
              )}
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="Display Name"
              autoFocus
            />
            <input 
              className={cn(
                "border rounded-xl px-4 py-2 w-full text-center text-[10px] focus:outline-none focus:border-cyan-400 shadow-sm transition-colors",
                isDark ? "bg-white/5 border-white/20 text-white" : "bg-slate-900/5 border-slate-200 text-slate-900"
              )}
              value={profilePhoto}
              onChange={(e) => setProfilePhoto(e.target.value)}
              placeholder="Photo URL"
            />
            <div className="flex gap-2">
              <button type="submit" className="flex-1 bg-cyan-500 text-white text-[10px] font-bold py-2 rounded-xl shadow-lg shadow-cyan-500/20">SAVE</button>
              <button type="button" onClick={() => setIsEditingProfile(false)} className={cn("flex-1 text-[10px] font-bold py-2 rounded-xl transition-colors", isDark ? "bg-white/10" : "bg-slate-200 text-slate-600")}>CANCEL</button>
            </div>
          </form>
        ) : (
          <div>
            <h2 className="text-xl font-bold">{user?.displayName || 'User'}</h2>
            <p className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-white/40" : "text-slate-400")}>{user?.email}</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className={cn(
          "p-4 border rounded-3xl text-center space-y-1 shadow-lg transition-colors",
          isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100"
        )}>
          <p className="text-2xl font-black text-cyan-500">{tasks.filter(t => t.completed).length}</p>
          <p className={cn("text-[8px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-slate-900")}>Tasks Done</p>
        </div>
        <div className={cn(
          "p-4 border rounded-3xl text-center space-y-1 shadow-lg transition-colors",
          isDark ? "bg-white/5 border-white/10" : "bg-white border-slate-100"
        )}>
          <p className="text-2xl font-black text-amber-500">{tasks.filter(t => !t.completed).length}</p>
          <p className={cn("text-[8px] font-bold uppercase tracking-widest opacity-40", isDark ? "text-white" : "text-slate-900")}>Ongoing</p>
        </div>
      </div>

      <div className="space-y-3">
        {!isEditingProfile && (
          <button 
            onClick={() => {
              setProfileName(user?.displayName || '');
              setProfilePhoto(user?.photoURL || '');
              setIsEditingProfile(true);
            }}
            className={cn(
              "w-full p-4 border rounded-2xl flex items-center justify-between text-sm font-medium transition-all active:scale-[0.98]",
              isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-900/5 border-slate-200 hover:bg-slate-900/10"
            )}
          >
            <span className="flex items-center gap-3">
              <UserIcon size={18} className="text-cyan-500" />
              Pengaturan Akun
            </span>
            <ArrowRight size={16} className="opacity-40" />
          </button>
        )}

        <button 
          onClick={() => setShowPrivacyPolicy(true)}
          className={cn(
            "w-full p-4 border rounded-2xl flex items-center justify-between text-sm font-medium transition-all active:scale-[0.98]",
            isDark ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-slate-900/5 border-slate-200 hover:bg-slate-900/10"
          )}
        >
          <span className="flex items-center gap-3">
            <Shield size={18} className="text-purple-500" />
            Kebijakan Privasi
          </span>
          <ArrowRight size={16} className="opacity-40" />
        </button>

        <div className={cn(
          "w-full p-4 border rounded-2xl flex items-center justify-between text-sm font-medium",
          isDark ? "bg-white/5 border-white/10 shadow-inner" : "bg-slate-900/5 border-slate-200"
        )}>
          <span className="flex items-center gap-3">
            <RefreshCw size={18} className="text-blue-500" />
            Versi Aplikasi
          </span>
          <span className="text-[10px] font-black opacity-30 tracking-widest">BUILD 2.5.0</span>
        </div>

        <div className="pt-4">
          <button onClick={handleLogout} className="w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-red-400 hover:bg-red-500/20 transition-all shadow-xl shadow-red-500/5">
            <LogOut size={16} />
            Keluar Akun
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(
      "flex flex-col h-full overflow-hidden relative selection:bg-cyan-500/30 transition-colors duration-500",
      isDark ? "text-white" : "text-slate-950"
    )}>
      {/* dynamic background */}
      <WeatherBackground weather={weather} isDark={isDark} />

      {/* Privacy Policy Modal */}
      <AnimatePresence>
        {showPrivacyPolicy && renderPrivacyPolicy()}
      </AnimatePresence>

      {/* Header */}
      <header className={cn(
        "px-8 py-8 flex justify-between items-center backdrop-blur-xl sm:backdrop-blur-3xl shrink-0 z-40 transition-all duration-500",
        isDark ? "bg-black/10" : "bg-white/20"
      )}>
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-10 h-10 rounded-full overflow-hidden border-2 p-[2px] bg-gradient-to-tr from-cyan-400 to-blue-500",
            isDark ? "border-white/20" : "border-slate-200 shadow-sm"
          )}>
            {user?.photoURL ? (
              <img className="w-full h-full rounded-full object-cover" src={user.photoURL} alt={user.displayName || ''} referrerPolicy="no-referrer" />
            ) : (
              <div className={cn(
                "w-full h-full rounded-full flex items-center justify-center text-xs font-bold",
                isDark ? "bg-slate-800" : "bg-slate-100 text-slate-500"
              )}>
                {user?.displayName?.[0] || user?.email?.[0]}
              </div>
            )}
          </div>
          <div>
            <p className={cn(
              "text-[10px] font-black uppercase tracking-widest mb-1",
              isDark ? "text-white/60" : "text-slate-500"
            )}>
              {activeTab === 'home' ? 'Home' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </p>
            <h1 className="text-sm font-black leading-none drop-shadow-sm">{user?.displayName?.split(' ')[0] || 'User'}</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full border flex items-center justify-center animate-pulse",
            isDark ? "bg-white/5 border-white/10 text-cyan-400" : "bg-cyan-50 border-cyan-100 text-cyan-500"
          )}>
            <div className={cn("w-1.5 h-1.5 rounded-full", isDark ? "bg-cyan-400" : "bg-cyan-500")} />
          </div>
        </div>
      </header>

      {/* Main Scroll Content */}
      <main className="px-5 pt-4 flex-1 overflow-y-auto no-scrollbar pb-32 flex flex-col gap-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-6"
          >
            {activeTab === 'home' && renderHome()}
            {activeTab === 'schedule' && renderSchedule()}
            {activeTab === 'board' && renderBoard()}
            {activeTab === 'profile' && renderProfile()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Bottom Navigation Navbar */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-24 backdrop-blur-xl sm:backdrop-blur-3xl flex justify-around items-center px-10 z-30 transition-all duration-500",
        isDark ? "bg-black/40" : "bg-white/30"
      )}>
        <button 
          onClick={() => setActiveTab('home')}
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'home' ? "text-cyan-500" : "opacity-40 hover:opacity-70")}
        >
          <Home size={20} strokeWidth={activeTab === 'home' ? 2.5 : 2} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('schedule')}
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'schedule' ? "text-cyan-500" : "opacity-40 hover:opacity-70")}
        >
          <Calendar size={20} strokeWidth={activeTab === 'schedule' ? 2.5 : 2} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Schedule</span>
        </button>
        <button 
          onClick={() => setActiveTab('board')}
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'board' ? "text-cyan-500" : "opacity-40 hover:opacity-70")}
        >
          <Layout size={20} strokeWidth={activeTab === 'board' ? 2.5 : 2} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Board</span>
        </button>
        <button 
          onClick={() => setActiveTab('profile')}
          className={cn("flex flex-col items-center gap-1 transition-all", activeTab === 'profile' ? "text-cyan-500" : "opacity-40 hover:opacity-70")}
        >
          <UserIcon size={20} strokeWidth={activeTab === 'profile' ? 2.5 : 2} />
          <span className="text-[8px] font-bold uppercase tracking-wider">Profile</span>
        </button>
      </div>

      {/* Style for hidden scrollbar */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
