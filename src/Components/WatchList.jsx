import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { IoIosCloseCircle } from "react-icons/io";
import { Button } from "@mui/material"; // Sử dụng Button từ MUI
import { Snackbar, Alert } from "@mui/material"; // Sử dụng Snackbar và Alert từ MUI

function WatchList() {
  const [watchList, setWatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false); // Quản lý trạng thái toast
  const [snackbarMessage, setSnackbarMessage] = useState({
    title: "",
    description: "",
    movieId: null,
  });

  useEffect(() => {
    const storedWatchList = JSON.parse(localStorage.getItem("watchList")) || [];
    setLoading(true);
    setError(null);

    const fetchWatchListDetails = async () => {
      try {
        if (storedWatchList.length > 0) {
          const detailsPromises = storedWatchList.map((id) =>
            GlobalApi.getMovieDetails(id)
          );
          const details = await Promise.all(detailsPromises);
          const movies = await Promise.all(
            details.map(async (resp) => {
              const movie = resp.data;
              const credits = await GlobalApi.getMovieCredits(movie.id);
              const director =
                credits.data.crew.find((person) => person.job === "Director")
                  ?.name || "Unknown Director";
              return { ...movie, director };
            })
          );
          setWatchList(movies);
        } else {
          setWatchList([]);
        }
      } catch (error) {
        setError("Lỗi khi lấy chi tiết phim: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchListDetails();
  }, []);

  const handleMovieClick = (movie) => {
    navigate(`/movie/${movie.id}/${movie.title || movie.name}`);
  };

  const removeFromWatchList = (movieId) => {
    // Tìm movie tương ứng để hiển thị thông tin
    const movieToRemove = watchList.find((movie) => movie.id === movieId);
    const movieTitle = movieToRemove?.title || movieToRemove?.name || "Unknown";

    setSnackbarMessage({
      title: "Xác nhận xóa",
      description: `Xóa "${movieTitle}"?`,
      movieId: movieId,
    });
    setOpenSnackbar(true); // Mở Snackbar
  };

  const handleConfirmRemove = () => {
    const movieId = snackbarMessage.movieId;
    const updatedWatchList = watchList.filter((movie) => movie.id !== movieId);
    setWatchList(updatedWatchList);
    const storedIds = updatedWatchList.map((movie) => movie.id);
    localStorage.setItem("watchList", JSON.stringify(storedIds));
    setOpenSnackbar(false); // Đóng Snackbar sau khi xác nhận
  };

  const handleCancelRemove = () => {
    setOpenSnackbar(false); // Đóng Snackbar khi hủy
  };

  if (loading)
    return <div className="text-white text-center p-6">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="bg-gray-900 min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-100 border-b-2 border-gray-700 pb-2">
        Watch List
      </h1>
      {watchList.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          Chưa có phim nào trong watch list.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchList.map((movie) => {
            const releaseYear = movie.release_date
              ? new Date(movie.release_date).getFullYear()
              : "N/A";

            return (
              <div
                key={movie.id}
                className="relative bg-gray-800 rounded-xl shadow-xl overflow-hidden transition-all duration-300 hover:shadow-2xl"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500/${movie.poster_path}`}
                  alt={movie.title || movie.name}
                  className="w-full h-72 object-cover"
                />
                <div className="p-4">
                  <p className="text-lg font-semibold text-gray-200 truncate">
                    {movie.title || movie.name}
                  </p>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span className="text-yellow-400">{movie.director}</span>
                    <span>{releaseYear}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFromWatchList(movie.id);
                  }}
                  className="absolute cursor-pointer top-2 right-2 p-0 border-none rounded-full flex items-center justify-center align-middle transition-all duration-200 focus:outline-none z-20"
                >
                  <IoIosCloseCircle className="text-red-600 w-6 h-6" />
                </button>
                <div
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 cursor-pointer z-10"
                  onClick={() => handleMovieClick(movie)}
                />
              </div>
            );
          })}
        </div>
      )}
      {/* Sử dụng Snackbar từ MUI với layout text và button cải tiến */}
      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }} // Vị trí top-center
        autoHideDuration={null} // Không tự động đóng
        onClose={() => setOpenSnackbar(false)}
        sx={{
          "& .MuiPaper-root": {
            background: "linear-gradient(135deg, #1a202c, #2d3748)", // Gradient nền
            borderRadius: "10px", // Bo góc mềm
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)", // Đổ bóng
            padding: "8px 16px", // Padding gọn
            maxWidth: "320px", // Chiều rộng cố định
            width: "100%", // Responsive
          },
        }}
      >
        <Alert
          severity="warning"
          action={
            <div className="flex justify-between w-full mt-2 ">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={handleConfirmRemove}
                sx={{
                  fontSize: "12px",
                  padding: "2px 8px",
                  marginRight: "8px",
                  backgroundColor: "#e50914",
                  "&:hover": { backgroundColor: "#b91c1c" },
                }}
              >
                Xác nhận
              </Button>
              <Button
                variant="outlined"
                size="small"
                onClick={handleCancelRemove}
                sx={{
                  fontSize: "12px",
                  padding: "2px 8px",
                  color: "#ffffff",
                  borderColor: "#4a5568",
                  "&:hover": {
                    borderColor: "#718096",
                    backgroundColor: "rgba(113, 128, 150, 0.1)",
                  },
                }}
              >
                Hủy
              </Button>
            </div>
          }
          onClose={() => setOpenSnackbar(false)}
          sx={{
            width: "100%",
            padding: "0",
            display: "flex",
            flexDirection: "column", // Xếp text trên, action dưới
            "& .MuiAlert-message": {
              color: "#e2e8f0",
              fontSize: "14px",
              lineHeight: "1.2",
              display: "flex",
              flexDirection: "column",
              padding: "0 8px",
              "& strong": {
                fontWeight: 600,
                marginBottom: "2px",
              },
            },
            "& .MuiAlert-icon": {
              fontSize: "20px",
              color: "#ecc94b",
              marginRight: "8px",
            },
          }}
        >
          <span>
            <strong>{snackbarMessage.title}</strong>
          </span>
          <span>{snackbarMessage.description}</span>
        </Alert>
      </Snackbar>
    </div>
  );
}

export default WatchList;
