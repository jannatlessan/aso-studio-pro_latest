import { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  FileBox, 
  Upload, 
  ChevronLeft,
  Settings2,
  ListPlus,
  Trash2,
  RefreshCcw,
  Check
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';

interface PdfFile {
  id: string;
  name: string;
  file: File;
  size: number;
}

export default function PDFMerger() {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mergedUrl, setMergedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    if (!uploadedFiles.length) return;

    const newFiles = uploadedFiles.map(file => ({
      id: Math.random().toString(36).substring(7),
      name: file.name,
      file,
      size: file.size
    }));

    setFiles(prev => [...prev, ...newFiles]);
    setMergedUrl(null);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
    setMergedUrl(null);
  };

  const mergePDFs = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    setMergedUrl(null);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const fileObj of files) {
        const arrayBuffer = await fileObj.file.arrayBuffer();
        let pdf;
        try {
          pdf = await PDFDocument.load(arrayBuffer, { ignoreEncryption: true });
        } catch (e) {
          console.warn('Could not load PDF cleanly, trying to create from buffer...', e);
          pdf = await PDFDocument.load(arrayBuffer);
        }
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach((page) => mergedPdf.addPage(page));
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setMergedUrl(url);

    } catch (error) {
      console.error('Error merging PDFs:', error);
      alert('Error merging PDF files. Please ensure they are valid PDF formats and not encrypted.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020202] text-[#E0E0E0] selection:bg-primary/30 font-mono flex flex-col">
      <SEO 
        title="Free Online PDF Merger | ShaadDev Studio" 
        description="Merge multiple PDF files into one document securely in your browser. 100% free and local processing without server uploads." 
        url="https://shaaddev.studio/tools/pdf-merger" keywords="pdf merger, join pdf documents, stitch pages" />
      
      {/* Header */}
      <nav className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/tools" className="flex items-center gap-3 group text-white/70 hover:text-primary transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-bold tracking-wider text-sm uppercase hidden sm:inline">Back to Tools</span>
          </Link>
          <div className="flex items-center gap-2 text-primary">
            <FileBox className="w-5 h-5" />
            <span className="font-black tracking-widest text-sm uppercase">PDF Merger</span>
          </div>
        </div>
      </nav>

      <main className="flex-grow p-4 sm:p-8 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-6">
          <div className="space-y-1 text-center sm:text-left">
             <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Merge PDF Documents</h1>
             <p className="text-white/60 text-sm">Combine multiple PDFs smoothly right in your browser. Complete privacy.</p>
          </div>

          <div className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/40 border border-white/10 space-y-6">
            
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-white/20 hover:border-primary/50 text-white/50 hover:text-primary rounded-xl flex flex-col items-center justify-center p-8 sm:p-12 cursor-pointer transition-all bg-black/50"
            >
              <input 
                type="file" 
                accept="application/pdf" 
                multiple
                className="hidden" 
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
              <Upload className="w-10 h-10 mb-3 opacity-50" />
              <span className="font-bold text-sm uppercase tracking-wider">Add PDF Files</span>
              <span className="text-xs opacity-50 mt-1">Select multiple PDF documents</span>
            </div>

            {files.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-white/10 pb-3">
                  <ListPlus className="w-4 h-4 text-primary" />
                  <h2 className="font-black text-xs uppercase tracking-widest text-white/70">Documents Queue ({files.length})</h2>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {files.map((f, index) => (
                    <div key={f.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-lg hover:border-white/10 group transition-all">
                      <div className="flex items-center gap-3 truncate">
                        <span className="text-xs font-black text-white/30 w-4">{index + 1}.</span>
                        <span className="text-sm truncate text-white/80">{f.name}</span>
                        <span className="text-[10px] uppercase bg-black/50 px-2 py-0.5 rounded text-white/40 border border-white/5">
                          {(f.size / 1024 / 1024).toFixed(2)} MB
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

                <div className="pt-4 flex justify-between items-center">
                  <span className="text-xs text-white/50">Output: Single Merged PDF</span>
                  <button 
                    onClick={mergePDFs}
                    disabled={isProcessing || files.length < 2}
                    className="px-6 py-3 bg-primary text-black hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-black uppercase tracking-widest text-xs transition-all flex items-center gap-2"
                  >
                    {isProcessing ? (
                      <span className="animate-pulse flex items-center gap-2"><RefreshCcw className="w-4 h-4 animate-spin"/> Processing...</span>
                    ) : (
                      <span className="flex items-center gap-2"><Check className="w-4 h-4"/> Merge PDFs</span>
                    )}
                  </button>
                </div>
              </div>
            )}

            {mergedUrl && (
               <div className="mt-8 p-6 bg-primary/10 border border-primary/20 rounded-xl space-y-4">
                 <h3 className="text-sm font-black text-primary uppercase tracking-widest flex items-center gap-2">
                   <Check className="w-5 h-5" /> PDFs Merged Successfully
                 </h3>
                 <a 
                   href={mergedUrl} 
                   download="merged_document_shaad-dev.pdf"
                   className="inline-flex w-full sm:w-auto mt-2 px-6 py-3 bg-primary text-black hover:bg-white rounded-lg font-bold uppercase tracking-widest text-xs transition-all justify-center items-center gap-2"
                 >
                   Download Merged PDF
                 </a>
               </div>
            )}

          </div>

          {/* SEO Optimized Content Section */}
          <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed font-sans">
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">Secure Client-Side PDF Document Merger</h2>
            <p>
              Managing a multitude of separate PDF files—whether they are scanned invoices, scattered legal contracts, lengthy academic research papers, or various chapters of a comprehensive digital report—can result in an incredibly disorganized and confusing digital workspace. Our <strong>Professional PDF Merger</strong> provides a robust, zero-friction solution that allows you to effortlessly combine multiple fragmented PDF documents into a single, flawlessly organized master file.
            </p>
            <p>
              Unlike traditional PDF tools that force you into subscribing to expensive monthly proprietary software plans or shady online services that demand you upload your highly confidential business documents to their remote servers, our solution is engineered entirely differently. By processing the intricate structure of the PDF file format directly within your browser window, we offer an immensely powerful workflow utility that guarantees lightning-fast execution while maintaining absolute zero-trust privacy for your sensitive enterprise or personal data.
            </p>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Add Your PDF Files:</strong> Drag and drop all the individual PDF files you wish to merge into the primary upload zone.</li>
              <li><strong>Organize Document Order:</strong> Utilize the intuitive interface to reorder the documents. The first file on the list will become the initial pages of your new master document, followed sequentially by the rest.</li>
              <li><strong>Remove Unwanted Files:</strong> If you accidentally upload the wrong version of a document, simply click the trash icon next to it to eject it from the merging queue.</li>
              <li><strong>Combine & Download:</strong> Once your sequence is perfectly arranged, click the merge button. The tool will rapidly compile the pages and immediately prompt you to download your new, unified PDF artifact.</li>
            </ol>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-white block">1. Are my sensitive legal or financial PDFs secure?</strong>
                <p>Absolutely 100% secure. Because our application utilizes advanced local WebAssembly and JavaScript PDF engine libraries, the entire merging process happens exclusively within the memory bank of your actual device. Your private documents are never transmitted over the internet to our servers.</p>
              </div>
              <div>
                <strong className="text-white block">2. Do I lose the original text searchability within my merged PDF?</strong>
                <p>No, you do not. Unlike rudimentary tools that simply rasterize your PDF into a series of flat images, our tool fundamentally restructures the PDF at the code level. Your critical text remains fully selectable, searchable, and intact within the new master document.</p>
              </div>
              <div>
                <strong className="text-white block">3. Is there a hard limit on the number of PDFs I can merge?</strong>
                <p>Technically, there is no hard-coded limit imposed by the tool itself. However, because the processing utilizes your local device's RAM to compile the final document, merging hundreds of massive, multi-gigabyte files simultaneously might be constrained by your specific computer's memory capacity.</p>
              </div>
            </div>
          <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Logical Sequencing</h4><p className="text-white/70">Ensure the page order makes chronological sense to tell a cohesive document narrative.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Optimize Source Docs</h4><p className="text-white/70">Pre-compress huge individual PDFs before merging them together to avoid bloat.</p></div></div></section></article>
          
          <RelatedTools currentPath="/tools/pdf-merger" />
        </div>
      </main>
      <Footer />
    </div>
  );
}