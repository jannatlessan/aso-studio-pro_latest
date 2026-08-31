import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X } from 'lucide-react';

export const GRADIENT = 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))';

const LINKS = [
  { label: 'Tools', path: '/tools' },
  { label: 'MicroSaaS', path: '/microsaas' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' }
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setOpen(false), [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/[0.06] bg-[#08080A]/75 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg shadow-primary/20" style={{ background: GRADIENT }}>
              <span className="text-white font-bold text-sm leading-none">R</span>
            </div>
            <span className="font-semibold text-[15px] tracking-tight">ShaadDev Studio</span>
          </Link>

          <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-white/55">
            {LINKS.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className={`hover:text-white transition-colors ${location.pathname === link.path ? 'text-white' : ''}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <a
              href="mailto:rizwanrasheed046@gmail.com"
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
              style={{ background: GRADIENT }}
            >
              Get in touch
            </a>
            <button
              type="button"
              aria-label={open ? 'Close menu' : 'Open menu'}
              onClick={() => setOpen((prev) => !prev)}
              className="lg:hidden p-2 rounded-lg border border-white/10 bg-white/[0.03] active:scale-95 transition-all"
            >
              {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              type="button"
              aria-label="Close menu"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-30 bg-black/60 backdrop-blur-[2px] lg:hidden"
            />
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="fixed top-[72px] left-0 right-0 z-40 px-4 lg:hidden"
            >
              <div className="rounded-2xl border border-white/10 bg-[#0F0F12] p-3 space-y-1 shadow-2xl shadow-black/60">
                {LINKS.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="block py-2.5 px-3 text-sm font-medium text-white/80 hover:text-white hover:bg-white/5 rounded-lg transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
                <a href="mailto:rizwanrasheed046@gmail.com" className="block py-2.5 px-3 text-sm font-semibold text-primary hover:bg-white/5 rounded-lg transition-all">
                  Get in touch
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
