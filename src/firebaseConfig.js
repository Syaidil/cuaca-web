// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, onValue } from 'firebase/database';

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCPH0NJ6f-hIvGcR5wSurlO8ZPnEWbZj5I",
  authDomain: "cuacaapp-idil.firebaseapp.com",
  databaseURL: "https://cuacaapp-idil-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cuacaapp-idil",
  storageBucket: "cuacaapp-idil.firebasestorage.app",
  messagingSenderId: "73384699556",
  appId: "1:73384699556:web:7973dd1b3fbe6d0124e831",
  measurementId: "G-NC06X5BZTD"
};

// Inisialisasi app dan database
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Export biar bisa dipakai di file lain
export { database, ref, push, onValue };
