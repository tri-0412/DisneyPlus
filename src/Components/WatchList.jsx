/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import GlobalApi from "../Services/GlobalApi";
import { useNavigate } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../Context/AuthContext";
import LoadingSkeleton from "./LoadingSkeleton";

function WatchList({ name }) {
  const [watchList, setWatchList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { toast } = useToast();
  const { watchListIds, removeFromWatchList } = useAuth();

  useEffect(() => {
    const fetchWatchListDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        if (watchListIds && watchListIds.length > 0) {
          const detailsPromises = watchListIds.map(async (item) => {
            const id = item.id;
            if (!id || isNaN(id) || id <= 0) return null;
            try {
              if (item.type === "movie") {
                const movieResp = await GlobalApi.getMovieDetails(id);
                if (movieResp?.data) {
                  const credits = await GlobalApi.getMovieCredits(id).catch(
                    () => ({ data: { crew: [] } })
                  );
                  const director =
                    credits.data.crew.find((p) => p.job === "Director")?.name ||
                    "Unknown Director";
                  return { ...movieResp.data, director, type: "movie" };
                }
              } else if (item.type === "series") {
                const seriesResp = await GlobalApi.getTVSeriesDetails(id);
                if (seriesResp?.data) {
                  const credits = await GlobalApi.getTVSeriesCredits(id).catch(
                    () => ({ data: { crew: [] } })
                  );
                  const director =
                    credits.data.crew.find((p) => p.job === "Director")?.name ||
                    "Unknown Director";
                  return { ...seriesResp.data, director, type: "series" };
                }
              }
            } catch (err) {
              console.error("Error fetching item:", err);
              return null;
            }
            return null;
          });

          const details = await Promise.all(detailsPromises);
          const validDetails = details.filter((d) => d !== null);
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

  const handleRemoveClick = (item) => {
    setSelectedItem(item);
    setConfirmOpen(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedItem) return;
    try {
      await removeFromWatchList(selectedItem.id, selectedItem.type || "movie");
      setWatchList((prev) => prev.filter((it) => it.id !== selectedItem.id));

      toast({
        title: "Thành công",
        description: `Đã xóa "${
          selectedItem.title || selectedItem.name
        }" khỏi watchlist!`,
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
    } finally {
      setConfirmOpen(false);
      setSelectedItem(null);
    }
  };

  if (loading) return <LoadingSkeleton count={12} />;
  if (error) return <div className="text-red-500 text-center p-6">{error}</div>;

  return (
    <div className="bg-[#1a1a1a] w-[1200px] min-h-screen text-white mx-auto p-6 mt-24 z-10">
      <h1
        className="text-3xl font-bold mt-6 mb-10 
               text-[#3cb4ff] tracking-wide uppercase 
               drop-shadow-[0_0_28px_#5baee5] 
               text-center"
      >
        Watch List
      </h1>

      {watchList.length === 0 ? (
        <p className="text-gray-400 text-center py-10">
          Chưa có phim nào trong watch list.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mx-auto gap-6">
          {watchList.map((item) => (
            <div
              key={item.id}
              className="relative rounded-xl overflow-hidden hover:scale-105 transition-all duration-300"
            >
              <img
                src={`https://image.tmdb.org/t/p/w500/${item.poster_path}`}
                alt={item.title || item.name}
                className="w-full h-65 object-cover rounded-lg"
              />
              <div className="flex py-2">
                <p className="text-lg p-2 font-semibold text-gray-200 truncate">
                  {item.title || item.name}
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveClick(item);
                }}
                className="absolute top-2 right-2 p-0 border-none rounded-full flex items-center justify-center z-20"
              >
                <IoIosClose className="text-red-600 w-6 h-6" />
              </button>
              <div
                className="absolute inset-0 bg-black bg-opacity-0 transition-opacity duration-300 cursor-pointer z-10"
                onClick={() => handleMovieClick(item)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Confirm dialog */}
      <Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        PaperProps={{
          style: {
            borderRadius: 12,
            backgroundColor: "#1f2937",
            color: "#f9fafb",
            padding: "8px",
          },
        }}
      >
        <DialogTitle className="text-red-400 font-bold">
          Xác nhận xóa
        </DialogTitle>
        <DialogContent className="text-gray-300">
          Bạn có chắc muốn xóa{" "}
          <span className="font-semibold">
            {selectedItem?.title || selectedItem?.name}
          </span>{" "}
          khỏi Watch List?
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmOpen(false)}
            variant="outlined"
            sx={{
              color: "#e5e7eb",
              borderColor: "#6b7280",
              textTransform: "none",
              "&:hover": {
                borderColor: "#9ca3af",
                background: "rgba(255,255,255,0.05)",
              },
            }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmRemove}
            variant="contained"
            sx={{
              background: "#e50914",
              textTransform: "none",
              "&:hover": { background: "#b91c1c" },
            }}
          >
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default WatchList;
