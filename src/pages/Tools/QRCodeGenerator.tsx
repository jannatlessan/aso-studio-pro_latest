import React, { useState } from 'react';
import { Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ToolHeader } from '../../components/ToolHeader';
import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import RelatedTools from '../../components/RelatedTools';
import { useToolNavigation } from '../../hooks/useToolNavigation';

const DEFAULT_QR_TEXT = 'https://shaaddev.studio';

export default function QRCodeGenerator() {
  const [text, setText] = useState(DEFAULT_QR_TEXT);
  
  // Track if tool has been used (text changed from default)
  const isToolUsed = text !== DEFAULT_QR_TEXT;

  // Use smart navigation hook
  const { handleBackClick, shouldShowToolName } = useToolNavigation({
    toolName: 'QR Generator',
    isToolUsed,
    onReset: () => setText(DEFAULT_QR_TEXT),
  });

  const downloadQR = () => {
    const svg = document.getElementById('qr-code');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const img = new Image();
    img.onload = () => {
      canvas.width = img.width + 40;
      canvas.height = img.height + 40;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 20, 20);
      const pngFile = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.download = 'qrcode-high-res.png';
      a.href = pngFile;
      a.click();
    };
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO title="QR Code Generator | ShaadDev Studio" description="Generate high-res QR codes instantly." url="https://shaaddev.studio/tools/qr-code-generator" keywords="qr code generator, url to qr graphic, trackable codes" />

      {/* Header */}
      <ToolHeader 
        toolName="QR Generator"
        isToolUsed={isToolUsed}
        onBackClick={handleBackClick}
        statusBadge={
          <div className="flex items-center gap-2 text-xs font-bold text-primary/80 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            TRENDING TOOL
          </div>
        }
      />

      {/* Main Content */}
      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-20 w-full space-y-16">
        {/* Title Section */}
        <div className="space-y-4 max-w-3xl">
          <h1 className="sm: font-black text-white uppercase tracking-wider relative inline-block text-4xl sm:text-5xl md:text-6xl font-black text-white uppercase tracking-wider relative inline-block">
  QR Generator<div className="absolute -bottom-2 left-0 w-1/3 h-1 sm:h-2 bg-primary rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"></div>
</h1>
        </div>
        <div className="glass-panel p-8 md:p-12 rounded-3xl border border-white/10 bg-black/40 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
<div className="space-y-6 flex flex-col justify-center h-full">
            <div>
              <label className="text-sm font-bold text-white/70 uppercase tracking-widest block mb-4">Paste Website URL or Text</label>
              <textarea 
                value={text} 
                onChange={(e) => setText(e.target.value)} 
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 text-white focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none text-lg resize-none custom-scrollbar h-32" 
                placeholder="Enter URL or Text" 
              />
            </div>
            <button onClick={downloadQR} disabled={!text} className="w-full bg-primary text-black font-black py-4 rounded-xl flex justify-center items-center gap-3 hover:bg-white transition-all hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed text-lg">
               <Download size={24} /> Export PNG Max-Res
            </button>
          </div>
          <div className="flex flex-col items-center justify-center p-12 bg-white rounded-[2rem] mx-auto w-full max-w-sm aspect-square border border-white/10 shadow-2xl transition-transform hover:scale-105 duration-500">
            {text ? 
              <QRCodeSVG id="qr-code" value={text} size={250} level="H" includeMargin={false} /> : 
              <div className="text-black/30 font-bold text-center">Type words to render <br/>QR code</div>
            }
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-24 mb-8 px-4">
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 space-y-6 text-sm sm:text-base text-white/70 leading-relaxed font-sans">
              <h2 className="text-xl sm:text-2xl font-black text-white uppercase tracking-wider font-mono">High-Resolution QR Code Generator</h2>
              <p>In a mobile-first world, Quick Response (QR) codes are indispensable for seamlessly bridging the physical and digital realms. Whether you're directing customers to a restaurant menu, sharing a Wi-Fi password, or placing a link on a business card, our QR Code Generator creates instant, reliable, and scannable visual data blocks.</p>
              <p>This tool generates vector-based SVG and high-fidelity PNG formats right in your browser, enabling you to export crystal-clear codes that will scan perfectly even when printed on massive banners or tiny product labels.</p>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
              <ol className="list-decimal pl-5 space-y-3">
                <li><strong>Enter Your Data:</strong> Type or paste the destination URL, text string, phone number, or data string into the main input field.</li>
                <li><strong>Live Preview:</strong> The QR code updates instantly on the screen as you type, giving you real-time visual feedback.</li>
                <li><strong>Download/Export:</strong> Right-click or use device tools to capture the code. (We recommend screenshots or saving the generated image directly for use in your designs).</li>
              </ol>

              <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
              <div className="space-y-4">
                
                <div>
                  <strong className="text-white block mb-1">1. Do these QR codes expire?</strong>
                  <p>No, the QR codes generated here are 'static'. They hardcode the data directly into the pixel matrix. As long as the destination URL or text remains valid, the code will work forever.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">2. Are my links tracked?</strong>
                  <p>We do not inject any analytics or trackers into the generated QR codes. The direct link you provide is exactly what is encoded.</p>
                </div>
                
                <div>
                  <strong className="text-white block mb-1">3. What is the maximum amount of data I can encode?</strong>
                  <p>While QR codes can technically hold over 4,000 alphanumeric characters, scanning reliability drops as data density increases. Keep URLs concise for best scanning consistency.</p>
                </div>
              </div>
            <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">High Contrast</h4><p className="text-white/70">Always maintain a dark code fill (usually black) on a very light background outline.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Test Before Use</h4><p className="text-white/70">Scan the downloaded PNG on multiple mobile devices and camera apps before printing it physically.</p></div></div></section></article>
                  <div className="mt-12 mb-8">
            <RelatedTools currentPath="/tools/qr-code-generator" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
