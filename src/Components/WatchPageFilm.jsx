import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaArrowLeft } from "react-icons/fa";
import LoadingSkeleton from "./LoadingSkeleton";

const IMAGE_BASE_URL = "https://placehold.co/500x750";

function WatchPageFilm() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [mediaDetails, setMediaDetails] = useState(null);
  const [video, setVideo] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);

  const [loadingDetails, setLoadingDetails] = useState(true);
  const [loadingVideo, setLoadingVideo] = useState(true);
  const [loadingSimilar, setLoadingSimilar] = useState(true);

  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    // Fetch chi tiết phim
    GlobalApi.getMovieDetails(id)
      .then((res) => setMediaDetails(res.data))
      .catch((err) => setError(`Không thể tải thông tin phim: ${err.message}`))
      .finally(() => setLoadingDetails(false));

    // Fetch video
    GlobalApi.getFullMovieVideo(id, false)
      .then((res) => setVideo(res.data))
      .catch((err) => {
        console.error("Video fetch error:", err);
        setVideo(null);
      })
      .finally(() => setLoadingVideo(false));

    // Fetch phim tương tự
    GlobalApi.getSimilarMovies(id)
      .then((res) => setSimilarMovies(res.data.results || []))
      .catch((err) =>
        console.error("Không thể tải phim tương tự:", err.message)
      )
      .finally(() => setLoadingSimilar(false));
  }, [id]);

  const handleMovieClick = (movieId) => {
    navigate(`/watch/${movieId}`);
  };

  if (error)
    return (
      <div className="text-white text-center p-10 text-2xl">
        {error} <br />
        <button
          onClick={() => navigate(-1)}
          className="mt-4 p-2 bg-blue-600 rounded-md hover:bg-blue-700"
        ></button>
      </div>
    );

  return (
    <div
      className="min-h-screen p-6 mt-24 relative"
      style={{
        backgroundImage: mediaDetails
          ? `url(https://image.tmdb.org/t/p/original${
              mediaDetails.backdrop_path || mediaDetails.poster_path || ""
            })`
          : `url(${IMAGE_BASE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-20 left-6 flex items-center text-white text-xl hover:text-gray-300 transition-colors duration-300 bg-transparent z-10"
      >
        <FaArrowLeft className="mr-2 w-6 h-6" />
      </button>

      <div className="relative z-10 max-w-6xl mx-auto rounded-xl p-6 shadow-2xl">
        {/* Movie Title */}
        {loadingDetails ? (
          <LoadingSkeleton count={1} width="60%" height="40px" />
        ) : (
          <h1 className="text-3xl md:text-4xl font-bold mb-10 text-center text-gray-100">
            {mediaDetails?.title}
          </h1>
        )}

        {/* Video Player */}
        {loadingVideo ? (
          <LoadingSkeleton count={1} width="100%" height="500px" />
        ) : video && video.embedUrl ? (
          <iframe
            width="100%"
            src={`${video.embedUrl}?autoplay=1`}
            title={mediaDetails?.title || "Movie Player"}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-xl shadow-lg mb-6"
            style={{
              aspectRatio: "16/9",
              minHeight: "500px",
              maxHeight: "90vh",
            }}
            onError={() =>
              setError("Không thể tải video từ URL nhúng. Vui lòng thử lại.")
            }
          />
        ) : (
          <p className="text-gray-400 text-center">Không tìm thấy video</p>
        )}

        {/* Similar Movies */}
        <div className="mt-10">
          <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-100 border-b border-gray-700 pb-2">
            Phim tương tự
          </h2>
          {loadingSimilar ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
              {Array(5)
                .fill(null)
                .map((_, i) => (
                  <LoadingSkeleton
                    key={i}
                    count={1}
                    width="100%"
                    height="220px"
                  />
                ))}
            </div>
          ) : similarMovies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {similarMovies.map((movie) => {
                const releaseYear = movie.release_date
                  ? new Date(movie.release_date).getFullYear()
                  : "N/A";
                return (
                  <div
                    key={movie.id}
                    className="relative bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl cursor-pointer"
                    onClick={() => handleMovieClick(movie.id)}
                  >
                    <img
                      src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                      alt={movie.title}
                      className="w-full h-56 object-cover"
                      onError={(e) => (e.target.src = `${IMAGE_BASE_URL}`)}
                    />
                    <div className="p-3">
                      <p className="text-base font-semibold text-gray-200 truncate">
                        {movie.title}
                      </p>
                      <p className="text-sm text-gray-400 mt-1">
                        {releaseYear}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">Không có phim tương tự.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WatchPageFilm;
