import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { useEffect } from "react";
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
import { Toaster } from "@/components/ui/toaster";
import Login from "./Components/Login";
import { auth } from "@/./../firebase";
import { onAuthStateChanged } from "firebase/auth";
import SeriesDetail from "./Components/SeriesDetail";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Kiểm tra trạng thái đăng nhập khi component mount
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const storedUser = localStorage.getItem("user");
      if (!user && !storedUser) {
        // Nếu không có user và không có dữ liệu trong localStorage, điều hướng đến /login
        navigate("/login");
      } else if (location.pathname === "/login" && (user || storedUser)) {
        // Nếu đã đăng nhập nhưng ở trang /login, điều hướng về /
        navigate("/");
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, location.pathname]);

  // Chỉ render Header, Slider, ProductionHouse khi không ở /login
  const showHomeComponents = location.pathname !== "/login";

  // Chỉ render Slider và ProductionHouse khi ở trang "/"
  const showSliderAndProduction = location.pathname === "/";

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
      </Routes>
      {showHomeComponents && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
      <Toaster />
    </Router>
  );
}

export default App;
