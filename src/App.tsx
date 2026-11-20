import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
const QRCodeGenerator = lazy(() => import('./pages/Tools/QRCodeGenerator'));
const AgeCalculator = lazy(() => import('./pages/Tools/AgeCalculator'));
const PomodoroTimer = lazy(() => import('./pages/Tools/PomodoroTimer'));
const UnitConverter = lazy(() => import('./pages/Tools/UnitConverter'));
const ColorPalette = lazy(() => import('./pages/Tools/ColorPalette'));
const CSSGradient = lazy(() => import('./pages/Tools/CSSGradient'));
const LoremIpsum = lazy(() => import('./pages/Tools/LoremIpsum'));
const MarkdownToHtml = lazy(() => import('./pages/Tools/MarkdownToHtml'));
const PercentageCalculator = lazy(() => import('./pages/Tools/PercentageCalculator'));
const YTThumbnail = lazy(() => import('./pages/Tools/YTThumbnail'));
import Home from './pages/Home';
const ToolsList = lazy(() => import('./pages/Tools/ToolsList'));
const ASOScreenshot = lazy(() => import('./pages/Tools/ASOScreenshot'));
const PasswordGenerator = lazy(() => import('./pages/Tools/PasswordGenerator'));
const JSONFormatter = lazy(() => import('./pages/Tools/JSONFormatter'));
const TextUtilities = lazy(() => import('./pages/Tools/TextUtilities'));
const ImageResizer = lazy(() => import('./pages/Tools/ImageResizer'));
const ImageCompressor = lazy(() => import('./pages/Tools/ImageCompressor'));
const AudioMerger = lazy(() => import('./pages/Tools/AudioMerger'));
const PDFMerger = lazy(() => import('./pages/Tools/PDFMerger'));
const PDFCompressor = lazy(() => import('./pages/Tools/PDFCompressor'));
const FileToPDF = lazy(() => import('./pages/Tools/FileToPDF'));
const BulkImageEnhancer = lazy(() => import('./pages/Tools/BulkImageEnhancer'));
const BackgroundRemover = lazy(() => import('./pages/Tools/BackgroundRemover'));
const VideoToGifMaker = lazy(() => import('./pages/Tools/VideoToGifMaker'));
const VideoToImages = lazy(() => import('./pages/Tools/VideoToImages'));

const GifViewer = lazy(() => import('./pages/Tools/GifViewer'));
const EventSlideshow = lazy(() => import('./pages/Tools/EventSlideshow'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsOfService = lazy(() => import('./pages/TermsOfService'));
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
import ScrollToTop from './components/ScrollToTop';
const MicroSaaS = lazy(() => import('./pages/MicroSaaS'));
const Stamppedia = lazy(() => import('./pages/Apps/Stamppedia'));
const StamppediaPrivacyPolicy = lazy(() => import('./pages/Apps/StamppediaPrivacy'));
const StamppediaTerms = lazy(() => import('./pages/Apps/StamppediaTerms'));
const AppDetail = lazy(() => import('./pages/Apps/AppDetail'));
const AppsHub = lazy(() => import('./pages/Apps/AppsHub'));
const AppCategory = lazy(() => import('./pages/Apps/AppsHub').then((m) => ({ default: m.AppCategory })));
const AppLegal = lazy(() => import('./pages/Apps/AppLegal'));
const GamesList = lazy(() => import('./pages/Games/GamesList'));
const Game2048 = lazy(() => import('./pages/Games/Game2048'));
const SlidingPuzzle = lazy(() => import('./pages/Games/SlidingPuzzle'));
const Minesweeper = lazy(() => import('./pages/Games/Minesweeper'));
const Sudoku = lazy(() => import('./pages/Games/Sudoku'));
const GemSwap = lazy(() => import('./pages/Games/GemSwap'));
const WhackAMole = lazy(() => import('./pages/Games/WhackAMole'));
const ReactionTime = lazy(() => import('./pages/Games/ReactionTime'));
const BlockDodge = lazy(() => import('./pages/Games/BlockDodge'));
const TapFlyer = lazy(() => import('./pages/Games/TapFlyer'));
const WordScramble = lazy(() => import('./pages/Games/WordScramble'));
const WordSearch = lazy(() => import('./pages/Games/WordSearch'));
const Hangman = lazy(() => import('./pages/Games/Hangman'));
const MemoryMatch = lazy(() => import('./pages/Games/MemoryMatch'));
const Solitaire = lazy(() => import('./pages/Games/Solitaire'));
const Snake = lazy(() => import('./pages/Games/Snake'));
const Breakout = lazy(() => import('./pages/Games/Breakout'));
const TetroBlocks = lazy(() => import('./pages/Games/TetroBlocks'));
const Pong = lazy(() => import('./pages/Games/Pong'));
const ClickEmpire = lazy(() => import('./pages/Games/ClickEmpire'));
const TowerStacker = lazy(() => import('./pages/Games/TowerStacker'));
const TriviaQuiz = lazy(() => import('./pages/Games/TriviaQuiz'));
const SimonSays = lazy(() => import('./pages/Games/SimonSays'));
const TicTacToe = lazy(() => import('./pages/Games/TicTacToe'));
const TraceMaster = lazy(() => import('./pages/Games/TraceMaster'));
const HoopShot = lazy(() => import('./pages/Games/HoopShot'));
const NotFound = lazy(() => import('./pages/NotFound'));
import WebMcpBridge from './components/WebMcpBridge';

// Every route except Home is a lazy chunk, so the home page does not download every tool's code
// (pdf/ffmpeg/onnx/xlsx...). Pre-rendered pages (dist/tools/*, dist/apps/*) keep showing their
// static #root markup until the route chunk arrives, so there is no blank flash.
const ssgHtml = typeof document !== 'undefined' ? document.querySelector('#root > .ssg:not(.ssg-home)')?.innerHTML ?? '' : '';
const RouteFallback = () =>
  ssgHtml ? <div className="ssg" dangerouslySetInnerHTML={{ __html: ssgHtml }} /> : <div className="min-h-screen" />;

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <WebMcpBridge />
      <Suspense fallback={<RouteFallback />}>
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
        <Route path="/apps" element={<AppsHub />} />
        <Route path="/apps/category/:category" element={<AppCategory />} />
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
      </Suspense>
    </Router>
  );
}
