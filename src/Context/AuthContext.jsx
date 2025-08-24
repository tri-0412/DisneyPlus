/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable no-useless-catch */
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc, setDoc } from "firebase/firestore";
import { toast } from "react-toastify";
import { auth, db, login, signup, logout } from "../../firebase"; // Sử dụng từ firebase.js
const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [watchListIds, setWatchListIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        await loadWatchlist(currentUser.uid);
      } else {
        setUser(null);
        setWatchListIds([]);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const loadWatchlist = async (uid) => {
    const watchlistRef = doc(db, "watchlists", uid);
    const watchlistSnap = await getDoc(watchlistRef);
    if (watchlistSnap.exists()) {
      const data = watchlistSnap.data().items || [];
      setWatchListIds(data);
      console.log("Loaded watchlist data for uid:", uid, "items:", data);
    } else {
      setWatchListIds([]);
    }
  };

  const signup = async (name, email, password) => {
    try {
      const userCredential = await signup(name, email, password); // Sử dụng từ firebase.js
      console.log("Signup successful:", userCredential);
      return userCredential;
    } catch (error) {
      console.error("Lỗi khi đăng ký:", error);
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await login(email, password); // Sử dụng từ firebase.js
      console.log("Login successful:", userCredential);
      return userCredential;
    } catch (error) {
      console.error("Lỗi khi đăng nhập:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logout(); // Sử dụng từ firebase.js
      console.log("Logout successful");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      toast.error("Không thể đăng xuất");
    }
  };

  const addToWatchList = async (mediaId, type = "movie") => {
    if (user) {
      const watchlistRef = doc(db, "watchlists", user.uid);
      const watchlistSnap = await getDoc(watchlistRef);
      let newWatchList = watchlistSnap.exists()
        ? watchlistSnap.data().items || []
        : [];
      const item = { id: mediaId, type };
      if (
        !newWatchList.some((item) => item.id === mediaId && item.type === type)
      ) {
        newWatchList.push(item);
        await setDoc(watchlistRef, { items: newWatchList }, { merge: true });
        setWatchListIds(newWatchList);
        console.log(
          "Successfully updated watchlist for uid:",
          user.uid,
          "newWatchList:",
          newWatchList
        );
      } else {
        console.log(
          "MediaId",
          mediaId,
          "with type",
          type,
          "already exists in watchlist"
        );
      }
    }
  };

  const updateWatchList = async (newWatchList) => {
    if (user) {
      try {
        const watchlistRef = doc(db, "watchlists", user.uid);
        console.log(
          "Updating watchlist for uid:",
          user.uid,
          "with:",
          newWatchList
        );
        await updateDoc(watchlistRef, { items: newWatchList });
        setWatchListIds(newWatchList);
        toast.success("Watchlist đã được cập nhật!");
      } catch (error) {
        console.error("Lỗi khi cập nhật watchlist:", error);
        toast.error("Không thể cập nhật watchlist");
        throw error;
      }
    }
  };

  const removeFromWatchList = async (mediaId, type) => {
    if (user) {
      console.log(
        "Removing mediaId:",
        mediaId,
        "with type:",
        type,
        "for user:",
        user.uid
      );
      const newWatchList = watchListIds.filter(
        (item) => !(item.id === mediaId && item.type === type)
      );
      await updateWatchList(newWatchList);
    } else {
      console.log("MediaId not found in watchlist or user not authenticated");
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    watchListIds,
    addToWatchList,
    removeFromWatchList,
    updateWatchList,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
