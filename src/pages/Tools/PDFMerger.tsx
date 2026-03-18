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
        url="https://shaaddev.studio/tools/pdf-merger" 
      />
      
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
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">Secure Online PDF Merger</h2>
            
            <p>
              Merging PDFs doesn't require uploading your sensitive documents to a random server. Our <strong>Free PDF Merger</strong> works entirely locally in your web browser. This means your personal and business records stay completely private.
            </p>
            
            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Why use our tool?</h3>
            <ul className="list-disc pl-5 space-y-3">
              <li><strong>Zero Uploads:</strong> We manipulate the file data buffers natively in the browser ensuring strict confidentiality.</li>
              <li><strong>Lightning Fast:</strong> No network waiting times required to upload or process your PDF batches.</li>
              <li><strong>Preserves Formatting:</strong> Using standard compliant algorithms, the document properties, fonts, and layouts remain intact during the join.</li>
            </ul>
          </article>
          
          <RelatedTools currentPath="/tools/pdf-merger" />
        </div>
      </main>
      <Footer />
    </div>
  );
}