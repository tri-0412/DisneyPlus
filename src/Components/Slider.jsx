/* eslint-disable react/jsx-key */
import { useEffect, useRef, useState } from "react";
import GlobalApi from "../Services/GlobalApi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";
const screenWidth = window.innerWidth;
function Slider() {
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const elementRef = useRef();
  useEffect(() => {
    getTrendingMovies();
  }, []);

  const getTrendingMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const resp = await GlobalApi.getTrendingVideos();
      setMovieList(resp.data.results || []);
    } catch (err) {
      setError("Không thể tải danh sách phim. Vui lòng thử lại sau!");
      console.error("Lỗi API:", err.message);
    } finally {
      setLoading(false);
    }
  };
  const sliderRight = (element) => {
    element.scrollLeft += screenWidth - 125;
  };
  const sliderLeft = (element) => {
    element.scrollLeft -= screenWidth - 125;
  };
  if (loading)
    return <div className="text-white text-center p-6">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;
  return (
    <div>
      <HiChevronLeft
        className="hidden md:block text-white text-[30px] absolute mx-8 mt-[150px] cursor-pointer"
        onClick={() => sliderLeft(elementRef.current)}
      />
      <HiChevronRight
        className="hidden md:block text-white text-[30px] absolute mx-8 mt-[150px] cursor-pointer right-0"
        onClick={() => sliderRight(elementRef.current)}
      />
      <div
        className="flex overflow-x-auto w-full px-16 py-4 scrollbar-hide scroll-smooth snap-mandatory "
        ref={elementRef}
      >
        {movieList.map((item) => (
          <img
            src={IMAGE_BASE_URL + item.backdrop_path}
            alt=""
            className="min-w-full md:h-[310px] object-cover object-left-top mr-5 rounded-md hover:border-[4px] border-gray-400 transition-all duration-100 ease-in"
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
