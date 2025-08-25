/* eslint-disable no-unused-vars */
import GlobalApi from "../Services/GlobalApi";

const movieBaseUrl = "https://api.themoviedb.org/3";
const api_key = import.meta.env.VITE_TMDB_API_KEY;

// Cache kết quả kiểm tra
const idCache = new Map();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 giờ

const isIdValid = async (id, isTV = false) => {
  const cacheKey = `${id}_${isTV ? "tv" : "movie"}`;
  const cached = idCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.isValid;
  }

  try {
    const response = await (isTV
      ? GlobalApi.getTVSeriesDetails(id)
      : GlobalApi.getMovieDetails(id));
    // Kiểm tra xem dữ liệu có hợp lệ không (tránh lỗi 404 hoặc dữ liệu rỗng)
    const isValid = !!response.data && response.data.id === id;
    idCache.set(cacheKey, { isValid, timestamp: Date.now() });
    return isValid;
  } catch (error) {
    console.warn(
      `ID ${id} (${isTV ? "TV" : "Movie"}) không hợp lệ:`,
      error.message
    );
    idCache.set(cacheKey, { isValid: false, timestamp: Date.now() });
    return false;
  }
};

export default isIdValid;
