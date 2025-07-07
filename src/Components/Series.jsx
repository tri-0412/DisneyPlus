import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { CiHeart } from "react-icons/ci"; // Icon trái tim rỗng
import { FaHeart } from "react-icons/fa"; // Icon trái tim đậm
import { useToast } from "@/hooks/use-toast"; // Sử dụng toast từ shadcn/ui

function Series() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [watchListIds, setWatchListIds] = useState(() => {
    return JSON.parse(localStorage.getItem("watchList")) || [];
  });
  const { toast } = useToast(); // Sử dụng hook useToast

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await GlobalApi.getTVSeries(); // Sử dụng endpoint series
        if (response.data.results) {
          setSeries(response.data.results);
        } else {
          throw new Error("Dữ liệu không hợp lệ từ API");
        }
      } catch (err) {
        setError("Không thể tải danh sách series. Vui lòng thử lại sau!");
        console.error("Lỗi API:", err.message); // Log lỗi để debug
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  const handleSeriesClick = (seriesItem) => {
    navigate(`/series/${seriesItem.id}/${seriesItem.name}`);
  };

  const handleAddToWatchList = (seriesId) => {
    let updatedWatchList = [...watchListIds];
    if (!updatedWatchList.includes(seriesId)) {
      updatedWatchList.push(seriesId);
      toast({
        title: "Thành công",
        description: "Đã thêm series vào watch list!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-green-500 text-white",
      });
    } else {
      toast({
        title: "Thông báo",
        description: "Series đã có trong watch list!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-blue-500 text-white",
      });
    }
    setWatchListIds(updatedWatchList);
    localStorage.setItem("watchList", JSON.stringify(updatedWatchList));
  };

  if (loading)
    return <div className="text-white text-center p-6">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-100 border-b-2 border-gray-700 pb-2">
        Series
      </h1>
      {series.length === 0 && !loading && !error ? (
        <p className="text-gray-400 text-center py-10">
          Không có series nào để hiển thị.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {series.map((seriesItem) => {
            const releaseYear = seriesItem.first_air_date
              ? new Date(seriesItem.first_air_date).getFullYear()
              : "N/A";
            const isInWatchList = watchListIds.includes(seriesItem.id);

            return (
              <div
                key={seriesItem.id}
                className="relative bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
                onClick={() => handleSeriesClick(seriesItem)}
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500/${seriesItem.poster_path}`}
                  alt={seriesItem.name}
                  className="w-full h-64 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <p className="text-lg font-semibold text-gray-200 truncate">
                    {seriesItem.name}
                  </p>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span>Year: {releaseYear}</span>
                    <span>Rating: {seriesItem.vote_average || "N/A"}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddToWatchList(seriesItem.id);
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
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Series;
