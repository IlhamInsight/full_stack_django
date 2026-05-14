import LoginForm from '../components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass p-8 rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome Back</h2>
            <p className="text-slate-500">Sign in to manage your room bookings</p>
          </div>
          <LoginForm />
        </div>
      </motion.div>
    </div>
  );
}
