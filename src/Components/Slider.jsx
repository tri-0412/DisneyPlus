import { useEffect, useRef, useState, useCallback } from "react";
import GlobalApi from "../Services/GlobalApi";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi";
import debounce from "lodash/debounce"; // Cần cài: npm install lodash

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function Slider() {
  const [movieList, setMovieList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const elementRef = useRef(null);

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

  // Hàm cuộn mượt mà với debounce
  const sliderRight = useCallback(
    debounce((element) => {
      if (element) {
        const maxScrollLeft = element.scrollWidth - element.clientWidth;
        const newScrollLeft = element.scrollLeft + element.clientWidth - 100; // Dựa trên kích thước container
        element.scrollTo({
          left: Math.min(newScrollLeft, maxScrollLeft),
          behavior: "smooth",
        });
      }
    }, 100),
    []
  );

  const sliderLeft = useCallback(
    debounce((element) => {
      if (element) {
        const newScrollLeft = element.scrollLeft - (element.clientWidth - 100);
        element.scrollTo({
          left: Math.max(newScrollLeft, 0),
          behavior: "smooth",
        });
      }
    }, 100),
    []
  );

  // Xử lý resize để cập nhật lại
  useEffect(() => {
    const handleResize = () => {
      if (elementRef.current) {
        elementRef.current.scrollTo({ left: 0, behavior: "smooth" }); // Reset khi resize
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (loading)
    return <div className="text-white text-center p-6">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="pt-24 relative">
      <HiChevronLeft
        className="hidden md:block text-white text-[30px] absolute mx-8 mt-[185px] cursor-pointer z-10"
        onClick={() => sliderLeft(elementRef.current)}
      />
      <HiChevronRight
        className="hidden md:block text-white text-[30px] absolute mx-8 mt-[185px] cursor-pointer right-0 z-10"
        onClick={() => sliderRight(elementRef.current)}
      />
      <div
        className="flex overflow-x-auto w-full px-16 py-4 pt-10 scrollbar-hide scroll-smooth snap-mandatory"
        ref={elementRef}
      >
        {movieList.map((item) => (
          <img
            key={item.id} // Thêm key để tránh lỗi ESLint
            src={IMAGE_BASE_URL + item.backdrop_path}
            alt={item.title || item.name}
            className="min-w-full md:h-[380px] object-cover object-left-top mr-5 rounded-md border-2 border-transparent hover:border-gray-400 transition-all duration-200 ease-in-out flex-shrink-0"
            loading="lazy" // Lazy loading hình ảnh
          />
        ))}
      </div>
    </div>
  );
}

export default Slider;
