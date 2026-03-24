import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileJson, 
  Copy, 
  Check, 
  ChevronLeft,
  Trash2,
  AlertCircle,
  Upload,
  Download,
  Loader2
} from 'lucide-react';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';
import FormatterWorker from './formatterWorker?worker';



const DEFAULT_INPUT = '{"name": "ShaadDev Studio", "tools": ["ASO", "Formatter"], "active": true}';

export default function JSONFormatter() {
  const [input, setInput] = useState(DEFAULT_INPUT);
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [indentSize, setIndentSize] = useState<2 | 4>(2);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const workerRef = useRef<Worker | null>(null);

  // Smart Navigation
  const isToolUsed = uploadedFile !== null || output !== '' || input !== DEFAULT_INPUT;
  const resetAll = () => {
    setInput(DEFAULT_INPUT);
    setOutput('');
    setError('');
    setFileName(null);
    setUploadedFile(null);
    setIsPreview(false);
    setCopied(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'JSON Formatter',
    isToolUsed,
    onReset: resetAll
  });

  useEffect(() => {
    workerRef.current = new FormatterWorker();

    workerRef.current.onmessage = (e) => {
      setIsProcessing(false); setProgress(null);
      if (e.data.success) {
        setError('');
        if (e.data.isLarge) {
          setOutput(e.data.preview);
          setIsPreview(true);
          setDownloadUrl(e.data.url);
        } else {
          setOutput(e.data.formatted);
          setIsPreview(false);
          if (downloadUrl) URL.revokeObjectURL(downloadUrl);
          setDownloadUrl(null);
        }
      } else {
        setError(e.data.error);
        setOutput('');
      }
    };

    return () => {
      workerRef.current?.terminate();
          };
  }, [downloadUrl]);

  const formatJSON = () => {
    if (!input.trim()) {
      setOutput('');
      setError('');
      return;
    }
    setIsProcessing(true);
    workerRef.current?.postMessage({ type: 'format-text', text: input, indentSize });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setFileName(file.name);
    setUploadedFile(file);
    setIsProcessing(true);
    setInput(`[File Loaded: ${file.name}]`);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
    setIsPreview(false);
    
    workerRef.current?.postMessage({ type: 'format-file', file, indentSize });
    
    // Reset file input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
    setFileName(null);
    setUploadedFile(null);
    setIsPreview(false);
    if (downloadUrl) URL.revokeObjectURL(downloadUrl);
    setDownloadUrl(null);
  };

  const handleIndentChange = (size: 2 | 4) => {
    setIndentSize(size);
    // Auto-reformat if not empty
    if (uploadedFile) {
      setIsProcessing(true);
      workerRef.current?.postMessage({ type: 'format-file', file: uploadedFile, indentSize: size });
    } else if (input.trim()) {
      setIsProcessing(true);
      workerRef.current?.postMessage({ type: 'format-text', text: input, indentSize: size });
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Free Online JSON Formatter | ShaadDev Studio" 
        description="Format, prettify, and validate JSON data quickly directly from your browser." 
        url="https://shaaddev.studio/tools/json-formatter" keywords="json formatter, format json online, pretify syntax" />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button onClick={handleBackClick} className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors" title={isToolUsed ? "(Click to reset)" : undefined}>
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">{isToolUsed ? 'JSON Formatter' : 'Back to Tools'}</span>
          </button>
          <div className="flex items-center gap-2 text-primary">
            <FileJson className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">JSON Formatter</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-7xl space-y-6 flex flex-col flex-grow">
          
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="space-y-1">
                <h1 className="text-2xl font-black tracking-tight">Format & Validate JSON</h1>
                <p className="text-white/60 text-xs">Beautify compact objects and validate array structures.</p>
             </div>
             <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                <button 
                  onClick={() => handleIndentChange(2)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${indentSize === 2 ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}
                >
                  2 Spaces
                </button>
                <button 
                  onClick={() => handleIndentChange(4)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${indentSize === 4 ? 'bg-primary text-black' : 'text-white/60 hover:text-white'}`}
                >
                  4 Spaces
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-grow min-h-[500px]">
            {/* Input Panel */}
            <div className="glass-panel flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40">
              <div className="border-b border-white/10 p-3 flex justify-between items-center bg-white/5">
                <span className="text-xs font-bold uppercase tracking-widest text-white/50">Input</span>
                <div className="flex gap-2">
                   <input 
                     type="file" 
                     accept=".json,application/json,text/plain" 
                     className="hidden" 
                     ref={fileInputRef}
                     onChange={handleFileUpload}
                   />
                   <button onClick={() => fileInputRef.current?.click()} className="px-2 py-1 bg-white/5 hover:bg-primary/20 text-white/70 hover:text-primary border border-white/10 hover:border-primary/30 rounded flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider transition-all" title="Upload File">
                     <Upload className="w-3.5 h-3.5" /> Upload JSON
                   </button>
                   <button onClick={clearAll} className="p-1.5 hover:bg-white/10 text-white/50 hover:text-red-400 rounded transition-colors" title="Clear">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
              <textarea 
                value={input}
                onChange={(e) => {
                  if (fileName) { setFileName(null); setUploadedFile(null); setInput(e.target.value); }
                  else setInput(e.target.value);
                }}
                disabled={!!fileName}
                placeholder="Paste your raw JSON data here..."
                className={`flex-grow w-full bg-transparent resize-none p-4 font-mono text-sm leading-relaxed focus:outline-none custom-scrollbar ${fileName ? 'text-primary/70 italic' : 'text-white/80 placeholder:text-white/20'}`}
                spellCheck={false}
              />
              <div className="p-4 border-t border-white/10 bg-white/5">
                <button 
                  onClick={formatJSON}
                  disabled={isProcessing || !!fileName}
                  className="w-full py-3 bg-primary text-black hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 flex justify-center items-center gap-2"
                >
                   {isProcessing && !fileName ? <Loader2 className="w-5 h-5 animate-spin" /> : <FileJson className="w-5 h-5" />} 
                   {isProcessing && !fileName ? 'Processing...' : 'Format Text'}
                </button>
              </div>
            </div>

            {/* Output Panel */}
            <div className="glass-panel flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-black/40 relative">
              <div className="border-b border-white/10 p-3 flex justify-between items-center bg-white/5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">Output</span>
                  {isPreview && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-[9px] font-bold rounded uppercase tracking-wider border border-yellow-500/20">Preview Only (Large File)</span>}
                </div>
                <div className="flex gap-2">
                   {downloadUrl && (
                     <a 
                       href={downloadUrl}
                       download={fileName ? `formatted_${fileName}` : "formatted.json"}
                       className="px-3 py-1.5 bg-primary/20 hover:bg-primary/40 text-primary border border-primary/30 rounded flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
                     >
                       <Download className="w-3.5 h-3.5" /> Download Full
                     </a>
                   )}
                   <button 
                     onClick={copyToClipboard} 
                     disabled={!output || isPreview}
                     className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 text-white/70 hover:text-primary border border-white/10 hover:border-primary/30 disabled:opacity-30 disabled:hover:bg-white/5 disabled:hover:text-white/70 disabled:hover:border-white/10 rounded flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all"
                   >
                     {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                     {copied ? 'Copied' : 'Copy'}
                   </button>
                </div>
              </div>

              {isProcessing && fileName ? (
                <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-4">
                  <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  <span className="text-primary font-bold uppercase tracking-widest text-sm animate-pulse">Processing Large File...</span>
                  {progress !== null ? (
                    <div className="w-full max-w-sm mt-2">
                       <div className="flex justify-between text-xs font-bold text-white/50 mb-1">
                          <span>Parsing & Structuring</span>
                          <span>{Math.round(progress * 100)}%</span>
                       </div>
                       <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-primary transition-all duration-300 ease-out" style={{ width: `${progress * 100}%` }}></div>
                       </div>
                    </div>
                  ) : (
                    <span className="text-white/50 text-xs">Parsing and formatting in background</span>
                  )}
                </div>
              ) : error ? (
                <div className="p-6 flex flex-col items-center justify-center h-full text-center space-y-3 bg-red-950/10">
                  <AlertCircle className="w-12 h-12 text-red-500" />
                  <span className="text-red-400 font-bold uppercase tracking-widest text-sm">Invalid JSON</span>
                  <span className="text-red-300/80 text-xs max-w-md">{error}</span>
                </div>
              ) : (
                <pre className="flex-grow w-full bg-transparent overflow-auto p-4 font-mono text-[13px] leading-[1.6] text-primary/90 custom-scrollbar m-0">
                  <code>{output ? (isPreview ? output + '\n\n... [Preview truncated. Download to view full file.]' : output) : 'Awaiting input format...'}</code>
                </pre>
              )}
            </div>
          </div>
          
          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed">
            <h2 className="text-xl font-black text-white uppercase tracking-wider">Why use a JSON Formatter & Validator?</h2>
            
            <p>
              Developers work with JSON (JavaScript Object Notation) daily. While machines can easily parse compacted, minified JSON spanning thousands of lines, it is nearly impossible for developers to read or debug. Our <strong>Online JSON Formatter</strong> helps you prettify messy backend payloads into readable, structured, and color-coded hierarchies.
            </p>
            
            <h3 className="text-lg font-bold text-white mt-8 mb-4">Features of this Validator</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Syntax Validation:</strong> It acts as a strict JSON validator. If you miss a comma or bracket, the tool instantly flags the specific parsing error so you can repair the structure.</li>
              <li><strong>Big File Support:</strong> By uploading a file directly, our background Web Workers can safely parse and format JSON files up to hundreds of megabytes without crashing or freezing your browser tab.</li>
              <li><strong>Secure Local Processing:</strong> Whether you are inspecting API tokens, secure environment variables, or private user data, this formatter runs entirely locally on your device. None of your JSON data is transmitted off your machine.</li>
              <li><strong>Custom Indentation:</strong> Toggle freely between 2-space and 4-space indentations based on your team's code formatting standards.</li>
            </ul>
          <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Validate Thoroughly</h4><p className="text-white/70">A single missing comma breaks JSON parsing. Always validate before saving your files.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Secure Data First</h4><p className="text-white/70">Ensure no hardcoded credentials or private data exist before sharing the formatted payloads.</p></div></div></section></article>

          <RelatedTools currentPath="/tools/json-formatter" />
        </div>
      </main>

      <Footer />
    </div>
  );
}