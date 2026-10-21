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
import PDFCompressor from './pages/Tools/PDFCompressor';
import FileToPDF from './pages/Tools/FileToPDF';
import BulkImageEnhancer from './pages/Tools/BulkImageEnhancer';
import BackgroundRemover from './pages/Tools/BackgroundRemover';
import VideoToGifMaker from './pages/Tools/VideoToGifMaker';
import VideoToImages from './pages/Tools/VideoToImages';

import GifViewer from './pages/Tools/GifViewer';
import EventSlideshow from './pages/Tools/EventSlideshow';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import AboutUs from './pages/AboutUs';
import ContactUs from './pages/ContactUs';
import ScrollToTop from './components/ScrollToTop';
import MicroSaaS from './pages/MicroSaaS';
import Stamppedia from './pages/Apps/Stamppedia';
import StamppediaPrivacyPolicy from './pages/Apps/StamppediaPrivacy';
import StamppediaTerms from './pages/Apps/StamppediaTerms';
import AppDetail from './pages/Apps/AppDetail';
import AppLegal from './pages/Apps/AppLegal';
import GamesList from './pages/Games/GamesList';
import Game2048 from './pages/Games/Game2048';
import SlidingPuzzle from './pages/Games/SlidingPuzzle';
import Minesweeper from './pages/Games/Minesweeper';
import Sudoku from './pages/Games/Sudoku';
import GemSwap from './pages/Games/GemSwap';
import WhackAMole from './pages/Games/WhackAMole';
import ReactionTime from './pages/Games/ReactionTime';
import BlockDodge from './pages/Games/BlockDodge';
import TapFlyer from './pages/Games/TapFlyer';
import WordScramble from './pages/Games/WordScramble';
import WordSearch from './pages/Games/WordSearch';
import Hangman from './pages/Games/Hangman';
import MemoryMatch from './pages/Games/MemoryMatch';
import Solitaire from './pages/Games/Solitaire';
import Snake from './pages/Games/Snake';
import Breakout from './pages/Games/Breakout';
import TetroBlocks from './pages/Games/TetroBlocks';
import Pong from './pages/Games/Pong';
import ClickEmpire from './pages/Games/ClickEmpire';
import TowerStacker from './pages/Games/TowerStacker';
import TriviaQuiz from './pages/Games/TriviaQuiz';
import SimonSays from './pages/Games/SimonSays';
import TicTacToe from './pages/Games/TicTacToe';
import TraceMaster from './pages/Games/TraceMaster';
import HoopShot from './pages/Games/HoopShot';
import NotFound from './pages/NotFound';

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
        <Route path="/tools/video-to-images" element={<VideoToImages />} />
        <Route path="/tools/gif-viewer" element={<GifViewer />} />

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
        <Route path="/tools/pdf-compressor" element={<PDFCompressor />} />
        <Route path="/tools/file-to-pdf" element={<FileToPDF />} />
        <Route path="/tools/event-slideshow" element={<EventSlideshow />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        
        {/* MicroSaaS Hub Routes */}
        <Route path="/microsaas" element={<MicroSaaS />} />
        
        {/* Stamppedia App Routes */}
        <Route path="/apps/stamppedia" element={<Stamppedia />} />
        <Route path="/apps/stamppedia/privacy" element={<StamppediaPrivacyPolicy />} />
        <Route path="/apps/stamppedia/terms" element={<StamppediaTerms />} />
        <Route path="/apps/:slug" element={<AppDetail />} />
        <Route path="/apps/:slug/privacy" element={<AppLegal type="privacy" />} />
        <Route path="/apps/:slug/terms" element={<AppLegal type="terms" />} />

        {/* Games Section */}
        <Route path="/games" element={<GamesList />} />
        <Route path="/games/2048" element={<Game2048 />} />
        <Route path="/games/sliding-puzzle" element={<SlidingPuzzle />} />
        <Route path="/games/minesweeper" element={<Minesweeper />} />
        <Route path="/games/sudoku" element={<Sudoku />} />
        <Route path="/games/gem-swap" element={<GemSwap />} />
        <Route path="/games/whack-a-mole" element={<WhackAMole />} />
        <Route path="/games/reaction-time" element={<ReactionTime />} />
        <Route path="/games/block-dodge" element={<BlockDodge />} />
        <Route path="/games/tap-flyer" element={<TapFlyer />} />
        <Route path="/games/word-scramble" element={<WordScramble />} />
        <Route path="/games/word-search" element={<WordSearch />} />
        <Route path="/games/hangman" element={<Hangman />} />
        <Route path="/games/memory-match" element={<MemoryMatch />} />
        <Route path="/games/solitaire" element={<Solitaire />} />
        <Route path="/games/snake" element={<Snake />} />
        <Route path="/games/breakout" element={<Breakout />} />
        <Route path="/games/tetro-blocks" element={<TetroBlocks />} />
        <Route path="/games/pong" element={<Pong />} />
        <Route path="/games/click-empire" element={<ClickEmpire />} />
        <Route path="/games/tower-stacker" element={<TowerStacker />} />
        <Route path="/games/trivia-quiz" element={<TriviaQuiz />} />
        <Route path="/games/simon-says" element={<SimonSays />} />
        <Route path="/games/tic-tac-toe" element={<TicTacToe />} />
        <Route path="/games/trace-master" element={<TraceMaster />} />
        <Route path="/games/hoop-shot" element={<HoopShot />} />

        {/* 404 Page Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}
