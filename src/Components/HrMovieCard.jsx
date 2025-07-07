/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { CiHeart } from "react-icons/ci"; // Icon trái tim rỗng
import { FaHeart } from "react-icons/fa"; // Icon trái tim đậm
import { useToast } from "@/hooks/use-toast"; // Import useToast từ shadcn/ui

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function HrMovieCard({ movie, onClick }) {
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
        description: "Đã thêm phim vào watch list!",
        duration: 2000, // Tự động đóng sau 2 giây
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
    <section
      className="hover:scale-110 transition-all duration-150 ease-in relative w-[110px] md:w-[260px] cursor-pointer bg-[#1a1a1a]"
      onClick={() => onClick(movie)}
    >
      <img
        src={IMAGE_BASE_URL + movie.backdrop_path}
        alt="t"
        className="w-[110px] md:w-[260px] rounded-lg hover:border-[3px] border-gray-400 cursor-pointer"
      />
      <div className="mt-2 flex justify-between items-center bg-[#1a1a1a]">
        <h2 className="text-white text-center flex-1 truncate w-[110px] md:w-[260px]">
          {movie.title}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation(); // Ngăn sự kiện onClick của section cha
            handleAddToWatchList();
          }}
          className={`h-8 w-8 p-1 bg-transparent focus:outline-none ${
            watchListIds.includes(movie.id)
              ? "text-red-600 hover:scale-110 border-none"
              : "text-white border-none hover:scale-110"
          } transition-all duration-300`}
          aria-label="Add to Watch List"
        >
          {watchListIds.includes(movie.id) ? (
            <FaHeart className="w-5 h-5 text-red-600" />
          ) : (
            <CiHeart className="w-7 h-7 text-white" />
          )}
        </button>
      </div>
    </section>
  );
}

export default HrMovieCard;
