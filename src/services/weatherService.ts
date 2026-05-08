export interface ForecastDay {
  date: string;
  temp: number;
  icon: string;
  condition: string;
}

export interface WeatherData {
  temp: number;
  condition: string;
  location: string;
  icon: string;
  id: number; // Weather condition ID for more precise animation selection
  forecast: ForecastDay[];
}

export async function getWeatherData(lat?: number, lon?: number, city?: string): Promise<WeatherData> {
  // Use the key provided by the user
  const API_KEY = 'c4fbb038b38e88b8e0254bc2c603007e';
  
  let latitude = lat ?? -6.9175; // Bandung default
  let longitude = lon ?? 107.6191;
  let locationName = city || 'Bandung';

  try {
    if (city) {
      const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(city)}&limit=1&appid=${API_KEY}`);
      if (!geoRes.ok) throw new Error('Geocoding service failed');
      const geoData = await geoRes.json();
      
      if (geoData && geoData.length > 0) {
        latitude = geoData[0].lat;
        longitude = geoData[0].lon;
        locationName = `${geoData[0].name}, ${geoData[0].country}`;
      } else {
        throw new Error('City not found');
      }
    }

    // Parallel fetch current weather and forecast
    const [currentRes, forecastRes] = await Promise.all([
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`),
      fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`)
    ]);

    const currentData = await currentRes.json();
    const forecastData = await forecastRes.json();
    
    if (currentData.cod !== 200) {
      throw new Error(currentData.message || 'Error fetching current weather');
    }

    if (!city) {
      locationName = `${currentData.name}, ${currentData.sys.country}`;
    }

    const mainCondition = currentData.weather[0].main;
    const weatherId = currentData.weather[0].id;
    let icon = 'Sun';
    let condition = currentData.weather[0].description;

    const mapIcon = (main: string) => {
      switch (main) {
        case 'Clouds': return 'Cloud';
        case 'Rain':
        case 'Drizzle': return 'CloudRain';
        case 'Thunderstorm': return 'CloudLightning';
        case 'Snow': return 'Snowflake';
        case 'Clear': return 'Sun';
        default: return 'Cloud';
      }
    };

    icon = mapIcon(mainCondition);

    // Process forecast: Take one entry per day (midday)
    const dailyForecast: ForecastDay[] = [];
    const seenDates = new Set();
    
    if (forecastData.list) {
      forecastData.list.forEach((item: any) => {
        const date = item.dt_txt.split(' ')[1] === '12:00:00' || item.dt_txt.split(' ')[1] === '15:00:00' 
          ? item.dt_txt.split(' ')[0] 
          : null;
        
        if (date && !seenDates.has(date)) {
          seenDates.add(date);
          dailyForecast.push({
            date,
            temp: Math.round(item.main.temp),
            icon: mapIcon(item.weather[0].main),
            condition: item.weather[0].description
          });
        }
      });
    }

    return {
      temp: Math.round(currentData.main.temp),
      condition: condition.charAt(0).toUpperCase() + condition.slice(1),
      location: locationName,
      icon,
      id: weatherId,
      forecast: dailyForecast.slice(0, 3) // Next 3 days
    };
  } catch (error: any) {
    console.error('Weather fetch error:', error);
    // Silent fail and return Bandung as absolute fallback
    const API_KEY = 'c4fbb038b38e88b8e0254bc2c603007e';
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=Bandung&units=metric&appid=${API_KEY}`);
      const data = await res.json();
      return {
        temp: Math.round(data.main?.temp || 24),
        condition: data.weather?.[0]?.description || 'Clear Sky',
        location: 'Bandung, ID',
        icon: 'Sun',
        id: 800,
        forecast: []
      };
    } catch {
      return {
        temp: 24,
        condition: 'Cerah',
        location: 'Bandung',
        icon: 'Sun',
        id: 800,
        forecast: []
      };
    }
  }
}
