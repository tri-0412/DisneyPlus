import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaArrowLeft } from "react-icons/fa";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movieDetails, setMovieDetails] = useState(null);
  const [movieCredits, setMovieCredits] = useState(null);
  const [video, setVideo] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    GlobalApi.getMovieDetails(id)
      .then((resp) => setMovieDetails(resp.data))
      .catch((error) =>
        setError(`Không thể tải thông tin phim: ${error.message}`)
      );

    GlobalApi.getMovieCredits(id)
      .then((resp) => setMovieCredits(resp.data))
      .catch((error) =>
        setError(`Không thể tải thông tin diễn viên: ${error.message}`)
      );

    GlobalApi.getMovieVideos(id)
      .then((resp) => {
        const videos = resp.data.results;
        const trailer = videos.find(
          (vid) => vid.type === "Trailer" && vid.site === "YouTube"
        );
        setVideo(trailer);
      })
      .catch((error) => setError(`Không thể tải trailer: ${error.message}`))
      .finally(() => setIsLoading(false));
  }, [id]);

  const addToWatchList = () => {
    if (movieDetails) {
      let watchList = JSON.parse(localStorage.getItem("watchList")) || [];
      if (!watchList.includes(movieDetails.id)) {
        watchList.push(movieDetails.id);
        localStorage.setItem("watchList", JSON.stringify(watchList));
        alert("Đã thêm vào watch list!");
      } else {
        alert("Phim đã có trong watch list!");
      }
    }
  };

  if (isLoading)
    return <div className="text-white text-center p-4">Đang tải...</div>;
  if (error) return <div className="text-white text-center p-4">{error}</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6 overflow-y-auto">
      <button
        onClick={() => navigate(-1)}
        className="absolute top-36 left-6 flex items-center text-white text-xl hover:border-transparent transition-colors duration-300 bg-transparent"
      >
        <FaArrowLeft className="mr-2" />
      </button>
      {movieDetails && (
        <div className="max-w-5xl mx-auto mt-16 bg-gray-800 bg-opacity-90 rounded-xl p-6 shadow-lg">
          <h1 className="text-4xl font-bold mb-6 text-center text-gray-100">
            {movieDetails.title || movieDetails.name}
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
                    movieDetails.backdrop_path || movieDetails.poster_path
                  }`}
                  alt={movieDetails.title || movieDetails.name}
                  className="w-full h-96 object-cover rounded-lg shadow-md"
                />
              )}
            </div>
            <div className="w-full md:w-1/3 space-y-4 overflow-y-auto max-h-[450px]">
              <p className="text-base">
                <strong className="text-gray-300">Tổng quan:</strong>{" "}
                {movieDetails.overview}
              </p>
              <p className="text-base">
                <strong className="text-gray-300">Ngày phát hành:</strong>{" "}
                {movieDetails.release_date}
              </p>
              <p className="text-base">
                <strong className="text-gray-300">Thời lượng:</strong>{" "}
                {movieDetails.runtime} phút
              </p>
              <p className="text-base">
                <strong className="text-gray-300">Điểm đánh giá:</strong>{" "}
                {movieDetails.vote_average}/10
              </p>
              {movieCredits && (
                <>
                  <p className="text-base">
                    <strong className="text-gray-300">Đạo diễn:</strong>{" "}
                    {movieCredits.crew?.find((c) => c.job === "Director")
                      ?.name || "N/A"}
                  </p>
                  <p className="text-base">
                    <strong className="text-gray-300">Diễn viên:</strong>{" "}
                    {movieCredits.cast
                      ?.slice(0, 5)
                      .map((c) => c.name)
                      .join(", ") || "N/A"}
                  </p>
                </>
              )}
              <button
                onClick={addToWatchList}
                className="mt-4 p-2 bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Thêm vào Watch List
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieDetail;
