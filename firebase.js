// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { toast } from "react-toastify";
// import { getAnalytics } from "firebase/analytics";

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
    await addDoc(collection(db, "user"), {
      uid: user.uid,
      name,
      authProvider: "local",
      email,
    });
    return user; // Trả về user sau khi đăng ký
  } catch (error) {
    console.log(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
    throw error; // Ném lỗi để xử lý ở component
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
    return user; // Trả về user sau khi đăng nhập
  } catch (error) {
    console.log(error);
    toast.error(error.code.split("/")[1].split("-").join(" "));
    throw error; // Ném lỗi để xử lý ở component
  }
};

const logout = () => {
  signOut(auth);
};

export { auth, db, login, signup, logout };
