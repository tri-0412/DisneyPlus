/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import MovieCard from "./MovieCard";
import { IoChevronBackOutline, IoChevronForwardOutline } from "react-icons/io5";
import HrMovieCard from "./HrMovieCard";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

// eslint-disable-next-line react/prop-types
function MovieList({
  genreId,
  index_,
  onMovieClick,
  onAddToWatchList,
  onMovieCount,
}) {
  const [movieList, setMovieList] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const elementRef = useRef(null);
  const loaderRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMovieByGenreId(1); // load page đầu tiên
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getMovieByGenreId = (pageNum) => {
    GlobalApi.getMovieByGenreId(genreId, pageNum)
      .then((resp) => {
        const results = resp.data.results || [];
        if (results.length === 0) {
          setHasMore(false);
          return;
        }
        setMovieList((prev) => [...prev, ...results]);

        if (typeof onMovieCount === "function" && pageNum === 1) {
          onMovieCount(results.length);
        }
      })
      .catch((error) => {
        console.error("Error fetching movies:", error);
      });
  };

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting) {
          const nextPage = page + 1;
          setPage(nextPage);
          getMovieByGenreId(nextPage);
        }
      },
      { threshold: 1 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [page, hasMore]);

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
          <div key={item.id} className="relative flex-shrink-0">
            {index_ % 3 === 0 ? (
              <HrMovieCard
                movie={item}
                onClick={onMovieClick}
                onAddToWatchList={onAddToWatchList}
                lazy
              />
            ) : (
              <MovieCard
                movie={item}
                onClick={onMovieClick}
                onAddToWatchList={onAddToWatchList}
                lazy
              />
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
