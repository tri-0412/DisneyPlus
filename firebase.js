// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, setDoc, doc, getDoc } from "firebase/firestore";
import { toast } from "react-toastify";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCxj8feVUDVvD4qmf4hm9ZNHNuF1ec-Xvc",
  authDomain: "netflix-clone-a3f7c.firebaseapp.com",
  projectId: "netflix-clone-a3f7c",
  storageBucket: "netflix-clone-a3f7c.firebasestorage.app",
  messagingSenderId: "687486696695",
  appId: "1:687486696695:web:c692fc033311e576bba7f2",
  measurementId: "G-5DXJT1Z2WE",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (name, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        name,
        authProvider: "local",
        email,
      },
      { merge: true }
    );
    // Khởi tạo watchlist
    await setDoc(doc(db, "watchlists", user.uid), { ids: [] }, { merge: true });
    return user;
  } catch (error) {
    console.error("Signup error:", error);
    if (error.code) {
      toast.error(
        error.code.split("/")[1].split("-").join(" ") || "Đã xảy ra lỗi"
      );
    } else {
      toast.error("Đã xảy ra lỗi không xác định");
    }
    throw error;
  }
};

const login = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    // Kiểm tra và khởi tạo watchlist nếu chưa có
    const watchlistRef = doc(db, "watchlists", user.uid);
    const docSnap = await getDoc(watchlistRef);
    if (!docSnap.exists()) {
      await setDoc(watchlistRef, { ids: [] }, { merge: true });
    }
    return user;
  } catch (error) {
    console.log(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
    throw error;
  }
};

const logout = () => {
  signOut(auth);
};

export { auth, db, login, signup, logout };
