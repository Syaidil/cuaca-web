import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CloudSun } from 'lucide-react';
import './App.css';
import './assets/style.css';
import { database, ref, push, onValue } from './firebaseConfig';

const API_KEY = 'ea0e9939a9759606b92e18046de380a9';

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

const getSaranAktivitas = (kondisi) => {
  kondisi = kondisi.toLowerCase();
  if (kondisi.includes("cerah")) return "Cocok untuk jalan-jalan atau olahraga di luar!";
  if (kondisi.includes("hujan")) return "Sebaiknya bawa payung atau tetap di rumah.";
  if (kondisi.includes("kabut")) return "Berkendara hati-hati, jarak pandang terbatas.";
  if (kondisi.includes("badai")) return "Lebih aman di dalam ruangan.";
  return "Nikmati harimu dengan bijak!";
};

const getRekomendasiLagu = (kondisi) => {
  kondisi = kondisi.toLowerCase();

  if (kondisi.includes("cerah")) {
    return {
      lagu: "Pharrell Williams - Happy",
      youtubeId: "ZbZSe6N_BXs",
    };
  }

  if (kondisi.includes("hujan")) {
    return {
      lagu: "Adele - Set Fire To The Rain",
      youtubeId: "a2giXO6eyuI",
    };
  }

  if (kondisi.includes("kabut") || kondisi.includes("haze") || kondisi.includes("fog")) {
    return {
      lagu: "Lana Del Rey - Summertime Sadness",
      youtubeId: "TdrL3QxjyVw",
    };
  }

  if (kondisi.includes("awan")) {
    return {
      lagu: "Coldplay - Sky Full of Stars",
      youtubeId: "VPRjCeoBqrI",
    };
  }

  if (kondisi.includes("badai") || kondisi.includes("petir")) {
    return {
      lagu: "Imagine Dragons - Thunder",
      youtubeId: "fKopy74weus",
    };
  }

  // Default
  return {
    lagu: "NIKI - Every Summertime",
    youtubeId: "a0OHkWX7B-E",
  };
};

function App() {
  const [cuacaData, setCuacaData] = useState({});
  const [loading, setLoading] = useState(false);
  const [kotaInput, setKotaInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [rating, setRating] = useState(0);
  const [komentar, setKomentar] = useState('');

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
        const rekomendasiLagu = getRekomendasiLagu(kondisiTerjemahan);

        const cuacaBaru = {
          kota: data.name,
          suhu: data.main.temp,
          kondisi: kondisiTerjemahan,
          waktu: new Date().toLocaleString(),
          saran: saranAktivitas,
          lagu: rekomendasiLagu.lagu,
          youtubeId: rekomendasiLagu.youtubeId,
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

  const handleFeedbackSubmit = async () => {
    if (rating === 0 || !komentar.trim()) {
      alert('Harap beri rating dan komentar terlebih dahulu!');
      return;
    }

    const feedbackRef = ref(database, 'feedback');
    await push(feedbackRef, {
      rating,
      komentar,
      waktu: new Date().toLocaleString(),
    });

    setShowFeedback(false);
    setRating(0);
    setKomentar('');
  };

  const isEmptyData = !cuacaData || Object.keys(cuacaData).length === 0;

  return (
    <div className="min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8 bg-gradient-to-b from-blue-300 via-blue-400 to-blue-600 max-w-7xl mx-auto">
      <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold mb-6 text-white text-center shadow-lg shadow-blue-900 flex items-center justify-center gap-3">
        <CloudSun size={44} className="text-yellow-300 drop-shadow-lg" />
        Info Cuaca Terkini
      </h1>

      <div className="flex flex-col sm:flex-row items-center mb-6 w-full max-w-2xl px-4">
        <input
          type="text"
          placeholder="Masukkan nama kota"
          value={kotaInput}
          onChange={(e) => setKotaInput(e.target.value)}
          onKeyPress={handleKeyPress}
          className="p-3 rounded-lg w-full sm:w-2/3 md:w-1/2 lg:w-1/3 sm:mr-4 mb-4 sm:mb-0 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all transform hover:scale-105"
        />
        <button
          onClick={handleCariCuaca}
          className="bg-white text-gray-700 font-bold py-3 px-6 rounded-lg shadow-md hover:shadow-lg hover:bg-blue-100 transition-all transform hover:scale-105"
        >
          Cari Cuaca
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 w-full">
          <div className="border-t-4 border-blue-500 border-solid w-16 h-16 rounded-full animate-spin"></div>
        </div>
      ) : isEmptyData ? (
        <p className="text-white text-lg text-center px-4">Belum ada data cuaca. Coba cari kota dulu.</p>
      ) : (
        <div className="weather-cards-container w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
          {Object.entries(cuacaData)
            .reverse()
            .map(([key, item], index) => (
              <motion.div
                key={key}
                className="weather-card bg-white p-6 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 ease-in-out flex flex-col items-start"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <h2 className="text-xl font-bold text-blue-700 mb-2">{item.kota}</h2>
                <p className="text-gray-700 mb-1">
                  Suhu: <span className="font-semibold text-blue-500">{item.suhu}°C</span>
                </p>
                <p className="text-gray-700 mb-1 capitalize">
                  Kondisi: <span className="font-semibold text-blue-500">{item.kondisi}</span>
                </p>
                <p className="text-gray-500 text-sm mb-2">{item.waktu}</p>
                <p className="text-green-600 font-medium italic">{item.saran}</p>
                <p className="mt-2">
                  Rekomendasi Lagu:{' '}
                  <a
                    href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline hover:text-blue-800"
                  >
                    {item.lagu}
                  </a>
                </p>
              </motion.div>
            ))}
        </div>
      )}

      {/* Tombol Feedback */}
      <button
        onClick={() => setShowFeedback(true)}
        className="feedback-button"
      >
        Keluar
      </button>

      {/* Modal Feedback */}
      {showFeedback && (
        <>
          <div className="feedback-overlay" onClick={() => setShowFeedback(false)}></div>
          <div className="feedback-modal">
            <h2 className="text-xl font-bold mb-4">Beri Masukan</h2>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Rating</label>
              <input
                type="number"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                min="1"
                max="5"
                className="w-full p-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2">Komentar</label>
              <textarea
                value={komentar}
                onChange={(e) => setKomentar(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows="4"
              ></textarea>
            </div>
            <button
              onClick={handleFeedbackSubmit}
              className="bg-blue-600 text-white py-2 px-6 rounded-lg w-full hover:bg-blue-700"
            >
              Kirim Feedback
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
