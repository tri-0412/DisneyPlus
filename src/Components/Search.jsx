import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { Search as SearchIcon } from "lucide-react";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [trendingError, setTrendingError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingMovies = async () => {
      setTrendingLoading(true);
      setTrendingError(null);
      try {
        const response = await GlobalApi.getHotVideos();
        console.log("Dữ liệu phim hot:", response.data.results);
        setTrendingMovies(response.data.results.slice(0, 5));
      } catch (err) {
        console.error("Lỗi khi lấy phim hot:", err);
        setTrendingError(
          "Không thể tải danh sách phim hot. Vui lòng thử lại sau!"
        );
        setTrendingMovies([]);
      } finally {
        setTrendingLoading(false);
      }
    };
    fetchTrendingMovies();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      setError("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await GlobalApi.searchMovies(query);
      setResults(response.data.results);
    } catch (err) {
      setError("Không thể tìm kiếm phim. Vui lòng thử lại sau!");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}/${movie.title || movie.name}`);
  };

  return (
    <div className="bg-gradient-to-b from-[#1a1a1a] to-[#2d2d2d] text-white min-h-screen p-6 pt-24">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mt-8 mb-8 text-[#5baee5] border-b-2 border-[#5baee5] pb-2 text-center">
          Search Your Favorite Movies
        </h1>
        <div className="flex flex-col md:flex-row gap-8">
          {/* Phần tìm kiếm */}
          <div className="w-full md:w-3/4">
            <form
              onSubmit={handleSearch}
              className="flex items-center max-w-3xl mx-auto bg-gray-800/90 rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 hover:shadow-red-600/50"
            >
              <SearchIcon className="ml-4 text-red-400" size={24} />
              <input
                type="text"
                placeholder="Tìm phim, diễn viên, thể loại..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-1 bg-transparent outline-none px-6 py-3 text-white placeholder-gray-300 text-lg  transition-all duration-300"
              />
              <button
                type="submit"
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 px-6 py-3 text-white font-semibold text-lg rounded-r-2xl transition-all duration-300 "
              >
                Search
              </button>
            </form>
            {error && (
              <p className="text-red-500 text-center mt-4 font-medium">
                {error}
              </p>
            )}
            {results.length === 0 && !error && !loading && (
              <p className="text-gray-400 text-center py-8 font-medium">
                Chưa có kết quả. Hãy thử tìm kiếm!
              </p>
            )}
            {loading && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-red-600"></div>
              </div>
            )}
            {results.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-12">
                {results.map((movie) => (
                  <div
                    key={movie.id}
                    className="cursor-pointer rounded-xl overflow-hidden hover:-translate-y-2 transition-all duration-300 transform"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title || movie.name}
                      className="w-full h-72 object-cover rounded-b-lg"
                    />
                    <div className="flex justify-center bg-transparent py-2 ">
                      <p className="text-center text-gray-100 font-semibold text-lg truncate">
                        {movie.title || movie.name}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Phần phim hot bên phải */}
          <div className="w-full md:w-1/4 max-h-[735px] bg-gray-800/90 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold mb-6 text-gray-100 border-b-2 border-red-600 pb-2">
              Trending Movies
            </h2>
            {trendingLoading ? (
              <div className="flex justify-center py-6">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-red-600"></div>
              </div>
            ) : trendingError ? (
              <p className="text-red-500 text-center font-medium">
                {trendingError}
              </p>
            ) : trendingMovies.length > 0 ? (
              <ul className="space-y-2 max-h-[620px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-600 scrollbar-track-gray-700 pr-2">
                {trendingMovies.map((movie) => (
                  <li
                    key={movie.id}
                    className="flex items-center gap-2 cursor-pointer hover:bg-gray-700/50 p-3 rounded-xl transition-all duration-300 animate-fade-in"
                    onClick={() => handleMovieClick(movie)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title || movie.name}
                      className="w-20 h-26 object-cover rounded-lg"
                    />
                    <span className="text-gray-200 font-medium text-base truncate flex-1">
                      {movie.title || movie.name}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-center py-6 font-medium">
                No trending movies available.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Search;
