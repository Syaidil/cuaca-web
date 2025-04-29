// Import Firebase v9+ dengan modular imports
import { initializeApp } from "firebase/app";
import { getDatabase, ref, push, onValue } from "firebase/database";


// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCPH0NJ6f-hIvGcR5wSurlO8ZPnEWbZj5I",
  authDomain: "cuacaapp-idil.firebaseapp.com",
  databaseURL: "https://cuacaapp-idil-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "cuacaapp-idil",
  storageBucket: "cuacaapp-idil.appspot.com",
  messagingSenderId: "73384699556",
  appId: "1:73384699556:web:7973dd1b3fbe6d0124e831",
  measurementId: "G-NC06X5BZTD"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Mendapatkan referensi ke database
const db = getDatabase(app);

// API Key OpenWeatherMap
const apiKey = "ea0e9939a9759606b92e18046de380a9";

// Elemen-elemen DOM
const cityInput = document.getElementById("city");
const cekBtn = document.getElementById("cekBtn");
const weatherResult = document.getElementById("weatherResult");
const weatherDataEl = document.getElementById("weatherData");
const historyList = document.getElementById("historyList");
const saranAktivitas = document.getElementById("saranAktivitas");
const aktivitasText = document.getElementById("aktivitasText");
const moodInput = document.getElementById("moodInput");
const aktivitasMoodText = document.getElementById("aktivitasMoodText");
const saranMoodDiv = document.getElementById("saranMood");
const toggleBtn = document.getElementById("darkModeToggle");
const body = document.getElementById("body");
const moonIcon = document.getElementById("moonIcon");
const sunIcon = document.getElementById("sunIcon");

// Ambil data cuaca dari API
async function getWeatherData(city) {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=id`);
    if (!res.ok) throw new Error("Kota tidak ditemukan!");
    const data = await res.json();
    return {
      kota: data.name,
      suhu: data.main.temp,
      cuaca: data.weather[0].description,
      mainCuaca: data.weather[0].main,
      waktu: new Date().toLocaleString("id-ID")
    };
  } catch (err) {
    alert("Gagal mengambil data cuaca.");
    console.error(err);
    return null;
  }
}

// Tampilkan data cuaca
function displayWeatherData(data) {
  weatherDataEl.innerHTML = `
    <p><strong>Kota:</strong> ${data.kota}</p>
    <p><strong>Suhu:</strong> ${data.suhu} °C</p>
    <p><strong>Cuaca:</strong> ${data.cuaca}</p>
    <p><strong>Waktu:</strong> ${data.waktu}</p>
  `;
  weatherResult.classList.remove("hidden");
  weatherResult.classList.add("fade-in");
}

// Saran berdasarkan cuaca
function tampilkanSaranAktivitas(data) {
  let saran = "";
  if (data.cuaca.includes("hujan")) {
    saran = "Bawa payung dan hindari aktivitas luar ruangan berlebih.";
  } else if (data.suhu >= 30) {
    saran = "Cuaca panas, minum air yang cukup dan hindari sinar matahari langsung.";
  } else if (data.suhu <= 20) {
    saran = "Cuaca dingin, kenakan jaket saat bepergian.";
  } else {
    saran = "Cuaca cukup nyaman, cocok untuk olahraga atau jalan-jalan santai.";
  }
  aktivitasText.textContent = saran;
  saranAktivitas.classList.remove("hidden");
  saranAktivitas.classList.add("fade-in");
}

// Saran berdasarkan mood
function tampilkanSaranMood(mood) {
  let saran = "";
  switch (mood) {
    case "stres":
      saran = "Cobalah meditasi atau mendengarkan musik menenangkan.";
      break;
    case "lelah":
      saran = "Tidur siang atau yoga ringan bisa menyegarkan tubuh.";
      break;
    case "senang":
      saran = "Nikmati energimu! Ajak teman atau olahraga.";
      break;
    case "cemas":
      saran = "Cobalah teknik pernapasan dalam atau journaling.";
      break;
    case "sedih":
      saran = "Tonton film atau bicara dengan orang yang kamu percayai.";
      break;
    case "bingung":
      saran = "Menulis di jurnal atau meditasi bisa bantu menjernihkan pikiran.";
      break;
    case "termotivasi":
      saran = "Manfaatkan semangatmu untuk mencoba hal baru.";
      break;
    default:
      saran = "Pilih suasana hati terlebih dahulu.";
  }
  aktivitasMoodText.textContent = saran;
  saranMoodDiv.classList.remove("hidden");
  saranMoodDiv.classList.add("fade-in");
}

// Simpan riwayat ke Firebase
async function saveWeatherHistory(data) {
  const historyRef = ref(db, "riwayatCuaca");
  await push(historyRef, data);
}

// Tampilkan riwayat dari Firebase
onValue(ref(db, "riwayatCuaca"), (snapshot) => {
  historyList.innerHTML = "";
  const data = snapshot.val();
  if (data) {
    const keys = Object.keys(data).reverse();
    keys.forEach((key) => {
      const item = data[key];
      const li = document.createElement("li");
      li.className = "p-3 bg-blue-100 rounded shadow dark:bg-gray-700 dark:text-gray-300";
      li.innerHTML = `
        <p class="font-semibold text-gray-900 dark:text-gray-100">${item.kota} (${item.waktu})</p>
        <p class="text-gray-700 dark:text-gray-300">${item.suhu} °C - ${item.cuaca}</p>
      `;
      historyList.appendChild(li);
    });
  }
});

// Cek dark mode dari localStorage
if (localStorage.getItem("darkMode") === "true") {
  body.classList.add("dark");
  moonIcon.classList.remove("hidden");
  sunIcon.classList.add("hidden");
}

// Tombol toggle dark mode
toggleBtn.addEventListener("click", () => {
  body.classList.toggle("dark");
  moonIcon.classList.toggle("hidden");
  sunIcon.classList.toggle("hidden");
  localStorage.setItem("darkMode", body.classList.contains("dark"));
});

// Fungsi untuk mengatur latar belakang berdasarkan kondisi cuaca
function setBackground(cuaca) {
    if (cuaca === "Clear") {
      document.body.style.backgroundColor = "#87CEEB"; // Biru langit cerah
    } else if (cuaca === "Rain" || cuaca === "Drizzle") {
      document.body.style.backgroundColor = "#5F6368"; // Abu-abu hujan
    } else if (cuaca === "Snow") {
      document.body.style.backgroundColor = "#B0E0E6"; // Warna salju
    } else {
      document.body.style.backgroundColor = "#D3D3D3"; // Warna default
    }
  }


// Tombol cek cuaca
cekBtn.addEventListener("click", async () => {
  const city = cityInput.value.trim();
  const mood = moodInput.value.trim();
  if (!city) {
    alert("Masukkan nama kota!");
    return;
  }
  if (!mood) {
    alert("Pilih suasana hati!");
    return;
  }
  const data = await getWeatherData(city);
  if (data) {
    displayWeatherData(data);
    tampilkanSaranAktivitas(data);
    tampilkanSaranMood(mood);
    setBackground(data.weather[0].main);
    await saveWeatherHistory(data);
  }
  cityInput.value = "";
});
