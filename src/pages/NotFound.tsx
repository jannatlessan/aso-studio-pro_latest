import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import SEO from '../components/SEO';

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#08080A] text-[#EDEDEF] flex items-center justify-center p-5 overflow-hidden">
      <SEO
        title="Page Not Found | ShaadDev Studio"
        description="The page you're looking for doesn't exist."
        noindex
      />
      {/* Decorative Background Elements */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      
      {/* Grid Overlay */}
      <div 
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, 
          backgroundSize: '50px 50px' 
        }} 
      />

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center space-y-8"
        >
          {/* Main 404 Text */}
          <div className="relative">
            <motion.h1 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 1, ease: "backOut" }}
              className="text-[12rem] sm:text-[16rem] font-black leading-none tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-b from-primary via-primary/50 to-transparent opacity-20 select-none"
            >
              404
            </motion.h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="space-y-4"
              >
                <h2 className="text-3xl sm:text-5xl font-bold tracking-tight">
                  Page not <span className="text-primary">found.</span>
                </h2>
                <p className="text-white/55 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  The page you're looking for doesn't exist or may have moved.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Action Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8"
          >
            <Link
              to="/"
              className="group flex items-center gap-2 px-6 py-3.5 rounded-full text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' }}
            >
              <Home className="w-4 h-4" />
              Return home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 px-6 py-3.5 rounded-full border border-white/15 text-sm font-semibold text-white/80 hover:border-white/30 hover:text-white transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              Go back
            </button>
          </motion.div>

          {/* System Info */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 1.2, duration: 1 }}
            className="pt-12 flex items-center justify-center gap-6"
          >
            <div className="h-px w-12 bg-white/20" />
            <div className="text-[10px] uppercase tracking-[0.3em] font-medium text-white/40">404 error</div>
            <div className="h-px w-12 bg-white/20" />
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight,
            opacity: Math.random() * 0.5
          }}
          animate={{ 
            y: [null, Math.random() * -100],
            opacity: [null, 0]
          }}
          transition={{ 
            duration: 2 + Math.random() * 4,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute w-1 h-1 bg-primary rounded-full pointer-events-none"
        />
      ))}
    </div>
  );
}
