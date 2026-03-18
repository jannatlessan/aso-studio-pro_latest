import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Type, 
  Copy, 
  Check, 
  ChevronLeft,
  Trash2,
  RefreshCcw,
  ArrowDownUp
} from 'lucide-react';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';

export default function TextUtilities() {
  const [text, setText] = useState('Welcome to Shaad Dev Text Utilities. Paste text here!');
  const [copied, setCopied] = useState(false);

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const charCount = text.length;
  const charNoSpacesCount = text.replace(/\s+/g, '').length;
  const lineCount = text.trim() === '' ? 0 : text.split(/\r\n|\r|\n/).length;

  const handleUpperCase = () => setText(text.toUpperCase());
  const handleLowerCase = () => setText(text.toLowerCase());
  const handleTitleCase = () => {
    setText(
      text.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    );
  };
  const handleRemoveSpaces = () => setText(text.replace(/\s+/g, ' '));
  const handleBase64Encode = () => {
    try { setText(btoa(text)); } catch(e) { alert("Invalid character for Base64 Encoding"); }
  };
  const handleBase64Decode = () => {
    try { setText(atob(text)); } catch(e) { alert("Invalid Base64 string"); }
  };
  
  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => setText('');

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Free Online Text & String Utilities | ShaadDev Studio"
        description="Convert string case, analyze word count, and manage encodings conveniently."
        url="https://shaaddev.studio/tools/text-utilities" 
      />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">Back to Tools</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Type className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">Text Utilities</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="space-y-1">
             <h1 className="text-2xl font-black tracking-tight">String & Text Manipulations</h1>
             <p className="text-white/60 text-xs">Instantly count characters and modify text casing and formatting.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
             {[
               { label: "Words", value: wordCount },
               { label: "Characters", value: charCount },
               { label: "Chars (No Space)", value: charNoSpacesCount },
               { label: "Lines", value: lineCount },
             ].map((stat, i) => (
                <div key={i} className="glass-panel p-4 rounded-xl flex flex-col gap-2 items-center justify-center text-center bg-black/40 border border-white/10">
                   <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{stat.label}</span>
                   <span className="text-3xl font-black text-primary">{stat.value}</span>
                </div>
             ))}
          </div>

          <div className="glass-panel rounded-2xl border border-white/10 bg-black/40 overflow-hidden flex flex-col min-h-[400px]">
             {/* Toolbar */}
             <div className="bg-white/5 border-b border-white/10 p-2 sm:p-3 flex flex-wrap gap-2 items-center">
                <button onClick={handleUpperCase} className="px-3 py-1.5 hover:bg-white/10 text-white/80 rounded transition-colors text-xs font-bold uppercase">UPPERCASE</button>
                <button onClick={handleLowerCase} className="px-3 py-1.5 hover:bg-white/10 text-white/80 rounded transition-colors text-xs font-bold lowercase">lowercase</button>
                <button onClick={handleTitleCase} className="px-3 py-1.5 hover:bg-white/10 text-white/80 rounded transition-colors text-xs font-bold capitalize">Title Case</button>
                <div className="w-px h-6 bg-white/10 mx-2 hidden sm:block"></div>
                <button onClick={handleRemoveSpaces} className="px-3 py-1.5 hover:bg-white/10 text-white/80 rounded transition-colors text-xs font-bold">Fix Spaces</button>
                <button onClick={handleBase64Encode} className="px-3 py-1.5 hover:bg-white/10 text-white/80 rounded transition-colors text-xs font-bold flex items-center gap-1">Encode 64</button>
                <button onClick={handleBase64Decode} className="px-3 py-1.5 hover:bg-white/10 text-white/80 rounded transition-colors text-xs font-bold flex items-center gap-1">Decode 64</button>
                
                <div className="ml-auto flex items-center gap-2">
                   <button onClick={clearAll} className="p-2 hover:bg-white/10 text-white/50 hover:text-red-400 rounded transition-colors" title="Clear">
                     <Trash2 className="w-4 h-4" />
                   </button>
                   <button onClick={copyToClipboard} className="p-2 hover:bg-primary/20 text-white/50 hover:text-primary rounded transition-colors" title="Copy">
                     {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                   </button>
                </div>
             </div>

             <textarea 
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type or paste your text here to begin..."
                className="flex-grow w-full bg-transparent resize-none p-6 font-mono text-sm sm:text-base leading-relaxed focus:outline-none text-white/90 placeholder:text-white/20 custom-scrollbar"
                spellCheck={false}
             />
          </div>

          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Comprehensive Text & String Utilities</h2>
            
            <p>
              Whether you are an author needing an accurate <strong>online word counter</strong> or a developer trying to rapidly <strong>encode text to Base64</strong>, our suite of string manipulation tools provides multiple formatting features in a single, convenient dashboard.
            </p>
            
            <h3 className="text-lg font-bold text-white mt-8 mb-4">Core Tool Features</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Word & Character Counting:</strong> Instantly analyze the length and density of your documents. See word counts, total character counts, and line counts update in real-time as you type or paste.</li>
              <li><strong>Case Convertor:</strong> Effortlessly convert blocks of text into <code>UPPERCASE</code>, <code>lowercase</code>, or <code>Title Case</code> without having to re-type sentences.</li>
              <li><strong>Whitespace Removal:</strong> The "Fix Spaces" utility quickly sanitizes badly formatted text by stripping out double or trailing spaces and normalizing the string formatting.</li>
              <li><strong>Base 64 Encoder/Decoder:</strong> Easily convert raw strings into Base64 algorithms for API usage or decode existing Base64 strings to audit hidden configurations directly from your browser.</li>
            </ul>
          </article>

          <RelatedTools currentPath="/tools/text-utilities" />
        </div>
      </main>

      <Footer />
    </div>
  );
}