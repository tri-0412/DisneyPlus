import logo from "@/assets/Images/logo.png";
import { useState } from "react";
import { login, signup } from "@/./../firebase.js";
import netflix_spinner from "@/assets/Images/netflix_spinner.gif";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

function Login() {
  const [signState, setSignState] = useState("Sign In");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const user_auth = async (event) => {
    event.preventDefault();
    if (!email || !password) {
      toast({
        title: "Lỗi",
        description: "Vui lòng nhập email và mật khẩu.",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
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
      // Lỗi đã được xử lý bởi toast trong firebase.js, chỉ cần log thêm nếu cần
      console.error(`${signState} failed:`, error.message);
    } finally {
      setLoading(false);
    }
  };

  return loading ? (
    <div className="flex items-center justify-center w-full h-screen">
      <img src={netflix_spinner} alt="" className="w-15" />
    </div>
  ) : (
    <div className="min-h-screen bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url(/public/background_banner.jpg)] bg-cover bg-center p-5 md:p-8">
      <img src={logo} alt="" className="w-38 h-20" />
      <div className="w-full max-w-sm bg-black/75 rounded-lg p-4 md:p-8 mx-auto mt-10">
        <h1 className="text-3xl font-medium mb-7 text-white">{signState}</h1>
        <form>
          {signState === "Sign Up" ? (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              type="text"
              placeholder="Your Name"
              className="w-full h-12 bg-gray-700 text-white mb-3 p-4 rounded-md outline-none text-base font-medium"
            />
          ) : null}

          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Your Email"
            className="w-full h-12 bg-gray-700 text-white mb-3 p-4 rounded-md outline-none text-base font-medium"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Your Password"
            className="w-full h-12 bg-gray-700 text-white mb-3 p-4 rounded-md outline-none text-base font-medium"
          />
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
          <div className="mt-10 text-gray-500">
            {signState === "Sign In" ? (
              <p>
                New to Netflix?{" "}
                <span
                  onClick={() => setSignState("Sign Up")}
                  className="text-white font-medium ml-1 cursor-pointer hover:underline"
                >
                  Sign Up Now
                </span>
              </p>
            ) : (
              <p>
                Already have account?{" "}
                <span
                  onClick={() => setSignState("Sign In")}
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
