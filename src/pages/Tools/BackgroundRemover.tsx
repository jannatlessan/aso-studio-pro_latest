import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { removeBackground, Config } from '@imgly/background-removal';
import { 
  Wand2, 
  Download, 
  Upload, 
  ChevronLeft,
  Settings2,
  RefreshCcw,
  Image as ImageIcon,
  Layers,
  Circle,
  Square,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Loader2,
  Palette,
  Move,
  ZoomIn,
  MessageCircle,
  Camera,
  Briefcase,
  Youtube as YoutubeIcon
} from 'lucide-react';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AdBlockDetector from '../../components/AdBlockDetector';

// We'll manage processing state intricately here
type ProcessState = 'idle' | 'loading_model' | 'processing' | 'done' | 'error';
type BackgroundMode = 'transparent' | 'solid' | 'gradient' | 'product_studio' | 'whatsapp_dp' | 'facebook_dp' | 'linkedin_dp' | 'instagram_dp' | 'youtube_thumb';
type FilterPreset = 'none' | 'grayscale' | 'vintage' | 'cool' | 'warm' | 'dramatic' | 'neon';

const FILTER_MAP: Record<FilterPreset, string> = {
  none: 'none',
  grayscale: 'grayscale(100%)',
  vintage: 'sepia(60%) contrast(1.2) brightness(0.9)',
  cool: 'hue-rotate(180deg) saturate(1.5) blur(0px)',
  warm: 'sepia(40%) saturate(1.4) hue-rotate(-15deg)',
  dramatic: 'contrast(1.4) brightness(0.9) saturate(1.2)',
  neon: 'saturate(2.5) contrast(1.3) hue-rotate(45deg)'
};

interface ProcessedImage {
  originalUrl: string;
  cutoutUrl: string; 
  cutoutBlob: Blob;
  finalRenderUrl?: string;
  width: number;
  height: number;
}

export default function BackgroundRemover() {
  const [sourceImage, setSourceImage] = useState<File | null>(null);
  const [processed, setProcessed] = useState<ProcessedImage | null>(null);
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [progress, setProgress] = useState(0);
  const [progressText, setProgressText] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Pro Studio Settings
  const [bgMode, setBgMode] = useState<BackgroundMode>('transparent');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [gradientStart, setGradientStart] = useState('#8b5cf6');
  const [gradientEnd, setGradientEnd] = useState('#ec4899');
  
  // Interactive Canvas State
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [scale, setScale] = useState(1);
  const [activeFilter, setActiveFilter] = useState<FilterPreset>('none');
  const [isDragging, setIsDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dragging Handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStart.current = { x: e.clientX - offsetX, y: e.clientY - offsetY };
    (e.target as Element).setPointerCapture(e.pointerId);
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    setOffsetX(e.clientX - dragStart.current.x);
    setOffsetY(e.clientY - dragStart.current.y);
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  // Preset Handlers
  const applyPreset = (mode: BackgroundMode, gStart: string, gEnd: string, targetScale = 1, yOffset = 0) => {
    setBgMode(mode);
    setGradientStart(gStart);
    setGradientEnd(gEnd);
    setScale(targetScale);
    setOffsetX(0);
    setOffsetY(yOffset);
  };

  // When a user selects an image
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset everything
    setSourceImage(file);
    setProcessed(null);
    setProcessState('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
  };

  const handleExport = async () => {
    if (!processed || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set dimensions based on mode
    let targetWidth = processed.width;
    let targetHeight = processed.height;
    const isSquare = ['whatsapp_dp', 'facebook_dp', 'linkedin_dp', 'instagram_dp'].includes(bgMode);
    
    if (bgMode === 'youtube_thumb') {
      targetWidth = 1920;
      targetHeight = 1080;
    } else if (isSquare) {
      const maxDim = Math.max(targetWidth, targetHeight) * 1.2;
      targetWidth = maxDim;
      targetHeight = maxDim;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Apply Circular Clipping FIRST if needed
    if (bgMode === 'whatsapp_dp' || bgMode === 'instagram_dp') {
       ctx.beginPath();
       ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.5, 0, Math.PI * 2);
       ctx.clip();
    }

    // Background Rendering
    if (bgMode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgMode === 'gradient' || bgMode === 'instagram_dp' || bgMode === 'facebook_dp' || bgMode === 'linkedin_dp' || bgMode === 'youtube_thumb') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, gradientStart);
      grad.addColorStop(1, gradientEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgMode === 'whatsapp_dp' || bgMode === 'product_studio') {
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.height
      );
      grad.addColorStop(0, bgMode === 'whatsapp_dp' ? '#ffffff' : '#333333');
      grad.addColorStop(1, bgMode === 'whatsapp_dp' ? '#e5e7eb' : '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = processed.cutoutUrl;
    await new Promise(resolve => img.onload = resolve);

    ctx.save();
    
    // Position transform centering + UI offsets + UI scaling
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Scale UI offsets to canvas resolution correctly relative to container bounds if possible
    // For simplicity, we apply raw offsets scaled proportionately but a multiplier is usually needed.
    // For an exact 1:1 feel, UI pixel drag needs ratio tracking. We'll approximate closely.
    const canvasScaleRatio = Math.max(canvas.width, canvas.height) / 800; // rough generic divisor
    const renderOffsetX = offsetX * canvasScaleRatio;
    const renderOffsetY = offsetY * canvasScaleRatio;

    ctx.translate(centerX + renderOffsetX, centerY + renderOffsetY);
    
    const uiScaleFactor = scale * (isSquare ? 1.2 : 1.0);
    ctx.scale(uiScaleFactor, uiScaleFactor);
    ctx.translate(-processed.width / 2, -processed.height / 2);

    if (bgMode === 'product_studio') {
       ctx.shadowColor = 'rgba(0,0,0,0.8)';
       ctx.shadowBlur = canvas.width * 0.05;
       ctx.shadowOffsetY = canvas.height * 0.02;
    }
    
    // Apply Active Filter to the Image context
    ctx.filter = FILTER_MAP[activeFilter];
    
    ctx.drawImage(img, 0, 0, processed.width, processed.height);
    
    // Reset shadow and filter for border drawing
    ctx.filter = 'none';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.shadowColor = 'transparent';
    ctx.restore();

    // Draw Top Border Ring
    if (bgMode === 'whatsapp_dp' || bgMode === 'instagram_dp') {
       ctx.beginPath();
       ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width * 0.48, 0, Math.PI * 2);
       ctx.lineWidth = canvas.width * (bgMode === 'instagram_dp' ? 0.04 : 0.02);
       const strokeGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
       strokeGrad.addColorStop(0, bgMode === 'instagram_dp' ? '#f59e0b' : '#ffffff');
       strokeGrad.addColorStop(1, bgMode === 'instagram_dp' ? '#ec4899' : '#ffffff');
       ctx.strokeStyle = strokeGrad;
       ctx.stroke();
    }

    const dataUrl = canvas.toDataURL(bgMode === 'transparent' ? 'image/png' : 'image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `studio-cutout-pro-${Date.now()}.${bgMode === 'transparent' ? 'png' : 'jpg'}`;
    link.click();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file || !file.type.startsWith('image/')) return;
    
    setSourceImage(file);
    setProcessed(null);
    setProcessState('idle');
    setProgress(0);
    setProgressText('');
    setErrorMsg('');
  };

  // Run the AI Model
  const executeRemoval = async () => {
    if (!sourceImage) return;
    setProcessState('loading_model');
    setProgress(0);
    setProgressText('Waking up AI Engine...');
    setErrorMsg('');

    try {
      const config: Config = {
        progress: (key, current, total) => {
          if (key === 'compute:inference') {
            setProcessState('processing');
            setProgressText('Extracting Foreground Mask...');
          } else {
            setProgressText(`Preparing Advanced Neural Engine...`);
          }
          setProgress(Math.round((current / total) * 100));
        }
      };

      const blob = await removeBackground(sourceImage, config);
      
      const originalUrl = URL.createObjectURL(sourceImage);
      const cutoutUrl = URL.createObjectURL(blob);
      
      const img = new Image();
      img.src = cutoutUrl;
      await new Promise(resolve => img.onload = resolve);

      setProcessed({
        originalUrl,
        cutoutUrl,
        cutoutBlob: blob,
        width: img.width,
        height: img.height
      });

      setProcessState('done');
      setProgress(100);
      setProgressText('Analysis Complete!');
      
    } catch (err: any) {
      console.error(err);
      setProcessState('error');
      setErrorMsg(err.message || 'An error occurred during AI processing. Please try a different image.');
    }
  };

  return (
    <>
      <AdBlockDetector />
      <div className="min-h-screen bg-[#020202] text-white selection:bg-purple-500/30 font-sans">
      <SEO 
        title="Free AI Background Remover | 100% Private Pro Cutout Tool"
        description="Instantly remove backgrounds from images online using powerful on-device Web AI. Completely free, private, and features pro studio composites like shadows and gradients."
        url="https://shaaddev.studio/tools/background-remover"
      />

      {/* Modern Header */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tools" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <ChevronLeft className="w-5 h-5 text-white/60 group-hover:text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                <Wand2 className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">AuraCut AI</h1>
                <p className="text-[10px] text-indigo-400 font-bold tracking-widest uppercase">100% Secure Local Processing</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setSourceImage(null); setProcessed(null); setProcessState('idle'); }} className="h-8 px-4 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-widest hidden sm:flex">
              <RefreshCcw className="w-3 h-3" /> Reset Tool
            </button>
            <button onClick={handleExport} disabled={processState !== 'done'} className="h-8 px-5 text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(99,102,241,0.3)] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed">
              <Download className="w-3 h-3" /> Export Studio HD
            </button>
          </div>
        </div>
      </nav>

      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Workspace */}
      <main className="pt-20 pb-24 min-h-[90vh] flex flex-col items-center justify-center p-4">
        
        {/* State: Idle / Setup */}
        {processState === 'idle' && !sourceImage && (
          <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> AuraCut AI Engine
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-indigo-500/50 pb-2">
              AuraCut Studio.<br/>Zero Servers.
            </h2>
            
            <p className="text-white/40 max-w-xl mx-auto text-lg leading-relaxed font-medium">
              Drop an image below to magnetically isolate your layers using our offline deep neural networks.
            </p>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-100"></div>
              <div className="relative border-2 border-dashed border-indigo-500/30 hover:border-indigo-500 rounded-3xl p-16 bg-[#050505]/80 backdrop-blur-sm transition-all flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 flex items-center justify-center relative overflow-hidden">
                  <Upload className="w-8 h-8 text-indigo-400 z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-indigo-500/20 to-transparent"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload Source Image</h3>
                  <p className="text-sm text-white/40 font-medium">Drag & drop your file here, or click to browse</p>
                  <p className="text-xs text-white/30 mt-2 font-mono">Supports JPG, PNG, WEBP (Max 25MB)</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-indigo-400/80 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> 100% Secure & Private Processing
            </div>
          </div>
        )}

        {/* State: Loading & Processing */}
        {(processState === 'loading_model' || processState === 'processing') && (
          <div className="w-full max-w-md p-10 bg-[#050505] border border-white/5 rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
               <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
            </div>
            
            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50">{progressText}</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-mono">{progress}% Complete</p>
            </div>
            
            <p className="text-[10px] text-amber-500/80 uppercase tracking-widest mt-6 font-bold animate-pulse">
               ⚠️ Please do not close or refresh this tab while processing.
            </p>

            {processState === 'loading_model' && (
               <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">
                 <Sparkles className="w-3 h-3 inline mr-1 text-purple-400 mb-0.5" />
                 First run downloads a 40MB WebAssembly Model locally into your browser. 
               </p>
            )}
          </div>
        )}

        {/* Pre-Processing State (File uploaded, button not pressed) */}
        {sourceImage && processState === 'idle' && (
          <div className="w-full max-w-2xl bg-[#050505] p-2 rounded-3xl border border-white/10 shadow-2xl animate-in fade-in zoom-in-95">
             <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 border border-white/5">
                <img src={URL.createObjectURL(sourceImage)} alt="Source Upload" className="w-full h-full object-contain" />
                <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-center">
                   <button onClick={executeRemoval} className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 px-8 py-4 rounded-xl font-black uppercase tracking-widest text-sm shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all transform hover:scale-105">
                     <Wand2 className="w-5 h-5"/> Start AI Background Extraction
                   </button>
                </div>
             </div>
          </div>
        )}

        {/* Error State */}
        {processState === 'error' && (
           <div className="w-full max-w-lg p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4">
              <h3 className="text-xl font-bold text-red-400">Processing Failed</h3>
              <p className="text-sm text-red-300/80">{errorMsg}</p>
              <button onClick={() => { setSourceImage(null); setProcessState('idle'); }} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Try Another Image</button>
           </div>
        )}

        {/* State: Done (Studio Builder) */}
        {processState === 'done' && processed && (
          <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Visual Canvas Layout */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#050505] rounded-3xl border border-white/5 relative overflow-hidden h-[500px] xl:h-[700px]">
               <div className="absolute inset-0 pattern-dots pattern-white outline-none opacity-[0.02]"></div>
               
               {/* Draggable Zone Container */}
               <div 
                 ref={containerRef}
                 className={`relative border shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden transition-[border-radius,width,height] duration-500 
                   ${['whatsapp_dp', 'facebook_dp', 'linkedin_dp', 'instagram_dp'].includes(bgMode) ? 'w-full max-w-sm aspect-square ' + (bgMode === 'instagram_dp' || bgMode === 'whatsapp_dp' ? 'rounded-full' : 'rounded-3xl border-white/10') : 
                     bgMode === 'youtube_thumb' ? 'w-full max-w-4xl aspect-[16/9] rounded-2xl border-white/10' : 'w-full max-w-3xl aspect-[4/3] rounded-2xl border-white/10'}`} 
                 style={{
                    background: bgMode === 'transparent' ? 'repeating-conic-gradient(#111 0% 25%, transparent 0% 50%) 50% / 20px 20px' :
                                bgMode === 'solid' ? bgColor :
                                (bgMode === 'gradient' || bgMode === 'facebook_dp' || bgMode === 'linkedin_dp' || bgMode === 'instagram_dp' || bgMode === 'youtube_thumb') ? `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` :
                                (bgMode === 'whatsapp_dp' || bgMode === 'product_studio') ? `radial-gradient(circle at center, ${bgMode === 'whatsapp_dp' ? '#ffffff, #e5e7eb' : '#333 0%, #000 100%'})` : 'transparent'
                 }}
               >
                 
                 <img 
                   src={processed.cutoutUrl} 
                   onPointerDown={handlePointerDown}
                   onPointerMove={handlePointerMove}
                   onPointerUp={handlePointerUp}
                   onPointerLeave={handlePointerUp}
                   draggable={false}
                   className={`relative z-10 w-full h-full object-contain cursor-grab active:cursor-grabbing transition-[filter,drop-shadow] duration-500 
                     ${bgMode === 'product_studio' ? 'drop-shadow-2xl' : 'drop-shadow-xl'}
                   `} 
                   style={{
                      transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
                      filter: FILTER_MAP[activeFilter]
                   }}
                   alt="Studio Cutout" 
                 />

                 {/* Simulated Environment Reflections for Specific Modes */}
                 {bgMode === 'product_studio' && (
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/5 to-transparent z-0 blur-md pointer-events-none"></div>
                 )}
                 {bgMode === 'instagram_dp' && (
                    <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none drop-shadow-xl" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="48" fill="none" stroke="url(#instaGrad)" strokeWidth="3" />
                       <defs>
                          <linearGradient id="instaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                             <stop offset="0%" stopColor="#f59e0b" />
                             <stop offset="50%" stopColor="#ef4444" />
                             <stop offset="100%" stopColor="#ec4899" />
                          </linearGradient>
                       </defs>
                    </svg>
                 )}
                 {bgMode === 'whatsapp_dp' && (
                    <div className="absolute inset-0 rounded-full border-[6px] border-white z-20 pointer-events-none drop-shadow-md"></div>
                 )}
               </div>

               {/* Absolute Scale Slider floating on top of canvas */}
               <div className="absolute bottom-6 right-6 lg:left-6 lg:right-auto bg-[#111]/80 backdrop-blur-xl border border-white/10 p-4 rounded-2xl flex items-center gap-4 z-40 shadow-2xl">
                  <ZoomIn className="w-5 h-5 text-white/50" />
                  <input type="range" min="0.5" max="2.5" step="0.05" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-32 xl:w-48 accent-indigo-500" />
                  <span className="text-xs font-mono text-white/50">{Math.round(scale * 100)}%</span>
               </div>
               
               {/* Controls Hint */}
               <div className="absolute top-6 left-6 text-[10px] uppercase tracking-widest font-black text-white/30 flex items-center gap-2">
                 <Move className="w-4 h-4" /> Click and Drag Subject freely
               </div>
            </div>

            {/* Pro Studio Settings Panel */}
            <div className="lg:col-span-4 xl:col-span-3 bg-[#050505] rounded-3xl border border-white/5 shadow-xl p-6 flex flex-col h-[500px] xl:h-[700px] overflow-y-auto custom-scrollbar">
              <div className="space-y-8 flex-1">
                
                {/* Section 1: 1-Click DP Presets */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                    <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Social AI Makers</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <button onClick={() => applyPreset('whatsapp_dp', '#ffffff', '#e5e7eb', 0.85, 20)} className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${bgMode === 'whatsapp_dp' ? 'bg-green-500/20 border-green-500 text-green-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                        <MessageCircle className="w-3 h-3" /> WhatsApp
                     </button>
                     <button onClick={() => applyPreset('instagram_dp', '#f59e0b', '#ec4899', 0.75, 40)} className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${bgMode === 'instagram_dp' ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                        <Camera className="w-3 h-3" /> Instagram
                     </button>
                     <button onClick={() => applyPreset('facebook_dp', '#3b5998', '#1e3a8a', 0.8, 40)} className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${bgMode === 'facebook_dp' ? 'bg-blue-500/20 border-blue-500 text-blue-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                        <span className="font-serif font-black text-sm outline-none px-1">f</span> Facebook
                     </button>
                     <button onClick={() => applyPreset('linkedin_dp', '#0ea5e9', '#0284c7', 0.85, 30)} className={`p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${bgMode === 'linkedin_dp' ? 'bg-sky-500/20 border-sky-500 text-sky-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                        <Briefcase className="w-3 h-3" /> LinkedIn
                     </button>
                     <button onClick={() => applyPreset('youtube_thumb', '#111111', '#ef4444', 1.0, 0)} className={`col-span-2 p-3 rounded-xl border text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${bgMode === 'youtube_thumb' ? 'bg-red-500/20 border-red-500 text-red-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                        <YoutubeIcon className="w-4 h-4" /> YouTube Thumbnail Pro
                     </button>
                  </div>
                </div>

                {/* Section 2: Mode Selector */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Palette className="w-4 h-4 text-indigo-400" />
                    <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Custom Environment</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => applyPreset('transparent', gradientStart, gradientEnd)} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'transparent' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                      <Square className="w-4 h-4 dashed stroke-[1.5]" /> Transparent
                    </button>
                    <button onClick={() => applyPreset('solid', gradientStart, gradientEnd)} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'solid' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                      <Square className="w-4 h-4 fill-current" /> Solid Base
                    </button>
                    <button onClick={() => applyPreset('gradient', gradientStart, gradientEnd)} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'gradient' ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                      <Layers className="w-4 h-4" /> Gradient UI
                    </button>
                    <button onClick={() => applyPreset('product_studio', gradientStart, gradientEnd, 1, -20)} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'product_studio' ? 'bg-purple-500/20 border-purple-500 text-purple-400' : 'bg-black/50 border-white/10 hover:bg-white/5'}`}>
                      <ImageIcon className="w-4 h-4" /> E-Com Shadow
                    </button>
                  </div>
                </div>

                {/* Section 3: Foreground Filters */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Subject Filters</h2>
                  </div>
                  <div className="flex gap-2 pb-2 overflow-x-auto custom-scrollbar snap-x">
                    {(Object.keys(FILTER_MAP) as FilterPreset[]).map(preset => (
                      <button 
                        key={preset}
                        onClick={() => setActiveFilter(preset)}
                        className={`flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest snap-start transition-all border ${
                          activeFilter === preset ? 'bg-pink-500/20 border-pink-500 text-pink-400' : 'bg-black/50 border-white/10 hover:bg-white/5 text-white/50'
                        }`}
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Section 4: Sub-settings based on mode */}
                {bgMode === 'solid' && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Base Fill Color</label>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                  </div>
                )}

                {['gradient', 'instagram_dp', 'facebook_dp', 'linkedin_dp', 'youtube_thumb'].includes(bgMode) && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-top-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2 col-span-1">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">Gradient Start</label>
                       <input type="color" value={gradientStart} onChange={(e) => setGradientStart(e.target.value)} className="w-full h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                    </div>
                    <div className="space-y-2 col-span-1">
                       <label className="text-[9px] font-bold uppercase tracking-widest text-white/50">Gradient End</label>
                       <input type="color" value={gradientEnd} onChange={(e) => setGradientEnd(e.target.value)} className="w-full h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                    </div>
                  </div>
                )}
                
                {bgMode === 'product_studio' && (
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-top-2 text-center text-[10px] text-white/50 uppercase tracking-widest leading-relaxed">
                     <CheckCircle2 className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                     Smart Environment active.<br/>Drop shadows and depth calculated.
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}
      </main>
      
      {/* Hidden File Input */}
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />

      {/* SEO Content Structure - Optimized for Google Search Strategy */}
      <section className="bg-black border-t border-white/5 py-24 px-4 relative z-10" itemScope itemType="https://schema.org/WebPage">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-white" itemProp="headline">Free AI Background Remover Online</h2>
             <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed" itemProp="description">
               Remove backgrounds from images instantly for free with AuraCut AI. Built for professionals, our tool uses on-device WebAssembly machine learning to cut out subjects completely offline. No subscriptions, zero watermarks, and no cloud uploads.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                <h3 className="text-white font-bold text-lg">100% Private Offline Processing</h3>
                <p className="text-sm text-white/50 leading-relaxed">Unlike generic background removers that upload your files, your photos never leave your device. The AI neural network runs entirely inside your local browser memory ensuring enterprise-grade privacy.</p>
             </div>
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <h3 className="text-white font-bold text-lg">E-Commerce Product Shadows</h3>
                <p className="text-sm text-white/50 leading-relaxed">Generate stunning e-commerce product showrooms instantly. Our AI calculates soft drop shadows and generates professional curved portrait backdrops perfect for WooCommerce or Shopify.</p>
             </div>
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <Circle className="w-8 h-8 text-pink-400" />
                <h3 className="text-white font-bold text-lg">WhatsApp & Social PFP Maker</h3>
                <p className="text-sm text-white/50 leading-relaxed">Create the perfect WhatsApp DP or Instagram profile picture. Upload a selfie and our PFP Ring Mode naturally centers your face and applies a high-resolution gradient ring.</p>
             </div>
          </div>

          {/* Highly Ranked SEO FAQ Schema Section */}
          <div className="pt-12 border-t border-white/10" itemScope itemType="https://schema.org/FAQPage">
             <h2 className="text-2xl font-black mb-8 text-center text-white">Frequently Asked Questions</h2>
             <div className="space-y-6">
                <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                   <h3 className="text-lg font-bold text-white mb-2" itemProp="name">How do I remove the background from an image for free?</h3>
                   <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p className="text-white/50 leading-relaxed" itemProp="text">Simply drag and drop your image (JPG, PNG, or WebP) into the AuraCut AI upload box above. The advanced neuronal web logic will automatically detect the foreground subject, extract the background, and provide you with a transparent PNG ready for download instantly—all at absolutely zero cost.</p>
                   </div>
                </div>
                <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                   <h3 className="text-lg font-bold text-white mb-2" itemProp="name">Is AuraCut AI truly private and safe to use?</h3>
                   <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p className="text-white/50 leading-relaxed" itemProp="text">Yes. Unlike standard cloud-based background removers, AuraCut AI runs the entire deep-learning model locally inside your browser utilizing WebAssembly. Your images are never uploaded to our servers, ensuring your strict data privacy remains unbroken.</p>
                   </div>
                </div>
                <div className="bg-[#050505] border border-white/5 p-6 rounded-2xl" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                   <h3 className="text-lg font-bold text-white mb-2" itemProp="name">Can I use this tool to create YouTube Thumbnails?</h3>
                   <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                      <p className="text-white/50 leading-relaxed" itemProp="text">Absolutely! AuraCut AI includes specialized 16:9 canvas settings via our Custom Environment panel. Just click the "YouTube Thumbnail Pro" preset, adjust your extracted subject's size, pick a dramatic gradient filter, and export a ready-to-use thumbnail natively.</p>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>
      
      <Footer />
    </div>
    </>
  );
}
