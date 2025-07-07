import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faTwitter,
  faInstagram,
  faYoutube,
} from "@fortawesome/free-brands-svg-icons";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-5 gap-8">
        {/* Về Disney+ */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Về Disney+</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-#1cc749">
                Giới thiệu về Disney
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Sứ mệnh và giá trị
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Tuyển dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Tin tức
              </a>
            </li>
          </ul>
        </div>

        {/* Giúp đỡ */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Giúp đỡ</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-#1cc749">
                Trung tâm trợ giúp
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Câu hỏi thường gặp
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Liên hệ chúng tôi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Trạng thái dịch vụ
              </a>
            </li>
          </ul>
        </div>

        {/* Quảng cáo */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Quảng cáo</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-#1cc749">
                Quảng cáo với chúng tôi
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Hướng dẫn quảng cáo
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Chính sách quảng cáo
              </a>
            </li>
          </ul>
        </div>

        {/* Chính sách */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Chính sách</h3>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:text-#1cc749">
                Điều khoản sử dụng
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Chính sách bảo mật
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Chính sách cookie
              </a>
            </li>
            <li>
              <a href="#" className="hover:text-#1cc749">
                Cài đặt cookie
              </a>
            </li>
          </ul>
        </div>

        {/* Mạng xã hội & Ngôn ngữ */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Kết nối với chúng tôi</h3>
          <div className="flex space-x-4 mb-4">
            <a href="#" className="hover:text-gray-300">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <FontAwesomeIcon icon={faTwitter} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
            <a href="#" className="hover:text-gray-300">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
          </div>
          <select className="bg-gray-800 text-white p-2 rounded w-full">
            <option value="en">English</option>
            <option value="vi">Tiếng Việt</option>
            <option value="es">Español</option>
          </select>
        </div>
      </div>

      {/* Phần cuối cùng */}
      <div className="container mx-auto px-4 mt-6 text-sm text-gray-400 text-center border-t border-gray-700 pt-4">
        <p>© {new Date().getFullYear()} Disney. All rights reserved.</p>
        <p className="mt-2">
          Disney+ là một dịch vụ phát trực tuyến do Disney cung cấp.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
