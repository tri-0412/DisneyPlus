import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaPlay } from "react-icons/fa";
import { useAuth } from "../Context/AuthContext";
import { useToast } from "../hooks/use-toast";

function SeriesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);
  const { addToWatchList, watchListIds } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    const fetchSeriesDetails = async () => {
      try {
        const detailsResp = await GlobalApi.getTVSeriesDetails(id);
        if (!detailsResp.data || !detailsResp.data.id) {
          throw new Error("Dữ liệu series không hợp lệ");
        }
        setSeriesDetails(detailsResp.data);
      } catch (err) {
        setError(`Không thể tải thông tin series: ${err.message}`);
        console.error("Lỗi API:", err.message, err.response?.data);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSeriesDetails();
  }, [id]);

  const handleWatchEpisode = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const videoResp = await GlobalApi.getSeriesEpisodeVideo(
        id,
        selectedSeason,
        selectedEpisode
      );
      console.log("Fetched video:", videoResp.data);
      if (videoResp.data.embedUrl) {
        navigate(`/watch/${id}/${selectedSeason}/${selectedEpisode}`, {
          state: {
            embedUrl: videoResp.data.embedUrl,
            source: videoResp.data.source,
          },
        });
      } else {
        throw new Error("Không tìm thấy URL video");
      }
    } catch (videoErr) {
      console.error("Lỗi khi lấy video:", videoErr.message);
      setError(`Không thể tải video: ${videoErr.message}`);
      toast({
        title: "Lỗi",
        description: "Không tìm thấy video cho tập này!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-red-500 text-white",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToWatchLists = () => {
    if (seriesDetails && !watchListIds.includes(seriesDetails.id)) {
      addToWatchList(seriesDetails.id);
      toast({
        title: "Thành công",
        description: "Đã thêm series vào Watch List!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-green-500 text-white",
      });
    } else if (seriesDetails) {
      toast({
        title: "Thông báo",
        description: "Series đã có trong Watch List!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-blue-500 text-white",
      });
    }
  };

  if (isLoading)
    return <div className="text-white text-center p-4">Đang tải...</div>;
  if (error)
    return (
      <div className="text-white text-center p-4">
        {error} <br />
        <button
          onClick={() => navigate("/series")}
          className="mt-2 p-2 bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Quay lại danh sách series
        </button>
      </div>
    );

  return (
    <div
      className="min-h-screen p-6 pt-24 mt-24 relative overflow-y-auto"
      style={{
        backgroundImage: `url(http://image.tmdb.org/t/p/original/${
          seriesDetails.backdrop_path || seriesDetails.poster_path
        })`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black opacity-60 z-0"></div>
      {seriesDetails && (
        <div>
          <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-white">
            <img
              src={`http://image.tmdb.org/t/p/original/${
                seriesDetails.backdrop_path || seriesDetails.poster_path
              }`}
              alt={seriesDetails.name}
              className="w-full h-[600px] object-cover rounded-lg shadow-2xl"
            />
            <div className="w-full md:col-span-2 text-center md:text-left p-6">
              <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
                {seriesDetails.name}
              </h1>
              <p className="text-lg text-gray-300 mb-4 w-full">
                {seriesDetails.overview}
              </p>
              <p className="text-sm text-gray-400 mb-4">
                Last episode: {seriesDetails.last_air_date || "2025-06-04"}
              </p>
              <div className="flex flex-wrap gap-3">
                {seriesDetails.genres?.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>
              <div className="flex items-center mb-4 justify-center md:justify-start">
                <span className="text-yellow-400 text-2xl">★★★★☆</span>
                <span className="ml-2 text-sm text-gray-400">(880 votes)</span>
              </div>
              <div className="flex space-x-4 justify-center md:justify-start">
                <button
                  onClick={handleWatchEpisode}
                  className="px-6 py-3 bg-[#34495e] rounded-md text-white font-semibold"
                >
                  Watch Film
                </button>
                <button
                  onClick={addToWatchLists}
                  className="px-6 py-3 bg-[#34495e] rounded-md text-white font-semibold"
                >
                  Add to Favorites
                </button>
              </div>
            </div>
          </div>
          <div className="mt-8 bg-transparent bg-opacity-90 rounded-xl p-6 shadow-lg relative z-20">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100 border-b-2 border-gray-700 pb-2"></h2>
            {seriesDetails.seasons && seriesDetails.seasons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seriesDetails.seasons.map((season) => (
                  <div
                    key={season.id}
                    className="bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={`http://image.tmdb.org/t/p/w500/${
                        season.poster_path || seriesDetails.poster_path
                      }`}
                      alt={`Phần ${season.season_number}`}
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                    <h3 className="text-lg font-medium text-gray-200">
                      Phần {season.season_number}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Số tập: {season.episode_count}
                    </p>
                    <p className="text-sm text-gray-400">
                      Ngày phát hành: {season.air_date || "Chưa có"}
                    </p>
                    <button
                      onClick={() => {
                        setSelectedSeason(season.season_number);
                        setSelectedEpisode(1);
                      }}
                      className="mt-2 flex items-center text-blue-400 hover:text-blue-600 transition duration-300"
                    >
                      <FaPlay className="mr-1" /> Xem chi tiết
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">
                Không có thông tin về các phần.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SeriesDetail;
