/* eslint-disable no-unused-vars */
import GenresList from "../Constant/GenresList";
import MovieList from "./MovieList";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "@/hooks/use-toast";

function GenreMovieList() {
  const navigate = useNavigate();
  const [hasMoreThanTen, setHasMoreThanTen] = useState(false);
  const { addToWatchList, watchListIds } = useAuth();
  const { toast } = useToast();

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}/${movie.title || movie.name}`);
  };

  const addToWatchListLocal = async (movieId) => {
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

  const handleViewMore = (genreId, genreName) => {
    navigate(`/genre/${genreId}`, { state: { name: genreName } });
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen mt-10 z-10">
      {GenresList.genere.map(
        (item, index) =>
          index <= 4 && (
            <div key={item.id} className="p-8 px-8 md:px-16">
              {hasMoreThanTen && (
                <div className="flex items-center mb-4 justify-between">
                  <h2 className="text-[24px] text-white font-bold">
                    {item.name}
                  </h2>
                  <button
                    onClick={() => handleViewMore(item.id, item.name)}
                    className="border-2 border-white text-white px-[10px] py-[5px] w-[120px] h-[40px] rounded-full transition-colors duration-200 shadow-md font-semibold"
                  >
                    View More
                  </button>
                </div>
              )}
              {!hasMoreThanTen && (
                <h2 className="text-[20px] text-white font-bold mb-4">
                  {item.name}
                </h2>
              )}
              <MovieList
                genreId={item.id}
                index_={index}
                onMovieClick={handleMovieClick}
                onAddToWatchList={addToWatchListLocal}
                onMovieCount={(count) => {
                  console.log("Movie count:", count);
                  setHasMoreThanTen(count > 10);
                }}
              />
            </div>
          )
      )}
    </div>
  );
}

export default GenreMovieList;
