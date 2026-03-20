import React, { useState, useEffect } from 'react';
import { ChevronLeft, ExternalLink, Search, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';

export default function YTThumbnail() {
  const [url, setUrl] = useState('');
  const [videoID, setVideoID] = useState(null);
  const [error, setError] = useState('');

  const extractId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  useEffect(() => {
    if (url.trim() !== '') {
      const id = extractId(url);
      if(id) {
         setVideoID(id);
         setError('');
      } else {
         setError('Unrecognized YouTube URL. Make sure it is formatted correctly.');
         setVideoID(null);
      }
    } else {
      setVideoID(null);
      setError('');
    }
  }, [url]);

  const handleFetch = () => {
    setError('');
    if (!url.trim()) {
      setError('Please paste a valid YouTube URL first.');
      return;
    }
    const id = extractId(url);
    if(id) {
       setVideoID(id);
    } else {
       setError('Unrecognized YouTube URL. Make sure it is formatted correctly.');
       setVideoID(null);
    }
  };

  const thumbUrl = videoID ? `https://img.youtube.com/vi/${videoID}/maxresdefault.jpg` : null;
  const hqThumbUrl = videoID ? `https://img.youtube.com/vi/${videoID}/hqdefault.jpg` : null;

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] p-5 sm:p-8 md:p-12 font-mono selection:bg-primary/30 transform-gpu">
      <SEO title="YT Thumbnail Saver | ShaadDev Studio" description="Fetch maximum resolution thumbnails from YouTube." url="https://shaaddev.studio/tools/yt-thumbnail" keywords="yt thumbnail, youtube grabber, extract hq cover" />
      
<div className="max-w-4xl mx-auto space-y-8">
        <Link to="/tools" className="mt-8 inline-flex items-center gap-2 text-sm text-white/50 hover:text-primary transition-colors">
          <ChevronLeft className="w-4 h-4" /> Back to Tools
        </Link>
        <div className="mb-10">
           <h1 className="sm: font-black text-white uppercase tracking-wider relative inline-block text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-wider relative inline-block">
  YouTube Thumbnail<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
           <p className="text-white/50 mt-4 text-lg">Download max-resolution cover imagery directly.</p>
        </div>
        
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 bg-black/40">
           <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                value={url} 
                onChange={e=>setUrl(e.target.value)} 
                onKeyDown={e => e.key === 'Enter' && handleFetch()}
                placeholder="https://www.youtube.com/watch?v=..." 
                className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:border-primary text-lg" 
              />
              <button onClick={handleFetch} className="bg-primary text-black px-8 py-4 sm:py-0 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-white transition-colors text-lg">
                 <Search size={20} /> Fetch
              </button>
           </div>
           
           {error && (
             <div className="mt-6 flex items-center gap-3 text-red-400 bg-red-400/10 p-4 rounded-xl border border-red-400/20">
               <AlertCircle size={20} /> <p>{error}</p>
             </div>
           )}
           
           {thumbUrl && !error && (
             <div className="mt-12 space-y-8 flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-500">
                <div className="relative group rounded-2xl overflow-hidden shadow-2xl border border-white/10">
                   <img src={thumbUrl} alt="Thumbnail Max Res" className="w-full object-cover" />
                </div>
                
                <div className="flex flex-wrap justify-center gap-4 w-full">
                  <a href={thumbUrl} target="_blank" rel="noreferrer" className="flex-1 max-w-[300px] flex justify-center bg-primary text-black px-6 py-4 rounded-xl font-black text-lg gap-3 hover:bg-white transition-all hover:scale-105">
                     <ExternalLink size={24} /> Open Max-Res
                  </a>
                  <a href={hqThumbUrl} target="_blank" rel="noreferrer" className="flex-1 max-w-[300px] flex justify-center bg-white/10 text-white border border-white/10 px-6 py-4 rounded-xl font-bold text-lg gap-3 hover:bg-white/20 transition-all">
                     <ExternalLink size={24} /> Open High-Qual
                  </a>
                </div>
             </div>
           )}
        </div>
      </div>
      
          <div className="max-w-4xl mx-auto mt-16 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">YouTube Thumbnail Downloader</h2>
              <p>Content creators, reviewers, and marketers frequently need to fetch the original cover imagery of YouTube content for archival, referencing, or blog integration. However, YouTube does not provide a native 'save image' button for thumbnails via its interface.</p>
              <p>By extracting the unique video ID from the provided URL, our tool securely queries Google's public image hosting servers (i.ytimg.com) and fetches the absolute highest resolution (MaxResDefault) thumbnail associated with the video frame.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Copy Link:</strong> Obtain a standard YouTube video link (e.g., `https://www.youtube.com/watch?v=...`) or a shortened `youtu.be` link.</li>
                <li><strong>Paste and Fetch:</strong> Insert the URL into the search field and submit.</li>
                <li><strong>Save Image:</strong> The max-resolution thumbnail will appear. Simply right-click on desktop or long-press on mobile and select 'Save Image As...' to store it locally.</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. Is downloading a thumbnail legal?</strong>
                  <p>Thumbnails are copyrighted by their respective creators. This tool is intended for personal archival, fair-use commentary, or referencing. You must obtain permission to use a creator's thumbnail commercially.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. Why is the image blurry for some older videos?</strong>
                  <p>Before 2012, YouTube did not enforce high-definition (1080p) thumbnails. If a MaxRes version does not mathematically exist on their server, a lower-resolution fallback is displayed.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">3. Can this download private video thumbnails?</strong>
                  <p>No, this tool leverages public image endpoints. If a video is unlisted or private and you are not authenticated to view it, the thumbnail will not resolve.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Fair Use Application</h4><p className="text-white/70">Only use extracted graphical imagery for commentary, transformative work, or personal offline archiving.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Know Format Fallbacks</h4><p className="text-white/70">If the Max-Res endpoint returns a hollow gray graphic, gracefully degrade to attempt the High-Qual standard instead.</p></div></div></section></article>
          <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/yt-thumbnail" />
          </div>
        </div>
      <Footer />
    </div>
  );
}
