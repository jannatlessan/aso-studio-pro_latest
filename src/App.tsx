import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QRCodeGenerator from './pages/Tools/QRCodeGenerator';
import AgeCalculator from './pages/Tools/AgeCalculator';
import PomodoroTimer from './pages/Tools/PomodoroTimer';
import UnitConverter from './pages/Tools/UnitConverter';
import ColorPalette from './pages/Tools/ColorPalette';
import CSSGradient from './pages/Tools/CSSGradient';
import LoremIpsum from './pages/Tools/LoremIpsum';
import MarkdownToHtml from './pages/Tools/MarkdownToHtml';
import PercentageCalculator from './pages/Tools/PercentageCalculator';
import YTThumbnail from './pages/Tools/YTThumbnail';
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
import BulkImageEnhancer from './pages/Tools/BulkImageEnhancer';
import BackgroundRemover from './pages/Tools/BackgroundRemover';
import VideoToGifMaker from './pages/Tools/VideoToGifMaker';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ScrollToTop from './components/ScrollToTop';

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tools" element={<ToolsList />} />
        <Route path="/tools/qr-code-generator" element={<QRCodeGenerator />} />
        <Route path="/tools/age-calculator" element={<AgeCalculator />} />
        <Route path="/tools/pomodoro-timer" element={<PomodoroTimer />} />
        <Route path="/tools/unit-converter" element={<UnitConverter />} />
        <Route path="/tools/color-palette" element={<ColorPalette />} />
        <Route path="/tools/css-gradient" element={<CSSGradient />} />
        <Route path="/tools/lorem-ipsum" element={<LoremIpsum />} />
        <Route path="/tools/markdown-to-html" element={<MarkdownToHtml />} />
        <Route path="/tools/percentage-calculator" element={<PercentageCalculator />} />
        <Route path="/tools/yt-thumbnail" element={<YTThumbnail />} />
        <Route path="/tools/video-to-gif" element={<VideoToGifMaker />} />

        <Route path="/tools/aso-screenshot" element={<ASOScreenshot />} />
        <Route path="/tools/password-generator" element={<PasswordGenerator />} />
        <Route path="/tools/json-formatter" element={<JSONFormatter />} />
        <Route path="/tools/text-utilities" element={<TextUtilities />} />
        <Route path="/tools/image-compressor" element={<ImageCompressor />} />
        <Route path="/tools/image-resizer" element={<ImageResizer />} />
        <Route path="/tools/bulk-image-enhancer" element={<BulkImageEnhancer />} />
        <Route path="/tools/background-remover" element={<BackgroundRemover />} />
        <Route path="/tools/audio-merger" element={<AudioMerger />} />
        <Route path="/tools/pdf-merger" element={<PDFMerger />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
      </Routes>
    </Router>
  );
}
