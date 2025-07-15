/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaArrowLeft, FaChevronUp, FaChevronDown } from "react-icons/fa";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function WatchPageSeries() {
  const { id, season, episode } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [mediaDetails, setMediaDetails] = useState(null);
  const [video, setVideo] = useState(null);
  const [similarSeries, setSimilarSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSeasons, setExpandedSeasons] = useState({});
  const [expandedEpisodes, setExpandedEpisodes] = useState({});
  const [selectedSeason, setSelectedSeason] = useState(parseInt(season) || 1);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setSelectedSeason(parseInt(season) || 1); // Đồng bộ selectedSeason

    console.log("Params from useParams:", { id, season, episode });

    const { embedUrl, source } = location.state || {};
    if (embedUrl) {
      console.log("Using embedUrl from state:", embedUrl);
      setVideo({ embedUrl, source });
    } else if (season && episode) {
      const parsedSeason = parseInt(season);
      const parsedEpisode = parseInt(episode);
      if (isNaN(parsedSeason) || isNaN(parsedEpisode)) {
        setError("Season hoặc Episode không hợp lệ.");
        setVideo(null);
        return;
      }
      GlobalApi.getSeriesEpisodeVideo(id, parsedSeason, parsedEpisode)
        .then((resp) => setVideo(resp.data))
        .catch((err) => {
          setError(`Không thể tải video: ${err.message}`);
          setVideo(null);
          console.error("Video fetch error:", err);
        });
    }

    const fetchDetails = GlobalApi.getTVSeriesDetails(id)
      .then((resp) => setMediaDetails(resp.data))
      .catch((err) => {
        setError(`Không thể tải thông tin series: ${err.message}`);
        console.error("Details fetch error:", err);
      });

    const fetchSimilar = GlobalApi.getSimilarTV(id)
      .then((resp) =>
        setSimilarSeries(resp.data.results ? resp.data.results.slice(0, 6) : [])
      )
      .catch((err) =>
        console.log("Không thể tải series tương tự:", err.message)
      );

    Promise.all([fetchDetails, fetchSimilar]).finally(() =>
      setIsLoading(false)
    );
  }, [id, season, episode, location.state]);

  const handleSeriesClick = (seriesId) => {
    navigate(`/watch-series/${seriesId}`);
  };

  const toggleSeason = (seasonNumber) => {
    setExpandedSeasons((prev) => {
      const newExpanded = { [seasonNumber]: !prev[seasonNumber] };
      return seasonNumber === 1 && !prev[1]
        ? { ...newExpanded, 1: true }
        : newExpanded;
    });
  };

  const toggleEpisodes = (seasonNumber) => {
    setExpandedEpisodes((prev) => ({
      ...prev,
      [seasonNumber]: !prev[seasonNumber],
    }));
  };

  const formattedSeason = String(parseInt(season || 0)).padStart(2, "0");
  const formattedEpisode = String(parseInt(episode || 0)).padStart(2, "0");

  if (isLoading)
    return (
      <div className="text-white text-center p-10 text-2xl">Đang tải...</div>
    );
  if (error)
    return (
      <div className="text-white text-center p-10 text-2xl">
        {error} <br />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 p-2 bg-blue-600 rounded-md hover:bg-blue-700"
        >
          Quay lại
        </button>
      </div>
    );

  return (
    <div
      className="min-h-screen p-6 mt-24 relative mx-auto"
      style={{
        backgroundImage: mediaDetails
          ? `url(${IMAGE_BASE_URL}${
              mediaDetails.backdrop_path || mediaDetails.poster_path
            })`
          : "none",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>
      <button
        onClick={() => navigate(-1)}
        className="absolute top-10 left-6 flex items-center text-white text-xl hover:text-gray-300 transition-colors duration-300 bg-transparent z-10"
      >
        <FaArrowLeft className="mr-2 w-7 h-7" />
      </button>
      {mediaDetails && video && video.embedUrl ? (
        <div className="relative z-10 max-w-7xl mx-auto mt-10 flex flex-col md:flex-row gap-6">
          {/* Video Player */}
          <div className="w-full md:w-3/4 mx-auto">
            <h1 className="text-3xl md:text-3xl font-bold mb-6 text-center text-gray-100">
              {mediaDetails.name} - Phần {formattedSeason} Tập{" "}
              {formattedEpisode}
            </h1>
            <iframe
              width="100%"
              height="500"
              src={`${video.embedUrl}?autoplay=1`}
              title={`${mediaDetails.name} Episode ${formattedEpisode}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="rounded-xl shadow-lg mb-4"
              style={{ aspectRatio: "16/9" }}
              onError={(e) => {
                console.error("Iframe error:", e);
                setError(
                  "Không thể tải video từ nguồn hiện tại, kiểm tra console log."
                );
              }}
              onLoad={() =>
                console.log("Iframe loaded successfully:", video.embedUrl)
              }
            ></iframe>
            {error && (
              <div className="text-red-500 text-center mb-4">{error}</div>
            )}
          </div>

          {/* Danh sách Phần & Tập (bên phải, có cuộn) */}
          <div className="w-full md:w-1/4 h-[500px] bg-transparent rounded-xl p-4 shadow-md ml-20 mt-[42px] mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold mb-3 text-center text-gray-100 border-b border-gray-600 pb-2">
              Danh sách Phần
            </h2>
            <div className="space-y-3 overflow-y-auto h-full ">
              {mediaDetails.seasons.map((s) => {
                const isExpanded = expandedSeasons[s.season_number] || false;
                const isEpisodesExpanded =
                  expandedEpisodes[s.season_number] || false;
                const episodeCount = s.episode_count || 1;
                const showAllEpisodes =
                  isEpisodesExpanded || episodeCount <= 10;
                const visibleEpisodes = showAllEpisodes
                  ? Array.from({ length: episodeCount }, (_, i) => i + 1)
                  : Array.from({ length: 10 }, (_, i) => i + 1);

                return (
                  <div
                    key={s.season_number}
                    className="bg-gray-700 rounded-lg p-2 shadow-md transition-all duration-300 hover:shadow-lg"
                  >
                    <button
                      onClick={() => toggleSeason(s.season_number)}
                      className="w-full text-left text-base md:text-lg font-semibold text-gray-200 flex justify-between items-center py-1"
                    >
                      <span>
                        Phần {String(s.season_number).padStart(2, "0")}
                      </span>
                      {isExpanded ? (
                        <FaChevronUp className="text-gray-400" />
                      ) : (
                        <FaChevronDown className="text-gray-400" />
                      )}
                    </button>
                    {isExpanded && (
                      <div className="mt-2 grid grid-cols-1 gap-1">
                        {visibleEpisodes.map((ep) => {
                          const isActive =
                            season == s.season_number && episode == ep;
                          const isWatched = false; // Thêm logic từ watchListIds nếu có
                          return (
                            <button
                              key={ep}
                              onClick={() =>
                                navigate(
                                  `/watch/${id}/${s.season_number}/${ep}`
                                )
                              }
                              className={`w-full p-1.5 rounded-md text-sm font-medium transition-colors duration-200 outline-none ${
                                isActive
                                  ? "bg-gray-400 "
                                  : isWatched
                                  ? "bg-green-600 opacity-70"
                                  : "bg-gray-600 "
                              }`}
                            >
                              Tập {String(ep).padStart(2, "0")}
                              {isWatched && (
                                <span className="ml-1 text-xs text-gray-300">
                                  (Đã xem)
                                </span>
                              )}
                            </button>
                          );
                        })}
                        {episodeCount > 10 && (
                          <button
                            onClick={() => toggleEpisodes(s.season_number)}
                            className="w-full p-1.5 mt-1 bg-gray-600 hover:bg-gray-500 rounded-md text-sm font-medium transition-colors duration-200"
                          >
                            {isEpisodesExpanded ? "Thu gọn" : "Xem thêm"}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-white text-center p-10 text-2xl mx-auto">
          Không tìm thấy nội dung video.
        </div>
      )}

      {similarSeries.length > 0 && (
        <div className="mt-10 relative z-20 mx-20">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-100 border-b border-gray-700 pb-2">
            Series tương tự
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mx-auto">
            {similarSeries.map((series) => {
              return (
                <div
                  key={series.id}
                  className="relative h-[420px] rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
                  onClick={() => handleSeriesClick(series.id)}
                >
                  <img
                    src={`https://image.tmdb.org/t/p/w500/${series.poster_path}`}
                    alt={series.name}
                    className="w-full h-[340px] object-cover rounded-b-xl "
                  />
                  <div className="p-3 bg-opacity-90">
                    <p className="text-lg font-semibold text-gray-200 truncate">
                      {series.name}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {similarSeries.length === 0 && (
        <p className="text-gray-400 text-center mt-10 mx-auto">
          Không có series tương tự.
        </p>
      )}
    </div>
  );
}

export default WatchPageSeries;
