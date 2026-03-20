import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Image as ImageIcon, 
  Download, 
  Upload, 
  ChevronLeft,
  Settings2,
  RefreshCcw,
  Check,
  ListPlus,
  Trash2,
  Maximize
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
  width: number;
  height: number;
  size: number;
  format: string;
  blob: Blob;
}

export default function ImageResizer() {
  const [images, setImages] = useState<ImageObj[]>([]);
  const [processed, setProcessed] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Settings
  const [resizeBy, setResizeBy] = useState<'width' | 'height' | 'exact' | 'percentage'>('percentage');
  const [targetWidth, setTargetWidth] = useState(800);
  const [targetHeight, setTargetHeight] = useState(600);
  const [percentage, setPercentage] = useState(50);
  const [format, setFormat] = useState<'original' | 'image/png' | 'image/jpeg' | 'image/webp'>('original');
  const [quality, setQuality] = useState(0.9);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
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

  const processImages = async () => {
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

      if (resizeBy === 'percentage') {
        const factor = percentage / 100;
        finalWidth = Math.round(img.width * factor);
        finalHeight = Math.round(img.height * factor);
      } else if (resizeBy === 'width') {
        finalWidth = targetWidth;
        finalHeight = Math.round(img.height * (targetWidth / img.width));
      } else if (resizeBy === 'height') {
        finalHeight = targetHeight;
        finalWidth = Math.round(img.width * (targetHeight / img.height));
      } else if (resizeBy === 'exact') {
        finalWidth = targetWidth;
        finalHeight = targetHeight;
      }

      finalWidth = Math.max(1, finalWidth);
      finalHeight = Math.max(1, finalHeight);

      canvas.width = finalWidth;
      canvas.height = finalHeight;

      const outFormat = format === 'original' ? img.file.type : format;

      if (outFormat === 'image/jpeg') {
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
        canvas.toBlob((b) => resolve(b), outFormat, quality);
      });

      if (blob) {
        const parts = img.file.name.split('.');
        const ext = outFormat.split('/')[1] || 'jpg';
        const newName = parts.slice(0, -1).join('.') + '_resized.' + ext;
        results.push({
          id: img.id,
          name: newName,
          blobUrl: URL.createObjectURL(blob),
          width: finalWidth,
          height: finalHeight,
          size: blob.size,
          format: outFormat,
          blob
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
    a.download = 'resized_images_shaad_dev.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Free Online Bulk Image Resizer | ShaadDev Studio" 
        description="Fast, local, high-quality bulk image resizing and format conversion tool. Resize single or multiple images instantly entirely in your browser." 
        url="https://shaaddev.studio/tools/image-resizer" keywords="image resizer, crop images online, pixel width scaler" />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">Back to Tools</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Maximize className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">Bulk Image Resizer</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="space-y-1 text-center sm:text-left">
             <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Bulk Image Resizer</h1>
             <p className="text-white/60 text-sm">Resize, convert, and format individual or bulk images straight in your browser.</p>
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
                  <Upload className="w-12 h-12 mb-4 opacity-50" />
                  <span className="font-bold text-lg uppercase tracking-wider">Add Single or Bulk Images</span>
                  <span className="text-xs opacity-50 mt-2">Supports multiple JPG, PNG, WEBP files</span>
                </div>
              ) : (
                <div className="glass-panel p-4 rounded-2xl border border-white/10 bg-black/40 space-y-4">
                   <div className="flex justify-between items-center px-2">
                     <span className="text-xs font-bold uppercase tracking-widest text-white/50 flex items-center gap-2">
                        <ListPlus className="w-4 h-4"/> Input Images ({images.length})
                     </span>
                     <div className="flex gap-3">
                       <button onClick={() => fileInputRef.current?.click()} className="text-xs text-primary hover:text-primary-light uppercase tracking-widest font-bold">Add More</button>
                       <button onClick={clearAll} className="text-xs text-red-400 hover:text-red-300 uppercase tracking-widest font-bold">Clear All</button>
                     </div>
                     <input 
                       type="file" 
                       accept="image/*" 
                       multiple 
                       className="hidden" 
                       ref={fileInputRef}
                       onChange={handleFileUpload}
                     />
                   </div>

                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[500px] overflow-y-auto p-2 custom-scrollbar">
                     {images.map((img) => {
                       const proc = processed.find(p => p.id === img.id);
                       return (
                         <div key={img.id} className="relative group bg-[#0f0f0f] border border-white/5 rounded-xl overflow-hidden">
                           <div className="absolute top-2 right-2 flex gap-1 z-10">
                             {proc && (
                               <a 
                                 href={proc.blobUrl} 
                                 download={proc.name}
                                 className="bg-black/80 p-1.5 rounded-lg text-white/50 hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                 title="Download Image"
                               >
                                 <Download className="w-4 h-4"/>
                               </a>
                             )}
                             <button 
                               onClick={() => removeImage(img.id)}
                               className="bg-black/80 p-1.5 rounded-lg text-white/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                               title="Remove Image"
                             >
                               <Trash2 className="w-4 h-4"/>
                             </button>
                           </div>
                           <img src={proc ? proc.blobUrl : img.previewUrl} alt="preview" className="w-full h-32 object-cover" />
                           <div className="p-2 space-y-1 bg-black/50 absolute bottom-0 left-0 right-0 backdrop-blur-sm">
                             <p className="text-[9px] truncate text-white/80">{img.file.name}</p>
                             {proc ? (
                               <p className="text-[10px] text-primary font-bold">{proc.width}x{proc.height} • {formatBytes(proc.size)}</p>
                             ) : (
                               <p className="text-[10px] text-white/50">{img.width}x{img.height} • {formatBytes(img.file.size)}</p>
                             )}
                           </div>
                           {proc && (
                             <div className="absolute top-2 left-2 bg-primary text-black text-[9px] font-bold px-2 py-0.5 rounded uppercase flex items-center gap-1 shadow-lg">
                               <Check className="w-3 h-3"/> Done
                             </div>
                           )}
                         </div>
                       )
                     })}
                   </div>
                   
                   {processed.length > 0 && (
                     <div className="p-4 bg-primary/10 border border-primary/20 rounded-xl flex justify-between items-center mt-4">
                       <div className="space-y-1">
                          <span className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2">
                            <Check className="w-5 h-5"/> Processing Complete
                          </span>
                          <span className="text-white/60 text-xs">Total files: {processed.length}</span>
                       </div>
                       <button 
                         onClick={downloadAll}
                         className="px-6 py-3 bg-primary text-black hover:bg-white rounded-lg font-bold uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                       >
                         <Download className="w-4 h-4" /> 
                         {processed.length > 1 ? 'Download ZIP' : 'Download Image'}
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
                  <h2 className="font-black text-sm uppercase tracking-widest">Global Settings</h2>
                </div>

                <div className="space-y-5">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Resize Mode</label>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {[
                        { val: 'percentage', label: 'By %' },
                        { val: 'width', label: 'By Width' },
                        { val: 'height', label: 'By Height' },
                        { val: 'exact', label: 'Exact Size' },
                      ].map(opt => (
                        <button
                          key={opt.val}
                          onClick={() => setResizeBy(opt.val as any)}
                          className={`py-2 px-1 rounded-lg border text-center transition-all ${resizeBy === opt.val ? 'bg-primary/10 border-primary text-primary font-bold' : 'border-white/10 text-white/60 hover:bg-white/5'}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {resizeBy === 'percentage' && (
                     <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 flex justify-between">
                         <span>Scale Percentage</span>
                         <span className="text-primary">{percentage}%</span>
                       </label>
                       <input 
                         type="range" min="10" max="200" step="10" 
                         value={percentage} 
                         onChange={(e) => setPercentage(parseInt(e.target.value))}
                         className="w-full accent-primary h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer"
                       />
                     </div>
                  )}

                  {resizeBy === 'width' && (
                     <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-2">Target Width (px) - Auto Height</label>
                       <input 
                         type="number" value={targetWidth} onChange={(e) => setTargetWidth(parseInt(e.target.value) || 1)}
                         className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                       />
                     </div>
                  )}

                  {resizeBy === 'height' && (
                     <div>
                       <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-2">Target Height (px) - Auto Width</label>
                       <input 
                         type="number" value={targetHeight} onChange={(e) => setTargetHeight(parseInt(e.target.value) || 1)}
                         className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                       />
                     </div>
                  )}

                  {resizeBy === 'exact' && (
                     <div className="flex gap-3">
                       <div className="w-1/2">
                         <label className="text-[9px] text-white/40 uppercase block mb-1">Width (px)</label>
                         <input 
                           type="number" value={targetWidth} onChange={(e) => setTargetWidth(parseInt(e.target.value) || 1)}
                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                         />
                       </div>
                       <div className="w-1/2">
                         <label className="text-[9px] text-white/40 uppercase block mb-1">Height (px)</label>
                         <input 
                           type="number" value={targetHeight} onChange={(e) => setTargetHeight(parseInt(e.target.value) || 1)}
                           className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none"
                         />
                       </div>
                     </div>
                  )}

                  <div className="pt-4 border-t border-white/10">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block mb-2">Output Format</label>
                    <select 
                      value={format}
                      onChange={(e) => setFormat(e.target.value as any)}
                      className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg p-2.5 text-sm focus:border-primary focus:outline-none cursor-pointer"
                    >
                      <option value="original">Keep Original Format</option>
                      <option value="image/jpeg">Convert to JPEG</option>
                      <option value="image/png">Convert to PNG</option>
                      <option value="image/webp">Convert to WEBP (Recommended)</option>
                    </select>
                  </div>

                  {(format === 'image/jpeg' || format === 'image/webp' || format === 'original') && (
                    <div className="pt-4 border-t border-white/10">
                      <div className="flex justify-between items-center mb-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Quality Settings</label>
                        <span className="text-[10px] text-primary">{Math.round(quality * 100)}%</span>
                      </div>
                      <input 
                        type="range" min="0.1" max="1" step="0.1" 
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="w-full accent-primary bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}

                  <button 
                    onClick={processImages}
                    disabled={!images.length || isProcessing}
                    className="w-full py-3.5 bg-primary text-black hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 mt-4 shadow-lg shadow-primary/20"
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2"><RefreshCcw className="w-5 h-5 animate-spin" /> Processing...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Settings2 className="w-5 h-5" /> Apply & Generate</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed font-sans">
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">Professional Bulk Image Resizer</h2>
            <p>
              In modern web development and digital content creation, optimizing image assets is absolutely essential for maintaining fast page load speeds, reducing bandwidth consumption, and ensuring a seamless user experience across a diverse range of devices. Our <strong>Professional Batch Image Resizer</strong> empowers developers, marketing teams, and designers to quickly scale, crop, and adjust the dimensions of multiple images simultaneously without compromising visual fidelity.
            </p>
            <p>
              Whether you are preparing a massive batch of product thumbnails for an e-commerce platform, adjusting hero images to perfectly fit a new responsive layout, or simply reducing dimensions to bypass strict file upload limits on social media networks, this robust utility handles it all. By eliminating the necessity of firing up heavy graphic editing suites for repetitive resizing tasks, our tool significantly streamlines your content pipeline, ensuring your website remains highly performant and SEO-friendly.
            </p>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Upload Images:</strong> Click the dropzone area or drag-and-drop the images you wish to alter. You can upload multiple files at once for batch processing.</li>
              <li><strong>Configure Dimensions:</strong> Enter your exact target width and height in pixels. Alternatively, use percentage-based scaling if you just need proportioned reduction.</li>
              <li><strong>Lock Aspect Ratio:</strong> Choose whether to lock the original aspect ratio (to prevent distortion and stretching) or force the image to fit the exact absolute dimensions you have provided.</li>
              <li><strong>Process & Download:</strong> Click the resize button. In moments, your scaled assets will be ready to download individually or packaged within a single, convenient ZIP archive.</li>
            </ol>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-white block">1. Is my original image quality degraded during resizing?</strong>
                <p>Our tool utilizes advanced canvas scaling algorithms that prioritize visual clarity. While making an image significantly smaller will naturally reduce its pixel count, making it sharper, we ensure the process doesn't introduce unnecessary artifacts or blurriness.</p>
              </div>
              <div>
                <strong className="text-white block">2. Are my proprietary images uploaded to the cloud?</strong>
                <p>No, we champion a privacy-first approach. All image manipulation—including decoding, resizing, and re-encoding—is executed entirely client-side using your browser's local resources. Your files never leave your computer.</p>
              </div>
              <div>
                <strong className="text-white block">3. What image formats are supported by this resizer?</strong>
                <p>We universally support the most common web-friendly image formats, primarily including PNG, JPEG (JPG), and WebP, allowing seamless integration into practically any modern web project.</p>
              </div>
            </div>
          <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Lock Aspect Ratio</h4><p className="text-white/70">Always check the aspect ratio lock to prevent destructive image stretching.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Standardize Outputs</h4><p className="text-white/70">Scale all hero images to a uniform width to stabilize CLS on your website.</p></div></div></section></article>

          <RelatedTools currentPath="/tools/image-resizer" />
        </div>
      </main>

      <Footer />
    </div>
  );
}