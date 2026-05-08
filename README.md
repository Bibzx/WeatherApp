# 🌤️ CLOUD TASK - Smart Dashboard & Weather

Aplikasi manajemen tugas modern yang terintegrasi dengan data cuaca real-time, dirancang dengan antarmuka yang memukau dan dioptimalkan untuk performa tinggi di perangkat seluler.

![Banner](https://i.top4top.io/p_3780opikh0.jpg)

## ✨ Fitur Utama

-   **Dashboard Cuaca Dinamis**: Menampilkan data cuaca real-time untuk **Bandung** (Default) dan lokasi Anda saat ini.
-   **Smart Task Manager**: Kelola tugas harian Anda dengan kategori, pencarian, dan sinkronisasi real-time.
-   **Modern Auth**: Login aman menggunakan Google Authentication (OAuth) yang telah dioptimalkan untuk perangkat seluler.
-   **Performa Optimal**: UI berbasis Glassmorphism yang telah diringankan khusus untuk perangkat Android.
-   **Kebijakan Privasi & Keamanan**: Transparansi penggunaan data langsung di dalam aplikasi.

---

## 🛠️ Persiapan Pengembangan (Local Development)

### Prasyarat
-   **Node.js** (Versi 18 ke atas)
-   **Google Cloud / Firebase Project** (Untuk database dan otentikasi)

### Cara Menjalankan
1.  Clone repositori ini.
2.  Install dependensi:
    ```bash
    npm install
    ```
3.  Jalankan dalam mode pengembangan:
    ```bash
    npm run dev
    ```

---

## 📱 Panduan Android Studio (Build APK)

Aplikasi ini menggunakan **Capacitor** untuk mengubah web-app menjadi aplikasi Android/APK asli.

### 1. Sinkronisasi Kode Web
Pastikan Anda sudah membuild aplikasi web-nya terlebih dahulu:
```bash
npm run build
npx cap sync
```

### 2. Membuka Android Studio
Jalankan perintah ini untuk membuka proyek di Android Studio:
```bash
npx cap open android
```

### 3. Konfigurasi Penting di Android Studio
-   **SHA-1 Fingerprint**: Dapatkan SHA-1 dari menu `Gradle` -> `Tasks` -> `android` -> `signingReport` di Android Studio.
-   **Firebase Console**: Masukkan SHA-1 tersebut ke dalam pengaturan project Android Anda di Firebase Console agar **Login Google** berfungsi di versi APK.
-   **Build APK**: Klik menu `Build` -> `Build Bundle(s) / APK(s)` -> `Build APK(s)`.

---

## 📜 Kebijakan Privasi
Kami sangat menjaga privasi Anda. Data yang dikumpulkan hanyalah:
-   Detail profil dasar (Nama, Email) untuk kebutuhan akun.
-   Data Tugas yang Anda simpan secara lokal/cloud.
-   Data lokasi hanya digunakan secara sementara untuk mengambil informasi cuaca.

---

## 🚀 Teknologi yang Digunakan
-   **Frontend**: React.js, Tailwind CSS, Lucide React
-   **Backend**: Firebase Firestore & Auth
-   **Animation**: Motion (Framer Motion)
-   **Mobile SDK**: CapacitorJS
-   **Weather API**: OpenWeatherMap

---

**Dibuat dengan ❤️ untuk produktivitas yang lebih baik.**
