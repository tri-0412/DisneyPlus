import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaArrowLeft, FaPlay } from "react-icons/fa";

function SeriesDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [seriesDetails, setSeriesDetails] = useState(null);
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchSeriesDetails = async () => {
      try {
        console.log("Fetching series details for ID:", id); // Debug ID
        const detailsResp = await GlobalApi.getTVSeriesDetails(id);
        if (!detailsResp.data || !detailsResp.data.id) {
          throw new Error("Dữ liệu series không hợp lệ");
        }
        setSeriesDetails(detailsResp.data);

        const videosResp = await GlobalApi.getTVSeriesVideos(id);
        const trailer = videosResp.data.results.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        );
        setVideo(trailer);
      } catch (err) {
        setError(`Không thể tải thông tin series: ${err.message}`);
        console.error("Lỗi API:", err.message, err.response?.data);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeriesDetails();
  }, [id]);

  const addToWatchList = () => {
    if (seriesDetails) {
      let watchList = JSON.parse(localStorage.getItem("watchList")) || [];
      if (!watchList.includes(seriesDetails.id)) {
        watchList.push(seriesDetails.id);
        localStorage.setItem("watchList", JSON.stringify(watchList));
        alert("Đã thêm vào watch list!");
      } else {
        alert("Series đã có trong watch list!");
      }
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
    <div className="bg-gray-900 min-h-screen text-white p-6 overflow-y-auto">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-36 left-6 flex items-center text-white text-xl hover:text-blue-400 transition-colors duration-300 bg-transparent"
      >
        <FaArrowLeft className="mr-2" />
        Quay lại
      </button>
      {seriesDetails && (
        <div className="max-w-5xl mx-auto mt-16 bg-gray-800 bg-opacity-90 rounded-xl p-6 shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-100">
            {seriesDetails.name}
          </h1>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              {video ? (
                <iframe
                  width="100%"
                  height="400"
                  src={`https://www.youtube.com/embed/${video.key}?autoplay=0`}
                  title="Trailer"
                  frameBorder="0"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="rounded-lg shadow-md"
                ></iframe>
              ) : (
                <img
                  src={`http://image.tmdb.org/t/p/original${
                    seriesDetails.backdrop_path || seriesDetails.poster_path
                  }`}
                  alt={seriesDetails.name}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
              )}
            </div>
            <div className="w-full md:w-1/3 space-y-4 overflow-y-auto max-h-[450px]">
              <p className="text-base">
                <strong className="text-gray-300">Tổng quan:</strong>{" "}
                {seriesDetails.overview}
              </p>
              <p className="text-base">
                <strong className="text-gray-300">
                  Ngày phát hành đầu tiên:
                </strong>{" "}
                {seriesDetails.first_air_date}
              </p>
              <p className="text-base">
                <strong className="text-gray-300">Số phần:</strong>{" "}
                {seriesDetails.number_of_seasons}
              </p>
              <p className="text-base">
                <strong className="text-gray-300">Số tập:</strong>{" "}
                {seriesDetails.number_of_episodes}
              </p>
              <p className="text-base">
                <strong className="text-gray-300">Điểm đánh giá:</strong>{" "}
                {seriesDetails.vote_average}/10
              </p>
              <button
                onClick={addToWatchList}
                className="mt-4 p-2 bg-blue-600 rounded-md hover:bg-blue-700 transition duration-300"
              >
                Thêm vào Watch List
              </button>
            </div>
          </div>
          {/* Hiển thị danh sách phần từ seriesDetails.seasons */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4 text-gray-100 border-b-2 border-gray-700 pb-2">
              Các phần (Seasons)
            </h2>
            {seriesDetails.seasons && seriesDetails.seasons.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {seriesDetails.seasons.map((season) => (
                  <div
                    key={season.id}
                    className="bg-gray-700 p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1"
                  >
                    <img
                      src={`http://image.tmdb.org/t/p/w500/${
                        season.poster_path || seriesDetails.poster_path
                      }`}
                      alt={`Phần ${season.season_number}`}
                      className="w-full h-48 object-cover rounded-md mb-2"
                    />
                    <h3 className="text-lg font-medium text-gray-200">
                      Phần {season.season_number} {/* Bắt đầu từ 1 */}
                    </h3>
                    <p className="text-sm text-gray-400">
                      Số tập: {season.episode_count}
                    </p>
                    <p className="text-sm text-gray-400">
                      Ngày phát hành: {season.air_date || "Chưa có"}
                    </p>
                    <button className="mt-2 flex items-center text-blue-400 hover:text-blue-600 transition duration-300">
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
