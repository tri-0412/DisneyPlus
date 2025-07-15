/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import { FaArrowLeft } from "react-icons/fa";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function WatchPageTrailer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mediaDetails, setMediaDetails] = useState(null);
  const [trailer, setTrailer] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    const fetchDetails = GlobalApi.getMovieDetails(id)
      .then((resp) => {
        setMediaDetails(resp.data);
        console.log("Fetched movie details for trailer ID:", id, resp.data);
      })
      .catch((err) => setError(`Không thể tải thông tin: ${err.message}`));

    const fetchTrailer = GlobalApi.getMovieVideos(id)
      .then((resp) => {
        console.log("getMovieVideos response for ID:", id, resp.data.results);
        const trailerVideo = resp.data.results.find(
          (v) => v.type === "Trailer" && v.site === "YouTube"
        );
        if (trailerVideo) {
          setTrailer({
            embedUrl: `https://www.youtube.com/embed/${trailerVideo.key}`,
            source: "youtube",
          });
          console.log("Loaded trailer for ID:", id, trailerVideo);
        } else {
          setError("Không tìm thấy trailer.");
          console.log(
            "No trailer found for ID:",
            id,
            "Available videos:",
            resp.data.results
          );
        }
      })
      .catch((err) => setError(`Không thể tải trailer: ${err.message}`));

    Promise.all([fetchDetails, fetchTrailer]).finally(() =>
      setIsLoading(false)
    );
  }, [id]);

  if (isLoading)
    return (
      <div className="text-white text-center p-10 text-2xl">Đang tải...</div>
    );
  if (error)
    return <div className="text-white text-center p-10 text-2xl">{error}</div>;

  return (
    <div
      className="min-h-screen p-6 mt-24 relative"
      style={{
        backgroundImage: mediaDetails
          ? `url(${IMAGE_BASE_URL}${
              mediaDetails.backdrop_path || mediaDetails.poster_path
            })`
          : "url(https://via.placeholder.com/1920x1080?text=No+Image)",
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
        <FaArrowLeft className="mr-2 w-7 h-7" />
      </button>
      {mediaDetails && trailer && trailer.embedUrl && (
        <div className="relative z-10 max-w-6xl mx-auto mt-10  rounded-xl p-6 shadow-2xl ">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-center text-gray-100">
            {mediaDetails.title || mediaDetails.name} - Trailer
          </h1>
          <iframe
            width="100%"
            height="600"
            src={trailer.embedUrl}
            title={`${mediaDetails.title || mediaDetails.name} Trailer`}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="rounded-xl shadow-lg mb-6"
          ></iframe>
        </div>
      )}
    </div>
  );
}

export default WatchPageTrailer;
