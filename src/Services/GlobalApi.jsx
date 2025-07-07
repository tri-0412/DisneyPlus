import axios from "axios";

const movieBaseUrl = "https://api.themoviedb.org/3";
const api_key = "2ec0d66f5bdf1dd12eefa0723f1479cf";

const movieByGenreBaseURL = `${movieBaseUrl}/discover/movie?api_key=${api_key}`;
const tvBaseURL = `${movieBaseUrl}/tv`;

const getTrendingVideos = () =>
  axios.get(`${movieBaseUrl}/trending/all/day?api_key=${api_key}`);
const getHotVideos = () =>
  axios.get(`${movieBaseUrl}/trending/movie/day?api_key=${api_key}`);
const getMovieByGenreId = (id) =>
  axios.get(`${movieByGenreBaseURL}&with_genres=${id}`);
const getTVSeries = () => axios.get(`${tvBaseURL}/popular?api_key=${api_key}`); // Danh sách series phổ biến
const getTVSeriesDetails = (id) =>
  axios.get(`${tvBaseURL}/${id}?api_key=${api_key}`); // Thông tin chi tiết series
const getTVSeriesSeasons = (id) =>
  axios.get(`${tvBaseURL}/${id}/season?api_key=${api_key}`); // Danh sách mùa (cần id mùa cụ thể, sẽ sửa sau)
const getTVSeriesSeasonDetails = (seriesId, seasonNumber) =>
  axios.get(
    `${tvBaseURL}/${seriesId}/season/${seasonNumber}?api_key=${api_key}`
  ); // Chi tiết một mùa
const getTVSeriesVideos = (id) =>
  axios.get(`${tvBaseURL}/${id}/videos?api_key=${api_key}`); // Video của series
const getMovieVideos = (id) =>
  axios.get(`${movieBaseUrl}/movie/${id}/videos?api_key=${api_key}`);
const getMovieDetails = (id) =>
  axios.get(`${movieBaseUrl}/movie/${id}?api_key=${api_key}`);
const getMovieCredits = (id) =>
  axios.get(`${movieBaseUrl}/movie/${id}/credits?api_key=${api_key}`);
const searchMovies = (query) =>
  axios.get(`${movieBaseUrl}/search/movie?api_key=${api_key}&query=${query}`);

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
};
