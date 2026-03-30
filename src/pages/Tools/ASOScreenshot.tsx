/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import {
  Upload,
  Download,
  Smartphone,
  Tablet,
  Type,
  Settings2,
  Plus,
  Check,
  Image as ImageIcon,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Trash2,
  Layers,
  Archive,
  Clipboard,
  Copy,
  Sparkles,
  Sun,
  Moon,
  Layout,
  Grid3X3,
  Edit3,
  PlusSquare,
  RefreshCw,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence, Reorder } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
import { useToolNavigation } from '../../hooks/useToolNavigation';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';
import RelatedTools from '../../components/RelatedTools';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface ScreenSize {
  id: string;
  name: string;
  width: number;
  height: number;
  type: 'iphone' | 'ipad' | 'android' | 'custom';
  label: string;
}

type TemplateId = 'classic' | 'modern' | 'feature' | 'gradient' | 'minimal' | 'split' | 'split-right';

interface ASOTemplate {
  id: TemplateId;
  name: string;
  description: string;
  layout: 'top-text' | 'bottom-text' | 'center-text' | 'split-left' | 'split-right';
  backgroundType: 'solid' | 'gradient' | 'mesh';
}

interface ScreenshotItem {
  id: string;
  file?: File; // Optional for persistence (we store URLs or blobs)
  previewUrl: string;
  headline: string;
  subheadline: string;
  backgroundColor: string;
  secondaryColor: string;
  textColor: string;
  frameColor: string;
  templateId: TemplateId;
  showIcon: boolean;
  headlineFont: string;
  subheadlineFont: string;
  headlineSize: number;
  subheadlineSize: number;
  sidePadding: number;
  customBackgroundUrl?: string;
  backgroundBlur?: number;
  textShadow?: boolean;
}

interface ProjectState {
  screenshots: ScreenshotItem[];
  globalFont: string;
  globalTemplateId: TemplateId;
  globalFitMode: 'contain' | 'cover' | 'stretch';
  backgroundMode: 'individual' | 'panoramic';
  panoramicImage?: string;
  globalHeadlineSize: number;
  globalSubheadlineSize: number;
  globalSidePadding: number;
  globalDevicePadding: number;
}

const IPHONE_SIZES: ScreenSize[] = [
  { id: 'iphone-6.5', name: 'iPhone 6.5"', label: '1242x2688', width: 1242, height: 2688, type: 'iphone' },
  { id: 'iphone-6.7', name: 'iPhone 6.7"', label: '1284x2778', width: 1284, height: 2778, type: 'iphone' },
  { id: 'iphone-custom', name: 'Custom iPhone', label: 'Custom', width: 0, height: 0, type: 'iphone' },
];

const IPAD_SIZES: ScreenSize[] = [
  { id: 'ipad-12.9', name: 'iPad 12.9"', label: '2048x2732', width: 2048, height: 2732, type: 'ipad' },
  { id: 'ipad-pro', name: 'iPad Pro', label: '2064x2752', width: 2064, height: 2752, type: 'ipad' },
  { id: 'ipad-custom', name: 'Custom iPad', label: 'Custom', width: 0, height: 0, type: 'ipad' },
];

const ANDROID_SIZES: ScreenSize[] = [
  { id: 'android-phone', name: 'Phone (6.7")', label: '1080x2400', width: 1080, height: 2400, type: 'android' },
  { id: 'android-7-tablet', name: '7" Tablet', label: '1200x1920', width: 1200, height: 1920, type: 'android' },
  { id: 'android-10-tablet', name: '10" Tablet', label: '1600x2560', width: 1600, height: 2560, type: 'android' },
  { id: 'android-custom', name: 'Custom Android', label: 'Custom', width: 0, height: 0, type: 'android' },
];

const TEMPLATES: ASOTemplate[] = [
  { id: 'classic', name: 'Classic Pro', description: 'Headline at top, device at bottom', layout: 'top-text', backgroundType: 'solid' },
  { id: 'modern', name: 'Modern Gradient', description: 'Headline at bottom, device at top', layout: 'bottom-text', backgroundType: 'gradient' },
  { id: 'feature', name: 'Feature Focus', description: 'Large headline, centered device', layout: 'center-text', backgroundType: 'mesh' },
  { id: 'split', name: 'Split Left', description: 'Text on left, device on right', layout: 'split-left', backgroundType: 'gradient' },
  { id: 'split-right', name: 'Split Right', description: 'Text on right, device on left', layout: 'split-right', backgroundType: 'mesh' },
  { id: 'minimal', name: 'Minimalist', description: 'Clean focus on screenshot', layout: 'top-text', backgroundType: 'solid' },
];

const FONTS = [
  { name: 'Inter', family: 'Inter, sans-serif', url: 'Inter:wght@400;700;900' },
  { name: 'Outfit', family: 'Outfit, sans-serif', url: 'Outfit:wght@400;700;900' },
  { name: 'Roboto', family: 'Roboto, sans-serif', url: 'Roboto:wght@400;700;900' },
  { name: 'Montserrat', family: 'Montserrat, sans-serif', url: 'Montserrat:wght@400;700;900' },
  { name: 'Bebas Neue', family: '"Bebas Neue", sans-serif', url: 'Bebas+Neue' },
  { name: 'Playfair', family: '"Playfair Display", serif', url: 'Playfair+Display:wght@700' },
];

const BG_COLORS = [
  '#00F0FF', '#121214', '#1C1C1E', '#2E5C6E', '#C75B39', '#B8860B', '#4A8068', '#5B7B8A', '#7B5EA7', '#ffffff'
];

const GRADIENTS = [
  { start: '#2E5C6E', end: '#4A8FA3' },
  { start: '#C75B39', end: '#E67E5C' },
  { start: '#B8860B', end: '#DAA520' },
  { start: '#4A8068', end: '#6BA68C' },
  { start: '#5B7B8A', end: '#7DA1B0' },
  { start: '#7B5EA7', end: '#9D85C7' },
];

const FRAME_COLORS = [
  '#000000', '#333333', '#ffffff', '#e5e7eb'
];

// --- Components ---

interface ScreenshotPreviewProps {
  item: ScreenshotItem;
  size: ScreenSize;
  appIcon: { url: string } | null;
  globalShowIcon: boolean;
  backgroundMode: 'individual' | 'panoramic';
  panoramicImage?: string | null;
  index: number;
  totalScreenshots: number;
  onDraw: (canvas: HTMLCanvasElement, item: ScreenshotItem, img: HTMLImageElement, size: ScreenSize, iconImg: HTMLImageElement | null, shotIndex?: number, totalShots?: number, panoImg?: HTMLImageElement | null, individualBgImg?: HTMLImageElement | null) => void;
}

const ScreenshotPreview = ({ item, size, appIcon, globalShowIcon, backgroundMode, panoramicImage, index, totalScreenshots, onDraw }: ScreenshotPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const runDraw = async () => {
      const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = url;
      });

      try {
        const img = await loadImage(item.previewUrl);
        const iconImg = appIcon ? await loadImage(appIcon.url).catch(() => null) : null;
        const panoImg = panoramicImage ? await loadImage(panoramicImage).catch(() => null) : null;
        const indBgImg = item.customBackgroundUrl ? await loadImage(item.customBackgroundUrl).catch(() => null) : null;
        
        onDraw(canvas, item, img, size, iconImg, index, totalScreenshots, panoImg, indBgImg);
      } catch (e) {
        console.error("Failed to load images for preview", e);
      }
    };

    runDraw();
  }, [item, size, appIcon, globalShowIcon, backgroundMode, panoramicImage, index, totalScreenshots, onDraw]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full object-contain"
    />
  );
};

export default function App() {
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);
  const [appIcon, setAppIcon] = useState<{ file: File; url: string } | null>(null);
  const [globalShowIcon, setGlobalShowIcon] = useState(true);

  const [selectedIPhoneSize, setSelectedIPhoneSize] = useState<ScreenSize>(IPHONE_SIZES[0]);
  const [selectedIPadSize, setSelectedIPadSize] = useState<ScreenSize>(IPAD_SIZES[0]);
  const [selectedAndroidSize, setSelectedAndroidSize] = useState<ScreenSize>(ANDROID_SIZES[0]);

  const [globalFont, setGlobalFont] = useState(FONTS[0].family);
  const [globalTemplateId, setGlobalTemplateId] = useState<TemplateId>('classic');

  const [iphoneCustomWidth, setIphoneCustomWidth] = useState('1242');
  const [iphoneCustomHeight, setIphoneCustomHeight] = useState('2688');
  const [ipadCustomWidth, setIpadCustomWidth] = useState('2048');
  const [ipadCustomHeight, setIpadCustomHeight] = useState('2732');
  const [androidCustomWidth, setAndroidCustomWidth] = useState('1080');
  const [androidCustomHeight, setAndroidCustomHeight] = useState('2400');
  const [customUnit, setCustomUnit] = useState<'px' | 'inch'>('px');

  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'iphone' | 'ipad' | 'android'>('iphone');
  const [backgroundMode, setBackgroundMode] = useState<'individual' | 'panoramic'>('individual');
  const [panoramicImage, setPanoramicImage] = useState<string | null>(null);
  const [bulkText, setBulkText] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [showStoreOverlay, setShowStoreOverlay] = useState(false);
  const [storeOverlayType, setStoreOverlayType] = useState<'ios' | 'android'>('ios');
  const [activeCategory, setActiveCategory] = useState<'template' | 'canvas' | 'branding' | 'assets'>('template');

  // Global Layout Options
  const [globalFitMode, setGlobalFitMode] = useState<'contain' | 'cover' | 'stretch'>('contain');
  const [globalDevicePadding, setGlobalDevicePadding] = useState(0);
  const [globalHeadlineSize, setGlobalHeadlineSize] = useState(1);
  const [globalSubheadlineSize, setGlobalSubheadlineSize] = useState(1);
  const [globalSidePadding, setGlobalSidePadding] = useState(0);
  const [globalShowBadge, setGlobalShowBadge] = useState(false);
  const [badgeType, setBadgeType] = useState<'stars' | 'award'>('stars');
  const [exportIPhone, setExportIPhone] = useState(true);
  const [exportIPad, setExportIPad] = useState(true);
  const [exportAndroid, setExportAndroid] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  // Smart Navigation
  const isToolUsed = screenshots.length > 0 || appIcon !== null;
  // --- Font Loader ---
  React.useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    const fontNames = FONTS.map(f => f.url).join('&family=');
    link.href = `https://fonts.googleapis.com/css2?family=${fontNames}&display=swap`;
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // --- Project Persistence ---
  React.useEffect(() => {
    const saved = localStorage.getItem('aso-studio-pro-project');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.screenshots) setScreenshots(parsed.screenshots.map((s: any) => ({ ...s, file: undefined }))); // Files cannot be serialized
        if (parsed.globalFont) setGlobalFont(parsed.globalFont);
        if (parsed.globalTemplateId) setGlobalTemplateId(parsed.globalTemplateId);
        if (parsed.globalFitMode) setGlobalFitMode(parsed.globalFitMode);
        if (parsed.backgroundMode) setBackgroundMode(parsed.backgroundMode);
        if (parsed.panoramicImage) setPanoramicImage(parsed.panoramicImage);
        if (parsed.globalHeadlineSize) setGlobalHeadlineSize(parsed.globalHeadlineSize);
        if (parsed.globalSubheadlineSize) setGlobalSubheadlineSize(parsed.globalSubheadlineSize);
        if (parsed.globalSidePadding) setGlobalSidePadding(parsed.globalSidePadding);
        if (parsed.globalDevicePadding) setGlobalDevicePadding(parsed.globalDevicePadding);
      } catch (e) {
        console.error("Failed to load project", e);
      }
    }
  }, []);

  React.useEffect(() => {
    const project = {
      screenshots: screenshots.map(s => ({ ...s, file: undefined })),
      globalFont,
      globalTemplateId,
      globalFitMode,
      backgroundMode,
      panoramicImage,
      globalHeadlineSize,
      globalSubheadlineSize,
      globalSidePadding,
      globalDevicePadding
    };
    localStorage.setItem('aso-studio-pro-project', JSON.stringify(project));
  }, [screenshots, globalFont, globalTemplateId, globalFitMode, backgroundMode, panoramicImage, globalHeadlineSize, globalSubheadlineSize, globalSidePadding, globalDevicePadding]);

  const { handleBackClick } = useToolNavigation({
    toolName: 'ASO Screenshot Generator',
    isToolUsed,
    onReset: () => {
      localStorage.removeItem('aso-studio-pro-project');
      setScreenshots([]);
      setAppIcon(null);
      setGlobalShowIcon(true);
      setSelectedIPhoneSize(IPHONE_SIZES[0]);
      setSelectedIPadSize(IPAD_SIZES[0]);
      setSelectedAndroidSize(ANDROID_SIZES[0]);
      setGlobalFont(FONTS[0].family);
      setGlobalTemplateId('classic');
      setIphoneCustomWidth('1242');
      setIphoneCustomHeight('2688');
      setIpadCustomWidth('2048');
      setIpadCustomHeight('2732');
      setAndroidCustomWidth('1080');
      setAndroidCustomHeight('2400');
      setCustomUnit('px');
      setIsProcessing(false);
      setPreviewMode('iphone');
      setBackgroundMode('individual');
      setPanoramicImage(null);
      setBulkText('');
      setShowPrompt(false);
      setGlobalFitMode('contain');
      setGlobalDevicePadding(0);
      setGlobalHeadlineSize(1);
      setGlobalSubheadlineSize(1);
      setGlobalSidePadding(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (iconInputRef.current) iconInputRef.current.value = '';
    }
  });

  const getEffectiveSize = (size: ScreenSize, type: 'iphone' | 'ipad' | 'android'): ScreenSize => {
    if (size.id.includes('custom')) {
      let w = 0, h = 0;
      if (type === 'iphone') { w = parseFloat(iphoneCustomWidth); h = parseFloat(iphoneCustomHeight); }
      else if (type === 'ipad') { w = parseFloat(ipadCustomWidth); h = parseFloat(ipadCustomHeight); }
      else { w = parseFloat(androidCustomWidth); h = parseFloat(androidCustomHeight); }
      
      const factor = customUnit === 'inch' ? 300 : 1;
      return { ...size, width: Math.round(w * factor), height: Math.round(h * factor), label: `${Math.round(w * factor)}x${Math.round(h * factor)}` };
    }
    return size;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Sort files by lastModified to respect capture order
    const sortedFiles = (Array.from(files) as File[]).sort((a, b) => a.lastModified - b.lastModified);

    const newItems: ScreenshotItem[] = sortedFiles.map((file: File) => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      previewUrl: URL.createObjectURL(file),
      headline: 'Amazing Feature',
      subheadline: 'Describe how it works here',
      backgroundColor: '#2E5C6E',
      secondaryColor: '#1D3D4A',
      textColor: '#ffffff',
      frameColor: '#000000',
      templateId: globalTemplateId,
      showIcon: true,
      headlineFont: globalFont,
      subheadlineFont: globalFont,
      headlineSize: 1,
      subheadlineSize: 1,
      sidePadding: 0
    }));

    setScreenshots(prev => [...prev, ...newItems]);
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAppIcon({ file, url: URL.createObjectURL(file) });
  };


  const removeScreenshot = (id: string) => {
    setScreenshots(prev => prev.filter(s => s.id !== id));
  };

  const updateScreenshot = (id: string, updates: Partial<ScreenshotItem>) => {
    setScreenshots(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const drawDeviceFrame = (
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    frameColor: string,
    img: HTMLImageElement,
    type: 'iphone' | 'ipad' | 'android',
    fitMode: 'contain' | 'cover' | 'stretch' = 'stretch',
    devicePadding: number = 0
  ) => {
    const isTablet = type === 'ipad' || type === 'android' && width > height;
    const bezel = (isTablet ? width * 0.04 : width * 0.05) + devicePadding;
    const radius = isTablet ? width * 0.05 : width * 0.12;
    const screenRadius = radius * 0.8;

    // High-Fidelity Shadow
    ctx.save();
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = width * 0.1;
    ctx.shadowOffsetY = width * 0.05;
    
    // Draw Device Body (Clay Style)
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = frameColor;
    ctx.fill();
    
    // Subtle Inner Glow for Clay look
    ctx.strokeStyle = 'rgba(255,255,255,0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Draw Screen
    ctx.save();
    const screenX = x + bezel;
    const screenY = y + bezel;
    const screenW = width - bezel * 2;
    const screenH = height - bezel * 2;

    ctx.beginPath();
    ctx.roundRect(screenX, screenY, screenW, screenH, screenRadius);
    ctx.clip();

    if (fitMode === 'stretch') {
      ctx.drawImage(img, screenX, screenY, screenW, screenH);
    } else {
      const imgAspect = img.width / img.height;
      const screenAspect = screenW / screenH;

      let drawW, drawH, drawX, drawY;

      if (fitMode === 'contain') {
        if (imgAspect > screenAspect) {
          drawW = screenW;
          drawH = screenW / imgAspect;
        } else {
          drawH = screenH;
          drawW = screenH * imgAspect;
        }
        drawX = screenX + (screenW - drawW) / 2;
        drawY = screenY + (screenH - drawH) / 2;
        ctx.fillStyle = '#000';
        ctx.fillRect(screenX, screenY, screenW, screenH);
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      } else if (fitMode === 'cover') {
        if (imgAspect > screenAspect) {
          drawH = screenH;
          drawW = screenH * imgAspect;
        } else {
          drawW = screenW;
          drawH = screenW / imgAspect;
        }
        drawX = screenX + (screenW - drawW) / 2;
        drawY = screenY + (screenH - drawH) / 2;
        ctx.drawImage(img, drawX, drawY, drawW, drawH);
      }
    }
    
    // Screen Reflection Overlay
    const grad = ctx.createLinearGradient(screenX, screenY, screenX + screenW, screenY + screenH);
    grad.addColorStop(0, 'rgba(255,255,255,0.1)');
    grad.addColorStop(0.5, 'transparent');
    grad.addColorStop(1, 'rgba(0,0,0,0.05)');
    ctx.fillStyle = grad;
    ctx.fillRect(screenX, screenY, screenW, screenH);
    
    ctx.restore();

    // Hardware Details
    if (type === 'iphone' || type === 'android') {
      const pillWidth = width * 0.2;
      const pillHeight = height * 0.02;
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.beginPath();
      // Dynamic Hardware: Pill for Pro models, tiny circle for standard Android
      if (type === 'iphone') {
        ctx.roundRect(x + (width - pillWidth) / 2, y + bezel * 0.5, pillWidth, pillHeight, pillHeight / 2);
      } else {
        const dotSize = width * 0.02;
        ctx.arc(x + width / 2, y + bezel * 0.6, dotSize, 0, Math.PI * 2);
      }
      ctx.fill();
    }
  };

  const generateAndDownload = async () => {
    if (screenshots.length === 0) return;
    setIsProcessing(true);

    const zip = new JSZip();
    const iphoneFolder = zip.folder("iPhone");
    const ipadFolder = zip.folder("iPad");
    const androidFolder = zip.folder("PlayConsole_Android");

    const iphoneSize = getEffectiveSize(selectedIPhoneSize, 'iphone');
    const ipadSize = getEffectiveSize(selectedIPadSize, 'ipad');
    const androidSize = getEffectiveSize(selectedAndroidSize, 'android');

    try {
      const iconImg = appIcon ? await loadImage(appIcon.url).catch(() => null) : null;
      const panoImg = panoramicImage ? await loadImage(panoramicImage).catch(() => null) : null;

      for (let i = 0; i < screenshots.length; i++) {
        const item = screenshots[i];
        try {
          const img = await loadImage(item.previewUrl);
          const individualBgImg = item.customBackgroundUrl ? await loadImage(item.customBackgroundUrl).catch(() => null) : null;
  
          // Generate for iPhone
          if (exportIPhone) {
            const iphoneCanvas = document.createElement('canvas');
            drawOnCanvas(iphoneCanvas, item, img, iphoneSize, iconImg, i, screenshots.length, panoImg, individualBgImg);
            const iphoneBlob = await canvasToBlob(iphoneCanvas);
            if (iphoneBlob && iphoneFolder) {
              iphoneFolder.file(`IPhone_${iphoneSize.label}_${i + 1}.png`, iphoneBlob);
            }
          }
  
          // Generate for iPad
          if (exportIPad) {
            const ipadCanvas = document.createElement('canvas');
            drawOnCanvas(ipadCanvas, item, img, ipadSize, iconImg, i, screenshots.length, panoImg, individualBgImg);
            const ipadBlob = await canvasToBlob(ipadCanvas);
            if (ipadBlob && ipadFolder) {
              ipadFolder.file(`IPad_${ipadSize.label}_${i + 1}.png`, ipadBlob);
            }
          }
  
          // Generate for Android (Play Console)
          if (exportAndroid) {
            const androidCanvas = document.createElement('canvas');
            drawOnCanvas(androidCanvas, item, img, androidSize, iconImg, i, screenshots.length, panoImg, individualBgImg);
            const androidBlob = await canvasToBlob(androidCanvas);
            if (androidBlob && androidFolder) {
              androidFolder.file(`Android_${androidSize.label}_${i + 1}.png`, androidBlob);
            }
          }
        } catch (itemErr) {
          console.error(`Skipping item ${i+1} due to load error:`, itemErr);
          alert(`⚠️ Error: The image for Screenshot ${i+1} is missing or expired.\n\nIf you refreshed the page, your previously uploaded images cannot be recovered automatically. Please re-upload your screenshots and try exporting again.`);
          setIsProcessing(false);
          return;
        }
      }

      const content = await zip.generateAsync({ type: 'blob' });
      downloadBlob(content, `ASO_Screenshots_Pro_Export.zip`);

      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#10b981', '#ffffff']
      });

    } catch (err) {
      console.error('Error generating screenshots:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const drawWrappedText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ): number => {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line.trim(), x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line.trim(), x, currentY);
    return currentY + lineHeight;
  };

  const measureWrappedTextHeight = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
    lineHeight: number
  ): number => {
    if (!text) return 0;
    const words = text.split(' ');
    let line = '';
    let lines = 1;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        line = words[n] + ' ';
        lines++;
      } else {
        line = testLine;
      }
    }
    return lines * lineHeight;
  };

  const drawBadge = (
    ctx: CanvasRenderingContext2D,
    type: 'stars' | 'award',
    x: number,
    y: number,
    size: number
  ) => {
    ctx.save();
    if (type === 'stars') {
      const starSize = size / 5;
      ctx.fillStyle = '#FFD700'; // Gold
      for (let i = 0; i < 5; i++) {
        const starX = x + i * starSize * 1.2;
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
           ctx.lineTo(
            starX + starSize/2 * Math.cos((18 + j * 72) * Math.PI / 180),
            y + starSize/2 * Math.sin((18 + j * 72) * Math.PI / 180)
          );
          ctx.lineTo(
            starX + starSize/4 * Math.cos((54 + j * 72) * Math.PI / 180),
            y + starSize/4 * Math.sin((54 + j * 72) * Math.PI / 180)
          );
        }
        ctx.closePath();
        ctx.fill();
      }
    } else {
      // Award Badge
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size/2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000';
      ctx.font = `black ${size/4}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.fillText('#1', x + size/2, y + size/1.8);
      
      // Laurel Wreath
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size * 0.6, 0.2 * Math.PI, 0.8 * Math.PI);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + size/2, y + size/2, size * 0.6, 1.2 * Math.PI, 1.8 * Math.PI);
      ctx.stroke();
    }
    ctx.restore();
  };

  const drawOnCanvas = (
    canvas: HTMLCanvasElement,
    item: ScreenshotItem,
    img: HTMLImageElement,
    size: ScreenSize,
    iconImg: HTMLImageElement | null,
    shotIndex: number = 0,
    totalShots: number = 1,
    panoImg: HTMLImageElement | null = null,
    individualBgImg: HTMLImageElement | null = null
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width;
    canvas.height = size.height;

    const template = TEMPLATES.find(t => t.id === item.templateId) || TEMPLATES[0];

    // --- Background Layer ---
    if (individualBgImg) {
      // Individual Custom Background (Priority 1)
      if (item.backgroundBlur) {
        ctx.save();
        ctx.filter = `blur(${item.backgroundBlur}px)`;
      }
      ctx.drawImage(individualBgImg, 0, 0, size.width, size.height);
      if (item.backgroundBlur) ctx.restore();
    } else if (backgroundMode === 'panoramic' && panoImg) {
      // Panoramic Logic (Priority 2)
      const sliceWidth = panoImg.width / totalShots;
      ctx.drawImage(
        panoImg, 
        shotIndex * sliceWidth, 0, sliceWidth, panoImg.height, 
        0, 0, size.width, size.height
      );
    } else {
      // Solid/Gradient (Priority 3)
      if (template.backgroundType === 'gradient') {
        const grad = ctx.createLinearGradient(0, 0, size.width, size.height);
        grad.addColorStop(0, item.backgroundColor);
        grad.addColorStop(1, item.secondaryColor);
        ctx.fillStyle = grad;
      } else if (template.backgroundType === 'mesh') {
        ctx.fillStyle = item.backgroundColor;
        ctx.fillRect(0, 0, size.width, size.height);
        ctx.globalAlpha = 0.4;
        const grad1 = ctx.createRadialGradient(size.width * 0.2, size.height * 0.2, 0, size.width * 0.2, size.height * 0.2, size.width * 0.8);
        grad1.addColorStop(0, item.secondaryColor);
        grad1.addColorStop(1, 'transparent');
        ctx.fillStyle = grad1;
        ctx.fillRect(0, 0, size.width, size.height);
        ctx.globalAlpha = 1.0;
      } else {
        ctx.fillStyle = item.backgroundColor;
      }
      ctx.fillRect(0, 0, size.width, size.height);
    }

    // Subtle Noise Overlay
    ctx.globalAlpha = 0.02;
    for (let i = 0; i < 50; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * size.width, Math.random() * size.height, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // Layout Constants
    const basePadding = size.width * 0.08;
    const effectiveSidePadding = basePadding + (item.sidePadding + globalSidePadding) * (size.width / 1000);
    const textSectionHeight = size.height * 0.28;
    const maxTextWidth = (template.layout === 'split-left' || template.layout === 'split-right') ? size.width * 0.4 : size.width - (effectiveSidePadding * 2);

    // Draw Text
    ctx.fillStyle = item.textColor;
    ctx.textAlign = template.layout.includes('split') ? 'left' : 'center';
    ctx.textBaseline = 'top';

    const headlineFontSize = size.width * 0.07 * item.headlineSize * globalHeadlineSize;
    const subheadlineFontSize = size.width * 0.04 * item.subheadlineSize * globalSubheadlineSize;

    ctx.font = `bold ${headlineFontSize}px ${item.headlineFont}`;
    const headlineHeight = measureWrappedTextHeight(ctx, item.headline, maxTextWidth, headlineFontSize * 1.2);

    ctx.font = `${subheadlineFontSize}px ${item.subheadlineFont}`;
    const subheadlineHeight = measureWrappedTextHeight(ctx, item.subheadline, maxTextWidth, subheadlineFontSize * 1.3);

    const totalTextHeight = headlineHeight + subheadlineHeight + (size.width * 0.02);
    
    // --- Readability shadow ---
    ctx.save();
    if (item.customBackgroundUrl || globalShowBadge) {
      ctx.shadowColor = 'rgba(0,0,0,0.6)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 4;
    }

    let headlineY: number;
    if (template.layout === 'bottom-text') {
      headlineY = size.height - totalTextHeight - basePadding;
    } else if (template.layout === 'center-text') {
      headlineY = (size.height - totalTextHeight) / 2;
    } else {
      headlineY = basePadding + size.width * 0.05;
    }

    const headlineX = template.layout === 'split-left' ? effectiveSidePadding :
      template.layout === 'split-right' ? size.width - maxTextWidth - effectiveSidePadding :
        size.width / 2;

    ctx.font = `bold ${headlineFontSize}px ${item.headlineFont}`;
    const nextY = drawWrappedText(ctx, item.headline, headlineX, headlineY, maxTextWidth, headlineFontSize * 1.2);

    ctx.font = `${subheadlineFontSize}px ${item.subheadlineFont}`;
    const subheadlineY = nextY + size.width * 0.01;
    const finalY = drawWrappedText(ctx, item.subheadline, headlineX, subheadlineY, maxTextWidth, subheadlineFontSize * 1.3);
    
    ctx.restore(); // Reset shadow/context

    let contentTopY = headlineY;
    let contentBottomY = finalY;

    // Draw Icon if enabled
    if (iconImg && item.showIcon && globalShowIcon) {
      const iconSize = size.width * 0.12;
      const iconX = template.layout === 'split-left' ? effectiveSidePadding :
        template.layout === 'split-right' ? size.width - maxTextWidth - effectiveSidePadding :
          size.width / 2 - iconSize / 2;

      let iconY = 0;
      if (template.layout === 'bottom-text') {
        iconY = contentTopY - iconSize - 20;
        contentTopY = iconY;
      } else {
        iconY = contentBottomY + 20;
        contentBottomY = iconY + iconSize;
      }

      ctx.save();
      ctx.beginPath();
      ctx.roundRect(iconX, iconY, iconSize, iconSize, iconSize * 0.2);
      ctx.clip();
      ctx.drawImage(iconImg, iconX, iconY, iconSize, iconSize);
      ctx.restore();
    }

    // Draw Device Frame
    const imgAspect = img.width / img.height;
    let frameWidth = size.width * 0.82;
    let frameHeight = frameWidth / imgAspect;

    if (frameHeight > size.height * 0.7) {
      frameHeight = size.height * 0.7;
      frameWidth = frameHeight * imgAspect;
    }

    let frameX = (size.width - frameWidth) / 2;
    let frameY: number;

    if (template.layout === 'bottom-text') {
      frameY = basePadding;
    } else if (template.layout === 'center-text') {
      frameY = (size.height - frameHeight) / 2;
    } else if (template.layout.includes('split')) {
      frameX = template.layout === 'split-left' ? size.width * 0.5 : -size.width * 0.3;
      frameY = (size.height - frameHeight) / 2;
    } else {
      frameY = size.height - frameHeight - basePadding * 0.5;
    }

    // Draw Badges
    // Position dynamically related to the text & icon block to prevent overlaps
    if (globalShowBadge) {
      const badgeSize = size.width * 0.15;
      const actualBadgeWidth = badgeSize * 1.2 * (badgeType === 'stars' ? 1.5 : 1);
      const badgeX = template.layout === 'split-left' ? effectiveSidePadding :
        template.layout === 'split-right' ? size.width - maxTextWidth - effectiveSidePadding :
          (size.width - actualBadgeWidth) / 2;
          
      let badgeY = 0;
      if (template.layout === 'bottom-text') {
          badgeY = contentTopY - badgeSize - 20;
          contentTopY = badgeY;
      } else {
          badgeY = contentBottomY + 20;
          contentBottomY = badgeY + badgeSize;
      }
      
      drawBadge(ctx, badgeType, badgeX, badgeY, badgeSize);
    }

    drawDeviceFrame(ctx, frameX, frameY, frameWidth, frameHeight, item.frameColor, img, size.type as any, globalFitMode, globalDevicePadding);
  };

  const loadImage = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  };

  const canvasToBlob = (canvas: HTMLCanvasElement): Promise<Blob | null> => {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-bg text-text transition-colors duration-300 selection:bg-primary/30">
      <SEO 
        title="Free Online ASO Screenshot Generator | ShaadDev Studio" 
        description="Create polished App Store and Play Store screenshots with customizable layouts, text, colors, and device sizes." 
        url="https://shaaddev.studio/tools/aso-screenshot" keywords="aso screenshot, app store asset grab, play store shots" />
      {/* Header */}
      <header className="sticky top-0 z-50 bg-bg/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-3">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept="image/*"
          className="hidden"
        />
        <input
          type="file"
          ref={iconInputRef}
          onChange={handleIconUpload}
          accept="image/*"
          className="hidden"
        />
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={handleBackClick} className="p-2 hover:bg-white/5 rounded-full transition-colors group" title={isToolUsed ? "(Click to reset)" : undefined}>
              <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-accent" />
            </button>
            <div 
              className="w-10 h-10 bg-slate-800 border border-white/10 flex items-center justify-center rounded-xl shadow-lg shadow-black/20 group relative overflow-hidden cursor-pointer shrink-0" 
              onClick={() => iconInputRef.current?.click()}
            >
              {appIcon ? (
                <img src={appIcon.url} className="w-full h-full object-cover p-1.5" />
              ) : (
                <Plus className="text-accent w-4 h-4 group-hover:scale-125 transition-transform" />
              )}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-[7px] font-black uppercase text-center leading-none px-1">
                {appIcon ? 'Change Icon' : 'Add App Icon'}
              </div>
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase flex items-center">
                ASO STUDIO
                <span className="text-accent text-[8px] ml-2 font-medium bg-accent/10 px-2 py-0.5 rounded-full border border-accent/20">PRO V3.8</span>
              </h1>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-accent animate-pulse" />
                <p className="text-[9px] text-text-tertiary uppercase font-black tracking-tighter leading-none">Studio Synthesis Active</p>
              </div>
            </div>
          </div>
 
          <div className="flex items-center gap-3">
            {screenshots.length > 0 && (
              <div className="flex items-center gap-1 bg-[#0a0a10] border border-white/10 p-1.5 rounded-xl shadow-inner">
                {[
                  { id: 'iphone', label: 'iOS Phone', active: exportIPhone, toggle: () => setExportIPhone(!exportIPhone) },
                  { id: 'ipad', label: 'iOS Tablet', active: exportIPad, toggle: () => setExportIPad(!exportIPad) },
                  { id: 'android', label: 'Android', active: exportAndroid, toggle: () => setExportAndroid(!exportAndroid) },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={p.toggle}
                    className={cn(
                      "px-3 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border shrink-0",
                      p.active 
                        ? "bg-[#06B6D4] text-[#0F1115] border-[#06B6D4] shadow-[0_0_15px_rgba(6,182,212,0.4)]" 
                        : "bg-[#1e293b] text-white/50 border-white/10 hover:text-white hover:bg-slate-700"
                    )}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            )}
            
            {screenshots.length > 0 && (
              <button
                onClick={generateAndDownload}
                disabled={isProcessing || (!exportIPhone && !exportIPad && !exportAndroid)}
                className="btn-primary py-2 px-6 !text-slate-950"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Synthesizing...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Export {screenshots.length * ([exportIPhone, exportIPad, exportAndroid].filter(Boolean).length)} Assets</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-4 lg:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Sidebar Controls */}

          {/* Sidebar Controls - Categorized for Pro Workflow */}
          <aside className="lg:col-span-3 space-y-6 lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto pr-2 custom-scrollbar">
            <div className="grid grid-cols-4 gap-2 bg-surface/50 p-1 rounded-2xl border border-white/5 mb-6">
              {[
                { id: 'template', label: 'Layout', icon: Layout },
                { id: 'canvas', label: 'Canvas', icon: Monitor },
                { id: 'branding', label: 'Brand', icon: Sparkles },
                { id: 'assets', label: 'Production', icon: Layers },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id as any)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all relative group",
                    activeCategory === cat.id ? "bg-surface-variant text-accent shadow-lg border border-white/5" : "text-text-tertiary hover:text-text-secondary hover:bg-white/5"
                  )}
                >
                  <cat.icon className={cn("w-4 h-4", activeCategory === cat.id ? "text-accent" : "text-text-tertiary group-hover:text-text-secondary")} />
                  <span className="text-[8px] font-black uppercase tracking-widest">{cat.label}</span>
                  {activeCategory === cat.id && (
                    <motion.div layoutId="activeCat" className="absolute -bottom-1 w-1 h-1 rounded-full bg-accent" />
                  )}
                </button>
              ))}
            </div>

            {/* Category: Template */}
            {activeCategory === 'template' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <section className="glass-panel p-5 space-y-4">
                  <div className="flex items-center gap-2 brightness-110">
                    <ImageIcon className="w-3.5 h-3.5 text-accent" />
                     <h2 className="section-title">Gallery Flow Strategy</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {['individual', 'panoramic'].map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setBackgroundMode(mode as any)}
                        className={cn(
                          "py-2 rounded-lg border text-[10px] font-black uppercase transition-all",
                          backgroundMode === mode ? "bg-accent/20 border-accent/50 text-white" : "border-white/5 text-text-tertiary hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>

                  {backgroundMode === 'panoramic' && (
                    <div className="space-y-3 pt-2">
                       <p className="text-[9px] text-white/40 uppercase font-black tracking-tighter italic">Recommended: 3000x2000px+</p>
                       <button
                        onClick={() => {
                          const input = document.createElement('input');
                          input.type = 'file';
                          input.accept = 'image/*';
                          input.onchange = (e: any) => {
                            const file = e.target.files?.[0];
                            if (file) setPanoramicImage(URL.createObjectURL(file));
                          };
                          input.click();
                        }}
                        className="w-full py-3 bg-white/5 border border-dashed border-white/10 rounded-xl flex items-center justify-center gap-2 hover:border-primary/50 transition-all text-[10px] font-black uppercase text-white/60"
                      >
                        {panoramicImage ? <Check className="w-3 h-3 text-primary" /> : <Plus className="w-3 h-3" />}
                        {panoramicImage ? 'Change Pano Background' : 'Upload Pano Background'}
                      </button>
                    </div>
                  )}
                </section>

                <section className="glass-panel p-5 space-y-4 shadow-sm border-white/[0.03]">
                  <div className="flex items-center justify-between brightness-110">
                    <div className="flex items-center gap-2">
                       <Grid3X3 className="w-3.5 h-3.5 text-accent" />
                       <h2 className="section-title">Global Layout Template</h2>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {TEMPLATES.map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setGlobalTemplateId(template.id);
                          setScreenshots(prev => prev.map(s => ({ ...s, templateId: template.id })));
                        }}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl border text-[11px] font-black transition-all flex items-center justify-between group",
                          globalTemplateId === template.id ? "bg-accent/20 border-accent text-white" : "bg-white/5 border-white/5 text-text-tertiary hover:bg-white/10 hover:text-white"
                        )}
                      >
                        <span>{template.name}</span>
                        <ChevronRight className="w-3 h-3 opacity-40 group-hover:translate-x-1 transition-transform" />
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* Category: Canvas */}
            {activeCategory === 'canvas' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <section className="glass-panel p-5 space-y-5">
                  <div className="flex items-center gap-2 brightness-110">
                    <Monitor className="w-3.5 h-3.5 text-accent" />
                    <h2 className="section-title">Target Ecosystems</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[9px] font-black text-text-tertiary uppercase tracking-widest">Apple App Store</label>
                        <Smartphone className="w-3 h-3 text-text-tertiary/40" />
                      </div>
                      <div className="grid grid-cols-1 gap-2">
                        {IPHONE_SIZES.concat(IPAD_SIZES).filter(s => !s.id.includes('custom')).map(size => (
                          <button
                            key={size.id}
                            onClick={() => size.type === 'iphone' ? setSelectedIPhoneSize(size) : setSelectedIPadSize(size)}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg border text-[10px] uppercase font-black transition-all flex items-center justify-between",
                              (selectedIPhoneSize.id === size.id || selectedIPadSize.id === size.id) ? "bg-accent/20 border-accent/40 text-accent" : "bg-white/5 border-white/5 text-text-tertiary hover:bg-white/10"
                            )}
                          >
                            <span>{size.name}</span>
                            <span className="opacity-40">{size.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      <label className="text-[9px] font-black text-white/30 uppercase tracking-widest">Google Play Store</label>
                      <div className="grid grid-cols-1 gap-2">
                        {ANDROID_SIZES.filter(s => !s.id.includes('custom')).map(size => (
                          <button
                            key={size.id}
                            onClick={() => setSelectedAndroidSize(size)}
                            className={cn(
                              "w-full text-left px-4 py-2 rounded-lg border text-[10px] uppercase font-black transition-all flex items-center justify-between",
                              selectedAndroidSize.id === size.id ? "bg-[#3DDC84] text-black border-[#3DDC84]" : "bg-white/5 border-white/5 text-white/40"
                            )}
                          >
                            <span>{size.name}</span>
                            <span className="opacity-40">{size.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="glass-panel p-5 space-y-4">
                  <h2 className="section-title">Global Adjustments</h2>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="control-label uppercase">Screenshot Fit</label>
                      <div className="grid grid-cols-3 gap-2">
                        {['contain', 'cover', 'stretch'].map(mode => (
                          <button
                            key={mode}
                            onClick={() => setGlobalFitMode(mode as any)}
                            className={cn(
                              "py-2 rounded-lg border text-[8px] font-black uppercase transition-all",
                              globalFitMode === mode ? "bg-primary/20 border-primary/50 text-white" : "border-white/5 text-white/20"
                            )}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <label className="control-label uppercase">Inner Padding</label>
                        <span className="text-[10px] font-black text-primary">{globalDevicePadding}px</span>
                      </div>
                      <input type="range" min="0" max="100" value={globalDevicePadding} onChange={e => setGlobalDevicePadding(parseInt(e.target.value))} className="w-full accent-primary h-1 bg-white/5 rounded-lg appearance-none cursor-pointer" />
                    </div>
                  </div>
                </section>
              </div>
            )}

            {/* Category: Branding */}
            {activeCategory === 'branding' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <section className="glass-panel p-5 space-y-4">
                  <div className="flex items-center justify-between brightness-110">
                    <div className="flex items-center gap-2">
                       <Type className="w-3.5 h-3.5 text-accent" />
                       <h2 className="section-title">Global Typography</h2>
                    </div>
                    <button 
                      onClick={() => setScreenshots(prev => prev.map(s => ({ ...s, headlineFont: globalFont, subheadlineFont: globalFont })))}
                      className="text-[8px] font-black text-accent uppercase hover:text-white transition-all bg-accent/5 px-2 py-1 rounded border border-accent/20"
                    >
                      Apply to All
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {FONTS.map(font => (
                      <button
                        key={font.name}
                        onClick={() => {
                          setGlobalFont(font.family);
                          setScreenshots(prev => prev.map(s => ({ ...s, headlineFont: font.family, subheadlineFont: font.family })));
                        }}
                        className={cn(
                          "px-4 py-3 rounded-xl border text-[11px] font-black transition-all text-left",
                          globalFont === font.family ? "bg-accent/20 border-accent/40 text-white" : "bg-white/3 border-white/5 text-text-tertiary hover:bg-white/5"
                        )}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name} Typeface
                      </button>
                    ))}
                  </div>
                </section>

                <section className="glass-panel p-5 space-y-4">
                  <div className="flex items-center gap-2 brightness-110">
                    <Sparkles className="w-3.5 h-3.5 text-accent" />
                    <h2 className="section-title">Visual Branding Assets</h2>
                  </div>
                  <div className="space-y-6">
                    {/* App Icon Upload */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                         <label className="control-label uppercase">App Icon</label>
                         <button onClick={() => setGlobalShowIcon(!globalShowIcon)} className={cn("text-[9px] font-black uppercase tracking-widest", globalShowIcon ? "text-primary" : "text-white/20")}>
                           {globalShowIcon ? 'Visible' : 'Hidden'}
                         </button>
                      </div>
                      <div onClick={() => iconInputRef.current?.click()} className="w-full h-24 bg-white/5 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all relative overflow-hidden group">
                        {appIcon ? (
                          <>
                            <img src={appIcon.url} className="w-full h-full object-contain p-4" />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[10px] font-black text-white uppercase">Change Icon</div>
                          </>
                        ) : (
                          <Plus className="w-6 h-6 text-white/10 group-hover:text-primary transition-all" />
                        )}
                      </div>
                    </div>

                    {/* Social Proof Badges */}
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center">
                         <label className="control-label uppercase">Social Proof</label>
                         <button onClick={() => setGlobalShowBadge(!globalShowBadge)} className={cn("text-[9px] font-black uppercase tracking-widest", globalShowBadge ? "text-primary" : "text-white/20")}>
                           {globalShowBadge ? 'Enabled' : 'Disabled'}
                         </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {['stars', 'award'].map(type => (
                          <button
                            key={type}
                            onClick={() => setBadgeType(type as any)}
                            className={cn(
                              "py-2 rounded-lg border text-[9px] font-black uppercase transition-all",
                              badgeType === type ? "bg-primary/20 border-primary text-white" : "border-white/5 text-white/20"
                            )}
                          >
                            {type} Badge
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </div>
            )}

            {activeCategory === 'assets' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-left-2 duration-300">
                <section className="glass-panel p-5 space-y-4">
                  <div className="flex items-center gap-2 brightness-110">
                    <Edit3 className="w-3.5 h-3.5 text-accent" />
                    <h2 className="section-title">Bulk Logic Editor</h2>
                  </div>
                  <p className="text-[9px] text-text-tertiary uppercase font-black tracking-tighter leading-relaxed">
                    Format: Headline $- Subheadline (One per line)
                  </p>
                  <textarea
                    value={bulkText}
                    onChange={(e) => {
                      const val = e.target.value;
                      setBulkText(val);
                      const lines = val.split('\n').filter(l => l.trim());
                      setScreenshots(prev => prev.map((s, i) => {
                        if (lines[i]) {
                          let [h, sh] = lines[i].split('$-').map(t => t.trim());
                          return { ...s, headline: h || s.headline, subheadline: sh || s.subheadline };
                        }
                        return s;
                      }));
                    }}
                    className="w-full h-48 bg-bg/40 border-2 border-dashed border-white/10 rounded-xl p-4 text-[11px] font-mono text-text focus:border-accent/40 outline-none resize-none transition-all"
                    placeholder="E.g. High Performance $- Fast & Stable"
                  />
                </section>
 
                <section className="glass-panel p-5 space-y-4">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full py-4 bg-accent text-bg font-black uppercase text-[11px] tracking-widest rounded-xl hover:bg-white transition-all shadow-lg shadow-accent/20 flex items-center justify-center gap-2"
                  >
                    <PlusSquare className="w-4 h-4" /> Import New Assets
                  </button>
                  <button
                    onClick={() => setScreenshots([])}
                    className="w-full py-3 bg-red-500/5 border border-red-500/10 text-red-500/60 font-black uppercase text-[10px] tracking-widest rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Purge Project
                  </button>
                </section>
              </div>
            )}

          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {screenshots.length > 0 && (
              <section className="glass-panel p-4 overflow-hidden">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    <h2 className="font-bold text-[10px] uppercase tracking-wider">Reorder Assets</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setScreenshots([])}
                      className="text-[9px] font-bold text-text-tertiary hover:text-red-400 transition-all uppercase tracking-widest"
                    >
                      Clear All
                    </button>
                    <span className="text-[9px] text-text-tertiary font-medium uppercase tracking-widest">{screenshots.length} Screenshots</span>
                  </div>
                </div>

                <Reorder.Group 
                  axis="x" 
                  values={screenshots} 
                  onReorder={setScreenshots}
                  className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar"
                >
                  {screenshots.map((item, index) => (
                    <Reorder.Item
                      key={item.id}
                      value={item}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="flex-shrink-0 w-24 space-y-2 group cursor-grab active:cursor-grabbing"
                    >
                      <div className="relative aspect-[9/16] rounded-lg overflow-hidden border border-border bg-surface-variant transition-transform group-hover:scale-105">
                        <img
                          src={item.previewUrl}
                          alt={`Screen ${index + 1}`}
                          className="w-full h-full object-cover pointer-events-none"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                          <button
                            onClick={() => removeScreenshot(item.id)}
                            className="p-2 bg-red-500/20 hover:bg-red-500/40 rounded-full transition-colors"
                            title="Remove"
                          >
                            <Trash2 className="w-4 h-4 text-red-400" />
                          </button>
                        </div>
                        <div className="absolute top-1 left-1 w-5 h-5 rounded bg-primary text-[10px] font-black flex items-center justify-center text-black shadow-lg">
                          {index + 1}
                        </div>
                      </div>
                      <p className="text-[8px] text-white/40 truncate text-center font-black uppercase tracking-tighter px-1">
                        Screen {index + 1}
                      </p>
                    </Reorder.Item>
                  ))}
                  
                  {/* Add More Button in Reorder Group */}
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-shrink-0 w-24 aspect-[9/16] rounded-lg border-2 border-dashed border-white/10 hover:border-accent/40 bg-surface/30 hover:bg-surface-variant/40 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all group/add"
                  >
                    <div className="p-2 rounded-full bg-accent/10 text-accent group-hover/add:scale-110 transition-transform">
                      <Plus className="w-5 h-5" />
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-text-tertiary">Add More</span>
                  </div>
                </Reorder.Group>
              </section>
            )}

            {screenshots.length === 0 ? (
              <div className="glass-panel min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-dashed border-2 border-border">
                <div className="w-16 h-16 bg-surface-variant rounded-2xl flex items-center justify-center mb-6">
                  <ImageIcon className="w-8 h-8 text-text-secondary" />
                </div>
                <h3 className="text-xl font-bold mb-2 tracking-tight text-text">No Assets Uploaded</h3>
                <p className="text-text-secondary max-w-xs mx-auto text-xs leading-relaxed mb-8">
                  Upload your raw screenshots to begin generating professional App Store assets.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="btn-primary"
                >
                  <Upload className="w-4 h-4" />
                  Upload Screenshots
                </button>
              </div>
            ) : (
              <div className="space-y-8">
                <AnimatePresence mode="popLayout">
                  {screenshots.map((item, index) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="glass-panel overflow-hidden group"
                    >
                      {/* Screenshot Header */}
                      <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-surface-variant/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-surface-variant flex items-center justify-center text-text-secondary font-bold text-xs border border-border">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="font-bold text-xs text-text truncate max-w-[200px]">{item.file.name}</h3>
                            <p className="text-[9px] text-text-tertiary font-medium uppercase tracking-wider">Asset ID: {item.id}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeScreenshot(item.id)}
                          className="w-8 h-8 flex items-center justify-center text-text-tertiary hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="p-6 grid grid-cols-1 xl:grid-cols-2 gap-8">
                        {/* Editor Column (Individual Control) */}
                        <div className="space-y-8 order-2 xl:order-1">
                          {/* Fine-Tune Individual Asset */}
                          <section className="space-y-4">
                            <div className="flex items-center gap-2 brightness-110 border-b border-white/5 pb-2">
                               <Settings2 className="w-3.5 h-3.5 text-accent" />
                               <h3 className="text-[10px] uppercase font-black tracking-widest text-text">Fine-Tune Slide {index + 1}</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 gap-4">
                               {/* Background Image Upload */}
                               <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                     <label className="text-[9px] font-black uppercase text-text-tertiary">Custom Background</label>
                                     {item.customBackgroundUrl && (
                                        <button 
                                           onClick={() => updateScreenshot(item.id, { customBackgroundUrl: undefined })}
                                           className="text-[8px] font-black text-red-500 uppercase hover:text-red-400"
                                         >Reset</button>
                                     )}
                                  </div>
                                  <div 
                                     onClick={() => {
                                       const input = document.createElement('input');
                                       input.type = 'file';
                                       input.accept = 'image/*';
                                       input.onchange = (e: any) => {
                                         const file = e.target.files?.[0];
                                         if (file) updateScreenshot(item.id, { customBackgroundUrl: URL.createObjectURL(file) });
                                       };
                                       input.click();
                                     }}
                                     className="w-full h-24 bg-white/[0.02] border border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-accent/40 transition-all group/bg relative overflow-hidden"
                                  >
                                     {item.customBackgroundUrl ? (
                                       <>
                                         <img src={item.customBackgroundUrl} className="w-full h-full object-cover opacity-40 shadow-inner" />
                                         <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/bg:opacity-100 bg-black/40 transition-opacity">
                                            <span className="text-[8px] font-black uppercase text-white">Change</span>
                                         </div>
                                       </>
                                     ) : (
                                       <>
                                         <ImageIcon className="w-4 h-4 text-text-tertiary mb-1" />
                                         <span className="text-[8px] font-black uppercase text-text-tertiary">Upload Image</span>
                                       </>
                                     )}
                                  </div>
                               </div>
 
                               {/* Blur Slide */}
                               {item.customBackgroundUrl && (
                                  <div className="space-y-3">
                                     <div className="flex justify-between">
                                       <label className="text-[9px] font-black uppercase text-text-tertiary">Focus Blur</label>
                                       <span className="text-[10px] font-black text-accent">{item.backgroundBlur || 0}px</span>
                                     </div>
                                     <input type="range" min="0" max="40" value={item.backgroundBlur || 0} onChange={e => updateScreenshot(item.id, { backgroundBlur: parseInt(e.target.value) })} className="w-full accent-accent h-1 bg-white/5 rounded-lg appearance-none" />
                                  </div>
                               )}
                            </div>
                          </section>
 
                          {/* Text Editor */}
                          <div className="space-y-6 pt-4 border-t border-white/5">
                            <div className="space-y-3 group">
                              <div className="flex justify-between items-center">
                                 <label className="control-label uppercase tracking-widest text-[9px]">Slide Headline</label>
                                 <button onClick={() => setScreenshots(prev => prev.map(s => ({ ...s, headline: item.headline })))} className="text-[8px] font-black text-accent uppercase opacity-0 group-hover:opacity-100 hover:text-white transition-all">Apply All</button>
                              </div>
                              <textarea
                                value={item.headline}
                                onChange={(e) => updateScreenshot(item.id, { headline: e.target.value })}
                                className="control-input py-3 min-h-[80px] bg-white/[0.02] border-white/10 hover:border-accent/40 focus:border-accent transition-all resize-none text-sm font-medium"
                                placeholder="..."
                              />
                            </div>
                            <div className="space-y-3 group">
                              <div className="flex justify-between items-center">
                                 <label className="control-label uppercase tracking-widest text-[9px]">Slide Subheadline</label>
                                 <button onClick={() => setScreenshots(prev => prev.map(s => ({ ...s, subheadline: item.subheadline })))} className="text-[8px] font-black text-accent uppercase opacity-0 group-hover:opacity-100 hover:text-white transition-all">Apply All</button>
                              </div>
                              <textarea
                                value={item.subheadline}
                                onChange={(e) => updateScreenshot(item.id, { subheadline: e.target.value })}
                                className="control-input py-3 min-h-[80px] bg-white/[0.02] border-white/10 hover:border-accent/40 focus:border-accent transition-all resize-none text-sm font-medium"
                                placeholder="..."
                              />
                            </div>
                          </div>
                        </div>
 
                        {/* Preview Section */}
                        <div className="space-y-4 order-1 xl:order-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase font-bold text-text-secondary tracking-widest">Live Preview</label>
                            <div className="flex gap-1.5">
                              {/* Ecosystem Toggle */}
                              {[
                                { id: 'iphone', label: 'iOS Phone', color: 'primary' },
                                { id: 'ipad', label: 'iOS Tablet', color: 'primary' },
                                { id: 'android', label: 'Android', color: '[#3DDC84]' },
                              ].map((btn) => (
                                <button
                                  key={btn.id}
                                  onClick={() => setPreviewMode(btn.id as any)}
                                  className={cn(
                                    "px-3 py-1 rounded-lg text-[9px] font-black border transition-all uppercase tracking-widest",
                                    previewMode === btn.id 
                                      ? `bg-${btn.color} text-black border-${btn.color}` 
                                      : "bg-white/5 text-white/40 border-white/5 hover:bg-white/10"
                                  )}
                                >
                                  {btn.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        <div 
                          onClick={() => setActiveCategory('branding')}
                          className={cn(
                          "relative rounded-[2rem] overflow-hidden bg-[#0a0a0a] mx-auto border border-white/5 transition-all duration-500 shadow-2xl p-2 cursor-pointer group/preview",
                          previewMode === 'iphone' ? "aspect-[9/16.5] max-w-[280px]" : 
                          previewMode === 'android' ? "aspect-[9/20] max-w-[260px]" :
                          "aspect-[3/4.2] max-w-[380px]"
                        )}>
                            <div className="absolute inset-x-0 top-0 h-24 bg-accent/0 group-hover/preview:bg-accent/5 transition-all z-10 flex items-center justify-center">
                               <div className="opacity-0 group-hover/preview:opacity-100 transition-opacity bg-accent text-bg text-[8px] font-black px-2 py-1 rounded-full uppercase">Edit Styles</div>
                            </div>
                            <ScreenshotPreview
                              item={item}
                              size={previewMode === 'iphone' ? selectedIPhoneSize : previewMode === 'ipad' ? selectedIPadSize : selectedAndroidSize}
                              appIcon={appIcon}
                              globalShowIcon={globalShowIcon}
                              backgroundMode={backgroundMode}
                              panoramicImage={panoramicImage}
                              index={index}
                              totalScreenshots={screenshots.length}
                              onDraw={(canvas, itm, img, sz, iconImg, idx, total, panoImg, indBgImg) => {
                                drawOnCanvas(canvas, itm, img, sz, iconImg, idx, total, panoImg, indBgImg);
                              }}
                            />

                            {/* Store UI Overlay Preview */}
                            {showStoreOverlay && (
                               <div className="absolute inset-0 pointer-events-none animate-in fade-in duration-500">
                                  {previewMode === 'android' ? (
                                     <div className="w-full h-full bg-black/20">
                                         <div className="absolute top-0 w-full h-12 bg-gradient-to-b from-black/60 to-transparent flex items-center px-6 justify-between">
                                            <div className="w-20 h-2 bg-white/20 rounded-full" />
                                            <div className="flex gap-2">
                                              <div className="w-4 h-4 rounded-full bg-white/20" />
                                              <div className="w-4 h-4 rounded-full bg-white/20" />
                                            </div>
                                         </div>
                                         <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[80%] h-12 bg-[#3DDC84] rounded-xl flex items-center justify-center font-black text-black text-[10px] uppercase">Install App</div>
                                     </div>
                                  ) : (
                                    <div className="w-full h-full bg-black/20">
                                         <div className="absolute top-4 left-6">
                                            <div className="w-10 h-10 bg-white/10 rounded-xl" />
                                         </div>
                                         <div className="absolute top-4 right-6 w-16 h-7 bg-primary rounded-full flex items-center justify-center text-black font-black text-[10px] uppercase">GET</div>
                                    </div>
                                  )}
                               </div>
                            )}
                          </div>
                          
                          <button 
                            onClick={() => setShowStoreOverlay(!showStoreOverlay)}
                            className="w-full py-2 bg-white/5 border border-white/10 rounded-lg text-[9px] font-black uppercase text-white/40 hover:text-white transition-all"
                          >
                            {showStoreOverlay ? 'Hide Store Mockup' : 'Show Store Mockup Overlay'}
                          </button>
                        </div>

                        {/* Editor Section */}
                        <div className="space-y-8">
                          <div className="space-y-6">
                            <div className="space-y-3">
                              <label className="control-label">Template Style</label>
                              <div className="grid grid-cols-3 gap-2">
                                {TEMPLATES.map(template => (
                                  <button
                                    key={template.id}
                                    onClick={() => updateScreenshot(item.id, { templateId: template.id })}
                                    className={cn(
                                      "px-2 py-2 rounded-lg border text-[8px] font-bold transition-all text-center",
                                      item.templateId === template.id ? "bg-primary/20 border-primary/50 text-primary-light" : "bg-surface-variant border-border text-text-secondary hover:bg-surface"
                                    )}
                                  >
                                    {template.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="control-label">Headline</label>
                                <div className="flex gap-1">
                                  {FONTS.map(f => (
                                    <button
                                      key={f.name}
                                      onClick={() => updateScreenshot(item.id, { headlineFont: f.family })}
                                      className={cn(
                                        "w-6 h-6 rounded border text-[8px] flex items-center justify-center transition-all",
                                        item.headlineFont === f.family ? "bg-primary text-white border-primary" : "bg-surface-variant border-border text-text-secondary hover:bg-surface"
                                      )}
                                      title={f.name}
                                      style={{ fontFamily: f.family }}
                                    >
                                      Aa
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <input
                                type="text"
                                value={item.headline}
                                onChange={(e) => updateScreenshot(item.id, { headline: e.target.value })}
                                className="control-input"
                                placeholder="Enter catchy headline..."
                              />
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] text-text-tertiary uppercase font-bold">Headline Size</span>
                                  <span className="text-[8px] font-mono text-primary">{item.headlineSize.toFixed(1)}x</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="2.0"
                                  step="0.1"
                                  value={item.headlineSize}
                                  onChange={(e) => updateScreenshot(item.id, { headlineSize: parseFloat(e.target.value) })}
                                  className="w-full accent-primary h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <label className="control-label">Subheadline</label>
                                <div className="flex gap-1">
                                  {FONTS.map(f => (
                                    <button
                                      key={f.name}
                                      onClick={() => updateScreenshot(item.id, { subheadlineFont: f.family })}
                                      className={cn(
                                        "w-6 h-6 rounded border text-[8px] flex items-center justify-center transition-all",
                                        item.subheadlineFont === f.family ? "bg-primary text-white border-primary" : "bg-surface-variant border-border text-text-secondary hover:bg-surface"
                                      )}
                                      title={f.name}
                                      style={{ fontFamily: f.family }}
                                    >
                                      Aa
                                    </button>
                                  ))}
                                </div>
                              </div>
                              <textarea
                                value={item.subheadline}
                                onChange={(e) => updateScreenshot(item.id, { subheadline: e.target.value })}
                                className="control-input min-h-[80px] py-3 resize-none"
                                placeholder="Add more details..."
                              />
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] text-text-tertiary uppercase font-bold">Subheadline Size</span>
                                  <span className="text-[8px] font-mono text-primary">{item.subheadlineSize.toFixed(1)}x</span>
                                </div>
                                <input
                                  type="range"
                                  min="0.5"
                                  max="2.0"
                                  step="0.1"
                                  value={item.subheadlineSize}
                                  onChange={(e) => updateScreenshot(item.id, { subheadlineSize: parseFloat(e.target.value) })}
                                  className="w-full accent-primary h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                              <div className="space-y-1">
                                <div className="flex justify-between items-center">
                                  <span className="text-[8px] text-text-tertiary uppercase font-bold">Side Padding</span>
                                  <span className="text-[8px] font-mono text-primary">{item.sidePadding}px</span>
                                </div>
                                <input
                                  type="range"
                                  min="-50"
                                  max="150"
                                  value={item.sidePadding}
                                  onChange={(e) => updateScreenshot(item.id, { sidePadding: parseInt(e.target.value) })}
                                  className="w-full accent-primary h-1 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="control-label">Primary Background</label>
                              <div className="flex flex-wrap gap-2">
                                {BG_COLORS.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => updateScreenshot(item.id, { backgroundColor: color })}
                                    className={cn(
                                      "w-6 h-6 rounded border transition-all",
                                      item.backgroundColor === color ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-white/20"
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="control-label">Secondary (Gradient/Mesh)</label>
                              <div className="flex flex-wrap gap-2">
                                {BG_COLORS.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => updateScreenshot(item.id, { secondaryColor: color })}
                                    className={cn(
                                      "w-6 h-6 rounded border transition-all",
                                      item.secondaryColor === color ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-white/20"
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                              <label className="control-label">Text Color</label>
                              <div className="flex flex-wrap gap-2">
                                {['#ffffff', '#000000', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(color => (
                                  <button
                                    key={color}
                                    onClick={() => updateScreenshot(item.id, { textColor: color })}
                                    className={cn(
                                      "w-6 h-6 rounded border transition-all",
                                      item.textColor === color ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-white/20"
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="control-label">Frame Color</label>
                              <div className="flex flex-wrap gap-2">
                                {FRAME_COLORS.map(color => (
                                  <button
                                    key={color}
                                    onClick={() => updateScreenshot(item.id, { frameColor: color })}
                                    className={cn(
                                      "w-6 h-6 rounded border transition-all",
                                      item.frameColor === color ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-white/20"
                                    )}
                                    style={{ backgroundColor: color }}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                  <input
                                    type="checkbox"
                                    checked={item.showIcon}
                                    onChange={(e) => updateScreenshot(item.id, { showIcon: e.target.checked })}
                                    className="sr-only"
                                  />
                                  <div className={cn(
                                    "w-8 h-4 rounded-full transition-all",
                                    item.showIcon ? "bg-primary" : "bg-surface-variant"
                                  )} />
                                  <div className={cn(
                                    "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all shadow-sm",
                                    item.showIcon ? "left-4.5" : "left-0.5"
                                  )} />
                                </div>
                                <span className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider group-hover:text-text-secondary transition-all">Show Icon</span>
                              </label>
                            </div>

                            <div className="flex items-center gap-2">
                              <label className="text-[9px] font-bold text-text-tertiary uppercase tracking-wider">Hex</label>
                              <input
                                type="color"
                                value={item.textColor}
                                onChange={(e) => updateScreenshot(item.id, { textColor: e.target.value })}
                                className="w-6 h-6 rounded bg-transparent cursor-pointer border border-border"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Bottom Action */}
                <div className="flex justify-center pt-8">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-6 py-3 glass-panel hover:bg-surface-variant text-text-secondary hover:text-text rounded-xl font-bold transition-all active:scale-95 group border border-border"
                  >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                    Add More Screenshots
                  </button>
                </div>
              </div>
            )}
            
            {/* SEO Optimized Content Section */}
            <article className="glass-panel p-6 sm:p-8 rounded-2xl bg-black/30 border border-white/5 mt-12 space-y-6 text-sm text-white/70 leading-relaxed font-sans">
            <h2 className="text-xl font-black text-white uppercase tracking-wider font-mono">App Store Optimization (ASO) & Mockup Generator</h2>
            <p>
              First impressions matter immensely in the highly competitive digital marketplace. When potential users discover your application on the Apple App Store or Google Play Store, the aesthetic quality of your store listing directly impacts your conversion rate. Our <strong>App Store Screenshots Generator</strong> helps developers, indie creators, and marketers design polished, professional-grade mockups without relying on complex, expensive, and heavy design software like Adobe Photoshop, Figma, or Sketch.
            </p>
            <p>
              By leveraging our intuitive tool, you can rapidly generate stunning, high-resolution application screenshots that effectively communicate your app's core value proposition. Whether you are launching a brand-new application, pushing an important update, or conducting A/B testing on different store listings, having high-quality, perfectly sized mockups is a critical factor for achieving App Store Optimization (ASO) success and maximizing your downloads.
            </p>
            
            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">How to Use</h3>
            <ol className="list-decimal pl-5 space-y-3">
              <li><strong>Upload Your Screenshots:</strong> Start by uploading the raw screenshots you took directly from your device simulator or physical hardware.</li>
              <li><strong>Select Your Target Device & Template:</strong> Choose from a variety of predefined device frames (such as iPhone 6.5", iPad Pro) and select a layout template (Classic, Modern Gradient, Split, etc.) that best suits your app's style.</li>
              <li><strong>Customize the Typography and Branding:</strong> Add compelling headlines and subheadlines. Use the configuration panel to adjust fonts, background colors, gradients, and text sizes to match your brand's unique identity.</li>
              <li><strong>Export Your Creations:</strong> Once you are satisfied with the preview, hit the download button to export all your perfectly sized, high-resolution mockups in a convenient ZIP file, ready for immediate upload to the App Store Connect or Google Play Console.</li>
            </ol>

            <h3 className="text-lg font-bold text-white mt-8 mb-4 font-mono">Frequently Asked Questions (FAQ)</h3>
            <div className="space-y-4">
              <div>
                <strong className="text-white block">1. What dimensions does the App Store require for screenshots?</strong>
                <p>Apple requires specific dimensions for different devices. For instance, iPhone 6.5" displays require 1242 x 2688 pixels, while iPads often use 2048 x 2732 pixels. Our tool automatically scales and exports your mockups to these exact specifications, ensuring compliance with Apple's strict guidelines.</p>
              </div>
              <div>
                <strong className="text-white block">2. Is my app data or screenshots uploaded to a server?</strong>
                <p>Absolutely not. At ShaadDev Studio, we prioritize your privacy and zero-trust security. All image processing, framing, and text rendering are performed entirely locally directly within your web browser. Your sensitive pre-release application mockups never leave your device.</p>
              </div>
              <div>
                <strong className="text-white block">3. Can I use custom fonts for my ASO text?</strong>
                <p>Yes! We provide a selection of highly readable, modern fonts tailored for mobile displays. You can customize the typography to ensure your headline and subheadline capture the user's attention in a fraction of a second.</p>
              </div>
            </div>
          <section className="mt-12 mb-6"><h3 className="text-2xl font-bold text-white font-mono border-b border-white/10 pb-4 mb-6">Best Practices for Usage & SEO</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Keep It Clean</h4><p className="text-white/70">Avoid cluttered photographic backgrounds to ensure the interface pops on the app store.</p></div><div className="space-y-4 rounded-lg bg-black/40 p-6 border border-white/10"><h4 className="font-bold text-white mb-2">Highlight Features</h4><p className="text-white/70">Call out the core UI elements using the device frame as a realistic anchor.</p></div></div></section></article>

            <div className="font-sans">
                <RelatedTools currentPath="/tools/aso-screenshot" />
            </div>

          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>
    </div>
  );
}
