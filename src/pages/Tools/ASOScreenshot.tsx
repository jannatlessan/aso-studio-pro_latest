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
  Layout
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import JSZip from 'jszip';
import confetti from 'canvas-confetti';
import { Link } from 'react-router-dom';
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
  type: 'iphone' | 'ipad' | 'custom';
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
  file: File;
  previewUrl: string;
  headline: string;
  subheadline: string;
  backgroundColor: string;
  secondaryColor: string; // For gradients
  textColor: string;
  frameColor: string;
  templateId: TemplateId;
  showIcon: boolean;
  headlineFont: string;
  subheadlineFont: string;
  headlineSize: number;
  subheadlineSize: number;
  sidePadding: number;
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

const TEMPLATES: ASOTemplate[] = [
  { id: 'classic', name: 'Classic Pro', description: 'Headline at top, device at bottom', layout: 'top-text', backgroundType: 'solid' },
  { id: 'modern', name: 'Modern Gradient', description: 'Headline at bottom, device at top', layout: 'bottom-text', backgroundType: 'gradient' },
  { id: 'feature', name: 'Feature Focus', description: 'Large headline, centered device', layout: 'center-text', backgroundType: 'mesh' },
  { id: 'split', name: 'Split Left', description: 'Text on left, device on right', layout: 'split-left', backgroundType: 'gradient' },
  { id: 'split-right', name: 'Split Right', description: 'Text on right, device on left', layout: 'split-right', backgroundType: 'mesh' },
  { id: 'minimal', name: 'Minimalist', description: 'Clean focus on screenshot', layout: 'top-text', backgroundType: 'solid' },
];

const FONTS = [
  { name: 'JetBrains', family: '"JetBrains Mono", monospace' },
  { name: 'Inter', family: 'Inter, sans-serif' },
  { name: 'Space', family: '"Space Grotesk", sans-serif' },
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
  drawOnCanvas: (canvas: HTMLCanvasElement, item: ScreenshotItem, img: HTMLImageElement, size: ScreenSize, iconImg: HTMLImageElement | null) => void;
}

const ScreenshotPreview = ({ item, size, appIcon, globalShowIcon, drawOnCanvas }: ScreenshotPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.src = item.previewUrl;
    img.onload = () => {
      if (appIcon) {
        const iconImg = new Image();
        iconImg.src = appIcon.url;
        iconImg.onload = () => drawOnCanvas(canvas, item, img, size, iconImg);
      } else {
        drawOnCanvas(canvas, item, img, size, null);
      }
    };
  }, [item, size, appIcon, globalShowIcon, drawOnCanvas]);

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

  const [globalFont, setGlobalFont] = useState(FONTS[0].family);
  const [globalTemplateId, setGlobalTemplateId] = useState<TemplateId>('classic');

  const [iphoneCustomWidth, setIphoneCustomWidth] = useState('1242');
  const [iphoneCustomHeight, setIphoneCustomHeight] = useState('2688');
  const [ipadCustomWidth, setIpadCustomWidth] = useState('2048');
  const [ipadCustomHeight, setIpadCustomHeight] = useState('2732');
  const [customUnit, setCustomUnit] = useState<'px' | 'inch'>('px');

  const [isProcessing, setIsProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState<'iphone' | 'ipad'>('iphone');
  const [bulkText, setBulkText] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);

  // Global Layout Options
  const [globalFitMode, setGlobalFitMode] = useState<'contain' | 'cover' | 'stretch'>('contain');
  const [globalDevicePadding, setGlobalDevicePadding] = useState(0);
  const [globalHeadlineSize, setGlobalHeadlineSize] = useState(1);
  const [globalSubheadlineSize, setGlobalSubheadlineSize] = useState(1);
  const [globalSidePadding, setGlobalSidePadding] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const iconInputRef = useRef<HTMLInputElement>(null);

  const getEffectiveSize = (size: ScreenSize, type: 'iphone' | 'ipad'): ScreenSize => {
    if (size.id.includes('custom')) {
      const w = parseFloat(type === 'iphone' ? iphoneCustomWidth : ipadCustomWidth) || 0;
      const h = parseFloat(type === 'iphone' ? iphoneCustomHeight : ipadCustomHeight) || 0;
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

  const moveScreenshot = (id: string, direction: 'left' | 'right') => {
    setScreenshots(prev => {
      const index = prev.findIndex(s => s.id === id);
      if (index === -1) return prev;
      const newIndex = direction === 'left' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newScreenshots = [...prev];
      const temp = newScreenshots[index];
      newScreenshots[index] = newScreenshots[newIndex];
      newScreenshots[newIndex] = temp;
      return newScreenshots;
    });
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
    type: 'iphone' | 'ipad',
    fitMode: 'contain' | 'cover' | 'stretch' = 'stretch',
    devicePadding: number = 0
  ) => {
    const bezel = (type === 'ipad' ? width * 0.05 : width * 0.04) + devicePadding;
    const radius = type === 'ipad' ? width * 0.06 : width * 0.12;
    const screenRadius = radius * 0.8;

    // Draw Device Body
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, radius);
    ctx.fillStyle = frameColor;
    ctx.shadowColor = 'rgba(0,0,0,0.4)';
    ctx.shadowBlur = 50;
    ctx.shadowOffsetY = 20;
    ctx.fill();
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

        // Fill background for contain mode
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
    ctx.restore();

    // Draw Notch/Pill for iPhone
    if (type === 'iphone') {
      const pillWidth = width * 0.25;
      const pillHeight = height * 0.025;
      ctx.fillStyle = '#111';
      ctx.beginPath();
      ctx.roundRect(x + (width - pillWidth) / 2, y + bezel + height * 0.01, pillWidth, pillHeight, pillHeight / 2);
      ctx.fill();
    }
  };

  const generateAndDownload = async () => {
    if (screenshots.length === 0) return;
    setIsProcessing(true);

    const zip = new JSZip();
    const iphoneFolder = zip.folder("iPhone");
    const ipadFolder = zip.folder("iPad");

    const iphoneSize = getEffectiveSize(selectedIPhoneSize, 'iphone');
    const ipadSize = getEffectiveSize(selectedIPadSize, 'ipad');

    try {
      const iconImg = appIcon ? await loadImage(appIcon.url) : null;

      for (let i = 0; i < screenshots.length; i++) {
        const item = screenshots[i];
        const img = await loadImage(item.previewUrl);

        // Generate for iPhone
        const iphoneCanvas = document.createElement('canvas');
        drawOnCanvas(iphoneCanvas, item, img, iphoneSize, iconImg);
        const iphoneBlob = await canvasToBlob(iphoneCanvas);
        if (iphoneBlob && iphoneFolder) {
          const name = `IPhone_${iphoneSize.label}_${i + 1}.png`;
          iphoneFolder.file(name, iphoneBlob);
        }

        // Generate for iPad
        const ipadCanvas = document.createElement('canvas');
        drawOnCanvas(ipadCanvas, item, img, ipadSize, iconImg);
        const ipadBlob = await canvasToBlob(ipadCanvas);
        if (ipadBlob && ipadFolder) {
          const name = `IPad_${ipadSize.label}_${i + 1}.png`;
          ipadFolder.file(name, ipadBlob);
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

  const drawOnCanvas = (
    canvas: HTMLCanvasElement,
    item: ScreenshotItem,
    img: HTMLImageElement,
    size: ScreenSize,
    iconImg: HTMLImageElement | null
  ) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = size.width;
    canvas.height = size.height;

    const template = TEMPLATES.find(t => t.id === item.templateId) || TEMPLATES[0];

    // Background
    if (template.backgroundType === 'gradient') {
      const grad = ctx.createLinearGradient(0, 0, size.width, size.height);
      grad.addColorStop(0, item.backgroundColor);
      grad.addColorStop(1, item.secondaryColor);
      ctx.fillStyle = grad;
    } else if (template.backgroundType === 'mesh') {
      ctx.fillStyle = item.backgroundColor;
      ctx.fillRect(0, 0, size.width, size.height);

      // Sophisticated mesh effect
      ctx.globalAlpha = 0.4;
      const grad1 = ctx.createRadialGradient(size.width * 0.2, size.height * 0.2, 0, size.width * 0.2, size.height * 0.2, size.width * 0.8);
      grad1.addColorStop(0, item.secondaryColor);
      grad1.addColorStop(1, 'transparent');
      ctx.fillStyle = grad1;
      ctx.fillRect(0, 0, size.width, size.height);

      const grad2 = ctx.createRadialGradient(size.width * 0.8, size.height * 0.8, 0, size.width * 0.8, size.height * 0.8, size.width * 0.8);
      grad2.addColorStop(0, item.secondaryColor);
      grad2.addColorStop(1, 'transparent');
      ctx.fillStyle = grad2;
      ctx.fillRect(0, 0, size.width, size.height);

      ctx.globalAlpha = 1.0;
    } else {
      ctx.fillStyle = item.backgroundColor;
    }
    ctx.fillRect(0, 0, size.width, size.height);

    // Subtle Noise Overlay
    ctx.globalAlpha = 0.03;
    for (let i = 0; i < 100; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#fff' : '#000';
      ctx.fillRect(Math.random() * size.width, Math.random() * size.height, 2, 2);
    }
    ctx.globalAlpha = 1.0;

    // Layout Constants
    const basePadding = size.width * 0.08;
    const effectiveSidePadding = basePadding + (item.sidePadding + globalSidePadding) * (size.width / 1000);
    const textSectionHeight = size.height * 0.28;
    const maxTextWidth = (template.layout === 'split-left' || template.layout === 'split-right') ? size.width * 0.35 : size.width - (effectiveSidePadding * 2);

    // Draw Text
    ctx.fillStyle = item.textColor;
    ctx.textAlign = template.layout.includes('split') ? 'left' : 'center';
    ctx.textBaseline = 'top';

    // Calculate heights for positioning
    const headlineFontSize = size.width * 0.07 * item.headlineSize * globalHeadlineSize;
    const subheadlineFontSize = size.width * 0.04 * item.subheadlineSize * globalSubheadlineSize;

    ctx.font = `bold ${headlineFontSize}px ${item.headlineFont}`;
    const headlineHeight = measureWrappedTextHeight(ctx, item.headline, maxTextWidth, headlineFontSize * 1.2);

    ctx.font = `${subheadlineFontSize}px ${item.subheadlineFont}`;
    const subheadlineHeight = measureWrappedTextHeight(ctx, item.subheadline, maxTextWidth, subheadlineFontSize * 1.3);

    const totalTextHeight = headlineHeight + subheadlineHeight + (size.width * 0.02);

    let headlineY: number;
    if (template.layout === 'bottom-text') {
      headlineY = size.height - totalTextHeight - basePadding;
    } else if (template.layout === 'center-text') {
      headlineY = (size.height - totalTextHeight) / 2;
    } else if (template.layout === 'split-right') {
      headlineY = basePadding + size.width * 0.05;
    } else {
      headlineY = basePadding + size.width * 0.05;
    }

    const headlineX = template.layout === 'split-left' ? effectiveSidePadding :
      template.layout === 'split-right' ? size.width - maxTextWidth - effectiveSidePadding :
        size.width / 2;

    // Draw Headline
    ctx.font = `bold ${headlineFontSize}px ${item.headlineFont}`;
    const nextY = drawWrappedText(ctx, item.headline, headlineX, headlineY, maxTextWidth, headlineFontSize * 1.2);

    // Draw Subheadline
    ctx.font = `${subheadlineFontSize}px ${item.subheadlineFont}`;
    const subheadlineY = nextY + size.width * 0.01;
    const finalY = drawWrappedText(ctx, item.subheadline, headlineX, subheadlineY, maxTextWidth, subheadlineFontSize * 1.3);

    // Draw Icon if enabled
    if (iconImg && item.showIcon && globalShowIcon) {
      const iconSize = size.width * 0.12;
      const iconX = template.layout === 'split-left' ? effectiveSidePadding :
        template.layout === 'split-right' ? size.width - maxTextWidth - effectiveSidePadding :
          size.width / 2 - iconSize / 2;
      let iconY: number;

      if (template.layout === 'bottom-text') {
        iconY = headlineY - iconSize - 20;
      } else {
        iconY = finalY + 20;
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
    let frameWidth = size.width * 0.85;
    let frameHeight = frameWidth / imgAspect;

    if (frameHeight > size.height * 0.75) {
      frameHeight = size.height * 0.75;
      frameWidth = frameHeight * imgAspect;
    }

    let frameX = (size.width - frameWidth) / 2;
    let frameY: number;

    if (template.layout === 'bottom-text') {
      frameY = basePadding;
      const textTop = (iconImg && item.showIcon && globalShowIcon) ? headlineY - (size.width * 0.12) - 40 : headlineY - 20;
      if (frameY + frameHeight > textTop) {
        frameHeight = textTop - frameY;
        frameWidth = frameHeight * imgAspect;
        frameX = (size.width - frameWidth) / 2;
      }
    } else if (template.layout === 'center-text') {
      frameWidth = size.width * 0.95;
      frameHeight = frameWidth / imgAspect;
      if (frameHeight > size.height * 0.85) {
        frameHeight = size.height * 0.85;
        frameWidth = frameHeight * imgAspect;
      }
      frameX = (size.width - frameWidth) / 2;
      frameY = (size.height - frameHeight) / 2;
      ctx.fillStyle = 'rgba(0,0,0,0.2)';
      ctx.fillRect(0, 0, size.width, size.height);
    } else if (template.layout === 'split-left' || template.layout === 'split-right') {
      frameWidth = size.width * 0.8;
      frameHeight = frameWidth / imgAspect;
      frameX = template.layout === 'split-left' ? size.width * 0.45 : -size.width * 0.25;
      frameY = (size.height - frameHeight) / 2;
    } else {
      const iconSize = size.width * 0.12;
      const textBottom = (iconImg && item.showIcon && globalShowIcon) ? finalY + iconSize + 60 : finalY + 40;
      frameY = Math.max(textBottom, textSectionHeight);

      if (frameY + frameHeight > size.height - basePadding) {
        frameHeight = size.height - frameY - basePadding;
        frameWidth = frameHeight * imgAspect;
        frameX = (size.width - frameWidth) / 2;
      }
    }

    drawDeviceFrame(ctx, frameX, frameY, frameWidth, frameHeight, item.frameColor, img, size.type as 'iphone' | 'ipad', globalFitMode, globalDevicePadding);
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
      <header className="sticky top-0 z-50 bg-[#020202]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-4">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          accept="image/*"
          className="hidden"
        />
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/tools" className="p-2 hover:bg-white/5 rounded-full transition-colors group">
              <ChevronLeft className="w-5 h-5 text-white/40 group-hover:text-primary" />
            </Link>
            <div className="w-10 h-10 bg-black border border-primary/40 flex items-center justify-center shadow-lg shadow-primary/10">
              <Layers className="text-primary w-6 h-6" />
            </div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase">ASO STUDIO<span className="text-primary text-[10px] ml-2 italic">PRO V3.0</span></h1>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <p className="text-[10px] text-white/30 uppercase font-black tracking-tighter">Secure Asset Synthesis Active</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {screenshots.length > 0 && (
              <button
                onClick={generateAndDownload}
                disabled={isProcessing}
                className="btn-primary py-2 px-4 text-xs"
              >
                {isProcessing ? (
                  <span className="animate-pulse">Processing...</span>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export Assets ({screenshots.length * 2})
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
          <aside className="lg:col-span-3 space-y-4">
            {/* App Icon Section */}
            <section className="bg-white/[0.03] border border-white/5 p-4 space-y-4 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  <h2 className="font-black text-[10px] uppercase tracking-widest text-white/50">App Icon</h2>
                </div>
                <div className="flex items-center gap-2">
                  {appIcon && (
                    <button
                      onClick={() => setAppIcon(null)}
                      className="text-[9px] font-black text-red-400/60 hover:text-red-400 transition-all uppercase tracking-widest"
                    >
                      REMOVE
                    </button>
                  )}
                  <button
                    onClick={() => setGlobalShowIcon(!globalShowIcon)}
                    className={cn(
                      "px-2 py-0.5 border text-[8px] font-black transition-all uppercase tracking-widest",
                      globalShowIcon ? "border-primary text-primary" : "border-white/10 text-white/20"
                    )}
                  >
                    {globalShowIcon ? 'VISIBLE' : 'HIDDEN'}
                  </button>
                </div>
              </div>

              <div
                onClick={() => iconInputRef.current?.click()}
                className="w-16 h-16 mx-auto bg-white/[0.02] border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-white/[0.05] transition-all group overflow-hidden relative"
              >
                {appIcon ? (
                  <>
                    <img src={appIcon.url} alt="App Icon" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Plus className="w-4 h-4 text-white" />
                    </div>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 text-white/20 group-hover:text-primary transition-all" />
                  </>
                )}
                <input
                  type="file"
                  ref={iconInputRef}
                  onChange={handleIconUpload}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            </section>

            {/* AI Copywriter Prompt */}
            <section className="bg-white/[0.03] border border-white/5 p-4 space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  <h2 className="font-black text-[10px] uppercase tracking-widest text-white/50">AI Copywriter</h2>
                </div>
                <button
                  onClick={() => setShowPrompt(!showPrompt)}
                  className="text-[9px] font-black text-primary hover:text-white transition-all bg-primary/10 px-1.5 py-0.5 border border-primary/20 uppercase tracking-widest"
                >
                  {showPrompt ? 'HIDE' : 'GET'}
                </button>
              </div>

              {showPrompt && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-3">
                    <p className="text-[10px] text-white/40 leading-relaxed font-bold uppercase tracking-tighter">
                      Gemini/ChatGPT PROMPT:
                    </p>
                    <div className="p-3 bg-black/40 border border-white/5 relative group">
                      <p className="text-[10px] text-white/60 leading-relaxed pr-8 italic select-all font-mono">
                        "based on metadata, first capture image will be first image, for all {screenshots.length} images in sequence give me engaging headline and subheadline format will be: headline $- subheadline"
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        const prompt = `based on metadata, first capture image will be first image, for all ${screenshots.length} images in sequence give me engaging headline and subheadline format will be: headline $- subheadline`;
                        navigator.clipboard.writeText(prompt);
                        confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 }, colors: ['#00F0FF', '#ffffff'] });
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-black text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-primary/20"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      COPY MASTER PROMPT
                    </button>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/10">
                    <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center flex-shrink-0 text-[10px] font-black text-black">!</div>
                    <p className="text-[9px] text-white/40 leading-relaxed uppercase font-black tracking-tighter">
                      Paste generated output into the <b>Bulk Import</b> area.
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* Bulk Text Import */}
            <section className="bg-white/[0.03] border border-white/5 p-4 space-y-3 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clipboard className="w-4 h-4 text-primary" />
                  <h2 className="font-black text-[10px] uppercase tracking-widest text-white/50">Bulk Import</h2>
                </div>
                {bulkText && (
                  <button
                    onClick={() => {
                      setBulkText('');
                      setScreenshots(prev => prev.map(s => ({ ...s, headline: 'Amazing Feature', subheadline: 'Describe how it works here' })));
                    }}
                    className="text-[9px] font-black text-white/20 hover:text-red-400 transition-all uppercase tracking-widest"
                  >
                    CLEAR
                  </button>
                )}
              </div>

              <div className="relative group">
                <textarea
                  className={cn(
                    "w-full bg-black/40 border-2 border-dashed text-[11px] py-4 px-4 resize-none transition-all font-mono text-white/80 focus:border-primary/50 outline-none",
                    bulkText ? "border-primary/30" : "border-white/10"
                  )}
                  placeholder="PASTE AI OUTPUT HERE...&#10;&#10;Format: Headline $- Subheadline"
                  value={bulkText}
                  onPaste={(e) => {
                    const pastedText = e.clipboardData.getData('text');
                    setBulkText(pastedText);
                    const lines = pastedText.split('\n').filter(l => l.trim());
                    setScreenshots(prev => prev.map((s, i) => {
                      if (lines[i]) {
                        let h = '', sh = '';
                        if (lines[i].includes('$-')) {
                          [h, sh] = lines[i].split('$-').map(t => t.trim());
                        } else if (lines[i].includes(' &- ')) {
                          [h, sh] = lines[i].split(' &- ').map(t => t.trim());
                        } else if (lines[i].includes(':')) {
                          [h, sh] = lines[i].split(':').map(t => t.trim());
                        } else if (lines[i].includes(' - ')) {
                          [h, sh] = lines[i].split(' - ').map(t => t.trim());
                        } else {
                          h = lines[i].trim();
                        }
                        return { ...s, headline: h || s.headline, subheadline: sh || s.subheadline };
                      }
                      return s;
                    }));
                    confetti({ particleCount: 30, spread: 50, origin: { y: 0.9 }, colors: ['#00F0FF'] });
                  }}
                  onChange={(e) => {
                    const val = e.target.value;
                    setBulkText(val);
                    const lines = val.split('\n').filter(l => l.trim());
                    setScreenshots(prev => prev.map((s, i) => {
                      if (lines[i]) {
                        let h = '', sh = '';
                        if (lines[i].includes('$-')) {
                          [h, sh] = lines[i].split('$-').map(t => t.trim());
                        } else if (lines[i].includes(' &- ')) {
                          [h, sh] = lines[i].split(' &- ').map(t => t.trim());
                        } else if (lines[i].includes(':')) {
                          [h, sh] = lines[i].split(':').map(t => t.trim());
                        } else if (lines[i].includes(' - ')) {
                          [h, sh] = lines[i].split(' - ').map(t => t.trim());
                        } else {
                          h = lines[i].trim();
                        }
                        return { ...s, headline: h || s.headline, subheadline: sh || s.subheadline };
                      }
                      return s;
                    }));
                  }}
                />
              </div>
            </section>

            {/* Global Layout Section */}
            <section className="glass-panel p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Layout className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-[10px] uppercase tracking-wider">Global Layout</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="control-label">Screenshot Fit</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['contain', 'cover', 'stretch'] as const).map(mode => (
                      <button
                        key={mode}
                        onClick={() => setGlobalFitMode(mode)}
                        className={cn(
                          "px-2 py-2 rounded-lg border text-[8px] font-bold transition-all uppercase",
                          globalFitMode === mode ? "bg-primary/20 border-primary/50 text-primary-light" : "bg-surface-variant border-border text-text-secondary hover:bg-surface"
                        )}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="control-label">Inner Padding</label>
                    <span className="text-[10px] font-bold text-primary">{globalDevicePadding}px</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="60"
                    value={globalDevicePadding}
                    onChange={(e) => setGlobalDevicePadding(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="control-label">Global Side Padding</label>
                    <span className="text-[10px] font-bold text-primary">{globalSidePadding}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="200"
                    value={globalSidePadding}
                    onChange={(e) => setGlobalSidePadding(parseInt(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="control-label">Global Headline Size</label>
                    <span className="text-[10px] font-bold text-primary">{globalHeadlineSize.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={globalHeadlineSize}
                    onChange={(e) => setGlobalHeadlineSize(parseFloat(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="control-label">Global Subheadline Size</label>
                    <span className="text-[10px] font-bold text-primary">{globalSubheadlineSize.toFixed(1)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2.5"
                    step="0.1"
                    value={globalSubheadlineSize}
                    onChange={(e) => setGlobalSubheadlineSize(parseFloat(e.target.value))}
                    className="w-full accent-primary h-1.5 bg-surface-variant rounded-lg appearance-none cursor-pointer"
                  />
                </div>
              </div>
            </section>

            {/* Global Styles Section */}
            <section className="glass-panel p-4 space-y-4">
              <div className="flex items-center gap-2">
                <Settings2 className="w-4 h-4 text-primary" />
                <h2 className="font-bold text-[10px] uppercase tracking-wider">Global Styles</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="control-label">Typography</label>
                  <div className="grid grid-cols-2 gap-2">
                    {FONTS.map(font => (
                      <button
                        key={font.name}
                        onClick={() => {
                          setGlobalFont(font.family);
                          setScreenshots(prev => prev.map(s => ({ ...s, headlineFont: font.family, subheadlineFont: font.family })));
                        }}
                        className={cn(
                          "px-3 py-2 rounded-lg border text-[10px] font-bold transition-all",
                          globalFont === font.family ? "bg-primary/20 border-primary/50 text-primary-light" : "bg-surface-variant border-border text-text-secondary hover:bg-surface"
                        )}
                        style={{ fontFamily: font.family }}
                      >
                        {font.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="control-label">Global Template</label>
                  <div className="space-y-2">
                    {TEMPLATES.map(template => (
                      <button
                        key={template.id}
                        onClick={() => {
                          setGlobalTemplateId(template.id);
                          setScreenshots(prev => prev.map(s => ({ ...s, templateId: template.id })));
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 rounded-xl border text-xs font-medium transition-all flex items-center justify-between group",
                          globalTemplateId === template.id ? "bg-primary/20 border-primary/50 text-primary-light" : "bg-surface-variant border-border text-text-secondary hover:bg-primary/10 hover:border-primary/30"
                        )}
                      >
                        <span>{template.name}</span>
                        <ChevronRight className={cn("w-3 h-3 transition-all", globalTemplateId === template.id ? "opacity-100" : "opacity-0 group-hover:opacity-100")} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Target Sizes */}
            <section className="glass-panel p-6 space-y-6">
              <div className="flex items-center gap-2">
                <Monitor className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-sm uppercase tracking-wider">Target Sizes</h2>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="control-label flex items-center gap-2">
                    <Smartphone className="w-3 h-3" />
                    iPhone
                  </label>
                  <div className="space-y-2">
                    {IPHONE_SIZES.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedIPhoneSize(size)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-between",
                          selectedIPhoneSize.id === size.id ? "bg-primary text-white font-bold" : "bg-surface-variant border border-border text-text-secondary hover:bg-surface"
                        )}
                      >
                        <span>{size.name}</span>
                        <span className="text-[10px] opacity-60">{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="control-label flex items-center gap-2">
                    <Tablet className="w-3 h-3" />
                    iPad
                  </label>
                  <div className="space-y-2">
                    {IPAD_SIZES.map((size) => (
                      <button
                        key={size.id}
                        onClick={() => setSelectedIPadSize(size)}
                        className={cn(
                          "w-full text-left px-4 py-3 rounded-xl text-xs transition-all flex items-center justify-between",
                          selectedIPadSize.id === size.id ? "bg-primary text-white font-bold" : "bg-surface-variant border border-border text-text-secondary hover:bg-surface"
                        )}
                      >
                        <span>{size.name}</span>
                        <span className="text-[10px] opacity-60">{size.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-4 glass-panel hover:bg-primary/10 hover:border-primary/30 text-primary-light rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center gap-3 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Add Screenshots
            </button>
            {/* Footer / Copyright */}
            <footer className="pt-8 pb-4 border-t border-border">
              <div className="flex flex-col items-center gap-2">
                <p className="text-[10px] text-text-tertiary font-medium">© 2026 ShaadDev Studio</p>
                <div className="flex gap-4">
                  <span className="text-[9px] text-text-tertiary uppercase tracking-widest">Enterprise Edition</span>
                  <span className="text-[9px] text-text-tertiary uppercase tracking-widest">v2.4.0</span>
                </div>
              </div>
            </footer>
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

                <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {screenshots.map((item, index) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="flex-shrink-0 w-24 space-y-2 group"
                      >
                        <div className="relative aspect-[9/16] rounded-lg overflow-hidden border border-border bg-surface-variant">
                          <img
                            src={item.previewUrl}
                            alt={`Screen ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center gap-1">
                            <button
                              onClick={() => moveScreenshot(item.id, 'left')}
                              disabled={index === 0}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move Left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5 text-white" />
                            </button>
                            <button
                              onClick={() => moveScreenshot(item.id, 'right')}
                              disabled={index === screenshots.length - 1}
                              className="p-1.5 bg-white/10 hover:bg-white/20 rounded-md disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="Move Right"
                            >
                              <ChevronRight className="w-3.5 h-3.5 text-white" />
                            </button>
                            <button
                              onClick={() => removeScreenshot(item.id)}
                              className="p-1.5 bg-red-500/20 hover:bg-red-500/40 rounded-md transition-colors"
                              title="Remove"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-red-400" />
                            </button>
                          </div>
                          <div className="absolute top-1 left-1 w-5 h-5 rounded bg-primary text-[10px] font-bold flex items-center justify-center text-white shadow-lg">
                            {index + 1}
                          </div>
                        </div>
                        <p className="text-[8px] text-text-secondary truncate text-center font-medium px-1">
                          {item.file.name}
                        </p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
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
                        {/* Preview Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[9px] uppercase font-bold text-text-secondary tracking-widest">Live Preview</label>
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => setPreviewMode('iphone')}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-bold border transition-all",
                                  previewMode === 'iphone' ? "bg-primary text-white border-primary" : "bg-surface-variant text-text-secondary border-border"
                                )}
                              >
                                IPHONE
                              </button>
                              <button
                                onClick={() => setPreviewMode('ipad')}
                                className={cn(
                                  "px-2 py-0.5 rounded text-[9px] font-bold border transition-all",
                                  previewMode === 'ipad' ? "bg-primary text-white border-primary" : "bg-surface-variant text-text-secondary border-border"
                                )}
                              >
                                IPAD
                              </button>
                            </div>
                          </div>
                          <div className={cn(
                            "relative rounded-2xl overflow-hidden bg-surface-variant mx-auto border border-border transition-all duration-500 shadow-inner",
                            previewMode === 'iphone' ? "aspect-[9/16] max-w-[260px]" : "aspect-[3/4] max-w-[340px]"
                          )}>
                            <ScreenshotPreview
                              item={item}
                              size={previewMode === 'iphone' ? selectedIPhoneSize : selectedIPadSize}
                              appIcon={appIcon}
                              globalShowIcon={globalShowIcon}
                              drawOnCanvas={drawOnCanvas}
                            />
                          </div>
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
