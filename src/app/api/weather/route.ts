import { NextRequest, NextResponse } from "next/server";
import { env } from "~/env.mjs";

interface WeatherAPIResponse {
  forecast: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        daily_chance_of_rain: number;
        condition: {
          text: string;
          code: number;
        };
      };
      astro: {
        sunrise: string;
        sunset: string;
      };
    }>;
  };
}

// 날씨 상태 한글 변환
const weatherConditionMap: Record<number, string> = {
  1000: "맑음",
  1003: "구름조금",
  1006: "구름많음",
  1009: "흐림",
  1030: "안개",
  1063: "가끔 비",
  1066: "가끔 눈",
  1069: "가끔 진눈깨비",
  1072: "가끔 이슬비",
  1087: "천둥",
  1114: "눈보라",
  1117: "폭설",
  1135: "안개",
  1147: "짙은안개",
  1150: "이슬비",
  1153: "이슬비",
  1168: "이슬비",
  1171: "이슬비",
  1180: "비",
  1183: "비",
  1186: "비",
  1189: "비",
  1192: "폭우",
  1195: "폭우",
  1198: "진눈깨비",
  1201: "진눈깨비",
  1204: "진눈깨비",
  1207: "진눈깨비",
  1210: "눈",
  1213: "눈",
  1216: "눈",
  1219: "눈",
  1222: "폭설",
  1225: "폭설",
  1237: "우박",
  1240: "소나기",
  1243: "소나기",
  1246: "폭우",
  1249: "진눈깨비",
  1252: "진눈깨비",
  1255: "눈",
  1258: "눈",
  1261: "우박",
  1264: "우박",
  1273: "뇌우",
  1276: "뇌우",
  1279: "뇌우+눈",
  1282: "뇌우+폭설",
};

// 12시간 형식을 24시간 형식으로 변환
function convertTo24Hour(time12h: string): string {
  const [time, modifier] = time12h.split(" ");
  if (!time || !modifier) return time12h;
  
  let [hours, minutes] = time.split(":");
  if (!hours || !minutes) return time12h;
  
  let hoursNum = parseInt(hours, 10);
  
  if (modifier.toUpperCase() === "PM" && hoursNum !== 12) {
    hoursNum += 12;
  } else if (modifier.toUpperCase() === "AM" && hoursNum === 12) {
    hoursNum = 0;
  }
  
  return `${String(hoursNum).padStart(2, "0")}:${minutes}`;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const date = searchParams.get("date");

    if (!location) {
      return NextResponse.json(
        { error: "location 파라미터가 필요합니다" },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: "date 파라미터가 필요합니다" },
        { status: 400 }
      );
    }

    const apiKey = env.WEATHER_API_KEY;
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "날씨 API 키가 설정되지 않았습니다" },
        { status: 500 }
      );
    }

    // WeatherAPI forecast 호출
    // 14일까지 예보 가능
    const apiUrl = `https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(location)}&dt=${date}&lang=ko`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("WeatherAPI error:", errorData);
      
      if (response.status === 400) {
        return NextResponse.json(
          { error: "유효하지 않은 장소 또는 날짜입니다" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { error: "날씨 정보를 가져오는데 실패했습니다" },
        { status: response.status }
      );
    }

    const data: WeatherAPIResponse = await response.json();
    
    if (!data.forecast?.forecastday?.[0]) {
      return NextResponse.json(
        { error: "해당 날짜의 날씨 정보가 없습니다" },
        { status: 404 }
      );
    }

    const forecastDay = data.forecast.forecastday[0];
    const conditionCode = forecastDay.day.condition.code;
    
    // 날씨 상태 한글 변환 (매핑되지 않으면 API 응답 텍스트 사용)
    const weatherText = weatherConditionMap[conditionCode] || forecastDay.day.condition.text;

    const weatherData = {
      weather: weatherText,
      tempMin: `${Math.round(forecastDay.day.mintemp_c)}℃`,
      tempMax: `${Math.round(forecastDay.day.maxtemp_c)}℃`,
      precipitation: `${forecastDay.day.daily_chance_of_rain}%`,
      sunrise: convertTo24Hour(forecastDay.astro.sunrise),
      sunset: convertTo24Hour(forecastDay.astro.sunset),
    };

    return NextResponse.json(weatherData);
  } catch (error) {
    console.error("Weather API error:", error);
    return NextResponse.json(
      { error: "날씨 정보를 가져오는 중 오류가 발생했습니다" },
      { status: 500 }
    );
  }
}

