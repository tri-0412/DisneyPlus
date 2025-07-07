/* eslint-disable react/prop-types */
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { CiHeart } from "react-icons/ci"; // Icon trái tim rỗng
import { FaHeart } from "react-icons/fa"; // Icon trái tim đậm

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function MovieCard({ movie, onClick }) {
  const [watchListIds, setWatchListIds] = useState(() => {
    // Lấy danh sách ID từ localStorage khi component mount
    return JSON.parse(localStorage.getItem("watchList")) || [];
  });
  const { toast } = useToast(); // Sử dụng hook useToast

  useEffect(() => {
    // Cập nhật localStorage khi watchListIds thay đổi
    localStorage.setItem("watchList", JSON.stringify(watchListIds));
  }, [watchListIds]);

  const handleAddToWatchList = () => {
    const movieId = movie.id;
    let updatedWatchList = [...watchListIds];
    if (!updatedWatchList.includes(movieId)) {
      updatedWatchList.push(movieId);
      toast({
        title: "Thành công",
        description: "Đã thêm phim vào Watch List!",
        duration: 3000, // Tự động đóng sau 3 giây
        position: "top-right", // Đặt vị trí top-right
        className: "text-sm font-medium bg-green-500 text-white",
      });
    } else {
      toast({
        title: "Thông báo",
        description: "Phim đã có trong Watch List!",
        duration: 2000,
        position: "top-right", // Đặt vị trí top-right
        className: "text-sm font-medium bg-blue-500 text-white",
      });
    }
    setWatchListIds(updatedWatchList);
  };

  return (
    <div
      className="flex-none w-48 cursor-pointer relative transition-all duration-300 hover:shadow-2xl"
      onClick={() => onClick(movie)}
      style={{
        background: "linear-gradient(145deg, #2a2a2a, #3a3a3a)",
        borderRadius: "0.5rem",
        padding: "0.25rem",
      }}
    >
      <img
        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
        alt={movie.title || movie.name}
        className="w-full h-auto rounded-lg shadow-lg hover:scale-105 transition-transform"
      />
      <div className="mt-2 flex justify-between items-center p-2 bg-opacity-90 bg-gray-800 rounded-b-lg">
        <h3 className="text-white text-center flex-1 truncate font-medium text-shadow">
          {movie.title || movie.name}
        </h3>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện onClick của div cha
            handleAddToWatchList();
          }}
          className={`h-8 w-8 p-1 bg-transparent focus:outline-none transition-all duration-300 ${
            watchListIds.includes(movie.id)
              ? "text-red-600 hover:scale-110"
              : "text-white hover:scale-110"
          }`}
          aria-label="Add to Watch List"
          style={{ textShadow: "0 0 2px rgba(0, 0, 0, 0.7)" }}
        >
          {watchListIds.includes(movie.id) ? (
            <FaHeart className="w-5 h-5 text-red-600" />
          ) : (
            <CiHeart className="w-7 h-7 text-white" />
          )}
        </button>
      </div>
    </div>
  );
}

export default MovieCard;
