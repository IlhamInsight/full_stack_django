import { useForm } from "react-hook-form";
import { useAuthStore } from "../../store/authStore";
import { useNavigate, Link } from "react-router-dom";
import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function RegisterForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm();
  const { register: registerUser, isLoading, error } = useAuthStore();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = async (data) => {
    // Backend now accepts full_name directly
    const registerData = {
      username: data.email,
      email: data.email,
      full_name: data.name,
      password: data.password,
      password2: data.password,
    };

    const success = await registerUser(registerData);
    if (success) {
      toast.success("Registration successful! Please login.");
      navigate("/login");
    } else {
      toast.error(error || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Full Name
        </label>
        <input
          type="text"
          {...register("name", { required: "Name is required" })}
          className={`w-full px-4 py-2.5 rounded-xl border ${errors.name ? "border-red-500" : "border-slate-200"} focus:ring-2 focus:ring-blue-500 outline-none`}
          placeholder="John Doe"
        />
        {errors.name && (
          <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Email
        </label>
        <input
          type="email"
          {...register("email", {
            required: "Email is required",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Invalid email address",
            },
          })}
          className={`w-full px-4 py-2.5 rounded-xl border ${errors.email ? "border-red-500" : "border-slate-200"} focus:ring-2 focus:ring-blue-500 outline-none`}
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
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className={`w-full px-4 py-2.5 rounded-xl border ${errors.password ? "border-red-500" : "border-slate-200"} focus:ring-2 focus:ring-blue-500 outline-none`}
            placeholder="••••••••"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-2.5 text-slate-400"
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

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all mt-4 disabled:opacity-70 flex justify-center"
      >
        {isLoading ?
          <Loader2 className="w-5 h-5 animate-spin" />
        : "Create Account"}
      </button>

      <p className="text-center text-sm text-slate-600 mt-4">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  );
}
