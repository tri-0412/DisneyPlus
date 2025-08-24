/* eslint-disable no-unused-vars */
import axios from "axios";

const movieBaseUrl = "https://api.themoviedb.org/3";
const api_key = "2ec0d66f5bdf1dd12eefa0723f1479cf";
const tvBaseURL = `${movieBaseUrl}/tv`;

const movieByGenreBaseURL = `${movieBaseUrl}/discover/movie?api_key=${api_key}`;
const getTrendingVideos = () =>
  axios.get(`${movieBaseUrl}/trending/all/day?api_key=${api_key}`);
const getHotVideos = () =>
  axios.get(`${movieBaseUrl}/trending/movie/day?api_key=${api_key}`);
const getMovieByGenreId = (id) =>
  axios.get(`${movieByGenreBaseURL}&with_genres=${id}`);
const getTVSeries = () => axios.get(`${tvBaseURL}/popular?api_key=${api_key}`);
const getTVSeriesDetails = async (id) => {
  if (!id || isNaN(id) || id <= 0) {
    console.error("Invalid series ID:", id);
    throw new Error("Invalid series ID");
  }
  try {
    const response = await axios.get(
      `${tvBaseURL}/${id}?api_key=${api_key}&language=en-US`
    );
    return response;
  } catch (error) {
    console.error(`Error fetching series details for ID ${id}:`, error.message);
    throw error;
  }
};
const getTVSeriesSeasons = (id) =>
  axios.get(`${tvBaseURL}/${id}/season?api_key=${api_key}`);
const getTVSeriesSeasonDetails = (seriesId, seasonNumber) =>
  axios.get(
    `${tvBaseURL}/${seriesId}/season/${seasonNumber}?api_key=${api_key}`
  );
const getTVSeriesVideos = (id) =>
  axios.get(`${tvBaseURL}/${id}/videos?api_key=${api_key}`);
const getMovieVideos = (id) =>
  axios.get(`${movieBaseUrl}/movie/${id}/videos?api_key=${api_key}`);
const getMovieDetails = (id) =>
  axios.get(`${movieBaseUrl}/movie/${id}?api_key=${api_key}`);
const getMovieCredits = (id) =>
  axios.get(`${movieBaseUrl}/movie/${id}/credits?api_key=${api_key}`);
const searchMovies = (query) =>
  axios.get(`${movieBaseUrl}/search/movie?api_key=${api_key}&query=${query}`);
// Trong GlobalApi.js
const getSimilarMovies = (movieId) =>
  axios.get(`${movieBaseUrl}/movie/${movieId}/similar?api_key=${api_key}`);
const getSimilarTV = (tvId) =>
  axios.get(`${tvBaseURL}/${tvId}/similar?api_key=${api_key}`);
const getTVSeriesCredits = (id) =>
  axios.get(`${tvBaseURL}/${id}/credits?api_key=${api_key}`);
// Hàm kiểm tra tính hợp lệ của URL với timeout
const isValidUrl = async (url) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);
    const response = await axios.head(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response.status === 200;
  } catch {
    return false;
  }
};

// Hàm lưu cache
const cacheData = (key, data, ttl = 24 * 60 * 60 * 1000) => {
  const item = { data, timestamp: Date.now(), ttl };
  localStorage.setItem(key, JSON.stringify(item));
};

const getCachedData = (key) => {
  const item = JSON.parse(localStorage.getItem(key));
  if (item && Date.now() - item.timestamp < item.ttl) {
    return item.data;
  }
  return null;
};

// Hàm lấy URL nhúng video cho movie (không thay đổi)
const getFullMovieVideo = async (movieId, options = {}) => {
  const cacheKey = `video_${movieId}_${JSON.stringify(options)}_v4`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log("Using cached data for cacheKey:", cacheKey);
    return { data: cached };
  }

  try {
    const tmdbResponse = await axios.get(
      `${movieBaseUrl}/movie/${movieId}?api_key=${api_key}`
    );
    const title = tmdbResponse.data.title.trim();
    const imdbId = tmdbResponse.data.imdb_id || `tt${movieId}`;
    const tmdbId = movieId;

    // Ưu tiên 1: 2embed với IMDB ID
    let embedUrl2embed = `https://www.2embed.cc/embed/${imdbId}`;
    console.log("Generated 2embed (IMDB) URL:", embedUrl2embed);
    const response2embedImdb = await axios.get(embedUrl2embed, {
      timeout: 7000,
    });
    if (
      response2embedImdb.data.includes("<video") ||
      response2embedImdb.data.includes("<iframe") ||
      response2embedImdb.data.includes("jwplayer") ||
      response2embedImdb.data.includes("source")
    ) {
      const result = { embedUrl: embedUrl2embed, source: "2embed-imdb" };
      cacheData(cacheKey, result);
      return { data: result };
    }

    // Ưu tiên 2: vidsrc với TMDB ID
    let embedUrl = `https://vidsrc.xyz/embed/movie?tmdb=${tmdbId}`;
    console.log("Generated vidsrc URL:", embedUrl);
    const vidsrcResponse = await axios.get(embedUrl, { timeout: 7000 });
    if (
      vidsrcResponse.data.includes("<video") ||
      vidsrcResponse.data.includes("<iframe") ||
      vidsrcResponse.data.includes("jwplayer") ||
      vidsrcResponse.data.includes("source")
    ) {
      const result = { embedUrl, source: "vidsrc" };
      cacheData(cacheKey, result);
      return { data: result };
    }

    // Ưu tiên 3: 2embed với TMDB ID
    embedUrl2embed = `https://www.2embed.cc/embed/${tmdbId}`;
    console.log("Fallback to 2embed (TMDB) URL:", embedUrl2embed);
    const response2embedTmdb = await axios.get(embedUrl2embed, {
      timeout: 7000,
    });
    if (
      response2embedTmdb.data.includes("<video") ||
      response2embedTmdb.data.includes("<iframe") ||
      response2embedTmdb.data.includes("jwplayer") ||
      response2embedTmdb.data.includes("source")
    ) {
      const result = { embedUrl: embedUrl2embed, source: "2embed-tmdb" };
      cacheData(cacheKey, result);
      return { data: result };
    }

    // Fallback cuối cùng: player4u
    const shortTitle = title.split(" ").slice(0, 2).join(" ");
    embedUrl = `https://player4u.xyz/embed?key=${encodeURIComponent(
      shortTitle
    )}`;
    const params = [];
    if (options.autoplay) params.push(`autoplay=1`);
    if (params.length > 0) embedUrl += `&${params.join("&")}`;
    console.log("Fallback to player4u URL:", embedUrl);
    const player4uResponse = await axios.get(embedUrl, { timeout: 7000 });
    if (
      player4uResponse.data.includes("<video") ||
      player4uResponse.data.includes("<iframe") ||
      player4uResponse.data.includes("jwplayer") ||
      player4uResponse.data.includes("source")
    ) {
      const result = { embedUrl, source: "player4u" };
      cacheData(cacheKey, result);
      return { data: result };
    }

    throw new Error("Không tìm thấy video từ các nguồn");
  } catch (error) {
    console.error(
      `Error fetching video: ${error.message}`,
      error.response?.data
    );
    throw new Error(`Không thể lấy URL video: ${error.message}`);
  }
};

// Hàm lấy URL nhúng video cho series (không thay đổi)
const getSeriesEpisodeVideo = async (seriesId, season, episode) => {
  const cacheKey = `series_video_${seriesId}_${season}_${episode}`;
  const cached = getCachedData(cacheKey);
  if (cached) return { data: cached };

  console.log("Input season and episode:", { season, episode });

  try {
    const tmdbResponse = await axios.get(
      `${tvBaseURL}/${seriesId}?api_key=${api_key}`
    );
    const title = tmdbResponse.data.name
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .trim()
      .replace(/\s+/g, " ");
    const imdbId = tmdbResponse.data.imdb_id || `tt${seriesId}`; // Lấy IMDB ID nếu có

    // Chuyển season và episode thành số nguyên và định dạng hai chữ số
    const formattedSeason = String(season).padStart(2, "0");
    const formattedEpisode = String(episode).padStart(2, "0");
    console.log("Formatted season and episode:", {
      formattedSeason,
      formattedEpisode,
    });

    // Danh sách các nguồn để thử
    const sources = [
      {
        name: "vidsrc",
        url: `https://vidsrc.xyz/embed/tv?tmdb=${seriesId}&season=${formattedSeason}&episode=${formattedEpisode}&autoplay=1`,
        check: (data) =>
          data.includes("<video") ||
          data.includes("<iframe") ||
          data.includes("source"),
      },
      {
        name: "2embed-tmdb",
        url: `https://www.2embed.cc/embedtv/${seriesId}?s=${formattedSeason}&e=${formattedEpisode}`,
        check: () =>
          isValidUrl(
            `https://www.2embed.cc/embedtv/${seriesId}?s=${formattedSeason}&e=${formattedEpisode}`
          ),
      },
      {
        name: "2embed-imdb",
        url: `https://www.2embed.cc/embedtv/${imdbId}?s=${formattedSeason}&e=${formattedEpisode}`,
        check: () =>
          isValidUrl(
            `https://www.2embed.cc/embedtv/${imdbId}?s=${formattedSeason}&e=${formattedEpisode}`
          ),
      },
      {
        name: "vidsrc-imdb",
        url: `https://vidsrc.xyz/embed/tv?imdb=${imdbId}&season=${formattedSeason}&episode=${formattedEpisode}&autoplay=1`,
        check: (data) =>
          data.includes("<video") ||
          data.includes("<iframe") ||
          data.includes("source"),
      },
      {
        name: "player4u",
        url: `https://player4u.xyz/embed?key=${encodeURIComponent(
          `${title} s${formattedSeason}e${formattedEpisode}`
        )}`,
        check: (data) =>
          data.includes("<video") ||
          data.includes("<iframe") ||
          data.includes("jwplayer") ||
          data.includes("source"),
      },
    ];

    for (const source of sources) {
      console.log(`Trying ${source.name} URL:`, source.url);
      try {
        const response = await axios.get(source.url, { timeout: 7000 });
        console.log(
          `${source.name} Response (first 100 chars):`,
          response.data.substring(0, 100)
        );
        if (
          typeof source.check === "function" &&
          (await source.check(response.data))
        ) {
          const result = { embedUrl: source.url, source: source.name };
          cacheData(cacheKey, result);
          console.log(`Success with ${source.name}:`, result);
          return { data: result };
        }
      } catch (error) {
        console.error(
          `Error with ${source.name}:`,
          error.message,
          error.response?.data
        );
      }
    }

    throw new Error("Không tìm thấy video từ các nguồn");
  } catch (error) {
    console.error(
      `Error fetching series video: ${error.message}`,
      error.response?.data
    );
    throw new Error(`Không thể lấy URL video series: ${error.message}`);
  }
};

export default {
  getTrendingVideos,
  getMovieByGenreId,
  getMovieVideos,
  getMovieDetails,
  getMovieCredits,
  getHotVideos,
  searchMovies,
  getTVSeries,
  getTVSeriesDetails,
  getTVSeriesSeasons,
  getTVSeriesSeasonDetails,
  getTVSeriesVideos,
  getFullMovieVideo,
  getSeriesEpisodeVideo,
  getSimilarMovies,
  getSimilarTV,
  getTVSeriesCredits,
};
