/* eslint-disable react/prop-types */
import { useToast } from "@/hooks/use-toast";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function MovieCard({ movie, onClick }) {
  const { addToWatchList, watchListIds } = useAuth();
  const { toast } = useToast();

  const handleAddToWatchList = async () => {
    const movieId = movie.id;
    const isInWatchList = watchListIds.some(
      (item) => item.id === movieId && item.type === "movie"
    );
    if (!isInWatchList) {
      await addToWatchList(movieId, "movie"); // Truyền type "movie"
      toast({
        title: "Thành công",
        description: "Đã thêm phim vào Watch List!",
        duration: 3000,
        position: "top-right",
        className: "text-sm font-medium bg-green-500 text-white",
      });
    } else {
      toast({
        title: "Thông báo",
        description: "Phim đã có trong Watch List!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-blue-500 text-white",
      });
    }
  };

  return (
    <section
      className="hover:scale-110 transition-all duration-150 ease-in relative w-48 cursor-pointer bg-[#1a1a1a] z-0"
      onClick={() => onClick(movie)}
    >
      <LazyLoadImage
        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
        alt={movie.title || movie.name}
        effect="blur" // mờ mờ trước khi load xong
        className="w-48 rounded-lg border-2 border-transparent hover:border-gray-400 cursor-pointer"
      />
      <div className="mt-2 flex justify-between items-center bg-[#1a1a1a]">
        <h3 className="text-white text-center flex-1 truncate w-48 font-medium">
          {movie.title || movie.name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToWatchList();
          }}
          className={`h-8 w-8 p-1 border-none bg-transparent focus:outline-none transition-all duration-150 ${
            watchListIds.some(
              (item) => item.id === movie.id && item.type === "movie"
            )
              ? "text-red-600 hover:scale-110"
              : "text-white hover:scale-110"
          }`}
          aria-label="Add to Watch List"
        >
          {watchListIds.some(
            (item) => item.id === movie.id && item.type === "movie"
          ) ? (
            <FaHeart className="w-5 h-5 text-red-600" />
          ) : (
            <CiHeart className="w-7 h-7 text-white" />
          )}
        </button>
      </div>
    </section>
  );
}

export default MovieCard;
