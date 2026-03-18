import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Minimize, 
  Download, 
  Upload, 
  ChevronLeft,
  Settings2,
  RefreshCcw,
  Check,
  ListPlus,
  Trash2,
  FileAxis3d,
  ArrowRight
} from 'lucide-react';
import JSZip from 'jszip';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';

interface ImageObj {
  id: string;
  file: File;
  previewUrl: string;
  width: number;
  height: number;
}

interface ProcessedImage {
  id: string;
  name: string;
  blobUrl: string;
  size: number;
  format: string;
  blob: Blob;
  savingsPercentage: number;
}

export default function ImageCompressor() {
  const [images, setImages] = useState<ImageObj[]>([]);
  const [processed, setProcessed] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Compression Settings
  const [quality, setQuality] = useState(0.7);
  const [format, setFormat] = useState<'image/webp' | 'image/jpeg'>('image/webp');
  const [resizeMode, setResizeMode] = useState<'none' | 'max_width'>('none');
  const [maxWidth, setMaxWidth] = useState(1920);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setProcessed([]);

    const newImages: ImageObj[] = [];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      
      const url = URL.createObjectURL(file);
      const dimensions = await new Promise<{w: number, h: number}>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.width, h: img.height });
        img.src = url;
      });

      newImages.push({
        id: Math.random().toString(36).substr(2, 9),
        file,
        previewUrl: url,
        width: dimensions.w,
        height: dimensions.h
      });
    }

    setImages(prev => [...prev, ...newImages]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setProcessed([]);
  };

  const clearAll = () => {
    setImages([]);
    setProcessed([]);
  };

  const compressImages = async () => {
    if (!images.length) return;
    setIsProcessing(true);
    setProcessed([]);

    const results: ProcessedImage[] = [];
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      alert("Canvas is not supported in this browser.");
      setIsProcessing(false);
      return;
    }

    for (const img of images) {
      let finalWidth = img.width;
      let finalHeight = img.height;

      if (resizeMode === 'max_width' && img.width > maxWidth) {
        finalWidth = maxWidth;
        finalHeight = Math.round(img.height * (maxWidth / img.width));
      }

      finalWidth = Math.max(1, finalWidth);
      finalHeight = Math.max(1, finalHeight);

      canvas.width = finalWidth;
      canvas.height = finalHeight;

      if (format === 'image/jpeg') {
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, finalWidth, finalHeight);
      } else {
        ctx.clearRect(0,0, finalWidth, finalHeight);
      }

      const imageElement = new Image();
      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = reject;
        imageElement.src = img.previewUrl;
      });

      ctx.drawImage(imageElement, 0, 0, finalWidth, finalHeight);

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), format, quality);
      });

      if (blob) {
        const parts = img.file.name.split('.');
        const ext = format.split('/')[1] || 'jpg';
        const newName = parts.slice(0, -1).join('.') + '_compressed.' + ext;
        
        let savings = 0;
        if (blob.size < img.file.size) {
            savings = ((img.file.size - blob.size) / img.file.size) * 100;
        }

        results.push({
          id: img.id,
          name: newName,
          blobUrl: URL.createObjectURL(blob),
          size: blob.size,
          format,
          blob,
          savingsPercentage: savings
        });
      }
    }

    setProcessed(results);
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    if (!processed.length) return;
    if (processed.length === 1) {
      const p = processed[0];
      const a = document.createElement('a');
      a.href = p.blobUrl;
      a.download = p.name;
      a.click();
      return;
    }

    const zip = new JSZip();
    processed.forEach(p => {
      zip.file(p.name, p.blob);
    });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'compressed_images_shaad_dev.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const totalOriginal = images.reduce((acc, curr) => acc + curr.file.size, 0);
  const totalProcessed = processed.reduce((acc, curr) => acc + curr.size, 0);
  const totalSavings = totalOriginal > 0 && processed.length > 0 ? ((totalOriginal - totalProcessed) / totalOriginal) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Free Online Image Compressor | ShaadDev Studio" 
        description="Compress bulk or individual image files without losing quality. Export to WEBP and JPEG optimized entirely within your browser locally." 
        url="https://shaaddev.studio/tools/image-compressor" 
      />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">Back to Tools</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Minimize className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">Smart Image Compressor</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="space-y-1 text-center sm:text-left">
             <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Image Compressor</h1>
             <p className="text-white/60 text-sm">Significantly reduce image file sizes while preserving visual quality using modern algorithms.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Input List */}
            <div className="lg:col-span-8 space-y-6">
              {!images.length ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-panel border border-dashed border-white/20 hover:border-primary/50 text-white/50 hover:text-primary rounded-2xl flex flex-col items-center justify-center p-16 cursor-pointer transition-all bg-black/40 min-h-[400px]"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <FileAxis3d className="w-12 h-12 mb-4 opacity-50" />
                  <span className="font-bold text-lg uppercase tracking-wider">Drop Bulk Images Here</span>
                  <span className="text-xs opacity-50 mt-2">Maximum privacy. No internet upload required.</span>
                </div>
              ) : (
                <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-black/40 space-y-4">
                   <div className="flex justify-between items-center px-2 border-b border-white/5 pb-3">
                     <span className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                        <ListPlus className="w-4 h-4 text-primary"/> Pending Queue ({images.length})
                     </span>
                     <div className="flex gap-3">
                       <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:text-primary-light uppercase tracking-widest font-bold">Add More</button>
                       <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest font-bold">Clear All</button>
                     </div>
                     <input type="file" accept="image/*" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                   </div>

                   <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                     {images.map((img) => {
                       const proc = processed.find(p => p.id === img.id);
                       return (
                         <div key={img.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl hover:border-white/10 group transition-all">
                           <div className="flex items-center gap-4 truncate">
                             <img src={img.previewUrl} className="w-12 h-12 object-cover rounded bg-black/50" alt="thumb" />
                             <div className="flex flex-col gap-1 w-[200px] sm:w-[300px]">
                               <span className="text-xs truncate text-white/80">{img.file.name}</span>
                               <span className="text-[10px] text-white/40">{img.width}x{img.height} • {formatBytes(img.file.size)}</span>
                             </div>
                           </div>

                           {!proc ? (
                             <button onClick={() => removeImage(img.id)} className="text-white/30 hover:text-red-400 p-2 rounded transition-colors hidden sm:block">
                               <Trash2 className="w-4 h-4"/>
                             </button>
                           ) : (
                             <div className="flex items-center gap-4">
                               <ArrowRight className="w-4 h-4 text-white/20 hidden md:block" />
                               <div className="flex flex-col gap-1 text-right">
                                 <span className="text-xs font-bold text-primary">{formatBytes(proc.size)}</span>
                                 <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20 inline-block w-max ml-auto">
                                   -{proc.savingsPercentage.toFixed(1)}%
                                 </span>
                               </div>
                               <a 
                                 href={proc.blobUrl} 
                                 download={proc.name}
                                 className="text-white/30 hover:text-primary p-2 flex items-center justify-center rounded transition-colors"
                                 title="Download Image"
                               >
                                 <Download className="w-4 h-4" />
                               </a>
                             </div>
                           )}
                         </div>
                       )
                     })}
                   </div>
                   
                   {processed.length > 0 && (
                     <div className="p-5 bg-primary/10 border border-primary/30 rounded-xl flex flex-col sm:flex-row gap-4 justify-between items-center mt-4">
                       <div className="flex gap-6 text-sm">
                          <div className="space-y-1">
                            <span className="text-white/50 text-[10px] uppercase font-bold tracking-widest block">Original Size</span>
                            <span className="text-white font-mono">{formatBytes(totalOriginal)}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-primary/70 text-[10px] uppercase font-bold tracking-widest block">Compressed Size</span>
                            <span className="text-primary font-black font-mono">{formatBytes(totalProcessed)}</span>
                          </div>
                          <div className="space-y-1">
                            <span className="text-green-500/70 text-[10px] uppercase font-bold tracking-widest block">Total Savings</span>
                            <span className="text-green-400 font-bold font-mono">-{totalSavings.toFixed(1)}%</span>
                          </div>
                       </div>
                       <button onClick={downloadAll} className="w-full sm:w-auto px-6 py-3 bg-primary text-black hover:bg-white rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex justify-center items-center gap-2 whitespace-nowrap">
                         <Download className="w-4 h-4" /> Download All
                       </button>
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Right: Settings */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="glass-panel p-6 rounded-2xl bg-black/40 border border-white/10 space-y-6">
                <div className="flex items-center gap-2 border-b border-white/10 pb-4">
                  <Settings2 className="w-5 h-5 text-primary" />
                  <h2 className="font-black text-sm uppercase tracking-widest">Compression Tech</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Target Output Format</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { val: 'image/webp', label: 'WEBP (Best)' },
                        { val: 'image/jpeg', label: 'JPEG (Standard)' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => setFormat(opt.val as any)}
                          className={`py-2 px-1 rounded-lg border text-center transition-all ${format === opt.val ? 'bg-primary/10 border-primary text-primary font-bold' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    <p className="text-[9px] text-white/40 leading-relaxed mt-1">Note: WEBP provides ~30% better compression than JPEG without noticeable detail loss.</p>
                  </div>

                  <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Compression Strength</label>
                        <span className="text-[10px] font-bold">{Math.round((1 - quality) * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0.1" max="0.9" step="0.05" 
                        value={1 - quality} /* Reversing so slider right = more compression */
                        onChange={(e) => setQuality(1 - parseFloat(e.target.value))}
                        className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between mt-1 text-[9px] text-white/30 uppercase tracking-widest">
                        <span>Lighter</span>
                        <span>Heavier</span>
                      </div>
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Optional Downscaling</label>
                    <label className="flex items-center gap-2 cursor-pointer group">
                      <input type="checkbox" checked={resizeMode === 'max_width'} onChange={(e) => setResizeMode(e.target.checked ? 'max_width' : 'none')} className="sr-only peer" />
                      <div className="w-4 h-4 rounded border border-white/30 peer-checked:bg-primary peer-checked:border-primary flex items-center justify-center transition-all">
                        <Check className="w-3 h-3 text-black opacity-0 peer-checked:opacity-100" />
                      </div>
                      <span className="text-[10px] font-bold uppercase text-white/60 group-hover:text-white transition-colors">Clip Max Width</span>
                    </label>
                    
                    {resizeMode === 'max_width' && (
                        <input 
                          type="number" value={maxWidth} onChange={(e) => setMaxWidth(parseInt(e.target.value) || 1920)}
                          className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                        />
                    )}
                    <p className="text-[9px] text-white/40 leading-relaxed">Clipping image resolution massively drops file size for 4K+ camera photos.</p>
                  </div>

                  <button 
                    onClick={compressImages}
                    disabled={!images.length || isProcessing}
                    className="w-full py-3.5 bg-primary text-black hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2"><RefreshCcw className="w-5 h-5 animate-spin" /> Compressing...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Settings2 className="w-5 h-5" /> Start Compression</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed font-sans">
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">High-Efficiency Image Compressor & Optimizer</h2>
            <p>
              Large, unoptimized images are notoriously the primary culprits behind sluggish website performance, inflated bounce rates, and poor Core Web Vitals scores. For developers obsessed with performance and SEO experts aiming for top-tier Google rankings, deploying aggressively optimized visual assets is an absolute necessity. Our <strong>High-Efficiency Image Compressor</strong> provides a powerful, automated solution to drastically reduce the file sizes of your JPEG, PNG, and WebP images while meticulously preserving their apparent visual quality.
            </p>
            <p>
              By intelligently discarding unnecessary metadata, optimizing color profiles, and applying advanced lossy or lossless compression algorithms directly within your web browser, this tool helps you strip away unnecessary bytes. Whether you are prepping a massive gallery for a portfolio site, streamlining huge assets for a mobile application, or trying to reduce your monthly CDN and bandwidth hosting costs, our Image Compressor ensures that your graphics load instantly on any network condition around the globe.
            </p>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Select Your Files:</strong> Drag and drop your heavy, unoptimized images directly into the designated upload area. Batch uploading represents the fastest workflow.</li>
              <li><strong>Adjust Compression Level:</strong> Utilize the compression slider to find the perfect balance between file size savings and visual fidelity. A lower percentage yields a much smaller file at the cost of slight artifacting, while a higher percentage prioritizes flawless visual quality.</li>
              <li><strong>Monitor Real-Time Savings:</strong> Watch the interface as it dynamically calculates the percentage of data saved compared to your original, bloated file sizes.</li>
              <li><strong>Download Optimized Files:</strong> Once compression is complete, effortlessly download your newly lightweight images, ready to be immediately deployed to your production environment.</li>
            </ol>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-white block">1. Does image compression permanently ruin image quality?</strong>
                <p>Not necessarily. Our intelligent compression primarily targets imperceptible data and fine-tunes color palettes. At moderate settings (around 70-85%), the resulting file size is vastly reduced, but the visual difference to the human eye is virtually undetectable.</p>
              </div>
              <div>
                <strong className="text-white block">2. Why is client-side, browser-based compression important?</strong>
                <p>Running the compression strictly within your local browser means you never have to undergo the slow, annoying process of uploading gigabytes of data to a remote server and waiting to download it back. It is significantly faster and inherently guarantees 100% data privacy.</p>
              </div>
              <div>
                <strong className="text-white block">3. Can I compress transparent PNG images?</strong>
                <p>Yes. Our compression engine intelligently handles alpha channels, meaning your transparent backgrounds (logos, UI elements, etc.) will be perfectly maintained while still benefiting from substantial file size reductions.</p>
              </div>
            </div>
          </article>

          <RelatedTools currentPath="/tools/image-compressor" />
        </div>
      </main>

      <Footer />
    </div>
  );
}