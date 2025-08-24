import logo from "@/assets/Images/logo.png";
import { useState } from "react";
import { login, signup, checkUserExists } from "@/./../firebase.js";
import netflix_spinner from "@/assets/Images/netflix_spinner.gif";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AiOutlineEye, AiOutlineEyeInvisible } from "react-icons/ai"; // Import biểu tượng mắt

function Login() {
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false); // State để bật/tắt hiển thị mật khẩu
  const navigate = useNavigate();
  const { toast } = useToast();

  const user_auth = async (event) => {
    event.preventDefault();

    // Kiểm tra nhập thiếu
    if (!email || !password || (signState === "Sign Up" && !name)) {
      setErrors({
        name: signState === "Sign Up" && !name ? "Vui lòng nhập tên." : "",
        email: !email ? "Vui lòng nhập email." : "",
        password: !password ? "Vui lòng nhập mật khẩu." : "",
      });
      toast({
        title: "Lỗi",
        description: "Vui lòng điền đầy đủ thông tin.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setErrors({ name: "", email: "", password: "" });

    try {
      if (signState === "Sign In") {
        const user = await login(email, password);
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: user.email,
            uid: user.uid,
          })
        );
        navigate("/");
      } else {
        const user = await signup(name, email, password);
        localStorage.setItem(
          "user",
          JSON.stringify({
            name: name,
            email: user.email,
            uid: user.uid,
          })
        );
        navigate("/");
      }
    } catch (error) {
      let updatedErrors = { name: "", email: "", password: "" };

      if (signState === "Sign In") {
        console.log("Debug: Error code received:", error.code);
        if (error.code === "auth/invalid-credential") {
          console.log("Debug: Checking user existence for email:", email);
          const userExists = await checkUserExists(email);
          console.log("Debug: checkUserExists returned:", userExists);
          if (userExists) {
            updatedErrors.password = "Mật khẩu không đúng.";
          } else {
            updatedErrors.email = "Tài khoản không tồn tại.";
          }
        } else {
          switch (error.code) {
            case "auth/wrong-password":
              updatedErrors.password = "Mật khẩu không đúng.";
              break;
            case "auth/user-not-found":
              updatedErrors.email = "Tài khoản không tồn tại.";
              break;
            case "auth/invalid-email":
              updatedErrors.email = "Email không hợp lệ.";
              break;
            default:
              updatedErrors.email = "Đã xảy ra lỗi, vui lòng thử lại.";
              break;
          }
        }
      } else {
        switch (error.code) {
          case "auth/email-already-in-use":
            updatedErrors.email = "Email đã được sử dụng.";
            break;
          case "auth/invalid-email":
            updatedErrors.email = "Email không hợp lệ.";
            break;
          case "auth/weak-password":
            updatedErrors.password = "Mật khẩu quá yếu.";
            break;
          default:
            updatedErrors.email = "Đã xảy ra lỗi, vui lòng thử lại.";
        }
      }

      setErrors(updatedErrors);
      console.error(`${signState} failed:`, error.message);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="flex items-center justify-center w-full h-screen">
      <img src={netflix_spinner} alt="Loading..." className="w-15" />
    </div>
  ) : (
    <div className="min-h-screen bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(/public/background_banner.jpg)] bg-cover bg-center p-5 md:p-8">
      <img src={logo} alt="Logo" className="w-38 h-20" />
      <div className="w-full max-w-sm bg-black/75 rounded-lg p-4 md:p-8 mx-auto mt-10">
        <h1 className="text-3xl font-medium mb-7 text-white">{signState}</h1>
        <form>
          {signState === "Sign Up" && (
            <div className="mb-3">
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: "" }));
                }}
                type="text"
                placeholder="Your Name"
                className="w-full h-12 bg-gray-700 text-white mb-1 p-4 rounded-md outline-none text-base font-medium"
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          )}

          <div className="mb-3">
            <input
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((prev) => ({ ...prev, email: "" }));
              }}
              type="email"
              placeholder="Your Email"
              className="w-full h-12 bg-gray-700 text-white mb-1 p-4 rounded-md outline-none text-base font-medium"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-3 relative">
            <input
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrors((prev) => ({ ...prev, password: "" }));
              }}
              type={showPassword ? "text" : "password"} // Chuyển đổi giữa text và password
              placeholder="Your Password"
              className="w-full h-12 bg-gray-700 text-white mb-1 p-4 pr-10 rounded-md outline-none text-base font-medium"
            />
            <span
              onClick={() => setShowPassword(!showPassword)} // Chuyển đổi trạng thái
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
            >
              {showPassword ? (
                <AiOutlineEyeInvisible size={20} />
              ) : (
                <AiOutlineEye size={20} />
              )}
            </span>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <button
            onClick={user_auth}
            type="submit"
            className="w-full bg-red-600 text-white rounded-md p-4 text-base font-medium mt-5 cursor-pointer hover:bg-red-700 transition-colors"
          >
            {signState}
          </button>
          <div className="flex justify-between items-center text-gray-400 text-sm mt-4">
            <div className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              <label>Remember Me</label>
            </div>
            <p>Need Help?</p>
          </div>
        </form>
        <form>
          <div className="mt-10 text-gray-500 text-center">
            {signState === "Sign In" ? (
              <p>
                New to Netflix?{" "}
                <span
                  onClick={() => {
                    setSignState("Sign Up");
                    setErrors({ name: "", email: "", password: "" });
                  }}
                  className="text-white font-medium ml-1 cursor-pointer hover:underline"
                >
                  Sign Up Now
                </span>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <span
                  onClick={() => {
                    setSignState("Sign In");
                    setErrors({ name: "", email: "", password: "" });
                  }}
                  className="text-white font-medium ml-1 cursor-pointer hover:underline"
                >
                  Sign In Now
                </span>
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default Login;
