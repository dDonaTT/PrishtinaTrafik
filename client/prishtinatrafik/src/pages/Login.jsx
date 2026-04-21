import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Toaster } from "react-hot-toast";
import {
  Car,
  Bus,
  Bike,
  MapPin,
  ArrowRight,
  Mail,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setErrorMessage("");
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email është i detyrueshëm";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Formati i email-it është i pavlefshëm";
    }
    if (!formData.password) {
      newErrors.password = "Fjalëkalimi është i detyrueshëm";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const result = await login(formData);

    if (result.success) {
      navigate("/");
    } else {
      setErrorMessage(result.error || "Email ose fjalëkalimi janë të gabuara");
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Toaster position="top-right" />

      <div className="absolute top-0 -left-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute top-0 -right-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
      <div className="absolute -bottom-40 left-20 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-2000"></div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 animate-float">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-3">
            <Bus className="w-8 h-8 text-white/40" />
          </div>
        </div>
        <div className="absolute bottom-20 right-10 animate-float-delayed">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-3">
            <Car className="w-8 h-8 text-white/40" />
          </div>
        </div>
        <div className="absolute top-1/3 right-20 animate-float-slow">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-2">
            <Bike className="w-6 h-6 text-white/40" />
          </div>
        </div>
        <div className="absolute bottom-1/3 left-20 animate-float-slow">
          <div className="bg-white/5 backdrop-blur rounded-2xl p-2">
            <MapPin className="w-6 h-6 text-white/40" />
          </div>
        </div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl blur-2xl opacity-50"></div>
              <div className="relative w-24 h-24 flex-shrink-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Prishtina Trafik"
                  className="absolute inset-0 w-full h-full object-contain"
                />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mt-6 mb-2 bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Prishtina Trafik
            </h1>
            <p className="text-purple-200/80">Transporti urban inteligjent</p>
          </div>

          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white">Mirë se vini!</h2>
              <p className="text-purple-200/70 text-sm mt-1">
                Identifikohuni për të vazhduar
              </p>
            </div>

            {errorMessage && (
              <div className="mb-6 p-3 bg-red-500/20 border border-red-500/30 rounded-xl backdrop-blur animate-shake">
                <p className="text-red-200 text-sm text-center">
                  {errorMessage}
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="group">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50 group-focus-within:text-purple-300 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-white placeholder-purple-300/30
                      ${errors.email ? "border-red-500" : "border-white/10 group-hover:border-white/20"}`}
                    placeholder="email@example.com"
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-300">{errors.email}</p>
                )}
              </div>

              <div className="group">
                <label className="block text-sm font-medium text-purple-200 mb-2">
                  Fjalëkalimi
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300/50 group-focus-within:text-purple-300 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-10 pr-12 py-3 bg-white/5 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition text-white placeholder-purple-300/30
                      ${errors.password ? "border-red-500" : "border-white/10 group-hover:border-white/20"}`}
                    placeholder="••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-300/50 hover:text-purple-300 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-300">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-xl transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Duke identifikuar...
                  </div>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Identifikohu
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </button>
            </form>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-transparent text-purple-300/60 text-sm">
                  Nuk keni llogari?
                </span>
              </div>
            </div>

            <Link
              to="/register"
              className="group block text-center text-white hover:text-purple-200 font-medium transition-colors"
            >
              <span className="inline-flex items-center gap-2 group-hover:gap-3 transition-all">
                Krijo llogari të re
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          <p className="text-center text-purple-300/40 text-xs mt-8">
            © 2026 Prishtina Trafik. Të gjitha të drejtat e rezervuara.
          </p>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Login;
