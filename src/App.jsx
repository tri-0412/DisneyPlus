/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { LuArrowUpFromLine } from "react-icons/lu";
import GenreMovieList from "./Components/GenreMovieList";
import Header from "./Components/Header";
import ProductionHouse from "./Components/ProductionHouse";
import Slider from "./Components/Slider";
import MovieDetail from "./Components/MovieDetail";
import Search from "./Components/Search";
import WatchList from "./Components/WatchList";
import Originals from "./Components/Originals";
import Movies from "./Components/Movies";
import Series from "./Components/Series";
import Footer from "./Components/Footer";
import { useToast } from "@/hooks/use-toast"; // Import useToast để sử dụng
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/Components/ui/toast"; // Import các thành phần toast
import Login from "./Components/Login";
import { auth } from "@/../firebase";
import { onAuthStateChanged } from "firebase/auth";
import SeriesDetail from "./Components/SeriesDetail";
import GenreDetailList from "./Components/GenreDetailList";
import WatchPageFilm from "./Components/WatchPageFilm";
import WatchPageTrailer from "./Components/WatchPageTrailer";
import WatchPageSeries from "./Components/WatchPageSeries";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const storedUser = localStorage.getItem("user");
      if (!user && !storedUser) {
        navigate("/login");
      } else if (location.pathname === "/login" && (user || storedUser)) {
        navigate("/");
      }
    });

    return () => unsubscribe();
  }, [navigate, location.pathname]);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const showHomeComponents = location.pathname !== "/login";
  const showSliderAndProduction = location.pathname === "/";

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Component Toaster
  function Toaster() {
    const { toasts } = useToast();

    return (
      <ToastProvider>
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast}>
            <div className="grid gap-1">
              {toast.title && <ToastTitle>{toast.title}</ToastTitle>}
              {toast.description && (
                <ToastDescription>{toast.description}</ToastDescription>
              )}
            </div>
            {toast.action}
            <ToastClose />
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    );
  }

  return (
    <div>
      {showHomeComponents && <Header />}
      {showHomeComponents && showSliderAndProduction && (
        <>
          <Slider />
          <ProductionHouse />
        </>
      )}
      <Routes>
        <Route path="/" element={<GenreMovieList />} />
        <Route path="/search" element={<Search />} />
        <Route path="/watch-list" element={<WatchList />} />
        <Route path="/originals" element={<Originals />} />
        <Route path="/movies" element={<Movies />} />
        <Route path="/series" element={<Series />} />
        <Route path="/series/:id/:name" element={<SeriesDetail />} />
        <Route path="/movie/:id/:title" element={<MovieDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/genre/:genreId" element={<GenreDetailList />} />
        <Route path="/watch/:id" element={<WatchPageFilm />} />
        <Route
          path="/watch/:id/:season/:episode"
          element={<WatchPageSeries />}
        />
        <Route path="/watch/trailer/:id" element={<WatchPageTrailer />} />
      </Routes>
      {showHomeComponents && <Footer />}
      {showHomeComponents && isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-red-600 text-white w-12 h-12 rounded-full flex items-center justify-center hover:bg-red-700 hover:scale-110 transition-all duration-200 z-50 shadow-md hover:border-0 border-0 outline-none"
          title="Back to Top"
        >
          <LuArrowUpFromLine className="absolute w-6 h-6" />
        </button>
      )}
      <Toaster /> {/* Sử dụng component Toaster trực tiếp */}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
