import RegisterForm from '../components/auth/RegisterForm';
import { motion } from 'framer-motion';

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative blobs */}
      <div className="absolute bottom-0 right-10 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob"></div>
      <div className="absolute top-20 left-10 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full relative z-10"
      >
        <div className="glass p-8 rounded-3xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Create Account</h2>
            <p className="text-slate-500">Join us to start booking rooms easily</p>
          </div>
          <RegisterForm />
        </div>
      </motion.div>
    </div>
  );
}
