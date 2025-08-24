/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaArrowLeft } from "react-icons/fa";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../Context/AuthContext";
import isIdValid from "../utils/checkValidId";
import LoadingSkeleton from "./LoadingSkeleton";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function MovieDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movieDetails, setMovieDetails] = useState(null);
  const [movieCredits, setMovieCredits] = useState(null);
  const [video, setVideo] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isTV, setIsTV] = useState(false);
  const { toast } = useToast();
  const { addToWatchList, watchListIds } = useAuth();

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchDetails = async () => {
      try {
        const movieResp = await GlobalApi.getMovieDetails(id);
        setMovieDetails(movieResp.data);
        setIsTV(false);
      } catch (movieErr) {
        const tvResp = await GlobalApi.getTVSeriesDetails(id);
        setMovieDetails(tvResp.data);
        setIsTV(true);
      }
    };

    const fetchCredits = GlobalApi.getMovieCredits(id)
      .then((resp) => setMovieCredits(resp.data))
      .catch((err) => setError(`Không thể tải diễn viên: ${err.message}`));

    const fetchVideo =
      !isTV &&
      GlobalApi.getFullMovieVideo(id, false)
        .then((resp) => setVideo(resp.data))
        .catch((err) => setError(`Không thể tải video: ${err.message}`));

    const fetchTrailer = GlobalApi.getMovieVideos(id)
      .then((resp) => {
        const trailerVideo = resp.data.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        if (trailerVideo)
          setTrailer({
            embedUrl: `https://www.youtube.com/embed/${trailerVideo.key}`,
            source: "youtube",
          });
      })
      .catch((err) => console.log("No trailer available:", err.message));

    Promise.all([
      fetchDetails(),
      fetchCredits,
      fetchVideo,
      fetchTrailer,
    ]).finally(() => setIsLoading(false));
  }, [id]);

  const addToWatchListHandler = async () => {
    if (
      movieDetails &&
      !watchListIds.some(
        (item) => item.id === movieDetails.id && item.type === "movie"
      )
    ) {
      await addToWatchList(movieDetails.id, "movie"); // Truyền type "movie"
      toast({
        title: "Thành công",
        description: "Đã thêm phim vào watch list!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-green-500 text-white",
      });
    } else if (movieDetails) {
      toast({
        title: "Thông báo",
        description: "Phim đã có trong watch list!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-blue-500 text-white",
      });
    }
  };

  const handleWatchNow = () => {
    if (video && video.embedUrl) navigate(`/watch/${id}`);
  };

  const handleWatchTrailer = () => {
    if (trailer && trailer.embedUrl) navigate(`/watch/trailer/${id}`);
    else
      toast({
        title: "Thông báo",
        description: "Không tìm thấy trailer!",
        duration: 2000,
        position: "top-right",
        className: "text-sm font-medium bg-red-500 text-white",
      });
  };

  if (isLoading)
    return <LoadingSkeleton count={1} width="100%" height="500px" />;

  if (error)
    return <div className="text-white text-center p-10 text-2xl">{error}</div>;

  return (
    <div
      className="min-h-screen p-6 mt-24 relative"
      style={{
        backgroundImage: movieDetails
          ? `url(${IMAGE_BASE_URL}${
              movieDetails.backdrop_path || movieDetails.poster_path
            })`
          : "ur",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-0"></div>
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-10 items-center text-white">
        <img
          src={`${IMAGE_BASE_URL}${movieDetails.poster_path}`}
          alt={movieDetails.title || movieDetails.name}
          className="w-full rounded-xl shadow-lg"
        />
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-5xl font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.5)]">
            {movieDetails.title || movieDetails.name}
          </h1>
          <p className="text-lg text-gray-300">{movieDetails.overview}</p>
          <p className="text-sm text-gray-400">
            <strong>Last episode:</strong>{" "}
            {movieDetails.last_air_date || movieDetails.release_date || "N/A"}
          </p>
          <div className="flex flex-wrap gap-3">
            {movieDetails.genres?.map((genre) => (
              <span
                key={genre.id}
                className="px-4 py-2 bg-white/10 border border-white/20 rounded-full text-sm text-white"
              >
                {genre.name}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className="text-yellow-400 text-xl">
                  {i < Math.round(movieDetails.vote_average / 2) ? "★" : "☆"}
                </span>
              ))}
            </div>
            <span className="text-sm text-gray-300">
              ({movieDetails.vote_count?.toLocaleString()} vote)
            </span>
          </div>
          <div className="flex flex-wrap gap-4 mt-6">
            <button
              onClick={handleWatchNow}
              className="px-6 py-3 bg-[#34495e] rounded-lg text-white font-semibold shadow-md"
            >
              Watch Now
            </button>
            <button
              onClick={handleWatchTrailer}
              className="px-6 py-3 bg-[#34495e] rounded-lg text-white font-semibold shadow-md"
            >
              Watch Trailer
            </button>
            <button
              onClick={addToWatchListHandler}
              className="px-6 py-3 bg-[#34495e] rounded-lg text-white font-semibold shadow-md"
            >
              Add to Favorites
            </button>
          </div>
        </div>
      </div>
      {movieDetails &&
        movieCredits &&
        movieCredits.cast &&
        movieCredits.cast.length > 0 && (
          <div className="mt-12 relative z-20">
            <div className="bg-transparent backdrop-blur-md p-6 rounded-xl">
              <h2 className="text-3xl md:text-4xl font-semibold mb-6 text-gray-100 border-b-2 border-gray-700/50 pb-2 hover:text-gray-300 transition-colors duration-300 text-center">
                Dàn Cast
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 items-center justify-items-center">
                {movieCredits.cast.slice(0, 12).map((actor) => (
                  <div
                    key={actor.id}
                    className="text-center group hover:shadow-2xl transition-all duration-300"
                  >
                    <img
                      src={
                        actor.profile_path
                          ? `${IMAGE_BASE_URL}${actor.profile_path}`
                          : "https://via.placeholder.com/150?text=No+Image"
                      }
                      alt={actor.name}
                      className="w-32 h-40 md:w-36 md:h-48 object-cover rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                    <p className="mt-3 text-base text-gray-300 group-hover:text-white transition-colors duration-300">
                      {actor.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}

export default MovieDetail;
