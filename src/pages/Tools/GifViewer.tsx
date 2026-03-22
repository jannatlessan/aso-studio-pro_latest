import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { 
  Image as ImageIcon, Download, Upload, ChevronLeft, RefreshCcw, 
  ShieldCheck, Loader2, PlaySquare, Settings2, SkipForward, Maximize,
  SlidersHorizontal, CheckCircle2, Sparkles, FileBox, Camera
} from 'lucide-react';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import AdBlockDetector from '../../components/AdBlockDetector';

type ProcessState = 'idle' | 'loading_engine' | 'processing' | 'done' | 'error';

let ffmpegInstance: FFmpeg | null = null;
let hasLoadedEngineThisSession = false;

export default function GifViewer() {
  const [processState, setProcessState] = useState<ProcessState>('idle');
  const [progressText, setProgressText] = useState('');
  const [simulatedProgress, setSimulatedProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [originalGifFile, setOriginalGifFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [extractedFrameUrl, setExtractedFrameUrl] = useState<string | null>(null);
  const [exportName, setExportName] = useState('aura-gif-export');
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Smooth Loading Effect simulator
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (processState === 'loading_engine' || processState === 'processing') {
       interval = setInterval(() => {
          setSimulatedProgress(prev => {
             if (prev >= 95) return 95;
             const remaining = 95 - prev;
             const increment = Math.max(0.1, remaining * 0.02);
             return prev + increment;
          });
       }, 100);
    } else if (processState === 'done') {
       setSimulatedProgress(100);
    } else {
       setSimulatedProgress(0);
    }
    return () => clearInterval(interval);
  }, [processState]);

  // Engaging Messages Rotator Effect for Processing
  useEffect(() => {
     let interval: ReturnType<typeof setInterval>;
     const ENGAGING_MESSAGES = [
        "Analyzing GIF structures...",
        "Decompressing LZW data blocks...",
        "Mapping logical screen descriptors...",
        "Transcribing temporal loops into MP4...",
        "Optimizing playback buffer..."
     ];
     let msgIndex = 0;
     if (processState === 'processing') {
        setProgressText(ENGAGING_MESSAGES[0]);
        interval = setInterval(() => {
           msgIndex = (msgIndex + 1) % ENGAGING_MESSAGES.length;
           setProgressText(ENGAGING_MESSAGES[msgIndex]);
        }, 1500); 
     } else if (processState === 'loading_engine') {
        setProgressText(hasLoadedEngineThisSession ? 'Waking up memory buffers...' : 'Loading secure playback engine...');
     }
     return () => clearInterval(interval);
  }, [processState]);

  const loadFFmpeg = async () => {
    if (ffmpegInstance) return ffmpegInstance;
    const ffmpeg = new FFmpeg();
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    
    ffmpegInstance = ffmpeg;
    hasLoadedEngineThisSession = true;
    return ffmpeg;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOriginalGifFile(file);
    setProcessState('loading_engine');
    setErrorMsg('');

    try {
      const ffmpeg = await loadFFmpeg();
      
      setProcessState('processing');
      // Write the file to memory
      await ffmpeg.writeFile('input.gif', await fetchFile(file));

      // Fast web-optimized MP4 transcoding to allow native browser Play/Pause & Scrubbing
      // -movflags faststart: allows immediate playback
      // -pix_fmt yuv420p: universal browser support
      // -vf "scale=trunc(iw/2)*2:trunc(ih/2)*2": Ensures dimensions are divisible by 2 (required for MP4 containers)
      await ffmpeg.exec([
        '-f', 'gif',
        '-i', 'input.gif',
        '-movflags', 'faststart',
        '-pix_fmt', 'yuv420p',
        '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2',
        'output.mp4'
      ]);

      const data = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([data as any], { type: 'video/mp4' });
      const convertedUrl = URL.createObjectURL(blob);

      setVideoUrl(convertedUrl);
      setExtractedFrameUrl(null);
      setProcessState('done');
      
      const baseName = file.name.substring(0, file.name.lastIndexOf('.')) || 'animation';
      setExportName(`${baseName}-aura-video`);
      
      // Cleanup WASM memory
      await ffmpeg.deleteFile('input.gif');
      await ffmpeg.deleteFile('output.mp4');

    } catch (err: any) {
      console.error(err);
      setProcessState('error');
      setErrorMsg(err.message || 'An error occurred while compiling the GIF structure. The file might be corrupted.');
    }
  };

  const extractCurrentFrame = () => {
     if (!videoRef.current || !canvasRef.current) return;
     const video = videoRef.current;
     const canvas = canvasRef.current;
     
     // Set canvas strictly to intrinsic video dimensions for highest clarity
     canvas.width = video.videoWidth;
     canvas.height = video.videoHeight;
     
     const ctx = canvas.getContext('2d');
     if (!ctx) return;
     
     ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
     const frameUrl = canvas.toDataURL('image/png', 1.0); // Extreme pristine PNG quality
     setExtractedFrameUrl(frameUrl);
  };

  const resetAll = () => {
    setOriginalGifFile(null);
    setVideoUrl(null);
    setExtractedFrameUrl(null);
    setProcessState('idle');
  };

  return (
    <>
      <AdBlockDetector />
      <div className="min-h-screen bg-[#020202] text-white selection:bg-sky-500/30 font-sans">
      <SEO 
        title="AuraCut Studio | GIF to Video Converter & Viewer"
        description="Upload any GIF to perfectly pause, rewind, scrub frame-by-frame, and convert to high-definition MP4 video. Extract ultra high-definition PNG frame slices. 100% free and fully private offline processing."
        url="https://shaaddev.studio/tools/gif-viewer"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/tools" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <ChevronLeft className="w-5 h-5 text-white/60 group-hover:text-white" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center border border-white/10 shadow-[0_0_15px_rgba(14,165,233,0.3)]">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-widest bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">GIF Studio Viewer</h1>
                <p className="text-[10px] text-sky-400 font-bold tracking-widest uppercase">100% Secure Local Engine</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetAll} className="h-8 px-4 text-xs font-bold bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors flex items-center gap-2 uppercase tracking-widest hidden sm:flex">
              <RefreshCcw className="w-3 h-3" /> Reset
            </button>
            {videoUrl && (
              <a href={videoUrl} download={`${exportName}.mp4`} className="h-8 px-5 text-xs font-bold bg-sky-500 hover:bg-sky-400 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(14,165,233,0.3)] uppercase tracking-widest animate-in fade-in zoom-in">
                <PlaySquare className="w-3 h-3" /> Download MP4
              </a>
            )}
            {extractedFrameUrl && (
              <a href={extractedFrameUrl} download={`${exportName}-frame.png`} className="h-8 px-5 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 rounded-lg transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] uppercase tracking-widest animate-in fade-in zoom-in">
                <Download className="w-3 h-3" /> Download High-Res Frame
              </a>
            )}
          </div>
        </div>
      </nav>

      <main className="pt-20 pb-24 min-h-[90vh] flex flex-col items-center justify-center p-4">
        
        {/* State: Idle / Setup */}
        {processState === 'idle' && !videoUrl && (
          <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Instant Frame Precision
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-sky-500/50 pb-2">
              Pause. Inspect.<br/>Convert GIFs.
            </h2>
            
            <p className="text-white/40 max-w-xl mx-auto text-lg leading-relaxed font-medium">
              Native animated GIFs cannot be paused or edited. Upload your GIF here to instantly unlock timeline scrubbing, MP4 video conversion, and high-definition PNG frame extraction.
            </p>

            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                 e.preventDefault();
                 const file = e.dataTransfer.files?.[0];
                 if (file && (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif'))) {
                    const dt = new DataTransfer();
                    dt.items.add(file);
                    if (fileInputRef.current) {
                        fileInputRef.current.files = dt.files;
                        handleFileUpload({ target: fileInputRef.current } as any);
                    }
                 }
              }}
              onClick={() => fileInputRef.current?.click()}
              className="relative group cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-indigo-600/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-100"></div>
              <div className="relative border-2 border-dashed border-sky-500/30 hover:border-sky-500 rounded-3xl p-16 bg-[#050505]/80 backdrop-blur-sm transition-all flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-sky-500/20 to-indigo-600/20 border border-sky-500/30 flex items-center justify-center relative overflow-hidden">
                  <Upload className="w-8 h-8 text-sky-400 z-10" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-sky-500/20 to-transparent"></div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Upload GIF Animation</h3>
                  <p className="text-sm text-white/40 font-medium">Drag & drop your file here, or click to browse</p>
                  <p className="text-xs text-white/30 mt-2 font-mono">Strictly requires .gif format</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sky-400/80 text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Zero Cloud Dependency &middot; 100% Edge Processing
            </div>
          </div>
        )}

        {/* State: Loading & Processing */}
        {(processState === 'loading_engine' || processState === 'processing') && (
          <div className="w-full max-w-md p-10 bg-[#050505] border border-white/5 rounded-3xl shadow-2xl space-y-8 animate-in zoom-in-95 duration-500 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-white/5">
               <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 transition-all duration-300" style={{ width: `${Math.round(simulatedProgress)}%` }}></div>
            </div>
            
            <Loader2 className="w-16 h-16 text-sky-500 animate-spin mx-auto" />
            
            <div className="space-y-4">
              <h3 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/50 animate-pulse">{progressText}</h3>
              <p className="text-xs text-white/40 uppercase tracking-widest font-mono">{Math.round(simulatedProgress)}% Complete</p>
            </div>
            
            <div className="pt-4 border-t border-white/5">
              <p className="text-[10px] text-amber-500/80 font-bold uppercase tracking-widest leading-relaxed flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Please do not close or refresh this tab
              </p>
            </div>
          </div>
        )}

        {/* State: Studio Configurator / Active Extractor */}
        {processState === 'done' && videoUrl && (
          <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Visual Scrubbing Canvas */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#050505] rounded-3xl border border-white/5 relative overflow-hidden min-h-[400px] xl:min-h-[700px]">
               <div className="absolute inset-0 pattern-dots pattern-white outline-none opacity-[0.02]"></div>
               
               <div className="relative z-10 w-full flex flex-col items-center justify-center gap-4">
                  <video 
                    ref={videoRef}
                    src={videoUrl} 
                    controls
                    autoPlay
                    loop
                    controlsList="nodownload"
                    className="w-full h-full max-w-5xl max-h-[65vh] rounded-xl border border-white/10 shadow-[0_0_50px_rgba(14,165,233,0.15)] bg-black"
                  />
                  <div className="px-6 py-4 bg-black/80 backdrop-blur-sm border border-white/10 rounded-2xl w-full max-w-2xl text-center space-y-2">
                     <p className="text-sky-400 font-bold text-sm tracking-wide uppercase">Interactive Master Editor</p>
                     <p className="text-white/50 text-xs">Use the timeline controls above to meticulously scrub through your GIF frame by frame. When you spot the exact frame you want, pause the video and hit Extract.</p>
                  </div>
               </div>
            </div>

            {/* Master Extraction Panel */}
            <div className="lg:col-span-4 xl:col-span-3 bg-[#050505] rounded-3xl border border-white/5 shadow-xl p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-8 flex-1">
                
                <div className="space-y-4">
                   <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                     <PlaySquare className="w-4 h-4 text-sky-400" />
                     <h2 className="font-black text-xs uppercase tracking-widest text-white/90">GIF to Video</h2>
                   </div>
                   <div className="p-4 bg-sky-500/5 border border-sky-500/20 rounded-xl space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40">Export Filename</label>
                        <input 
                          type="text" 
                          value={exportName} 
                          onChange={(e) => setExportName(e.target.value)} 
                          className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:border-sky-500 outline-none transition-colors"
                        />
                      </div>
                      <a href={videoUrl} download={`${exportName}.mp4`} className="w-full flex items-center justify-center gap-3 bg-sky-600 hover:bg-sky-500 py-3 rounded-lg shadow-lg transition-all border border-sky-400/20 font-black uppercase tracking-widest text-xs group">
                        <PlaySquare className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                        Download as MP4
                      </a>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                     <Camera className="w-4 h-4 text-emerald-400" />
                     <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Frame Extender</h2>
                   </div>
                   <button onClick={extractCurrentFrame} className="w-full flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 py-6 rounded-xl shadow-[0_0_30px_rgba(16,185,129,0.2)] transition-all border border-emerald-500/20 group">
                     <Camera className="w-8 h-8 text-white mb-1 group-hover:scale-110 transition-transform duration-300"/>
                     <span className="font-black uppercase tracking-widest text-sm drop-shadow-md">Capture Frame</span>
                     <span className="text-[10px] text-emerald-200/50 uppercase tracking-widest font-bold">at current timeline position</span>
                   </button>
                </div>

                {extractedFrameUrl && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                      <ImageIcon className="w-4 h-4 text-sky-400" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-white/90">Extracted Canvas</h2>
                    </div>
                    <div className="relative rounded-xl border border-white/10 overflow-hidden bg-black aspect-video flex items-center justify-center p-2 group">
                       <img src={extractedFrameUrl} alt="Captured frame fragment" className="max-w-full max-h-full rounded-md object-contain shadow-2xl" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={extractedFrameUrl} download={`aura-gif-frame-${Date.now()}.png`} className="px-4 py-2 bg-sky-500 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-sky-400 transition-colors">Download PNG</a>
                       </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        )}

        {/* Error Block */}
        {processState === 'error' && (
           <div className="w-full max-w-lg p-8 bg-red-500/10 border border-red-500/20 rounded-3xl text-center space-y-4 mt-8">
              <h3 className="text-xl font-bold text-red-400">Interpreter Engine Failed</h3>
              <p className="text-sm text-red-300/80">{errorMsg}</p>
              <button onClick={() => setProcessState('idle')} className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors">Upload a different file & Retry</button>
           </div>
        )}
      </main>
      
      {/* Hidden processing canvas used for instant high-def PNG extractions without FFmpeg overhead */}
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/gif" className="hidden" />

      {/* SEO Environment block */}
      <section className="bg-black border-t border-white/5 py-24 px-4 relative z-10" itemScope itemType="https://schema.org/WebPage">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
             <h2 className="text-4xl md:text-6xl font-black text-white leading-tight" itemProp="headline">The Best Online GIF Viewer & GIF to Video Converter</h2>
             <p className="text-white/60 text-lg md:text-xl leading-relaxed" itemProp="description">
               Natively, internet browsers cannot pause or scrub animated GIFs. We solved that. Upload any standard .gif archive here to instantly pause the animation, scrub linearly through the temporal timeline frame-by-frame, convert your GIF to MP4 video, and extract absolute high-definition PNG splices instantly to your local machine. Absolutely zero cloud tracking and zero server limits.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                <PlaySquare className="w-8 h-8 text-sky-400" />
                <h3 className="text-white font-bold">Unrestricted Playback Control</h3>
                <p className="text-sm text-white/50">Gain the granular ability to formally pause, resume, and linearly scrub animations exactly as if they were standard MP4 videos.</p>
             </div>
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                <Camera className="w-8 h-8 text-emerald-400" />
                <h3 className="text-white font-bold">Meticulous Frame Extraction</h3>
                <p className="text-sm text-white/50">Capture absolute split-second microframes from your loops seamlessly and export them instantly as pristine lossless .png images.</p>
             </div>
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                <ShieldCheck className="w-8 h-8 text-indigo-400" />
                <h3 className="text-white font-bold">Client-Side Edge Security</h3>
                <p className="text-sm text-white/50">Your files legally never leave your local RAM. We execute the FFmpeg compiler locally inside your browser architecture natively.</p>
             </div>
             <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl space-y-4">
                <CheckCircle2 className="w-8 h-8 text-teal-400" />
                <h3 className="text-white font-bold">Always Free. No Watermarks.</h3>
                <p className="text-sm text-white/50">AuraCut does not inject paywalls or annoying corporate watermarks into your highly valuable extracted frame content outputs.</p>
             </div>
          </div>

          <div className="space-y-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-black text-white text-center">Frequently Asked Questions</h3>
            <div className="grid gap-6" itemScope itemType="https://schema.org/FAQPage">
               <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <PlaySquare className="w-8 h-8 text-sky-400 shrink-0" />
                     <h4 className="text-white font-extrabold text-xl" itemProp="name">Why can't I normally pause a GIF on my computer?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-white/50 leading-relaxed" itemProp="text">The GIF (Graphics Interchange Format) architecture was explicitly designed in the 1980s as a static bitmap image sequence format without a native temporal playback container. Most standard desktop environments and browsers implement basic "infinite loop" parsers that legally offer zero external control methods to stop, reverse, or edit the sequence dynamically without advanced software installed.</p>
                  </div>
               </div>
               <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <Camera className="w-8 h-8 text-emerald-400 shrink-0" />
                     <h4 className="text-white font-extrabold text-xl" itemProp="name">How does AuraCut extract the exact frame without losing quality?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-white/50 leading-relaxed" itemProp="text">When you drop your GIF into our viewer, our secure offline pipeline injects an FFmpeg WebAssembly terminal into your session to convert the archaic graphics sequence into a fluid, highly-compliant modern MP4 stream. When you click extract, our engine generates an HTML5 Canvas node mathematically mapped to the precise intrinsic aspect ratio of your video and copies the exact pixel RGB values of that given millisecond.</p>
                  </div>
               </div>
               <div className="bg-[#050505] border border-white/5 p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <ShieldCheck className="w-8 h-8 text-indigo-400 shrink-0" />
                     <h4 className="text-white font-extrabold text-xl" itemProp="name">Is my uploaded GIF saved to a public server?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-white/50 leading-relaxed" itemProp="text">No, absolutely not. Because we implement bleeding-edge edge-compute technologies, all logic is handled natively by your device's physical CPU. Even if you drastically disconnect your WiFI immediately after the engine initializes, our tools will continue running perfectly because your data never transfers through a cloud environment.</p>
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
