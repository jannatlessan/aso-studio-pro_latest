import { Link } from 'react-router-dom';
import { Smartphone, Lock, FileJson, Type, ChevronRight, Image as ImageIcon } from 'lucide-react';

const relatedLinks = [
  { 
    path: "/tools/aso-screenshot", 
    name: "ASO Screenshot Pro", 
    icon: Smartphone, 
    desc: "Create polished app store mockups for iOS and Android." 
  },
  { 
    path: "/tools/image-resizer", 
    name: "Bulk Image Resizer", 
    icon: ImageIcon, 
    desc: "Batch resize multiple images in seconds directly in your browser." 
  },
  { 
    path: "/tools/image-compressor", 
    name: "Smart Image Compressor", 
    icon: ImageIcon, 
    desc: "Compress images with maximum size savings and no quality loss." 
  },
  { 
    path: "/tools/password-generator", 
    name: "Password Generator", 
    icon: Lock, 
    desc: "Instantly create strong, random, secure passwords locally." 
  },
  { 
    path: "/tools/json-formatter", 
    name: "JSON Formatter", 
    icon: FileJson, 
    desc: "Prettify, validate, and parse large JSON payloads." 
  },
  { 
    path: "/tools/text-utilities", 
    name: "Text Utilities", 
    icon: Type, 
    desc: "Count words, switch text case, and encode Base64." 
  }
];

export default function RelatedTools({ currentPath }: { currentPath: string }) {
  const links = relatedLinks.filter(l => l.path !== currentPath);

  if (links.length === 0) return null;

  return (
    <div className="pt-10 border-t border-white/10 mt-16">
      <h3 className="text-xl font-black text-white mb-6 uppercase tracking-wider text-center sm:text-left">
        Explore More Developer Tools
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {links.slice(0, 3).map((link) => (
          <Link 
            key={link.path} 
            to={link.path}
            className="glass-panel p-5 rounded-xl border border-white/10 hover:border-primary/40 bg-black/40 hover:bg-white/5 transition-all group flex flex-col items-start gap-4"
          >
            <div className="p-3 bg-white/5 group-hover:bg-primary/20 group-hover:text-primary rounded-lg transition-colors border border-white/10">
              <link.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white mb-1 group-hover:text-primary transition-colors">
                {link.name}
              </h4>
              <p className="text-xs text-white/50 leading-relaxed">
                {link.desc}
              </p>
            </div>
            <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-white/40 group-hover:text-primary transition-colors">
              Open Tool <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}