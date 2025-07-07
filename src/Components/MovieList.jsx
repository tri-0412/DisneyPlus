/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from "react";
import GlobalApi from "../Services/GlobalApi";
import MovieCard from "./MovieCard";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import HrMovieCard from "./HrMovieCard";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

// eslint-disable-next-line react/prop-types
function MovieList({ genreId, index_, onMovieClick }) {
  const [movieList, setMovieList] = useState([]);
  const elementRef = useRef(null);

  useEffect(() => {
    getMovieByGenreId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMovieByGenreId = () => {
    GlobalApi.getMovieByGenreId(genreId).then((resp) => {
      setMovieList(resp.data.results);
    });
  };

  const sliderRight = (element) => {
    element.scrollLeft += 500;
  };

  const sliderLeft = (element) => {
    element.scrollLeft -= 500;
  };

  return (
    <div className="relative">
      <IoChevronBackOutline
        onClick={() => sliderLeft(elementRef.current)}
        className={`cursor-pointer text-[50px] text-white p-2 z-10 hidden md:block absolute ${
          index_ % 3 === 0 ? "mt-[70px]" : "top-[40%] translate-y-[-50%]"
        }`}
      />
      <div
        ref={elementRef}
        className="flex gap-7 overflow-x-auto scrollbar-hide scroll-smooth pt-4 pb-4 px-3"
      >
        {movieList.map((item, index) => (
          <div key={item.id} className="relative">
            {index_ % 3 === 0 ? (
              <HrMovieCard movie={item} onClick={onMovieClick} />
            ) : (
              <MovieCard movie={item} onClick={onMovieClick} />
            )}
          </div>
        ))}
      </div>
      <IoChevronForwardOutline
        onClick={() => sliderRight(elementRef.current)}
        className={`cursor-pointer text-[50px] text-white p-2 z-10 hidden md:block absolute ${
          index_ % 3 === 0
            ? "mt-[70px] top-0 right-0"
            : "top-[40%] translate-y-[-50%] right-0"
        }`}
      />
    </div>
  );
}

export default MovieList;
