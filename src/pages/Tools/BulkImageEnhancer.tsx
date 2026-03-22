import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Wand2, 
  Download, 
  Upload, 
  ChevronLeft,
  Settings2,
  RefreshCcw,
  Check,
  ListPlus,
  Trash2,
  Maximize,
  Image as ImageIcon,
  X,
  Eye,
  Type,
  Sparkles
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

export default function BulkImageEnhancer() {
  const [images, setImages] = useState<ImageObj[]>([]);
  const [processed, setProcessed] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [previewImage, setPreviewImage] = useState<{url: string, style?: any} | null>(null);
  const [activePreviewId, setActivePreviewId] = useState<string | null>(null);

  const [isComparing, setIsComparing] = useState(false);

  // Filter Settings
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [grayscale, setGrayscale] = useState(0);
  const [blur, setBlur] = useState(0);
  const [sepia, setSepia] = useState(0);
  const [hueRotate, setHueRotate] = useState(0);

  // Advanced Pro Settings (Now Free for all)
  const [watermarkText, setWatermarkText] = useState('');
  const [watermarkColor, setWatermarkColor] = useState('#ffffff');
  const [watermarkOpacity, setWatermarkOpacity] = useState(80);
  const [outputFormat, setOutputFormat] = useState<'image/png' | 'image/jpeg' | 'image/webp'>('image/webp');
  const [outputQuality, setOutputQuality] = useState(0.9);
  
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
    const newSelectedIds = new Set(selectedIds);

    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;
      
      const url = URL.createObjectURL(file);
      const dimensions = await new Promise<{w: number, h: number}>((resolve) => {
        const img = new Image();
        img.onload = () => resolve({ w: img.width, h: img.height });
        img.src = url;
      });

      const id = Math.random().toString(36).substr(2, 9);
      newImages.push({
        id,
        file,
        previewUrl: url,
        width: dimensions.w,
        height: dimensions.h
      });
      newSelectedIds.add(id);
    }

    setImages(prev => [...prev, ...newImages]);
    setSelectedIds(newSelectedIds);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setProcessed(prev => prev.filter(p => p.id !== id));
    if (activePreviewId === id) setActivePreviewId(null);
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  const clearAll = () => {
    setImages([]);
    setProcessed([]);
    setSelectedIds(new Set());
    setActivePreviewId(null);
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const selectAll = () => setSelectedIds(new Set(images.map(img => img.id)));
  const deselectAll = () => setSelectedIds(new Set());

  const presets = [
    { name: 'Normal', values: { brightness: 100, contrast: 100, saturation: 100, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    // Beautify & Portrait
    { name: 'Studio', values: { brightness: 115, contrast: 105, saturation: 100, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Glamour', values: { brightness: 110, contrast: 115, saturation: 115, grayscale: 0, blur: 0.3, sepia: 15, hueRotate: 0 } },
    { name: 'Soft Skin', values: { brightness: 105, contrast: 95, saturation: 105, grayscale: 0, blur: 0.5, sepia: 10, hueRotate: 0 } },
    { name: 'Fresh', values: { brightness: 110, contrast: 90, saturation: 110, grayscale: 0, blur: 0.2, sepia: 0, hueRotate: 0 } },
    { name: 'Golden Hour', values: { brightness: 105, contrast: 110, saturation: 130, grayscale: 0, blur: 0, sepia: 30, hueRotate: 350 } },
    { name: 'Color Fix', values: { brightness: 105, contrast: 110, saturation: 115, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Vibrant', values: { brightness: 100, contrast: 120, saturation: 135, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Crisp', values: { brightness: 105, contrast: 125, saturation: 90, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    // Existing Classics
    { name: 'Clarendon', values: { brightness: 110, contrast: 120, saturation: 125, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Gingham', values: { brightness: 105, contrast: 90, saturation: 90, grayscale: 0, blur: 0, sepia: 10, hueRotate: 350 } },
    { name: 'Moon', values: { brightness: 110, contrast: 110, saturation: 0, grayscale: 100, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Lark', values: { brightness: 108, contrast: 90, saturation: 110, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Reyes', values: { brightness: 110, contrast: 85, saturation: 75, grayscale: 0, blur: 0, sepia: 22, hueRotate: 0 } },
    { name: 'Juno', values: { brightness: 105, contrast: 115, saturation: 130, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Slumber', values: { brightness: 105, contrast: 105, saturation: 66, grayscale: 0, blur: 0, sepia: 30, hueRotate: 0 } },
    { name: 'Crema', values: { brightness: 105, contrast: 95, saturation: 90, grayscale: 0, blur: 0, sepia: 20, hueRotate: 350 } },
    { name: 'Ludwig', values: { brightness: 100, contrast: 105, saturation: 85, grayscale: 0, blur: 0, sepia: 25, hueRotate: 350 } },
    { name: 'Aden', values: { brightness: 110, contrast: 90, saturation: 85, grayscale: 0, blur: 0, sepia: 20, hueRotate: 340 } },
    { name: 'Perpetua', values: { brightness: 110, contrast: 110, saturation: 110, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Vintage', values: { brightness: 90, contrast: 120, saturation: 80, grayscale: 20, blur: 0, sepia: 50, hueRotate: 0 } },
    { name: 'Cinematic', values: { brightness: 90, contrast: 130, saturation: 110, grayscale: 0, blur: 0, sepia: 10, hueRotate: 0 } },
    { name: 'Cyberpunk', values: { brightness: 100, contrast: 140, saturation: 150, grayscale: 0, blur: 0, sepia: 0, hueRotate: -30 } },
    { name: 'Noir', values: { brightness: 90, contrast: 150, saturation: 0, grayscale: 100, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Fade', values: { brightness: 110, contrast: 80, saturation: 80, grayscale: 0, blur: 0, sepia: 0, hueRotate: 0 } },
    { name: 'Cool', values: { brightness: 100, contrast: 110, saturation: 110, grayscale: 0, blur: 0, sepia: 30, hueRotate: 180 } },
    { name: 'Warm', values: { brightness: 105, contrast: 110, saturation: 120, grayscale: 0, blur: 0, sepia: 40, hueRotate: 0 } },
    { name: 'Dreamy', values: { brightness: 110, contrast: 90, saturation: 120, grayscale: 0, blur: 1, sepia: 0, hueRotate: 0 } },
    { name: 'Retro', values: { brightness: 95, contrast: 115, saturation: 70, grayscale: 0, blur: 0, sepia: 60, hueRotate: 0 } },
    { name: 'Matrix', values: { brightness: 100, contrast: 120, saturation: 120, grayscale: 0, blur: 0, sepia: 50, hueRotate: 90 } },
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setBrightness(preset.values.brightness);
    setContrast(preset.values.contrast);
    setSaturation(preset.values.saturation);
    setGrayscale(preset.values.grayscale);
    setBlur(preset.values.blur);
    setSepia(preset.values.sepia);
    setHueRotate(preset.values.hueRotate);
    setProcessed([]);
  }

  const resetFilters = () => {
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setGrayscale(0);
    setBlur(0);
    setSepia(0);
    setHueRotate(0);
    setWatermarkText('');
    setProcessed([]);
  }

  const handleMagicEnhance = () => {
    // Deep pop calculation
    setBrightness(108);
    setContrast(115);
    setSaturation(125);
    setBlur(0.1);
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
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.clearRect(0,0, img.width, img.height);
      
      // Apply filters string
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`;

      const imageElement = new Image();
      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = reject;
        imageElement.src = img.previewUrl;
      });

      ctx.drawImage(imageElement, 0, 0, img.width, img.height);
      
      // Add Watermark
      if (watermarkText) {
        ctx.filter = 'none'; // reset filter so watermark isn't altered
        ctx.globalAlpha = watermarkOpacity / 100;
        ctx.fillStyle = watermarkColor;
        const fontSize = Math.max(14, img.width * 0.04);
        ctx.font = `600 ${fontSize}px Inter, sans-serif`;
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        // Stroke for visibility over any background
        ctx.lineWidth = fontSize * 0.05;
        ctx.strokeStyle = '#000000';
        ctx.strokeText(watermarkText, img.width - (fontSize * 0.5), img.height - (fontSize * 0.5));
        ctx.fillText(watermarkText, img.width - (fontSize * 0.5), img.height - (fontSize * 0.5));
        ctx.globalAlpha = 1.0;
      }

      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((b) => resolve(b), outputFormat, outputQuality);
      });

      if (blob) {
        const parts = img.file.name.split('.');
        const ext = outputFormat.split('/')[1] === 'jpeg' ? 'jpg' : outputFormat.split('/')[1];
        const newName = parts.slice(0, -1).join('.') + '_enhanced.' + ext;
        results.push({
          id: img.id,
          name: newName,
          blobUrl: URL.createObjectURL(blob),
          width: img.width,
          height: img.height,
          size: blob.size,
          format: outputFormat,
          blob
        });
      }
    }

    setProcessed(results);
    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const toDownload = processed.filter(p => selectedIds.has(p.id));
    if (!toDownload.length) return;
    if (toDownload.length === 1) {
      const p = toDownload[0];
      const a = document.createElement('a');
      a.href = p.blobUrl;
      a.download = p.name;
      a.click();
      return;
    }

    const zip = new JSZip();
    toDownload.forEach(p => {
      zip.file(p.name, p.blob);
    });
    
    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'enhanced_images_batch.zip';
    a.click();
    URL.revokeObjectURL(url);
  };

  const previewFilterStyle = {
    filter: `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) blur(${blur}px) sepia(${sepia}%) hue-rotate(${hueRotate}deg)`
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Pro Bulk Image Enhancer | Free Online Photo Filter Tool" 
        description="Edit batch photos instantly in your browser. Apply custom presets, correct colors, smooth skin, and add text watermarks. Fast, secure, and 100% free." 
        url="https://shaaddev.studio/tools/bulk-image-enhancer" 
        keywords="bulk image enhancer, free photo editor online, batch watermark, photo presets online" 
      />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">Back to Tools</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">Bulk Enhancer</span>
          </div>
        </div>
      </nav>

      {/* Fullscreen Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 sm:p-8 backdrop-blur-xl" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-7xl max-h-full flex items-center justify-center">
            <button 
              onClick={(e) => { e.stopPropagation(); setPreviewImage(null); }}
              className="absolute -top-10 right-0 lg:-right-10 bg-white/10 hover:bg-white/20 p-2 rounded-full text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={previewImage.url} 
              style={previewImage.style} 
              alt="Fullscreen Preview" 
              className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl ring-1 ring-white/10" 
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-6xl space-y-6">
          
          <div className="space-y-2 text-center sm:text-left">
             <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-widest mb-2">
               100% Free Unlimited Tool
             </div>
             <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary/50 relative inline-block">
               Bulk Image Enhancer Pro
             </h1>
             <p className="text-white/60 text-sm max-w-2xl">
               Apply studio-grade portrait presets, professional color correction, and batch watermarking to unlimited images at once—completely free and private in your browser.
             </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Input List */}
            <div className="lg:col-span-8 space-y-6">
              {!images.length ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="glass-panel border-2 border-dashed border-white/10 hover:border-primary/50 text-white/30 hover:text-primary rounded-3xl flex flex-col items-center justify-center p-16 cursor-pointer transition-all bg-gradient-to-b from-white/[0.02] to-black/40 min-h-[400px] shadow-2xl"
                >
                  <input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    className="hidden" 
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                  />
                  <div className="p-4 bg-primary/10 rounded-full mb-6">
                    <Upload className="w-10 h-10 text-primary" />
                  </div>
                  <span className="font-black text-xl uppercase tracking-widest mb-2 text-white">Upload Assets</span>
                  <span className="text-xs font-semibold opacity-70 tracking-wider">Drag & Drop Batch High-Res Images</span>
                </div>
              ) : (
                <div className="glass-panel p-4 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.03] to-black/40 space-y-4 shadow-2xl relative overflow-hidden">
                   
                   {/* Top Bar inside file list */}
                   <div className="flex justify-between items-center px-4 pt-2">
                     <span className="text-xs font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <ListPlus className="w-4 h-4 text-primary"/> Source Assets ({images.length})
                     </span>
                     <div className="flex flex-wrap gap-2 justify-end items-center">
                       <button onClick={selectAll} className="text-[10px] text-white/50 hover:text-white uppercase tracking-widest font-bold border border-white/10 hover:bg-white/5 px-2 py-1 rounded">Select All</button>
                       <button onClick={deselectAll} className="text-[10px] text-white/50 hover:text-white uppercase tracking-widest font-bold border border-white/10 hover:bg-white/5 px-2 py-1 rounded">Deselect All</button>
                       <div className="w-px h-4 bg-white/10 mx-1 hidden sm:block"></div>
                       <button onClick={() => fileInputRef.current?.click()} className="text-[10px] text-primary hover:text-primary-light uppercase tracking-widest font-bold px-2 py-1 bg-primary/10 rounded">Add More</button>
                       <button onClick={clearAll} className="text-[10px] text-red-400 hover:text-red-300 uppercase tracking-widest font-bold px-2 py-1 bg-red-400/10 rounded">Clear Workspace</button>
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
                   
                   {/* Default Large View of Active Image */}
                   {images.length > 0 && (() => {
                     const activeImg = images.find(img => img.id === activePreviewId) || images[0];
                     return (
                       <div className="mx-2 mb-4 mt-2 rounded-2xl overflow-hidden bg-black border border-white/10 relative aspect-[16/9] shadow-2xl flex items-center justify-center group select-none ring-1 ring-white/5">
                         <img 
                           src={isComparing ? activeImg.previewUrl : (processed.length ? (processed.find(p => p.id === activeImg.id)?.blobUrl || activeImg.previewUrl) : activeImg.previewUrl)} 
                           style={isComparing ? {} : (processed.length ? {} : previewFilterStyle)}
                           alt="Large Filter Preview" 
                           className="w-full h-full object-contain pointer-events-none transition-opacity duration-300"
                         />
                         
                         <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2 shadow-lg">
                           <Sparkles className={`w-3 h-3 ${isComparing ? 'text-white/40' : 'text-primary'}`} /> 
                           {isComparing ? 'Original Baseline' : 'Live Studio Preview'}
                         </div>
                         
                         <button
                           onPointerDown={() => setIsComparing(true)}
                           onPointerUp={() => setIsComparing(false)}
                           onPointerLeave={() => setIsComparing(false)}
                           className="absolute bottom-4 left-4 bg-primary/20 hover:bg-primary/40 text-primary backdrop-blur-md px-4 py-2 rounded-xl border border-primary/50 text-xs font-black uppercase tracking-widest transition-colors shadow-lg active:scale-95"
                           title="Press and hold to see the original uploaded image"
                         >
                           Hold to Compare
                         </button>

                         <button
                           onClick={() => {
                             const proc = processed.find(p => p.id === activeImg.id);
                             setPreviewImage(proc ? {url: proc.blobUrl} : {url: activeImg.previewUrl, style: previewFilterStyle});
                           }}
                           className="absolute bottom-4 right-4 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/10 text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                           title="Full Screen Canvas"
                         >
                           <Maximize className="w-5 h-5"/>
                         </button>
                       </div>
                     );
                   })()}

                   <div className="px-5 pb-2">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Batch Filmstrip</p>
                   </div>

                   <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto px-4 pb-4 custom-scrollbar">
                     {images.map((img) => {
                       const proc = processed.find(p => p.id === img.id);
                       const isActive = activePreviewId ? img.id === activePreviewId : images[0].id === img.id;
                       
                       return (
                         <div 
                           key={img.id} 
                           onClick={() => setActivePreviewId(img.id)}
                           className={`relative group bg-black border rounded-2xl overflow-hidden ring-1 cursor-pointer transition-colors ${isActive ? 'border-primary ring-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.2)]' : 'border-white/5 ring-white/5 hover:border-white/20'}`}
                         >
                           <div className="absolute top-2 left-2 z-20" onClick={(e) => e.stopPropagation()}>
                             <input 
                               type="checkbox" 
                               checked={selectedIds.has(img.id)}
                               onChange={() => toggleSelection(img.id)}
                               className="w-5 h-5 accent-primary cursor-pointer rounded bg-black/50 border-white/20"
                             />
                           </div>
                           <div className="absolute top-2 right-2 flex gap-1 z-20 transition-opacity" onClick={(e) => e.stopPropagation()}>
                             <button
                               onClick={() => setPreviewImage(proc ? {url: proc.blobUrl} : {url: img.previewUrl, style: previewFilterStyle})}
                               className="bg-black/80 p-1.5 rounded-lg text-white/50 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                               title="Focus Inspect"
                             >
                               <Eye className="w-4 h-4"/>
                             </button>
                             {proc && (
                               <a 
                                 href={proc.blobUrl} 
                                 download={proc.name}
                                 className="bg-primary/20 p-1.5 rounded-lg text-primary hover:bg-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center border border-primary/20"
                                 title="Download Image"
                               >
                                 <Download className="w-4 h-4"/>
                               </a>
                             )}
                             <button 
                               onClick={() => removeImage(img.id)}
                               className="bg-red-500/20 border border-red-500/20 p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/40 opacity-0 group-hover:opacity-100 transition-opacity"
                               title="Remove Asset"
                             >
                               <Trash2 className="w-4 h-4"/>
                             </button>
                           </div>
                           
                           {/* Before process: CSS preview. After process: literal blob */}
                           {proc ? (
                             <img src={proc.blobUrl} alt="processed preview" className="w-full h-32 object-cover" />
                           ) : (
                             <img src={img.previewUrl} alt="live filter preview" style={previewFilterStyle} className="w-full h-32 object-cover transition-all" />
                           )}

                           <div className="p-2 space-y-1 bg-gradient-to-t from-black via-black/80 to-transparent absolute bottom-0 left-0 right-0 pt-6">
                             <p className="text-[10px] truncate text-white/80 font-semibold">{img.file.name}</p>
                             {proc ? (
                               <p className="text-[9px] text-primary font-bold tracking-widest uppercase">Export Ready • {formatBytes(proc.size)}</p>
                             ) : (
                               <p className="text-[9px] text-white/50 tracking-widest uppercase">Raw Asset • {formatBytes(img.file.size)}</p>
                             )}
                           </div>
                           {proc && (
                             <div className="absolute top-2 left-10 bg-primary text-black text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-widest flex items-center gap-1 shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]">
                               <Check className="w-3 h-3"/> Processed
                             </div>
                           )}
                         </div>
                       )
                     })}
                   </div>
                   
                   {processed.length > 0 && (
                     <div className="p-5 bg-gradient-to-r from-primary/10 to-transparent border-t border-primary/20 flex flex-col sm:flex-row justify-between items-center gap-4">
                       <div className="space-y-1 text-center sm:text-left">
                          <span className="text-primary font-black uppercase tracking-widest text-sm flex items-center gap-2 justify-center sm:justify-start">
                            <Check className="w-5 h-5"/> Rendering Complete
                          </span>
                          <span className="text-white/60 text-[10px] font-bold tracking-widest uppercase">{processed.filter(p => selectedIds.has(p.id)).length} Selected of {processed.length} Processed Assets</span>
                       </div>
                       <button 
                         onClick={downloadAll}
                         disabled={processed.filter(p => selectedIds.has(p.id)).length === 0}
                         className="px-8 py-4 bg-primary text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] shadow-primary/20"
                       >
                         <Download className="w-4 h-4" /> 
                         {processed.filter(p => selectedIds.has(p.id)).length > 1 ? 'Download Batch ZIP' : 'Download High-Res'}
                       </button>
                     </div>
                   )}
                </div>
              )}
            </div>

            {/* Right: Settings */}
            <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
              <div className="glass-panel p-6 rounded-3xl bg-black/60 border border-white/10 space-y-6 shadow-2xl backdrop-blur-2xl">
                
                {/* Magic Enhance Action */}
                <button 
                  onClick={handleMagicEnhance}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px] shadow-2xl mb-2"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-amber-500 rounded-xl opacity-70 group-hover:opacity-100 transition-opacity blur-sm"></span>
                  <div className="relative bg-black px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all">
                    <Sparkles className="w-5 h-5 text-amber-400" />
                    <span className="font-black uppercase tracking-widest text-xs bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-primary">Auto-Magical Enhance</span>
                  </div>
                </button>

                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-5 h-5 text-primary" />
                    <h2 className="font-black text-sm uppercase tracking-widest">Global Master Rig</h2>
                  </div>
                  <button onClick={resetFilters} className="text-[9px] text-white/30 hover:text-white uppercase font-black tracking-widest underline decoration-white/20 underline-offset-4">Reset Engine</button>
                </div>

                {/* Presets Row */}
                <div className="space-y-3">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 block">Cinematic LUTS ({presets.length})</label>
                  <div className="flex gap-3 pb-3 overflow-x-auto custom-scrollbar hide-scrollbar-mobile snap-x pl-1 pr-4 -mx-1 pt-1">
                    {presets.map(p => {
                      const presetFilter = `brightness(${p.values.brightness}%) contrast(${p.values.contrast}%) saturate(${p.values.saturation}%) grayscale(${p.values.grayscale}%) blur(${p.values.blur}px) sepia(${p.values.sepia}%) hue-rotate(${p.values.hueRotate}deg)`;
                      const activeImg = images.find(img => img.id === activePreviewId) || images[0];
                      
                      return (
                        <button
                          key={p.name}
                          onClick={() => applyPreset(p)}
                          className="snap-start shrink-0 group flex flex-col items-center gap-2 transition-transform hover:scale-105 relative"
                          title={`Apply ${p.name} LUT`}
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-white/10 group-hover:border-primary transition-colors bg-[#0a0a0a] shadow-lg relative">
                            <img 
                              src={images.length > 0 ? activeImg.previewUrl : "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=200&auto=format&fit=crop"} 
                              alt={p.name}
                              style={{ filter: presetFilter }}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-white/60 group-hover:text-primary">
                            {p.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex justify-between">
                      <span>Exposure Base</span> <span className="text-primary font-mono">{brightness}%</span>
                    </label>
                    <input type="range" min="0" max="200" value={brightness} onChange={(e) => { setBrightness(parseInt(e.target.value)); setProcessed([]); }} className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex justify-between">
                      <span>Contrast Index</span> <span className="text-primary font-mono">{contrast}%</span>
                    </label>
                    <input type="range" min="0" max="200" value={contrast} onChange={(e) => { setContrast(parseInt(e.target.value)); setProcessed([]); }} className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex justify-between">
                      <span>Color Peak (Sat)</span> <span className="text-primary font-mono">{saturation}%</span>
                    </label>
                    <input type="range" min="0" max="200" value={saturation} onChange={(e) => { setSaturation(parseInt(e.target.value)); setProcessed([]); }} className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 flex justify-between">
                      <span>Skin Softener (Blur)</span> <span className="text-primary font-mono">{blur}px</span>
                    </label>
                    <input type="range" min="0" max="20" step="0.1" value={blur} onChange={(e) => { setBlur(parseFloat(e.target.value)); setProcessed([]); }} className="w-full accent-primary h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-3">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex justify-between"><span>Grayscale</span><span className="text-white/30">{grayscale}</span></label>
                       <input type="range" min="0" max="100" value={grayscale} onChange={(e) => { setGrayscale(parseInt(e.target.value)); setProcessed([]); }} className="w-full accent-white/50 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                     </div>
                     <div className="space-y-3">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-white/50 flex justify-between"><span>Sepia</span><span className="text-white/30">{sepia}</span></label>
                       <input type="range" min="0" max="100" value={sepia} onChange={(e) => { setSepia(parseInt(e.target.value)); setProcessed([]); }} className="w-full accent-amber-500 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                     </div>
                  </div>

                  {/* Watermark Overlay Settings */}
                  <div className="pt-6 border-t border-white/10 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                       <Type className="w-4 h-4 text-purple-400" />
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-white flex-1">Watermark Engine</h3>
                    </div>
                    
                    <input 
                      type="text" 
                      placeholder="Add branding overlay text..." 
                      value={watermarkText} 
                      onChange={(e) => { setWatermarkText(e.target.value); setProcessed([]); }} 
                      className="w-full bg-[#050505] border border-white/10 hover:border-white/20 focus:border-primary rounded-xl p-3 text-sm font-semibold transition-all focus:outline-none"
                    />
                    
                    <div className="flex gap-4 items-center">
                       <div className="flex-1 space-y-2">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Color Override</label>
                         <input type="color" value={watermarkColor} onChange={(e) => { setWatermarkColor(e.target.value); setProcessed([]); }} className="w-full h-8 rounded border-none appearance-none bg-transparent cursor-pointer" />
                       </div>
                       <div className="flex-1 space-y-2">
                         <label className="text-[9px] font-bold uppercase tracking-widest text-white/40 block">Alpha Blend</label>
                         <input type="range" min="10" max="100" value={watermarkOpacity} onChange={(e) => { setWatermarkOpacity(parseInt(e.target.value)); setProcessed([]); }} className="w-full accent-purple-400 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer" />
                       </div>
                    </div>
                  </div>

                  {/* Export Settings */}
                  <div className="pt-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50 mb-2 block">Export Container Format</label>
                    <select 
                      value={outputFormat}
                      onChange={(e) => { setOutputFormat(e.target.value as any); setProcessed([]); }}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl p-3 text-xs font-bold uppercase tracking-widest focus:border-primary focus:outline-none cursor-pointer text-white/80"
                    >
                      <option value="image/webp">WebP (Ultra-Fast & Light)</option>
                      <option value="image/jpeg">JPEG (Lossy Standard)</option>
                      <option value="image/png">PNG (Lossless High-Res)</option>
                    </select>
                  </div>

                  <button 
                    onClick={processImages}
                    disabled={!images.length || isProcessing}
                    className="w-full py-4 bg-gradient-to-r from-primary to-primary/80 text-black hover:to-white disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 mt-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.5)] border border-white/10"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCcw className="w-5 h-5 animate-spin" /> <span className="opacity-90">Executing Render...</span>
                      </>
                    ) : (
                      <>
                        <Settings2 className="w-5 h-5" /> Execute Batch Render
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-10 rounded-3xl bg-gradient-to-br from-black/80 to-[#111] border border-white/5 mt-16 space-y-10 text-sm text-white/70 leading-relaxed font-sans shadow-2xl">
            <header className="space-y-4 text-center sm:text-left">
              <h2 className="text-3xl font-black text-white tracking-wider font-mono">Guide: How to Use the Free Bulk Image Enhancer</h2>
              <p className="text-lg text-white/80 max-w-4xl">
                Looking to quickly edit multiple photos, correct colors, smooth skin tones, or add watermarks to a whole batch of images? Our free online tool does it all instantly in your browser, keeping your files completely private.
              </p>
            </header>

            <section className="space-y-6">
              <h3 className="text-xl font-bold text-white border-b border-white/10 pb-3">Step-by-Step Instructions</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-primary">1. Upload Your Images</h4>
                  <p>Drag and drop your photos into the drop zone, or click to browse. We support JPG, PNG, and WebP formats. There are no strict batch limits on how many you can process at once.</p>
                  <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" alt="Uploading images on computer" className="w-full h-48 object-cover rounded-xl border border-white/10 shadow-lg" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-primary">2. Apply Presets or Sliders</h4>
                  <p>Click on one of our 30+ built-in presets (like 'Glamour', 'Golden Hour', or 'Cyberpunk') or manually adjust Brightness, Contrast, and skin-smoothing Blur. Press <b>"Hold to Compare"</b> to instantly see your progress against the original image.</p>
                  <img src="https://images.unsplash.com/photo-1622737133809-d95047b9e673?q=80&w=800&auto=format&fit=crop" alt="Color correction presets interface example" className="w-full h-48 object-cover rounded-xl border border-white/10 shadow-lg" />
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-primary">3. Add Custom Watermarks</h4>
                  <p>Scroll down to the "Watermark Engine" setting. Type in your brand name, studio name, or copyright text. You can choose any color and adjust the exact opacity to perfectly brand your bulk batch before sharing.</p>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-bold text-primary">4. Download as ZIP</h4>
                  <p>Check the boxes of the specific images you want to keep (or just hit "Select All"). Choose your output format (WebP is best for sizes, PNG for absolute highest quality), then hit the "Execute Batch Render" button to download your ZIP!</p>
                </div>
              </div>
            </section>

            <section className="space-y-4 bg-primary/5 p-6 rounded-2xl border border-primary/20">
              <h3 className="text-xl font-bold text-white">Before and After Examples</h3>
              <p>Wondering what our built-in beautification tools look like? Our "Soft Skin" and "Studio" presets subtly alter the lighting and add micro-blur smoothing to make portraits pop professionally, without artificial filtering artifacts.</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-white/50">Before (Original)</span>
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" style={{ filter: 'brightness(95%) contrast(90%)' }} alt="Before portrait editing example" className="w-full h-64 object-cover rounded-xl grayscale-[20%]" />
                </div>
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-primary">After ("Glamour" Preset)</span>
                  <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=600&auto=format&fit=crop" style={{ filter: 'brightness(110%) contrast(115%) saturate(115%) sepia(10%) blur(0.2px)' }} alt="After portrait editing glamour effect" className="w-full h-64 object-cover rounded-xl" />
                </div>
              </div>
            </section>
          </article>

          <RelatedTools currentPath="/tools/bulk-image-enhancer" />
        </div>
      </main>

      <Footer />
    </div>
  );
}
