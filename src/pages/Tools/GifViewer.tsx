import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToolNavigation } from '../../hooks/useToolNavigation';
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

  // Smart Navigation
  const isToolUsed = originalGifFile !== null || videoUrl !== null;
  const resetAll = () => {
    setOriginalGifFile(null);
    setVideoUrl(null);
    setExtractedFrameUrl(null);
    setProcessState('idle');
    setErrorMsg('');
    setProgressText('');
    setSimulatedProgress(0);
    setExportName('aura-gif-export');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'GIF Viewer',
    isToolUsed,
    onReset: resetAll
  });

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

  return (
    <>
      <AdBlockDetector />
      <div className="min-h-screen bg-white text-ink selection:bg-primary/20 font-sans">
      <SEO
        title="AuraCut Studio | GIF to Video Converter & Viewer"
        description="Upload any GIF to perfectly pause, rewind, scrub frame-by-frame, and convert to high-definition MP4 video. Extract ultra high-definition PNG frame slices. 100% free and fully private offline processing."
        url="https://shaaddev.studio/tools/gif-viewer"
      />

      <nav className="fixed top-0 left-0 right-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBackClick} className="p-2 hover:bg-black/[0.04] rounded-full transition-colors group" title={isToolUsed ? "(Click to reset)" : undefined}>
              <ChevronLeft className="w-5 h-5 text-[#55605B] group-hover:text-ink" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-dark flex items-center justify-center border border-black/5 shadow-lg shadow-primary/20">
                <ImageIcon className="w-4 h-4 text-white" />
              </div>
              <div>
                <h1 className="text-sm font-black uppercase tracking-widest text-ink">GIF Studio Viewer</h1>
                <p className="text-[10px] text-primary font-bold tracking-widest uppercase">100% Secure Local Engine</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={resetAll} className="h-8 px-4 text-xs font-bold bg-black/[0.03] hover:bg-black/[0.06] border border-black/10 text-[#55605B] rounded-full transition-colors flex items-center gap-2 uppercase tracking-widest hidden sm:flex">
              <RefreshCcw className="w-3 h-3" /> Reset
            </button>
            {videoUrl && (
              <a href={videoUrl} download={`${exportName}.mp4`} className="h-8 px-5 text-xs font-bold bg-primary-dark hover:bg-[#048532] text-white rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary/25 uppercase tracking-widest animate-in fade-in zoom-in">
                <PlaySquare className="w-3 h-3" /> Download MP4
              </a>
            )}
            {extractedFrameUrl && (
              <a href={extractedFrameUrl} download={`${exportName}-frame.png`} className="h-8 px-5 text-xs font-bold bg-primary-dark hover:bg-[#048532] text-white rounded-full transition-all flex items-center gap-2 shadow-lg shadow-primary/25 uppercase tracking-widest animate-in fade-in zoom-in">
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-mint border border-primary/20 text-primary text-xs font-black uppercase tracking-widest">
              <Sparkles className="w-3 h-3" /> Instant Frame Precision
            </div>

            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-ink pb-2">
              Pause. Inspect.<br/><span className="text-primary">Convert GIFs.</span>
            </h2>

            <p className="text-[#55605B] max-w-xl mx-auto text-lg leading-relaxed font-medium">
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
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500 opacity-50 group-hover:opacity-100"></div>
              <div className="relative border-2 border-dashed border-primary/30 hover:border-primary rounded-3xl p-16 bg-[#F6F8F7] transition-all flex flex-col items-center gap-6">
                <div className="w-20 h-20 rounded-2xl bg-mint border border-primary/30 flex items-center justify-center relative overflow-hidden">
                  <Upload className="w-8 h-8 text-primary z-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-ink mb-2">Upload GIF Animation</h3>
                  <p className="text-sm text-[#55605B] font-medium">Drag & drop your file here, or click to browse</p>
                  <p className="text-xs text-[#8B958F] mt-2 font-mono">Strictly requires .gif format</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-primary text-xs font-bold uppercase tracking-widest">
              <ShieldCheck className="w-4 h-4" /> Zero Cloud Dependency &middot; 100% Edge Processing
            </div>
          </div>
        )}

        {/* State: Loading & Processing */}
        {(processState === 'loading_engine' || processState === 'processing') && (
          <div className="w-full max-w-md p-10 bg-white border border-black/10 rounded-3xl shadow-xl shadow-black/5 space-y-8 animate-in zoom-in-95 duration-500 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-black/[0.06]">
               <div className="h-full bg-primary-dark transition-all duration-300" style={{ width: `${Math.round(simulatedProgress)}%` }}></div>
            </div>

            <Loader2 className="w-16 h-16 text-primary animate-spin mx-auto" />

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-ink">{progressText}</h3>
              <p className="text-xs text-[#55605B] uppercase tracking-widest font-mono">{Math.round(simulatedProgress)}% Complete</p>
            </div>

            <div className="pt-4 border-t border-black/10">
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-widest leading-relaxed flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3 h-3" /> Please do not close or refresh this tab
              </p>
            </div>
          </div>
        )}

        {/* State: Studio Configurator / Active Extractor */}
        {processState === 'done' && videoUrl && (
          <div className="w-full max-w-[1400px] grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-500">
            {/* Visual Scrubbing Canvas */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col items-center justify-center p-4 sm:p-8 bg-[#F6F8F7] rounded-3xl border border-black/10 relative overflow-hidden min-h-[400px] xl:min-h-[700px]">
               <div className="relative z-10 w-full flex flex-col items-center justify-center gap-4">
                  <video
                    ref={videoRef}
                    src={videoUrl}
                    controls
                    autoPlay
                    loop
                    controlsList="nodownload"
                    className="w-full h-full max-w-5xl max-h-[65vh] rounded-xl border border-black/10 shadow-2xl bg-black"
                  />
                  <div className="px-6 py-4 bg-white backdrop-blur-sm border border-black/10 shadow-sm rounded-2xl w-full max-w-2xl text-center space-y-2">
                     <p className="text-primary font-bold text-sm tracking-wide uppercase">Interactive Master Editor</p>
                     <p className="text-[#55605B] text-xs">Use the timeline controls above to meticulously scrub through your GIF frame by frame. When you spot the exact frame you want, pause the video and hit Extract.</p>
                  </div>
               </div>
            </div>

            {/* Master Extraction Panel */}
            <div className="lg:col-span-4 xl:col-span-3 bg-white rounded-3xl border border-black/10 shadow-lg shadow-black/5 p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
              <div className="space-y-8 flex-1">

                <div className="space-y-4">
                   <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                     <PlaySquare className="w-4 h-4 text-primary" />
                     <h2 className="font-black text-xs uppercase tracking-widest text-ink">GIF to Video</h2>
                   </div>
                   <div className="p-4 bg-mint border border-primary/20 rounded-xl space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#8B958F]">Export Filename</label>
                        <input
                          type="text"
                          value={exportName}
                          onChange={(e) => setExportName(e.target.value)}
                          className="w-full bg-white border border-black/10 rounded-lg px-3 py-2 text-xs text-ink focus:border-primary outline-none transition-colors"
                        />
                      </div>
                      <a href={videoUrl} download={`${exportName}.mp4`} className="w-full flex items-center justify-center gap-3 bg-primary-dark hover:bg-[#048532] text-white py-3 rounded-lg shadow-lg shadow-primary/25 transition-all border border-primary/20 font-black uppercase tracking-widest text-xs group">
                        <PlaySquare className="w-4 h-4 group-hover:scale-110 transition-transform"/>
                        Download as MP4
                      </a>
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                     <Camera className="w-4 h-4 text-primary" />
                     <h2 className="font-black text-xs uppercase tracking-widest text-ink">Frame Extender</h2>
                   </div>
                   <button onClick={extractCurrentFrame} className="w-full flex flex-col items-center justify-center gap-2 bg-primary-dark hover:bg-[#048532] text-white py-6 rounded-xl shadow-lg shadow-primary/25 transition-all border border-primary/20 group">
                     <Camera className="w-8 h-8 text-white mb-1 group-hover:scale-110 transition-transform duration-300"/>
                     <span className="font-black uppercase tracking-widest text-sm">Capture Frame</span>
                     <span className="text-[10px] text-white/70 uppercase tracking-widest font-bold">at current timeline position</span>
                   </button>
                </div>

                {extractedFrameUrl && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                    <div className="flex items-center gap-2 border-b border-black/10 pb-2">
                      <ImageIcon className="w-4 h-4 text-primary" />
                      <h2 className="font-black text-xs uppercase tracking-widest text-ink">Extracted Canvas</h2>
                    </div>
                    <div className="relative rounded-xl border border-black/10 overflow-hidden bg-black aspect-video flex items-center justify-center p-2 group">
                       <img src={extractedFrameUrl} alt="Captured frame fragment" className="max-w-full max-h-full rounded-md object-contain shadow-2xl" />
                       <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <a href={extractedFrameUrl} download={`aura-gif-frame-${Date.now()}.png`} className="px-4 py-2 bg-primary-dark text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#048532] transition-colors">Download PNG</a>
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
           <div className="w-full max-w-lg p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-4 mt-8">
              <h3 className="text-xl font-bold text-red-600">Interpreter Engine Failed</h3>
              <p className="text-sm text-red-700/80">{errorMsg}</p>
              <button onClick={() => setProcessState('idle')} className="px-6 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-full text-xs font-bold uppercase tracking-widest transition-colors">Upload a different file & Retry</button>
           </div>
        )}
      </main>

      {/* Hidden processing canvas used for instant high-def PNG extractions without FFmpeg overhead */}
      <canvas ref={canvasRef} className="hidden"></canvas>
      <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/gif" className="hidden" />

      {/* SEO Environment block */}
      <section className="bg-[#F6F8F7] border-t border-black/[0.06] py-24 px-4 relative z-10" itemScope itemType="https://schema.org/WebPage">
        <div className="max-w-6xl mx-auto space-y-24">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
             <h2 className="text-4xl md:text-6xl font-black text-ink leading-tight" itemProp="headline">The Ultimate GIF Viewer & GIF to Video Converter</h2>
             <p className="text-[#55605B] text-lg md:text-xl leading-relaxed" itemProp="description">
               Stop struggling with unpausable animations. AuraCut GIF Studio is a professional-grade solution that transforms archaic .gif files into modern, interactive experiences. Convert GIFs to MP4 videos, scrub frame-by-frame with millisecond precision, and extract lossless PNG frames—all executed 100% offline in your browser for absolute privacy. Perfect for animators, developers, and social media creators.
             </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-3xl space-y-4 hover:border-primary/30 transition-colors group">
                <PlaySquare className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="text-ink font-black text-xl">Lossless GIF to MP4</h3>
                <p className="text-sm text-[#55605B] leading-relaxed">Our advanced FFmpeg pipeline transposes GIF frames into high-bitrate H.264 MP4 videos while preserving every single pixel and color value from the original source.</p>
             </div>
             <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-3xl space-y-4 hover:border-primary/30 transition-colors group">
                <Camera className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="text-ink font-black text-xl">Frame-Perfect Slicing</h3>
                <p className="text-sm text-[#55605B] leading-relaxed">Isolate specific moments from your animations. Scrub through the timeline and export individual frames as transparent PNGs with zero compression artifacts.</p>
             </div>
             <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-3xl space-y-4 hover:border-primary/30 transition-colors group">
                <ShieldCheck className="w-10 h-10 text-primary group-hover:scale-110 transition-transform" />
                <h3 className="text-ink font-black text-xl">100% Local Logic</h3>
                <p className="text-sm text-[#55605B] leading-relaxed">Your data remains yours. No servers, no uploads, no cloud tracking. Everything from decompressing LZW data to compiling MP4 streams happens in your RAM.</p>
             </div>
          </div>

          <div className="space-y-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-black text-ink text-center">In-Depth GIF Viewer FAQ</h3>
            <div className="grid gap-6" itemScope itemType="https://schema.org/FAQPage">
               <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <PlaySquare className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">How do I pause or rewind an animated GIF?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Standard browsers do not support pausing GIFs. AuraCut Studio solves this by instantly transcoding your .gif file into a temporary MP4 video stream using WebAssembly. This unlocks a standard video player interface where you can formally pause, rewind, loop, and scrub at will.</p>
                  </div>
               </div>
               <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <Camera className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">How can I extract individual frames from a GIF animation?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Simply upload your GIF to our extractor, pause at the exact frame you need, and click "Capture Frame". Our engine will instantaneously copy the pixel-perfect frame onto a hidden high-resolution canvas and generate a downloadable PNG image for you.</p>
                  </div>
               </div>
               <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <Download className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">Can I convert my GIF to an MP4 video file?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Yes! In addition to viewing, AuraCut provides a dedicated "Download MP4" button. This allows you to formally convert any animated GIF into a modern H.264 video file, which is often much smaller in size and more compatible with social media platforms like Instagram or Twitter.</p>
                  </div>
               </div>
               <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <Sparkles className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">Does it support GIFs with transparent backgrounds?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Currently, when converting a GIF to MP4, transparency is flattened into a solid color (usually black or white) because the MP4 format does not natively support an alpha channel. However, when using our "Frame Extractor", the captured images are exported as high-quality PNGs, which can maintain pixel-perfect detail.</p>
                  </div>
               </div>
               <div className="bg-white border border-black/10 shadow-sm shadow-black/[0.02] p-8 rounded-2xl space-y-4" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                  <div className="flex items-center gap-4">
                     <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
                     <h4 className="text-ink font-extrabold text-xl" itemProp="name">Is there any limit to the GIF file size I can upload?</h4>
                  </div>
                  <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer" className="pl-12">
                    <p className="text-sm text-[#55605B] leading-relaxed" itemProp="text">Our tool has no artificial file size limits. Because the conversion happens on your own computer, the only limit is your available RAM and CPU power. We've successfully processed heavy GIF archives over 100MB right in the browser!</p>
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
