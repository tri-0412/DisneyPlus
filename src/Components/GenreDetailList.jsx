/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import GlobalApi from "../Services/GlobalApi";
import MovieCard from "./MovieCard";

const IMAGE_BASE_URL = "http://image.tmdb.org/t/p/original";

function GenreDetailList() {
  const { genreId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [movieList, setMovieList] = useState([]);
  const [genreName, setGenreName] = useState("Unknown"); // Mặc định nếu không có name

  useEffect(() => {
    getMovieByGenreId();
    // Lấy genreName từ state nếu có
    if (location.state?.name) {
      setGenreName(location.state.name);
    }
  }, [genreId, location.state]);

  const getMovieByGenreId = () => {
    GlobalApi.getMovieByGenreId(genreId).then((resp) => {
      setMovieList(resp.data.results);
    });
  };

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}/${movie.title || movie.name}`);
  };

  return (
    <div className="container mx-auto py-8 mt-24">
      <h2 className="text-2xl font-bold mb-10 text-white">{genreName}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {movieList.map((item) => (
          <MovieCard
            key={item.id}
            movie={item}
            onClick={() => handleMovieClick(item)}
          />
        ))}
      </div>
    </div>
  );
}

export default GenreDetailList;
