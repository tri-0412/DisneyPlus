import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
// import { FaStar } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../Context/AuthContext";
import LoadingSkeleton from "./LoadingSkeleton";

function Movies() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { addToWatchList, watchListIds } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await GlobalApi.getMovieByGenreId(28); // Genre ID cho Action
        setMovies(response.data.results);
      } catch (err) {
        setError("Không thể tải danh sách phim. Vui lòng thử lại sau!");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  const handleMovieClick = (movie) => {
    navigate(
      `/movie/${movie.id}/${encodeURIComponent(movie.title || movie.name)}`
    );
  };

  const handleAddToWatchList = async (movieId) => {
    const isInWatchList = watchListIds.some(
      (item) => item.id === movieId && item.type === "movie"
    );
    if (!isInWatchList) {
      await addToWatchList(movieId, "movie"); // Truyền type "movie"
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
  };

  // const getStarRating = (voteAverage) => {
  //   const maxStars = 5;
  //   const rating = Math.round((voteAverage || 0) / 2);
  //   return Array(maxStars)
  //     .fill(0)
  //     .map((_, index) => (
  //       <FaStar
  //         key={index}
  //         className={index < rating ? "text-yellow-400" : "text-gray-500"}
  //       />
  //     ));
  // };

  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;
  if (loading) return <LoadingSkeleton count={12} />;

  return (
    <div className="bg-[#1a1a1a] w-[1200px] min-h-screen text-white p-6 mt-24 mx-auto">
      <h1
        className="text-3xl font-bold mt-6 mb-10 
               text-[#3cb4ff] tracking-wide uppercase 
               drop-shadow-[0_0_10px_#5baee5] 
               text-center"
      >
        Movies
      </h1>
      {movies.length === 0 && !loading && !error ? (
        <p className="text-gray-400 text-center py-10">
          Không có phim nào để hiển thị.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {movies.map((movie) => {
            // const releaseYear = movie.release_date
            //   ? new Date(movie.release_date).getFullYear()
            //   : "N/A";
            const isInWatchList = watchListIds.some(
              (item) => item.id === movie.id && item.type === "movie"
            );

            return (
              <div
                key={movie.id}
                className="relative rounded-xl overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer"
                onClick={() => handleMovieClick(movie)}
              >
                <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                  Phim bom tấn
                </div>
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-65 object-cover rounded-lg opacity-95 hover:opacity-100 transition-opacity"
                />
                <div className=" flex py-2">
                  <p className="text-md -mt-2 p-2 font-semibold text-gray-200 mb-1 truncate">
                    {movie.title || movie.name}
                  </p>
                  {/* <div className="flex justify-between items-center text-sm text-gray-400">
                    <span>Year: {releaseYear}</span>
                    <div className="flex items-center">
                      {getStarRating(movie.vote_average)}
                    </div>
                  </div> */}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWatchList(movie.id);
                  }}
                  className={`absolute top-2 right-2 h-8 w-8 p-1 bg-transparent focus:outline-none transition-all duration-300 ${
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
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMovieClick(movie);
                  }}
                  className="absolute bottom-4 left-4 bg-red-600 text-white text-sm font-medium px-3 py-1 rounded-md hover:bg-red-700 transition duration-300"
                >
                  Xem Ngay
                </button> */}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Movies;
