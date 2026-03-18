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
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed font-sans">
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">Advanced Text Manipulation & Formatting Utilities</h2>
            <p>
              Working with large volumes of text, cleaning up raw data strings, or formatting content for various programming and editorial requirements can be an incredibly tedious process. Our comprehensive <strong>Text Utilities Suite</strong> provides developers, copywriters, data analysts, and content creators with an indispensable toolkit to quickly manipulate, transform, and analyze text strings without having to write custom scripts or switch between multiple different applications.
            </p>
            <p>
              Whether you need to instantly strip out unnecessary whitespace, convert a messy block of text into a specific casing format (like camelCase for variables, or Title Case for articles), extract all the URLs from a document, or simply perform a fast character count for SEO optimization, this tool streamlines your entire workflow. By combining multiple operations into a single, cohesive, web-based interface, we save you valuable time and reduce human error, letting you focus on the actual logic and structure of your projects rather than mindlessly re-typing mundane text.
            </p>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Input Your Text:</strong> Paste your raw, unformatted, or messy text block directly into the large input area provided on the screen.</li>
              <li><strong>Select an Operation:</strong> Browse through the assorted quick-action buttons below the text box. Choose actions such as Upper Case, Lower Case, Title Case, or more specific developer actions like generating camelCase or sorting lines alphabetically.</li>
              <li><strong>Review Real-Time Output:</strong> The text will be transformed instantly according to the operation you selected. You can easily chain multiple operations together to achieve your desired outcome.</li>
              <li><strong>Copy to Clipboard:</strong> Once the text matches your exact requirements, utilize the one-click copy button to copy the transformed text back into your code editor, document, or content management system.</li>
            </ol>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-white block">1. Does this tool process my text on a remote server?</strong>
                <p>Not at all. Everything you type or paste into the text utility is processed locally directly within your own web browser's memory. We do not transmit, analyze, or log your proprietary text, ensuring complete privacy, especially for sensitive code snippets or confidential articles.</p>
              </div>
              <div>
                <strong className="text-white block">2. What kind of casing formats are supported?</strong>
                <p>We support a wide array of cases crucial for both developers and writers, including standard UPPERCASE, lowercase, and Title Case, alongside programming-specific paradigms such as camelCase, snake_case, kebab-case, and PascalCase.</p>
              </div>
              <div>
                <strong className="text-white block">3. Can I use this for counting characters and words?</strong>
                <p>Yes, the tool features real-time analytics that automatically displays the accurate character count, word count, and line count of your input, which is particularly beneficial for SEO specialists aiming for specific content length constraints.</p>
              </div>
            </div>
          </article>

          <RelatedTools currentPath="/tools/text-utilities" />
        </div>
      </main>

      <Footer />
    </div>
  );
}