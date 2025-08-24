/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import React from "react";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../Context/AuthContext";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function HrMovieCard({ movie, onClick }) {
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
        description: "Đã thêm phim vào watch list!",
        duration: 2000,
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
      className="hover:scale-110 transition-all duration-150 ease-in relative w-[110px] md:w-[260px] cursor-pointer bg-[#1a1a1a]"
      onClick={() => onClick(movie)}
    >
      <LazyLoadImage
        src={IMAGE_BASE_URL + movie.backdrop_path}
        alt="t"
        effect="blur" // mờ mờ trước khi load xong
        className="w-[110px] md:w-[260px] rounded-lg border-2 border-transparent hover:border-gray-400 cursor-pointer"
      />
      <div className="mt-2 flex justify-between items-center bg-[#1a1a1a]">
        <h2 className="text-white text-center flex-1 truncate w-[110px] md:w-[260px]">
          {movie.title}
        </h2>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleAddToWatchList();
          }}
          className={`h-8 w-8 p-1 bg-transparent focus:outline-none ${
            watchListIds.some(
              (item) => item.id === movie.id && item.type === "movie"
            )
              ? "text-red-600 hover:scale-110 border-none"
              : "text-white border-none hover:scale-110"
          } transition-all duration-300`}
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

export default HrMovieCard;
