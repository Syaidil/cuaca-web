import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import './App.css';
import './assets/style.css';
import { database, ref, push, onValue } from './firebaseConfig';

const API_KEY = 'ea0e9939a9759606b92e18046de380a9';

// Fungsi terjemahan kondisi cuaca
const translateToIndonesian = (condition) => {
  const translations = {
    "clear sky": "Langit cerah",
    "few clouds": "Sedikit awan",
    "scattered clouds": "Awan tersebar",
    "broken clouds": "Awan pecah",
    "shower rain": "Hujan ringan",
    "rain": "Hujan",
    "thunderstorm": "Badai petir",
    "mist": "Kabut",
    "haze": "Kabut",
    "fog": "Kabut"
  };
  return translations[condition] || condition;
};

// Fungsi saran aktivitas berdasarkan kondisi cuaca
const getSaranAktivitas = (kondisi) => {
  kondisi = kondisi.toLowerCase();
  if (kondisi.includes("cerah")) return "Cocok untuk jalan-jalan atau olahraga di luar!";
  if (kondisi.includes("hujan")) return "Sebaiknya bawa payung atau tetap di rumah.";
  if (kondisi.includes("kabut")) return "Berkendara hati-hati, jarak pandang terbatas.";
  if (kondisi.includes("badai")) return "Lebih aman di dalam ruangan.";
  return "Nikmati harimu dengan bijak!";
};

function App() {
  const [cuacaData, setCuacaData] = useState({});
  const [loading, setLoading] = useState(false);
  const [kotaInput, setKotaInput] = useState('');

  const fetchWeather = async (kota) => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${kota}&appid=${API_KEY}&units=metric&lang=id`
      );
      const data = await response.json();
      console.log('Data dari OpenWeatherMap:', data);

      if (response.ok) {
        const kondisiTerjemahan = translateToIndonesian(data.weather[0].description);
        const saranAktivitas = getSaranAktivitas(kondisiTerjemahan);

        const cuacaBaru = {
          kota: data.name,
          suhu: data.main.temp,
          kondisi: kondisiTerjemahan,
          waktu: new Date().toLocaleString(),
          saran: saranAktivitas
        };

        const cuacaRef = ref(database, 'riwayatCuaca');
        await push(cuacaRef, cuacaBaru);
      } else {
        console.error('Gagal mengambil data:', data.message);
      }
    } catch (error) {
      console.error('Gagal fetch cuaca:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cuacaRef = ref(database, 'riwayatCuaca');
    const unsubscribe = onValue(cuacaRef, (snapshot) => {
      const data = snapshot.val();
      setCuacaData(data || {});
    });

    return () => unsubscribe();
  }, []);

  const handleCariCuaca = () => {
    if (kotaInput.trim() !== '') {
      fetchWeather(kotaInput.trim());
      setKotaInput('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleCariCuaca();
    }
  };

  const isEmptyData = !cuacaData || Object.keys(cuacaData).length === 0;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-600">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white text-center shadow-lg shadow-blue-900">
        Info Cuaca Terkini
      </h1>

      {/* Input dan Button */}
      <div className="flex flex-col sm:flex-row items-center mb-6 w-full max-w-2xl">
        <input
          type="text"
          placeholder="Masukkan nama kota"
          value={kotaInput}
          onChange={(e) => setKotaInput(e.target.value)}
          onKeyPress={handleKeyPress}  // Menambahkan event listener untuk Enter
          className="p-3 rounded-lg w-full sm:w-2/3 md:w-1/2 lg:w-1/3 mr-0 sm:mr-4 mb-4 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all transform hover:scale-105"
        />
        <button
          onClick={handleCariCuaca}
          className="bg-white text-gray-700 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-100 transition-all transform hover:scale-105"
        >
          Cari Cuaca
        </button>
      </div>

      {/* Card Riwayat Cuaca */}
      {loading ? (
        <div className="flex justify-center items-center h-64 w-full">
          <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
        </div>
      ) : isEmptyData ? (
        <p className="text-white text-lg">Belum ada data cuaca. Coba cari kota dulu.</p>
      ) : (
        <div className="weather-cards-container w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(cuacaData)
            .reverse()
            .map(([key, item], index) => (
              <motion.div
                key={key}
                className="weather-card bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col items-start mb-4"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h2 className="text-xl font-bold text-blue-700 mb-2">{item.kota}</h2>
                <p className="text-gray-700 mb-1">Suhu: <span className="font-semibold text-blue-500">{item.suhu}°C</span></p>
                <p className="text-gray-700 mb-1 capitalize">Kondisi: <span className="font-semibold text-blue-500">{item.kondisi}</span></p>
                <p className="text-gray-500 text-sm mb-2">{item.waktu}</p>
                <p className="text-green-600 font-medium italic">{item.saran}</p>
              </motion.div>
            ))}
        </div>
      )}
    </div>
  );
}

export default App;
