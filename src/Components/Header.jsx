/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo1.png";
import {
  HiHome,
  HiMagnifyingGlass,
  HiStar,
  HiPlayCircle,
  HiTv,
} from "react-icons/hi2";
import { HiPlus, HiDotsVertical } from "react-icons/hi";
import HeaderItem from "./HeaderItem";
import { logout } from "@/./../firebase";
import { auth } from "@/./../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRef } from "react"; // Thêm import useRef

function Header() {
  const [toggle, setToggle] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const modalRef = useRef(null); // Thêm ref cho modal
  // Thêm useEffect để đóng modal khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(event.target) &&
        !event.target.closest(".user-button") // Loại trừ nút user
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setUser({
          name: storedUser.name || currentUser.email.split("@")[0],
          email: currentUser.email,
          uid: currentUser.uid,
        });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error.message);
    }
    setIsModalOpen(false);
  };

  const menu = [
    { name: "HOME", icon: HiHome, path: "/" },
    { name: "SEARCH", icon: HiMagnifyingGlass, path: "/search" },
    { name: "WATCH LIST", icon: HiPlus, path: "/watch-list" },
    { name: "ORIGINALS", icon: HiStar, path: "/originals" },
    { name: "MOVIES", icon: HiPlayCircle, path: "/movies" },
    { name: "SERIES", icon: HiTv, path: "/series" },
  ];

  return (
    <div className="fixed top-0 left-0 w-full flex items-center justify-between p-5 z-[9999] bg-[#1a1a1a] shadow-lg">
      <div className="flex items-center gap-8">
        <Link to="/">
          <img
            src={logo}
            alt="Logo"
            className="w-20 md:w-[115px] object-cover"
          />
        </Link>
        <div className="flex md:hidden gap-5">
          {menu.map(
            (item, index) =>
              index < 3 && (
                <Link
                  to={item.path}
                  key={item.name}
                  className={`${
                    location.pathname === item.path
                      ? "active underline underline-offset-8 text-red-600"
                      : ""
                  } hover:no-underline hover:text-red-600 transition-all duration-200`}
                >
                  <HeaderItem name={""} Icon={item.icon} />
                </Link>
              )
          )}
          <div className="md:hidden" onClick={() => setToggle(!toggle)}>
            <HeaderItem name={""} Icon={HiDotsVertical} />
            {toggle ? (
              <div className="absolute mt-3 bg-[rgba(51,51,51,.712)] border-[1px] border-gray-700 p-3 px-5 py-4 z-[9999] space-y-2">
                {menu.map(
                  (item, index) =>
                    index > 2 && (
                      <Link
                        to={item.path}
                        key={item.name}
                        className={`${
                          location.pathname === item.path
                            ? "active underline underline-offset-4 text-red-600"
                            : ""
                        } hover:no-underline hover:text-red-600 transition-all duration-200`}
                      >
                        <HeaderItem name={item.name} Icon={item.icon} />
                      </Link>
                    )
                )}
              </div>
            ) : null}
          </div>
        </div>
        <div className="hidden md:flex gap-8">
          {menu.map((item) => (
            <Link
              to={item.path}
              key={item.name}
              className={`${
                location.pathname === item.path
                  ? "active underline underline-offset-8 text-white hover:text-white"
                  : ""
              } transition-all duration-200`}
            >
              <HeaderItem name={item.name} Icon={item.icon} />
            </Link>
          ))}
        </div>
      </div>
      <div className="relative">
        {user ? (
          <>
            <button
              onClick={() => setIsModalOpen(!isModalOpen)}
              className="flex border-none items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-full transition-colors duration-200 user-button" // Thêm class user-button
            >
              <span className="text-sm font-medium">{user.name}</span>
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <span className="text-xs">{user.name.charAt(0)}</span>
              </div>
            </button>
            {isModalOpen && (
              <div
                ref={modalRef} // Gắn ref vào modal
                className="absolute right-0 mt-2 w-48 bg-gray-700 border border-gray-700 rounded-md shadow-lg z-[9999]"
              >
                <div className="absolute -top-3.5 right-4 w-0 h-0 border-l-[10px] border-r-[10px] border-b-[10px] border-l-transparent border-r-transparent border-b-gray-700 transform translate-y-1/2" />
                <button
                  onClick={handleLogout}
                  className="w-full bg-transparent border-none text-left px-4 py-3 text-red-600 rounded-md text-sm transition-colors duration-200"
                >
                  Log Out
                </button>
              </div>
            )}
          </>
        ) : (
          <Link to="/login">
            <button className="bg-red-600 text-white px-4 py-2 rounded-full hover:bg-red-700 transition-colors duration-200 text-sm font-medium">
              Sign In
            </button>
          </Link>
        )}
      </div>
    </div>
  );
}

export default Header;
