import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import ToolsList from './pages/Tools/ToolsList';
import ASOScreenshot from './pages/Tools/ASOScreenshot';
import PasswordGenerator from './pages/Tools/PasswordGenerator';
import JSONFormatter from './pages/Tools/JSONFormatter';
import TextUtilities from './pages/Tools/TextUtilities';
import ImageResizer from './pages/Tools/ImageResizer';
import ImageCompressor from './pages/Tools/ImageCompressor';
import AudioMerger from './pages/Tools/AudioMerger';
import PDFMerger from './pages/Tools/PDFMerger';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<ToolsList />} />
        <Route path="/tools/aso-screenshot" element={<ASOScreenshot />} />
        <Route path="/tools/password-generator" element={<PasswordGenerator />} />
        <Route path="/tools/json-formatter" element={<JSONFormatter />} />
        <Route path="/tools/text-utilities" element={<TextUtilities />} />
        <Route path="/tools/image-compressor" element={<ImageCompressor />} />
        <Route path="/tools/image-resizer" element={<ImageResizer />} />
        <Route path="/tools/audio-merger" element={<AudioMerger />} />
        <Route path="/tools/pdf-merger" element={<PDFMerger />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
      </Routes>
    </Router>
  );
}
