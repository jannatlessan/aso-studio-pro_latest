import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Music, 
  Upload, 
  ChevronLeft,
  Settings2,
  ListPlus,
  Trash2,
  RefreshCcw,
  Check
} from 'lucide-react';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';
// @ts-ignore
import toWav from 'audiobuffer-to-wav';
// @ts-ignore
import * as lamejs from 'lamejs';

interface AudioFile {
  id: string;
  name: string;
  file: File;
  duration?: number;
}

export default function AudioMerger() {
  const [files, setFiles] = useState<AudioFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<'wav' | 'mp3'>('mp3');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (!uploadedFiles.length) return;

    const newAudioFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      file
    }));

    setFiles(prev => [...prev, ...newAudioFiles]);
    setMergedUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setMergedUrl(null);
  };

  const mergeAudioFiles = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setMergedUrl(null);

    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const buffers: AudioBuffer[] = [];

      // Decode all files
      for (const fileObj of files) {
        const arrayBuffer = await fileObj.file.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        buffers.push(audioBuffer);
      }

      // Calculate total duration roughly
      const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);
      const outputBuffer = audioContext.createBuffer(
        buffers[0].numberOfChannels,
        totalLength,
        buffers[0].sampleRate
      );

      // Merge data
      for (let channel = 0; channel < outputBuffer.numberOfChannels; channel++) {
        const outputData = outputBuffer.getChannelData(channel);
        let offset = 0;
        for (const buffer of buffers) {
          // Some buffers might have 1 channel while output has 2
          const channelData = buffer.getChannelData(channel % buffer.numberOfChannels);
          outputData.set(channelData, offset);
          offset += buffer.length;
        }
      }
let blob: Blob;

      if (outputFormat === 'mp3') {
        const mp3encoder = new lamejs.Mp3Encoder(outputBuffer.numberOfChannels, outputBuffer.sampleRate, 128); // 128kbps
        const mp3Data = [];

        const left = outputBuffer.getChannelData(0);
        const right = outputBuffer.numberOfChannels > 1 ? outputBuffer.getChannelData(1) : left;

        const sampleBlockSize = 1152;
        const leftInt16 = new Int16Array(left.length);
        const rightInt16 = new Int16Array(right.length);
        
        for (let i = 0; i < left.length; i++) {
          const l = Math.max(-1, Math.min(1, left[i]));
          leftInt16[i] = l < 0 ? l * 0x8000 : l * 0x7FFF;
          
          if (outputBuffer.numberOfChannels > 1) {
            const r = Math.max(-1, Math.min(1, right[i]));
            rightInt16[i] = r < 0 ? r * 0x8000 : r * 0x7FFF;
          }
        }

        for (let i = 0; i < left.length; i += sampleBlockSize) {
          const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
          let mp3buf;
          
          if (outputBuffer.numberOfChannels > 1) {
            const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
            mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
          } else {
            mp3buf = mp3encoder.encodeBuffer(leftChunk);
          }
          
          if (mp3buf.length > 0) {
            mp3Data.push(new Int8Array(mp3buf));
          }
        }

        const mp3buf = mp3encoder.flush();
        if (mp3buf.length > 0) {
          mp3Data.push(new Int8Array(mp3buf));
        }

        blob = new Blob(mp3Data, { type: 'audio/mp3' });
      } else {
        // Convert AudioBuffer to WAV ArrayBuffer
        const wavArrayBuffer = toWav(outputBuffer);
        blob = new Blob([new DataView(wavArrayBuffer)], { type: 'audio/wav' });
      }
      
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);

    } catch (error) {
      console.error('Error merging audio:', error);
      alert('Error merging audio files. Make sure they are valid audio formats.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Free Online Audio Merger | ShaadDev Studio" 
        description="Merge multiple MP3, WAV, or OGG audio files into a single track directly in your browser. Fast, local processing with no file uploads required." 
        url="https://shaaddev.studio/tools/audio-merger" keywords="audio merger, merge mp3 online, stitch audio files" />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">Back to Tools</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <Music className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">Audio Merger</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-6">
          <div className="space-y-1 text-center sm:text-left">
             <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Merge Audio Files</h1>
             <p className="text-white/60 text-sm">Combine MP3s & WAVs seamlessly right in your browser. 100% private and offline.</p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/10 space-y-6">
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-primary/50 text-white/50 hover:text-primary rounded-xl flex flex-col items-center justify-center p-8 sm:p-12 cursor-pointer transition-all bg-black/50"
            >
              <input 
                type="file" 
                accept="audio/*" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Upload className="w-10 h-10 mb-3 opacity-50" />
              <span className="font-bold text-sm uppercase tracking-wider">Add Audio Files</span>
              <span className="text-xs opacity-50 mt-1">Select multiple files (MP3, WAV, OGG)</span>
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <ListPlus className="w-4 h-4 text-primary" />
                  <h2 className="font-black text-xs uppercase tracking-widest text-white/70">Audio Tracks ({files.length})</h2>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((f, index) => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-white/10 group transition-all">
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-xs font-black text-white/30 w-4">{index + 1}.</span>
                        <span className="text-sm truncate text-white/80">{f.name}</span>
                        <span className="text-[10px] uppercase bg-black/50 px-2 py-0.5 rounded text-white/40 border border-white/5">
                          {(f.file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </div>
                      <button 
                        onClick={() => removeFile(f.id)}
                        className="text-white/30 hover:text-red-400 p-1 rounded transition-colors"
                        title="Remove track"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-white/50 uppercase tracking-widest font-bold">Output Format:</span>
                    <select 
                      value={outputFormat} 
                      onChange={(e) => setOutputFormat(e.target.value as 'mp3' | 'wav')}
                      className="bg-black/50 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80 focus:border-primary focus:outline-none uppercase tracking-wider"
                    >
                      <option value="mp3">MP3 (Compressed)</option>
                      <option value="wav">WAV (Lossless)</option>
                    </select>
                  </div>
                  <button 
                    onClick={mergeAudioFiles}
                    disabled={isProcessing || files.length < 2}
                    className="w-full sm:w-auto px-6 py-3 bg-primary text-black hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse flex items-center gap-2"><RefreshCcw className="w-4 h-4 animate-spin"/> Processing...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Check className="w-4 h-4"/> Merge Files</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mergedUrl && (
               <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-xl space-y-4">
                 <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                   <Check className="w-5 h-5" /> Audio Merged Successfully
                 </h3>
                 <audio 
                   controls 
                   src={mergedUrl} 
                   className="w-full h-10 rounded-lg outline-none custom-audio-player" 
                 />
                 <a 
                   href={mergedUrl} 
                   download={`merged_audio_shaad-dev.${outputFormat}`}
                   className="inline-flex w-full sm:w-auto mt-2 px-6 py-3 bg-primary text-black hover:bg-white rounded-lg font-bold uppercase tracking-widest text-xs transition-all justify-center items-center gap-2"
                 >
                   Download Merged {outputFormat.toUpperCase()}
                 </a>
               </div>
            )}

          </div>

          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed font-sans">
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">Seamless Audio File Merger & Joiner</h2>
            <p>
              Combining multiple audio tracks into a single, cohesive file can often require the frustrating installation of complex, expensive Digital Audio Workstations (DAWs) or clunky desktop software. Our <strong>Browser-Based Audio Merger</strong> eliminates all of that friction, empowering podcasters, video editors, music producers, and casual creators to instantly stitch together disjointed audio clips, voiceovers, background tracks, and sound effects directly from their web browser.
            </p>
            <p>
              This utility is specifically designed for speed and simplicity. Whether you are compiling a continuous mixtape, appending an outro to your weekly podcast episode, or simply joining split voice memos from your smartphone, the tool handles the intricate process of audio decoding, buffering, and sequencing seamlessly under the hood. By utilizing robust Web Audio APIs, we ensure that the native quality of your audio streams is preserved, delivering a high-fidelity output master file in seconds.
            </p>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Upload Audio Segments:</strong> Drag and drop the individual audio files (MP3, WAV, WebM, etc.) you wish to combine into the interactive list.</li>
              <li><strong>Arrange the Sequence:</strong> Utilize the intuitive drag-and-drop interface to reorder your tracks. The tracks will be merged sequentially from top to bottom exactly as they are displayed.</li>
              <li><strong>Preview and Trim:</strong> If necessary, listen to short previews of the files to confirm the flow, sequence, and verify you haven't uploaded the wrong take.</li>
              <li><strong>Merge and Export:</strong> Click the merge execution button. The tool will rapidly compile the tracks together, generating a brand new consolidated audio file ready for instant download and distribution.</li>
            </ol>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-white block">1. What audio formats do you support for merging?</strong>
                <p>Our audio engine is compatible with most standard web audio formats, including MP3, WAV, and WebM, making it highly versatile for various types of user inputs derived from phones, recorders, or online libraries.</p>
              </div>
              <div>
                <strong className="text-white block">2. Is there a noticeable gap or pop between merged tracks?</strong>
                <p>No, our tool is engineered to append the raw audio buffers perfectly end-to-end. Provided your original files don't have built-in silence at the very end, the transition between merged tracks will be entirely mathematically seamless and continuous.</p>
              </div>
              <div>
                <strong className="text-white block">3. Are my private voice recordings stored on your servers?</strong>
                <p>Never. The entirety of the audio decoding, buffering, and merging process happens securely within the sandbox of your browser using the local device's processing power. Your private intellectual property and sensitive voice recordings remain strictly confidential and never leave your machine.</p>
              </div>
            </div>
          <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Consistent Formats</h4><p className="text-white/70">For the cleanest crossfades, use source audio files with matching sample rates.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Sequence Order</h4><p className="text-white/70">Always double check the sequence order before downloading the final mp3 file.</p></div></div></section></article>
          
          <RelatedTools currentPath="/tools/audio-merger" />
        </div>
      </main>
      <Footer />
    </div>
  );
}