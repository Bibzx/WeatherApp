import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  onAuthStateChanged, 
  User, 
  signInWithPopup, 
  signInWithRedirect,
  getRedirectResult,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendEmailVerification
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  updateProfileName: (name: string) => Promise<void>;
  updateUserProfile: (name: string, photoURL?: string) => Promise<void>;
  sendVerification: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Menangani hasil dari redirect login (penting untuk mobile)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          toast.success(`Berhasil masuk sebagai ${result.user.displayName || result.user.email}`);
        }
      })
      .catch((error) => {
        console.error('Redirect error:', error);
        if (error.code === 'auth/internal-error' || error.code === 'auth/missing-initial-state') {
          // Jangan tampilkan toast error yang membingungkan jika itu hanya masalah state awal
          console.warn('Masalah sinkronisasi sesi terdeteksi.');
        } else if (error.code !== 'auth/popup-closed-by-user') {
          toast.error('Gagal menyelesaikan login otomatis.');
        }
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      // Deteksi jika di perangkat mobile
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      
      if (isMobile) {
        toast.info('Membuka Google Login...');
        await signInWithRedirect(auth, googleProvider);
      } else {
        await signInWithPopup(auth, googleProvider);
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.code === 'auth/popup-blocked') {
        toast.error('Popup diblokir! Silakan izinkan popup atau gunakan mode redirect.');
        await signInWithRedirect(auth, googleProvider);
      } else if (error.code === 'auth/network-request-failed') {
        toast.error('Koneksi internet bermasalah. Pastikan perangkat Anda terhubung.');
      } else {
        toast.error('Gagal masuk dengan Google. Cek SHA-1 di Firebase Console jika ini versi APK.');
      }
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name: string) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        await updateProfile(res.user, { displayName: name });
        await sendEmailVerification(res.user);
      }
    } catch (error) {
      console.error('Register error:', error);
      throw error;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const sendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      // Force React to recognize a new object even if properties changed in-place
      setUser(Object.assign({}, auth.currentUser));
    }
  };

  const updateProfileName = async (name: string) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { displayName: name });
      // Refresh user state to trigger UI update
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const updateUserProfile = async (name: string, photoURL?: string) => {
    if (!auth.currentUser) return;
    try {
      await updateProfile(auth.currentUser, { 
        displayName: name,
        photoURL: photoURL || auth.currentUser.photoURL
      });
      setUser({ ...auth.currentUser });
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUpWithEmail, signInWithEmail, updateProfileName, updateUserProfile, sendVerification, refreshUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
