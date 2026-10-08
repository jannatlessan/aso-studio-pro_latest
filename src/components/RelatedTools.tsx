import { Link } from 'react-router-dom';
import {
  ChevronRight, Image as ImageIcon, Wand2, Layers, Film, Images, Heart, Minimize, FileBox,
  FileOutput, Music, Palette, Paintbrush, Smartphone, FileJson, Code, Type, AlignLeft,
  Calculator, Scale, Percent, QrCode, Lock, Timer, Youtube
} from 'lucide-react';

type Category = 'Images & Media' | 'Documents & Files' | 'Design' | 'Development' | 'Text' | 'Calculators' | 'Utilities';

interface ToolLink {
  path: string;
  name: string;
  icon: typeof ImageIcon;
  desc: string;
  category: Category;
}

// Full catalog so related suggestions can stay relevant to the tool being used.
const CATALOG: ToolLink[] = [
  { path: '/tools/image-resizer', name: 'Bulk Image Resizer', icon: ImageIcon, desc: 'Batch resize multiple images in seconds, right in your browser.', category: 'Images & Media' },
  { path: '/tools/image-compressor', name: 'Smart Image Compressor', icon: ImageIcon, desc: 'Shrink JPEG, PNG & WebP images with no visible quality loss.', category: 'Images & Media' },
  { path: '/tools/bulk-image-enhancer', name: 'Bulk Image Enhancer', icon: Wand2, desc: 'Apply brightness, contrast & filters to many photos at once.', category: 'Images & Media' },
  { path: '/tools/background-remover', name: 'AuraCut AI', icon: Layers, desc: 'Remove image backgrounds locally with a neural engine.', category: 'Images & Media' },
  { path: '/tools/gif-viewer', name: 'GIF Online Viewer', icon: ImageIcon, desc: 'Scrub GIFs frame-by-frame and export HD PNG frames.', category: 'Images & Media' },
  { path: '/tools/video-to-gif', name: 'Video to GIF Maker', icon: Film, desc: 'Convert any video into a high-quality animated GIF offline.', category: 'Images & Media' },
  { path: '/tools/video-to-images', name: 'Video to Images', icon: Images, desc: 'Extract a full sequence of frames from any video.', category: 'Images & Media' },
  { path: '/tools/event-slideshow', name: 'Event Slideshow', icon: Heart, desc: 'Turn photo folders into a full-screen slideshow with music.', category: 'Images & Media' },

  { path: '/tools/file-to-pdf', name: 'File to PDF Converter', icon: FileOutput, desc: 'Convert images, CSV, Excel & Word files into clean PDFs.', category: 'Documents & Files' },
  { path: '/tools/pdf-compressor', name: 'Smart PDF Compressor', icon: Minimize, desc: 'Shrink PDFs offline with smart photo compression.', category: 'Documents & Files' },
  { path: '/tools/pdf-merger', name: 'Secure PDF Merger', icon: FileBox, desc: 'Combine multiple PDFs into one file, completely offline.', category: 'Documents & Files' },
  { path: '/tools/audio-merger', name: 'Audio Merger Pro', icon: Music, desc: 'Merge MP3, WAV & M4A audio files privately in your browser.', category: 'Documents & Files' },

  { path: '/tools/color-palette', name: 'Color Palette Gen', icon: Palette, desc: 'Create beautiful, trending color schemes for your designs.', category: 'Design' },
  { path: '/tools/css-gradient', name: 'CSS Gradient Generator', icon: Paintbrush, desc: 'Visually build and export fluid CSS gradients instantly.', category: 'Design' },
  { path: '/tools/aso-screenshot', name: 'ASO Screenshot Pro', icon: Smartphone, desc: 'Create polished App Store & Play Store screenshots.', category: 'Design' },

  { path: '/tools/json-formatter', name: 'JSON Formatter', icon: FileJson, desc: 'Prettify, validate and parse large JSON payloads.', category: 'Development' },
  { path: '/tools/markdown-to-html', name: 'Markdown to HTML', icon: Code, desc: 'Convert Markdown into clean, formatted HTML instantly.', category: 'Development' },

  { path: '/tools/text-utilities', name: 'Text Utilities', icon: Type, desc: 'Count words, switch case, and encode/decode Base64.', category: 'Text' },
  { path: '/tools/lorem-ipsum', name: 'Lorem Ipsum Generator', icon: AlignLeft, desc: 'Generate customizable placeholder dummy text.', category: 'Text' },

  { path: '/tools/age-calculator', name: 'Age Calculator', icon: Calculator, desc: 'Calculate exact age in years, months, days and seconds.', category: 'Calculators' },
  { path: '/tools/unit-converter', name: 'Unit Converter', icon: Scale, desc: 'Convert length, weight, temperature, data and more.', category: 'Calculators' },
  { path: '/tools/percentage-calculator', name: 'Percentage Calculator', icon: Percent, desc: 'Work out percentage changes, discounts and tips.', category: 'Calculators' },

  { path: '/tools/qr-code-generator', name: 'QR Code Generator', icon: QrCode, desc: 'Generate high-res QR codes for URLs, text and contacts.', category: 'Utilities' },
  { path: '/tools/password-generator', name: 'Password Generator', icon: Lock, desc: 'Create strong, random, secure passwords locally.', category: 'Utilities' },
  { path: '/tools/pomodoro-timer', name: 'Pomodoro Timer', icon: Timer, desc: 'Stay focused with a customizable Pomodoro technique timer.', category: 'Utilities' },
  { path: '/tools/yt-thumbnail', name: 'YT Thumbnail Saver', icon: Youtube, desc: 'Fetch max-resolution YouTube thumbnails to your device.', category: 'Utilities' }
];

// A couple of broadly useful tools to pad out categories that have fewer than 3 siblings.
const FALLBACK_ORDER = ['/tools/file-to-pdf', '/tools/image-compressor', '/tools/qr-code-generator', '/tools/pdf-merger', '/tools/json-formatter', '/tools/password-generator'];

export default function RelatedTools({ currentPath }: { currentPath: string }) {
  const current = CATALOG.find((t) => t.path === currentPath);

  const picks: ToolLink[] = [];
  const pushUnique = (tool?: ToolLink) => {
    if (tool && tool.path !== currentPath && !picks.some((p) => p.path === tool.path)) picks.push(tool);
  };

  // Prefer tools in the same category, then fall back to broadly useful ones.
  if (current) CATALOG.filter((t) => t.category === current.category).forEach(pushUnique);
  FALLBACK_ORDER.forEach((path) => pushUnique(CATALOG.find((t) => t.path === path)));
  CATALOG.forEach(pushUnique);

  const links = picks.slice(0, 3);
  if (links.length === 0) return null;

  return (
    <div className="pt-10 border-t border-black/10 mt-16">
      <h3 className="text-xl font-black text-ink mb-6 uppercase tracking-wider text-center sm:text-left">
        Related Tools You Might Like
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className="p-5 rounded-2xl border border-black/10 bg-white hover:border-primary/40 hover:shadow-lg hover:shadow-black/5 transition-all group flex flex-col items-start gap-4"
          >
            <div className="p-3 bg-mint text-primary group-hover:bg-primary group-hover:text-white rounded-lg transition-colors border border-primary/15">
              <link.icon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-ink mb-1 group-hover:text-primary transition-colors">
                {link.name}
              </h4>
              <p className="text-xs text-[#55605B] leading-relaxed">
                {link.desc}
              </p>
            </div>
            <span className="mt-auto pt-4 inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#8B958F] group-hover:text-primary transition-colors">
              Open Tool <ChevronRight className="w-3 h-3" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
