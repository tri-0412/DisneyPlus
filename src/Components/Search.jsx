import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";

function Search() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [trendingLoading, setTrendingLoading] = useState(true); // Loading cho phim hot
  const [trendingError, setTrendingError] = useState(null); // Lỗi cho phim hot
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy danh sách phim hot khi component mount
    const fetchTrendingMovies = async () => {
      setTrendingLoading(true);
      setTrendingError(null);
      try {
        const response = await GlobalApi.getHotVideos(); // Đảm bảo trả về Promise
        console.log("Dữ liệu phim hot:", response.data.results); // Debug
        setTrendingMovies(response.data.results.slice(0, 5)); // Lấy 5 phim hot nhất
      } catch (err) {
        console.error("Lỗi khi lấy phim hot:", err);
        setTrendingError(
          "Không thể tải danh sách phim hot. Vui lòng thử lại sau!"
        );
        setTrendingMovies([]); // Đặt rỗng nếu lỗi
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
    <div className="bg-[#1a1a1a] text-white p-6 mt-24">
      <h1 className="text-3xl font-bold mb-8 text-gray-100 border-b-2 border-gray-700 pb-2">
        Search
      </h1>
      <div className="flex flex-col md:flex-row gap-6">
        {/* Phần tìm kiếm */}
        <div className="w-full md:w-3/4">
          <form onSubmit={handleSearch} className="flex items-center mb-6">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tìm kiếm phim..."
              className="flex-1 p-3 rounded-md bg-gray-800 mr-2 text-white border-2 border-gray-700 focus:outline-none focus:border-blue-500 shadow-md"
            />
            <button
              type="submit"
              className="py-3 px-5 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-400"
              disabled={loading}
            >
              {loading ? (
                <span className="animate-pulse">Đang tìm...</span>
              ) : (
                "Tìm kiếm"
              )}
            </button>
          </form>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          {results.length === 0 && !error && !loading && (
            <p className="text-gray-400 text-center py-6">
              Không có kết quả hoặc chưa tìm kiếm.
            </p>
          )}
          {loading && (
            <p className="text-center text-gray-300 py-6">Đang tải...</p>
          )}
          {results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map((movie) => (
                <div
                  key={movie.id}
                  className="cursor-pointer bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300"
                  onClick={() => handleMovieClick(movie)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="w-full h-64 object-cover"
                  />
                  <p className="p-3 text-center text-gray-200 font-medium truncate">
                    {movie.title || movie.name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Phần phim hot bên phải */}
        <div
          className="w-full md:w-1/4 bg-gray-800 p-4 rounded-xl shadow-lg"
          style={{ height: "620px" }}
        >
          <h2 className="text-xl font-semibold mb-4 text-gray-100 border-b border-gray-700 pb-2">
            Phim Hot
          </h2>
          {trendingLoading ? (
            <p className="text-gray-400 text-center">Đang tải phim hot...</p>
          ) : trendingError ? (
            <p className="text-red-500 text-center">{trendingError}</p>
          ) : trendingMovies.length > 0 ? (
            <ul
              className="space-y-4 overflow-y-auto"
              style={{ height: "calc(100% - 2rem)" }}
            >
              {trendingMovies.map((movie) => (
                <li
                  key={movie.id}
                  className="flex items-center gap-3 cursor-pointer hover:bg-gray-700 p-2 rounded-lg transition-colors duration-200"
                  onClick={() => handleMovieClick(movie)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                    alt={movie.title || movie.name}
                    className="w-16 h-20 object-cover rounded-md"
                  />
                  <span className="text-gray-200 truncate">
                    {movie.title || movie.name}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400 text-center">
              Không có phim hot để hiển thị.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
