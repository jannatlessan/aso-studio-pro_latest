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
  Palette
} from 'lucide-react';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AdBlockDetector from '../../components/AdBlockDetector';

// We'll manage processing state intricately here
type ProcessState = 'idle' | 'loading_model' | 'processing' | 'done' | 'error';
type BackgroundMode = 'transparent' | 'solid' | 'gradient' | 'product_studio' | 'pfp_ring';

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
  
  const [edgeFeather, setEdgeFeather] = useState(1);
  const [dropShadow, setDropShadow] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    canvas.width = processed.width;
    canvas.height = processed.height;

    // Background Rendering
    if (bgMode === 'solid') {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgMode === 'gradient' || bgMode === 'pfp_ring') {
      const grad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      grad.addColorStop(0, gradientStart);
      grad.addColorStop(1, gradientEnd);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else if (bgMode === 'product_studio') {
      const grad = ctx.createRadialGradient(
        canvas.width / 2, canvas.height, 0,
        canvas.width / 2, canvas.height, canvas.height
      );
      grad.addColorStop(0, '#333333');
      grad.addColorStop(1, '#000000');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    if (bgMode === 'pfp_ring') {
       ctx.beginPath();
       ctx.arc(canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) * 0.45, 0, Math.PI * 2);
       ctx.lineWidth = canvas.width * 0.02;
       ctx.strokeStyle = '#ffffff';
       ctx.stroke();
       ctx.clip(); 
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = processed.cutoutUrl;
    await new Promise(resolve => img.onload = resolve);

    ctx.save();
    if (bgMode === 'product_studio') {
       ctx.shadowColor = 'rgba(0,0,0,0.8)';
       ctx.shadowBlur = canvas.width * 0.05;
       ctx.shadowOffsetY = canvas.height * 0.05;
       ctx.translate(0, -canvas.height * 0.05);
    } else if (bgMode === 'pfp_ring') {
       const scale = 0.9;
       ctx.translate(canvas.width * (1-scale)/2, canvas.height * (1-scale)/2);
       ctx.scale(scale, scale);
    }
    
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    const dataUrl = canvas.toDataURL(bgMode === 'transparent' ? 'image/png' : 'image/jpeg', 0.95);
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `studio-cutout-${Date.now()}.${bgMode === 'transparent' ? 'png' : 'jpg'}`;
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
        publicPath: 'https://static.imgly.com/@imgly/background-removal-data/1.7.0/dist/',
        progress: (key, current, total) => {
          if (key === 'compute:inference') {
            setProcessState('processing');
            setProgressText('Extracting Foreground...');
          } else {
            setProgressText(`Loading Local AI Model (${key})...`);
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
                <h1 className="text-sm font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">AI Cutout Pro</h1>
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
              <Sparkles className="w-3 h-3" /> Next-Gen Offline AI Model
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-indigo-500/50 pb-2">
              Flawless Cutouts.<br/>Zero Servers.
            </h2>
            
            <p className="text-white/40 max-w-xl mx-auto text-lg leading-relaxed font-medium">
              Drop an image below to magically remove the background using high-fidelity neural networks running directly inside your browser GPU.
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
            
            {processState === 'loading_model' && (
               <p className="text-[10px] text-white/30 uppercase tracking-widest mt-4">
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
          <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Visual Canvas Layout */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center p-4 bg-[#050505] rounded-3xl border border-white/5 relative overflow-hidden">
               <div className="absolute inset-0 pattern-dots pattern-white outline-none opacity-[0.02]"></div>
               
               <div className={`relative w-full max-w-3xl border shadow-2xl flex items-center justify-center overflow-hidden transition-all duration-500 ${bgMode === 'pfp_ring' ? 'aspect-square rounded-full border-white/20' : 'aspect-video rounded-2xl border-white/10'}`} 
                 style={{
                    background: bgMode === 'transparent' ? 'repeating-conic-gradient(#111 0% 25%, transparent 0% 50%) 50% / 20px 20px' :
                                bgMode === 'solid' ? bgColor :
                                bgMode === 'gradient' ? `linear-gradient(135deg, ${gradientStart}, ${gradientEnd})` :
                                bgMode === 'product_studio' ? 'radial-gradient(ellipse at bottom, #333 0%, #000 100%)' :
                                bgMode === 'pfp_ring' ? `linear-gradient(to bottom right, ${gradientStart}, ${gradientEnd})` : 'transparent'
                 }}>
                 
                 <img 
                   src={processed.cutoutUrl} 
                   className={`relative z-10 w-full h-full object-contain pointer-events-none transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                     bgMode === 'product_studio' ? 'drop-shadow-2xl translate-y-[-5%]' : 
                     bgMode === 'pfp_ring' ? 'rounded-full scale-[0.85] drop-shadow-2xl' : ''
                   }`} 
                   alt="Studio Cutout" 
                 />

                 {/* Simulated Environment Reflections */}
                 {bgMode === 'product_studio' && (
                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-white/5 to-transparent z-0 blur-md"></div>
                 )}
                 {bgMode === 'pfp_ring' && (
                    <div className="absolute inset-0 rounded-full border-[8px] border-white/20 z-20 pointer-events-none"></div>
                 )}
               </div>
            </div>

            {/* Pro Studio Settings Panel */}
            <div className="lg:col-span-4 xl:col-span-3 bg-[#050505] rounded-3xl border border-white/5 shadow-xl p-6 flex flex-col h-[600px] overflow-y-auto custom-scrollbar">
              <div className="flex items-center gap-2 border-b border-white/10 pb-4 mb-6">
                <Palette className="w-5 h-5 text-indigo-400" />
                <h2 className="font-black text-sm uppercase tracking-widest text-white/90">Studio Environment</h2>
              </div>

              <div className="space-y-6 flex-1">
                {/* Mode Selector */}
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setBgMode('transparent')} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'transparent' ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] text-indigo-400' : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'}`}>
                    <Square className="w-4 h-4 dashed stroke-[1.5]" /> Transparent
                  </button>
                  <button onClick={() => setBgMode('solid')} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'solid' ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] text-indigo-400' : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'}`}>
                    <Square className="w-4 h-4 fill-current" /> Solid Base
                  </button>
                  <button onClick={() => setBgMode('gradient')} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'gradient' ? 'bg-indigo-500/20 border-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.3)] text-indigo-400' : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'}`}>
                    <Layers className="w-4 h-4" /> Gradient UI
                  </button>
                  <button onClick={() => setBgMode('product_studio')} className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'product_studio' ? 'bg-purple-500/20 border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.3)] text-purple-400' : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'}`}>
                    <ImageIcon className="w-4 h-4" /> Product Studio
                  </button>
                  <button onClick={() => setBgMode('pfp_ring')} className={`col-span-2 flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border text-[10px] font-bold uppercase tracking-widest gap-2 transition-all ${bgMode === 'pfp_ring' ? 'bg-pink-500/20 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.3)] text-pink-400' : 'bg-black/50 border-white/10 text-white/50 hover:bg-white/5'}`}>
                    <Circle className="w-4 h-4" /> Profile Picture Ring Mode
                  </button>
                </div>

                {/* Sub-settings based on mode */}
                {bgMode === 'solid' && (
                  <div className="space-y-4 p-4 bg-white/5 rounded-xl border border-white/5 animate-in slide-in-from-top-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/50">Base Fill Color</label>
                    <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-full h-10 rounded-lg border-none cursor-pointer bg-transparent" />
                  </div>
                )}

                {(bgMode === 'gradient' || bgMode === 'pfp_ring') && (
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

      {/* SEO Content Structure */}
      <section className="bg-black border-t border-white/5 py-24 px-4 relative z-10">
        <div className="max-w-4xl mx-auto space-y-16">
          <div className="text-center space-y-4">
             <h2 className="text-3xl md:text-5xl font-black text-white">The Ultimate Free Background Remover</h2>
             <p className="text-white/60 text-lg max-w-2xl mx-auto leading-relaxed">
               Built for uncompromising professionals. Our tool extracts exquisite foreground details leveraging state-of-the-art WebAssembly machine learning—all entirely for free, forever.
             </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                <h3 className="text-white font-bold text-lg">100% Private</h3>
                <p className="text-sm text-white/50 leading-relaxed">Unlike generic background removers, your photos never leave your device. The AI neural network runs entirely inside your local browser memory.</p>
             </div>
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <Sparkles className="w-8 h-8 text-purple-400" />
                <h3 className="text-white font-bold text-lg">Pro Studio Generator</h3>
                <p className="text-sm text-white/50 leading-relaxed">Automatically generate stunning e-commerce product showrooms with algorithmically calculated soft drop shadows and curved studio drops.</p>
             </div>
             <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4">
                <Circle className="w-8 h-8 text-pink-400" />
                <h3 className="text-white font-bold text-lg">Instant PFP Maker</h3>
                <p className="text-sm text-white/50 leading-relaxed">Upload a selfie and our PFP Ring Mode will instantly center your face, mask the background, and wrap it in a glowing high-resolution ring.</p>
             </div>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
    </>
  );
}
