import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, indexedDBLocalPersistence } from 'firebase/auth';
import { initializeFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);

// Using initializeFirestore instead of getFirestore to provide settings
// experimentalForceLongPolling membantu di lingkungan dengan koneksi socket terbatas (seperti beberapa jaringan seluler)
export const db = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);

export const auth = getAuth(app);

// Mencoba menggunakan IndexedDB (lebih stabil di mobile)
setPersistence(auth, indexedDBLocalPersistence).catch((err) => {
  console.error('Persistence error:', err);
  // Fallback ke LocalStorage jika IndexedDB gagal
  setPersistence(auth, browserLocalPersistence);
});

export const googleProvider = new GoogleAuthProvider();
// Memaksa pemilihan akun untuk menghindari loop login otomatis yang sering error di mobile
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
