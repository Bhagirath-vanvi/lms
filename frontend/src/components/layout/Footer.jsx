import { Link } from "react-router-dom";
import {
  FiBookOpen,
  FiMail,
  FiPhone,
  FiMapPin,
  FiFacebook,
  FiTwitter,
  FiInstagram,
  FiLinkedin,
} from "react-icons/fi";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Company Info */}
          <div className="space-y-5">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <FiBookOpen className="text-white text-xl" />
              </div>
              <span className="text-2xl font-semibold text-gray-800 dark:text-white">
                EduSphere
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Empowering learners globally with engaging, expert-led education.
              Join our thriving community.
            </p>
            <div className="flex space-x-4">
              {[FiFacebook, FiTwitter, FiInstagram, FiLinkedin].map(
                (Icon, i) => (
                  <a key={i} href="#" className="group">
                    <Icon
                      className="text-gray-500 dark:text-gray-400 group-hover:text-blue-500 transition"
                      size={20}
                    />
                  </a>
                )
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Quick Links
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                { label: "Browse Courses", to: "/courses" },
                { label: "Become a Student", to: "/register" },
                { label: "Teach on EduSphere", to: "/register" },
                { label: "Help & Support", to: "#" },
              ].map(({ label, to }, i) => (
                <li key={i}>
                  <Link
                    to={to}
                    className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Categories
            </h3>
            <ul className="space-y-2 text-sm">
              {["Programming", "Design", "Business", "Marketing"].map(
                (category) => (
                  <li key={category}>
                    <Link
                      to={`/courses?category=${category}`}
                      className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition-colors"
                    >
                      {category}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
              Contact Us
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <FiMail className="text-blue-500" size={16} />
                <span>support@edusphere.com</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-blue-500" size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin className="text-blue-500" size={16} />
                <span>123 Education St, Learning City</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-300 dark:border-gray-700 pt-6 text-sm flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-600 dark:text-gray-400">
            © {currentYear} EduSphere. All rights reserved.
          </p>
          <div className="flex gap-6">
            {["Privacy Policy", "Terms of Service", "Cookie Policy"].map(
              (text, i) => (
                <a
                  key={i}
                  href="#"
                  className="text-gray-600 dark:text-gray-400 hover:text-blue-500 transition"
                >
                  {text}
                </a>
              )
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
