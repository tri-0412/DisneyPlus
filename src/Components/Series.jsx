/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { CiHeart } from "react-icons/ci";
import { FaHeart } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../Context/AuthContext";

function Series() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addToWatchList, watchListIds, removeFromWatchList } = useAuth();

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await GlobalApi.getTVSeries();
        setSeries(response.data.results);
        console.log(
          "Fetched series IDs:",
          response.data.results.map((s) => s.id)
        );
      } catch (err) {
        setError("Không thể tải danh sách series. Vui lòng thử lại sau!");
        console.error("Lỗi API:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchSeries();
  }, []);

  const handleSeriesClick = (seriesItem) => {
    console.log("Navigating to series ID:", seriesItem.id, seriesItem.name);
    navigate(`/series/${seriesItem.id}/${encodeURIComponent(seriesItem.name)}`);
  };

  const handleAddToWatchList = async (seriesId) => {
    try {
      console.log("Before add - Current watchListIds:", watchListIds);
      console.log("Attempting to add series ID to watchlist:", seriesId);
      if (
        !watchListIds.some(
          (item) => item.id === seriesId && item.type === "series"
        )
      ) {
        await addToWatchList(seriesId, "series");
        console.log("After add - Updated watchListIds:", watchListIds);
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
    } catch (error) {
      console.error("Lỗi khi thêm vào watchlist:", error);
      toast({
        title: "Lỗi",
        description: "Không thể thêm series vào watch list!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-red-500 text-white",
      });
    }
  };

  if (loading)
    return <div className="text-white text-center p-6">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-white p-6 mt-24">
      <h1 className="text-3xl font-bold mb-6 text-gray-100 border-b-2 border-gray-700 pb-2">
        Series
      </h1>
      {series.length === 0 && !loading && !error ? (
        <p className="text-gray-400 text-center py-10">
          Không có series nào để hiển thị.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {series.map((seriesItem) => {
            const releaseYear = seriesItem.first_air_date
              ? new Date(seriesItem.first_air_date).getFullYear()
              : "N/A";
            const isInWatchList = watchListIds.some(
              (item) => item.id === seriesItem.id && item.type === "series"
            );
            console.log(
              "Checking series ID:",
              seriesItem.id,
              "in watchListIds:",
              watchListIds
            );

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
                      ? "text-red-600 hover:scale-110 border-none"
                      : "text-white hover:scale-110 border-none"
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
