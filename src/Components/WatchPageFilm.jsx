import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaArrowLeft } from "react-icons/fa";

const IMAGE_BASE_URL = "https://placehold.co/500x750";

function WatchPageFilm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mediaDetails, setMediaDetails] = useState(null);
  const [video, setVideo] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Chỉ fetch details cho phim lẻ
    const fetchDetails = GlobalApi.getMovieDetails(id)
      .then((resp) => {
        setMediaDetails(resp.data);
      })
      .catch((err) => {
        setError(`Không thể tải thông tin phim: ${err.message}`);
        console.error("Details fetch error:", err);
      });

    // Fetch video cho phim lẻ
    const fetchVideo = async () => {
      try {
        const resp = await GlobalApi.getFullMovieVideo(id, false);
        console.log("Fetched video data:", resp.data); // Debug URL
        setVideo(resp.data);
      } catch (err) {
        setError(`Không thể tải video: ${err.message}`);
        setVideo(null);
        console.error("Video fetch error:", err);
      }
    };

    // Fetch phim tương tự
    const fetchSimilar = GlobalApi.getSimilarMovies(id)
      .then((resp) => {
        setSimilarMovies(
          resp.data.results ? resp.data.results.slice(0, 6) : []
        );
      })
      .catch((err) => console.log("Không thể tải phim tương tự:", err.message));

    Promise.all([fetchDetails, fetchVideo(), fetchSimilar]).finally(() =>
      setIsLoading(false)
    );
  }, [id]);

  const handleMovieClick = (movieId) => {
    navigate(`/watch/${movieId}`);
  };

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
      className="min-h-screen p-6 mt-24 relative"
      style={{
        backgroundImage: mediaDetails
          ? `url(${IMAGE_BASE_URL}${
              mediaDetails.backdrop_path || mediaDetails.poster_path || ""
            })`
          : `url(${IMAGE_BASE_URL})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>
      <button
        onClick={() => navigate(-1)}
        className="absolute top-20 left-6 flex items-center text-white text-xl hover:text-gray-300 transition-colors duration-300 bg-transparent z-10"
      >
        <FaArrowLeft className="mr-2 w-7 h-7" /> Quay lại
      </button>
      {mediaDetails && video && video.embedUrl ? (
        <div className="relative z-10 max-w-6xl mx-auto mt-10 rounded-xl p-6 shadow-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-gray-100">
            {mediaDetails.title}
          </h1>
          <iframe
            width="100%"
            height="100%" // Sử dụng height 100% để tự điều chỉnh
            src={`${video.embedUrl}?autoplay=1`} // Thêm autoplay để tự động play
            title={`${mediaDetails.title}`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-xl shadow-lg mb-6"
            style={{
              aspectRatio: "16/9",
              minHeight: "500px",
              maxHeight: "90vh",
            }} // Giới hạn chiều cao tối đa
            onError={() => {
              setError(
                "Không thể tải video từ URL nhúng. Vui lòng kiểm tra lại."
              );
              console.error("Iframe load error for URL:", video.embedUrl);
            }}
            onLoad={() =>
              console.log("Iframe loaded with URL:", video.embedUrl)
            }
          ></iframe>
          {error && (
            <div className="text-red-500 text-center mb-4">
              {error} <br />
              URL sử dụng: {video.embedUrl}
            </div>
          )}

          {similarMovies.length > 0 ? (
            <div className="mt-10">
              <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-gray-100 border-b border-gray-700 pb-2">
                Phim tương tự
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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
                        className="w-full h-48 object-cover"
                        onError={(e) => (e.target.src = `${IMAGE_BASE_URL}`)}
                      />
                      <div className="p-4">
                        <p className="text-lg font-semibold text-gray-200 truncate">
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
            </div>
          ) : (
            <p className="text-gray-400 text-center mt-10"></p>
          )}
        </div>
      ) : (
        <div className="text-white text-center p-10 text-2xl">
          Không tìm thấy nội dung video.
        </div>
      )}
    </div>
  );
}

export default WatchPageFilm;
