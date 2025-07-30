import { useState, useEffect } from "react";

export function useLocationWeather() {
  const [location, setLocation] = useState(null); // { lat, lon }
  const [address, setAddress] = useState("");     // "X. ..., H. ..., ..."
  const [weather, setWeather] = useState(null);   // { temp, description, ... }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1. Lấy tọa độ
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            timeout: 10000,
            enableHighAccuracy: true
          });
        });

        const { latitude, longitude } = position.coords;
        setLocation({ lat: latitude, lon: longitude });

        // 2. Lấy địa chỉ từ toạ độ
        const geoRes = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
        );
        const geoData = await geoRes.json();
        const { address } = geoData;

        const xa = address.suburb || address.village || address.town || address.city_district || "";
        const huyen = address.county || address.district || "";
        const tinh = address.state || address.region || address.city || "";

        const customAddress = `X. ${xa} H. ${huyen}, ${tinh}`;
        setAddress(customAddress);

        // 3. Lấy thời tiết - sử dụng API key từ environment hoặc fallback
        const apiKey = import.meta.env.VITE_OPENWEATHERMAP_API_KEY || "YOUR_OPENWEATHERMAP_API_KEY";
        
        if (apiKey === "YOUR_OPENWEATHERMAP_API_KEY") {
          // Fallback: sử dụng API key demo (có thể không hoạt động)
          console.warn("⚠️ Sử dụng API key demo. Vui lòng cấu hình VITE_OPENWEATHERMAP_API_KEY để có kết quả chính xác.");
          
          // Thử với API key demo (có thể không hoạt động)
          try {
            const demoApiKey = "demo_key_for_testing"; // Đây chỉ là demo, không hoạt động thực tế
            const weatherRes = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=vi&appid=${demoApiKey}`
            );
            
            if (weatherRes.ok) {
              const weatherData = await weatherRes.json();
              setWeather({
                temp: Math.round(weatherData.main.temp),
                desc: weatherData.weather[0].description,
                icon: weatherData.weather[0].icon,
                humidity: weatherData.main.humidity,
                windSpeed: weatherData.wind.speed
              });
            } else {
              // Nếu demo key không hoạt động, tạo dữ liệu mẫu
              setWeather({
                temp: 25,
                desc: "trời đẹp",
                icon: "01d",
                humidity: 65,
                windSpeed: 5
              });
              setError("Đang sử dụng dữ liệu mẫu. Vui lòng cấu hình API key thực để có dữ liệu chính xác.");
            }
          } catch (demoError) {
            // Tạo dữ liệu mẫu nếu không thể kết nối
            setWeather({
              temp: 25,
              desc: "trời đẹp",
              icon: "01d",
              humidity: 65,
              windSpeed: 5
            });
            setError("Đang sử dụng dữ liệu mẫu. Vui lòng cấu hình API key thực để có dữ liệu chính xác.");
          }
          setLoading(false);
          return;
        }

        const weatherRes = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&lang=vi&appid=${apiKey}`
        );
        
        if (!weatherRes.ok) {
          throw new Error(`Weather API error: ${weatherRes.status}`);
        }

        const weatherData = await weatherRes.json();
        setWeather({
          temp: Math.round(weatherData.main.temp),
          desc: weatherData.weather[0].description,
          icon: weatherData.weather[0].icon,
          humidity: weatherData.main.humidity,
          windSpeed: weatherData.wind.speed
        });
      } catch (err) {
        console.error("Lỗi lấy thời tiết:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, []);

  return { location, address, weather, loading, error };
}
