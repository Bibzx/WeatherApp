import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LogIn, CloudLightning, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { cn } from '../lib/utils';
import { toast } from 'sonner';

export default function AuthScreen() {
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signInWithEmail(email, password);
        toast.success(`Selamat datang kembali, ${email}!`);
      } else {
        await signUpWithEmail(email, password, name);
        toast.success(`Akun berhasil dibuat! Silakan masuk.`);
      }
    } catch (err: any) {
      const errorMessage = getFriendlyErrorMessage(err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signIn();
      toast.success('Berhasil masuk dengan Google!');
    } catch (err: any) {
      const errorMessage = err.code === 'auth/too-many-requests' 
        ? 'Terlalu banyak percobaan. Silakan tunggu beberapa menit.'
        : err.message || 'Gagal masuk dengan Google';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getFriendlyErrorMessage = (err: any) => {
    if (err.code === 'auth/operation-not-allowed') {
      return 'Pendaftaran dengan Email/Password belum diaktifkan di Firebase Console.';
    } else if (err.code === 'auth/email-already-in-use') {
      return 'Email sudah terdaftar. Silakan masuk.';
    } else if (err.code === 'auth/weak-password') {
      return 'Kata sandi terlalu lemah. Minimal 6 karakter.';
    } else if (err.code === 'auth/invalid-credential') {
      return 'Email atau kata sandi salah.';
    } else if (err.code === 'auth/too-many-requests') {
      return 'Terlalu banyak percobaan. Silakan tunggu beberapa menit sebelum mencoba lagi.';
    } else {
      return err.message || 'Terjadi kesalahan saat masuk';
    }
  };

  const toggleMode = () => {
    setMode(prev => prev === 'login' ? 'register' : 'login');
    setError('');
  };

  return (
    <div className={cn(
      "flex flex-col items-center min-h-full px-8 pt-12 pb-12 overflow-y-auto no-scrollbar transition-colors duration-500",
      isDark ? "text-white" : "text-slate-900"
    )}>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="w-20 h-20 bg-gradient-to-tr from-cyan-400 to-blue-500 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-cyan-500/20 mb-6 border border-white/30 flex-shrink-0"
      >
        <CloudLightning size={40} strokeWidth={2.5} />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1 mb-8 flex-shrink-0"
      >
        <h1 className={cn(
          "text-2xl font-black tracking-tight italic bg-clip-text text-transparent",
          isDark ? "bg-gradient-to-r from-white to-white/70" : "bg-gradient-to-r from-slate-900 to-slate-700"
        )}>WeatherTask</h1>
        <p className={cn("font-medium text-xs uppercase tracking-widest", isDark ? "text-white/40" : "text-slate-400")}>
          {mode === 'login' ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
        </p>
      </motion.div>

      <motion.form 
        layout
        onSubmit={handleSubmit}
        className="w-full space-y-4 mb-8"
      >
        <AnimatePresence mode="popLayout">
          {mode === 'register' && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-1"
            >
              <div className="relative">
                <UserIcon className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-white/30" : "text-slate-400")} size={18} />
                <input
                  type="text"
                  placeholder="Nama Lengkap"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={cn(
                    "w-full rounded-2xl py-4 pl-12 pr-4 backdrop-blur-lg focus:outline-none focus:ring-1 transition-all text-sm shadow-sm",
                    isDark ? "bg-white/5 focus:ring-cyan-500/50 focus:border-cyan-500/40 text-white placeholder:text-white/20" : "bg-slate-900/5 focus:ring-cyan-500/30 text-slate-900 placeholder:text-slate-400"
                  )}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-1">
          <div className="relative">
            <Mail className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-white/30" : "text-slate-400")} size={18} />
            <input
              type="email"
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={cn(
                "w-full rounded-2xl py-4 pl-12 pr-4 backdrop-blur-lg focus:outline-none focus:ring-1 transition-all text-sm shadow-sm",
                isDark ? "bg-white/5 focus:ring-cyan-500/50 focus:border-cyan-500/40 text-white placeholder:text-white/20" : "bg-slate-900/5 focus:ring-cyan-500/30 text-slate-900 placeholder:text-slate-400"
              )}
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="relative">
            <Lock className={cn("absolute left-4 top-1/2 -translate-y-1/2", isDark ? "text-white/30" : "text-slate-400")} size={18} />
            <input
              type="password"
              placeholder="Kata Sandi"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={cn(
                "w-full rounded-2xl py-4 pl-12 pr-4 backdrop-blur-lg focus:outline-none focus:ring-1 transition-all text-sm shadow-sm",
                isDark ? "bg-white/5 focus:ring-cyan-500/50 focus:border-cyan-500/40 text-white placeholder:text-white/20" : "bg-slate-900/5 focus:ring-cyan-500/30 text-slate-900 placeholder:text-slate-400"
              )}
            />
          </div>
        </div>

        {error && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-[10px] font-bold uppercase tracking-wider text-center"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "w-full font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all disabled:opacity-50",
            isDark ? "bg-gradient-to-r from-cyan-400 to-blue-600 text-white shadow-cyan-500/20" : "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-blue-500/30"
          )}
        >
          {loading ? (
            <Loader2 className="animate-spin" size={20} />
          ) : (
            <>
              {mode === 'login' ? 'Masuk' : 'Daftar Sekarang'}
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </motion.form>

      <div className={cn("w-full flex items-center gap-4 mb-8", isDark ? "opacity-20" : "opacity-10")}>
        <div className={cn("h-[1px] flex-1", isDark ? "bg-white" : "bg-slate-900")} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-inherit">Atau</span>
        <div className={cn("h-[1px] flex-1", isDark ? "bg-white" : "bg-slate-900")} />
      </div>

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className={cn(
            "w-full font-black py-4 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl disabled:opacity-50",
            isDark ? "bg-white/5 text-white border border-white/10 hover:bg-white/10" : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
          )}
        >
        <span className="w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-3 h-3" alt="G" />
        </span>
        Google
      </button>

      <div className="mt-8 text-center sm:mt-12">
        <button 
          onClick={toggleMode}
          className={cn("text-xs transition-colors", isDark ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-900")}
        >
          {mode === 'login' ? (
            <>Belum punya akun? <span className="text-cyan-500 font-bold">Daftar</span></>
          ) : (
            <>Sudah punya akun? <span className="text-cyan-500 font-bold">Masuk</span></>
          )}
        </button>
      </div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 0.4 }}
        className={cn("mt-auto pt-8 text-[9px] font-bold uppercase tracking-[0.3em] flex-shrink-0", isDark ? "text-white" : "text-slate-900")}
      >
        UTS Mobile Programming
      </motion.p>
    </div>
  );
}
