import GenresList from "../Constant/GenresList";
import MovieList from "./MovieList";
import { useNavigate } from "react-router-dom";

function GenreMovieList() {
  const navigate = useNavigate();

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}/${movie.title || movie.name}`);
  };

  const addToWatchList = (movieId) => {
    let watchList = JSON.parse(localStorage.getItem("watchList")) || [];
    if (!watchList.includes(movieId)) {
      watchList.push(movieId);
      localStorage.setItem("watchList", JSON.stringify(watchList));
      alert("Đã thêm vào watch list!");
    } else {
      alert("Phim đã có trong watch list!");
    }
  };

  return (
    <div className="bg-[#1a1a1a] min-h-screen">
      {GenresList.genere.map(
        (item, index) =>
          index <= 4 && (
            <div key={item.id} className="p-8 px-8 md:px-16">
              <h2 className="text-[20px] text-white font-bold">{item.name}</h2>
              <MovieList
                genreId={item.id}
                index_={index}
                onMovieClick={handleMovieClick}
                onAddToWatchList={addToWatchList} // Truyền hàm vào MovieList
              />
            </div>
          )
      )}
    </div>
  );
}

export default GenreMovieList;
