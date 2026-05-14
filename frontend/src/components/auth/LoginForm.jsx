import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    // Convert email input to username for Django backend
    const credentials = {
      username: data.email, // Send email as username
      password: data.password,
    };

    const success = await login(credentials);
    if (success) {
      toast.success("Successfully logged in!");
      navigate("/dashboard");
    } else {
      toast.error(error || "Login failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          {...register("email", { required: "Email is required" })}
          className={`w-full px-4 py-3 rounded-xl border ${errors.email ? "border-red-500" : "border-slate-200"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
          placeholder="you@example.com"
        />
        {errors.email && (
          <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Password
        </label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            {...register("password", { required: "Password is required" })}
            className={`w-full px-4 py-3 rounded-xl border ${errors.password ? "border-red-500" : "border-slate-200"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-600"
          >
            {showPassword ?
              <EyeOff size={20} />
            : <Eye size={20} />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center text-slate-600">
          <input
            type="checkbox"
            className="mr-2 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Remember me
        </label>
        <a href="#" className="text-blue-600 hover:underline">
          Forgot password?
        </a>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-70 flex justify-center items-center"
      >
        {isLoading ?
          <Loader2 className="w-5 h-5 animate-spin" />
        : "Sign In"}
      </button>

      <p className="text-center text-sm text-slate-600 mt-6">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 font-medium hover:underline"
        >
          Sign up
        </Link>
      </p>
    </form>
  );
}
