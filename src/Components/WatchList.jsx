/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { Button } from "@mui/material";
import { Snackbar, Alert } from "@mui/material";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../Context/AuthContext";

function WatchList({ name }) {
  const [watchList, setWatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState({
    title: "",
    description: "",
    movieId: null,
  });
  const { toast } = useToast();
  const { watchListIds, removeFromWatchList } = useAuth(); // Sử dụng trực tiếp từ useAuth

  useEffect(() => {
    const fetchWatchListDetails = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching watchlist with IDs:", JSON.stringify(watchListIds));

      try {
        if (watchListIds && watchListIds.length > 0) {
          const detailsPromises = watchListIds.map(async (item) => {
            const id = item.id;
            if (!id || isNaN(id) || id <= 0) {
              console.error("Invalid ID in watchListIds:", item);
              return null;
            }

            try {
              if (item.type === "movie") {
                const movieResp = await GlobalApi.getMovieDetails(id);
                if (movieResp && movieResp.data) {
                  console.log(
                    `Successfully fetched movie ID ${id}:`,
                    movieResp.data.title
                  );
                  const credits = await GlobalApi.getMovieCredits(id).catch(
                    (err) => {
                      console.error(`Lỗi khi lấy credits cho ID ${id}:`, err);
                      return { data: { crew: [] } };
                    }
                  );
                  const director =
                    credits.data.crew.find(
                      (person) => person.job === "Director"
                    )?.name || "Unknown Director";
                  return { ...movieResp.data, director, type: "movie" };
                }
              } else if (item.type === "series") {
                const seriesResp = await GlobalApi.getTVSeriesDetails(id);
                if (seriesResp && seriesResp.data) {
                  console.log(
                    `Successfully fetched series ID ${id}:`,
                    seriesResp.data.name
                  );
                  const credits = await GlobalApi.getTVSeriesCredits(id).catch(
                    (err) => {
                      console.error(
                        `Lỗi khi lấy credits cho series ID ${id}:`,
                        err
                      );
                      return { data: { crew: [] } }; // Fallback nếu lỗi
                    }
                  );
                  const director =
                    credits.data.crew.find(
                      (person) => person.job === "Director"
                    )?.name || "Unknown Director";
                  return { ...seriesResp.data, director, type: "series" };
                } else {
                  console.error(`No data for series ID ${id}`);
                }
              }
            } catch (err) {
              console.error(`Lỗi khi lấy chi tiết cho ID ${id}:`, err);
              return null;
            }
            return null;
          });
          const details = await Promise.all(detailsPromises);
          const validDetails = details.filter((d) => d !== null);
          if (validDetails.length === 0) {
            setWatchList([]);
            return;
          }
          setWatchList(validDetails);
        } else {
          setWatchList([]);
        }
      } catch (error) {
        setError("Lỗi khi lấy chi tiết phim/series: " + error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchWatchListDetails();
  }, [watchListIds]);

  const handleMovieClick = (item) => {
    const path = item.type === "series" ? "/series" : "/movie";
    navigate(
      `${path}/${item.id}/${encodeURIComponent(item.title || item.name)}`
    );
  };

  const handleRemoveFromWatchList = (movieId) => {
    // Đổi tên để tránh xung đột
    const itemToRemove = watchList.find((item) => item.id === movieId);
    const itemTitle = itemToRemove?.title || itemToRemove?.name || "Unknown";
    const type = itemToRemove?.type || "movie";
    setSnackbarMessage({
      title: "Xác nhận xóa",
      description: `Xóa "${itemTitle}" khỏi danh sách yêu thích?`,
      movieId: movieId,
    });
    setOpenSnackbar(true);
  };

  const handleConfirmRemove = async (movieId) => {
    try {
      const itemToRemove = watchList.find((item) => item.id === movieId);
      const type = itemToRemove?.type || "movie";
      await removeFromWatchList(movieId, type); // Sử dụng hàm từ useAuth
      const updatedWatchList = watchList.filter((item) => item.id !== movieId);
      setWatchList(updatedWatchList);

      const removedItem = watchList.find((item) => item.id === movieId);
      const itemTitle = removedItem?.title || removedItem?.name || "Unknown";

      toast({
        title: "Thành công",
        description: `Đã xóa "${itemTitle}" khỏi watchlist!`,
        duration: 3000,
        className: "bg-green-800 border border-green-700 text-white",
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể xóa khỏi watchlist!",
        duration: 3000,
        className: "bg-red-800 border border-red-700 text-white",
      });
      console.error("Lỗi khi xóa watchlist:", error);
    } finally {
      setOpenSnackbar(false);
    }
  };

  if (loading)
    return <div className="text-white text-center p-6">Đang tải...</div>;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="bg-[#1a1a1a] min-h-screen text-white p-6 mt-24 z-10">
      <h1 className="text-3xl font-bold mb-8 text-gray-100 border-b-2 border-gray-700 pb-2">
        Watch List
      </h1>
      {watchList.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          Chưa có phim nào trong watch list.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {watchList.map((item) => {
            const releaseYear =
              item.release_date || item.first_air_date
                ? new Date(
                    item.release_date || item.first_air_date
                  ).getFullYear()
                : "N/A";

            return (
              <div
                key={item.id}
                className="relative bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <img
                  src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                  alt={item.title || item.name}
                  className="w-full h-72 object-cover"
                />
                <div className="p-4">
                  <p className="text-lg font-semibold text-gray-200 truncate">
                    {item.title || item.name}
                  </p>
                  <div className="flex justify-between text-sm text-gray-400 mt-1">
                    <span className="text-yellow-400">
                      {item.director || "Unknown Director"}
                    </span>
                    <span>{releaseYear}</span>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveFromWatchList(item.id);
                  }}
                  className="absolute top-2 right-2 p-0 outline-none border-none rounded-full flex items-center justify-center align-middle transition-all duration-200 focus:outline-none !border-0 !outline-0 focus:!ring-0 z-20"
                >
                  <IoIosClose className="text-red-600 w-6 h-6 bg-transparent" />
                </button>
                <div
                  className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-opacity duration-300 cursor-pointer z-10"
                  onClick={() => handleMovieClick(item)}
                />
              </div>
            );
          })}
        </div>
      )}
      <Snackbar
        open={openSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
        autoHideDuration={null}
        onClose={() => setOpenSnackbar(false)}
        sx={{
          "& .MuiPaper-root": {
            background: "linear-gradient(135deg, #1a202c, #2d3748)",
            borderRadius: "10px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.4)",
            padding: "10px 18px",
            marginTop: "108px",
            maxWidth: "320px",
            width: "100%",
            zIndex: 50,
          },
        }}
      >
        <Alert
          severity="warning"
          action={
            <div className="flex justify-between w-full">
              <Button
                variant="contained"
                color="error"
                size="small"
                onClick={() => handleConfirmRemove(snackbarMessage.movieId)}
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
                onClick={() => setOpenSnackbar(false)}
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
            flexDirection: "column",
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
