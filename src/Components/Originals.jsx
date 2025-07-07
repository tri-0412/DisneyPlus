import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { CiHeart } from "react-icons/ci"; // Icon trái tim rỗng
import { FaHeart } from "react-icons/fa"; // Icon trái tim đậm
import { useToast } from "@/hooks/use-toast"; // Sử dụng toast từ shadcn/ui

function Originals() {
  const [originals, setOriginals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [watchListIds, setWatchListIds] = useState(() => {
    return JSON.parse(localStorage.getItem("watchList")) || [];
  });
  const { toast } = useToast(); // Sử dụng hook useToast

  useEffect(() => {
    const fetchOriginals = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await GlobalApi.getMovieByGenreId(10770); // Genre ID cho TV Movie (Originals)
        setOriginals(response.data.results);
      } catch (err) {
        setError("Không thể tải danh sách originals. Vui lòng thử lại sau!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOriginals();
  }, []);

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}/${movie.title || movie.name}`);
  };

  const handleAddToWatchList = (movieId) => {
    let updatedWatchList = [...watchListIds];
    if (!updatedWatchList.includes(movieId)) {
      updatedWatchList.push(movieId);
      toast({
        title: "Thành công",
        description: "Đã thêm phim vào watch list!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-green-500 text-white",
      });
    } else {
      toast({
        title: "Thông báo",
        description: "Phim đã có trong watch list!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-blue-500 text-white",
      });
    }
    setWatchListIds(updatedWatchList);
    localStorage.setItem("watchList", JSON.stringify(updatedWatchList));
  };

  if (loading)
    return <div className="text-white text-center p-6">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h1 className="text-4xl font-bold mb-6 text-gray-100 border-b-4 border-yellow-500 pb-3 relative">
        Originals
      </h1>
      {originals.length === 0 && !loading && !error ? (
        <p className="text-gray-400 text-center py-10">
          Không có phim originals để hiển thị.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {originals.map((movie) => {
            const releaseYear = movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A";
            const isInWatchList = watchListIds.includes(movie.id);

            return (
              <div
                key={movie.id}
                className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl cursor-pointer"
                onClick={() => handleMovieClick(movie)}
              >
                <div className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-semibold px-2 py-1 rounded-full">
                  Original
                </div>
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-64 object-cover rounded-t-lg opacity-95 hover:opacity-100 transition-opacity"
                />
                <div className="p-4">
                  <p className="text-base font-semibold text-gray-200 truncate mb-3">
                    {movie.title || movie.name}
                  </p>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>Year: {releaseYear}</span>
                    <span>Rating: {movie.vote_average || "N/A"}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWatchList(movie.id);
                  }}
                  className={`absolute border-none top-2 right-2 h-8 w-8 p-1 bg-transparent focus:outline-none transition-all duration-300 ${
                    isInWatchList
                      ? "text-red-600 hover:scale-110"
                      : "text-white hover:scale-110"
                  }`}
                >
                  {isInWatchList ? (
                    <FaHeart className="w-5 h-5" />
                  ) : (
                    <CiHeart className="w-7 h-7" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMovieClick(movie); // Placeholder, có thể thay bằng route riêng
                  }}
                  className="absolute bottom-2 left-4 bg-blue-600 text-white text-sm font-medium px-3 py-1.5 rounded-md hover:bg-blue-700 transition duration-300"
                >
                  Xem ngay
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Originals;
