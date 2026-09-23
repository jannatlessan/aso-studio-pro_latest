export interface MicroSaasApp {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  longDescription: string[];
  iconUrl: string;
  featureUrl: string;
  playStore?: string;
  playStoreLabel?: string;
  appStore?: string;
  appStoreLabel?: string;
  platforms: string[];
  features: string[];
}

export const microsaasApps: MicroSaasApp[] = [
  {
    slug: 'fish-audio',
    name: 'Fish Audio: AI Voice Clone TTS',
    tagline: 'AI voice clone & text-to-speech',
    description: 'Voice cloning and text-to-speech app; original name of the app now also released as Mimicly/VoiceTwin under rebrands.',
    longDescription: [
      "Fish Audio (Shad Audio) is an AI-powered voice cloning and text-to-speech platform built for creators, podcasters, and developers who need natural-sounding audio fast.",
      "Record a short voice sample and Fish Audio creates a digital twin of your voice, ready to read out any script you give it. Prefer not to use your own voice? Pick from a library of AI voices instead.",
      "Under the hood, Fish Audio is powered by cutting-edge speech synthesis technology, tuned for clarity and natural intonation across long-form scripts as well as short clips."
    ],
    iconUrl: '/assets/microsaas/shad-audio/icon.png',
    featureUrl: '/assets/microsaas/shad-audio/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.fishaudio.studio',
    appStore: 'https://apps.apple.com/us/app/fish-audio-ai-voice-clone-tts/id6775396336',
    platforms: ['iOS', 'Android'],
    features: [
      'Clone any voice from a short recording',
      'Text-to-speech with natural intonation',
      'Library of ready-to-use AI voices',
      'Fast on-device and cloud processing',
      'Export audio for podcasts, videos, and more'
    ]
  },
  {
    slug: 'mimicly',
    name: 'Mimicly: AI Voice Clone App',
    tagline: 'Instant mobile voice cloning',
    description: 'Rebranded voice cloning/TTS app (previously Fish Audio, previously Shaad), using the Fish Audio API.',
    longDescription: [
      "Mimicly is a fast mobile voice cloning application that transforms written scripts into natural human speech using custom-trained AI voice models.",
      "Capture short audio samples to generate cloned voice profiles or select from celebrity and character presets.",
      "Ideal for social media creators, voiceover production, and accessibility tools."
    ],
    iconUrl: '/assets/microsaas/voice-cloning/icon.png',
    featureUrl: '/assets/microsaas/voice-cloning/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.fishaudio.ai.tts.clone',
    platforms: ['Android'],
    features: [
      'Instant voice cloning on Android',
      'Custom text-to-speech generation',
      'High fidelity audio export',
      'Powered by Fish Audio speech engine'
    ]
  },
  {
    slug: 'voice-cloning',
    name: 'VoiceTwin AI: Voice Cloning',
    tagline: 'iOS voice cloning & voice changer',
    description: 'iOS voice cloning and voice-changer app, text-to-speech with cloned voices.',
    longDescription: [
      "VoiceTwin AI brings professional voice cloning and text-to-speech directly to iOS devices.",
      "Record a short sample and the app builds a digital voice clone in moments, ready to read out any text you provide.",
      "Includes voice changing filters, studio adjustments, and instant audio sharing."
    ],
    iconUrl: '/assets/microsaas/voice-cloning/icon.png',
    featureUrl: '/assets/microsaas/voice-cloning/feature.png',
    appStore: 'https://apps.apple.com/us/app/voicetwin-ai-voice-cloning/id6766869439',
    platforms: ['iOS'],
    features: [
      'iOS optimized neural voice cloning',
      'Celebrity & character style presets',
      'Natural-sounding text-to-speech output',
      'Fast generation for scripts of any length'
    ]
  },
  {
    slug: 'pixelforge',
    name: 'PixelForge - Text to Image AI',
    tagline: 'Batch AI photo & art creator',
    description: 'Batch AI photo and art creator; text-to-image generation app.',
    longDescription: [
      "PixelForge is a text-to-image AI creation suite designed for artists, designers, and social media creators.",
      "Generate photorealistic images, digital paintings, and stylized graphics using advanced generative AI diffusion models.",
      "Includes batch prompt rendering, style presets, and high-resolution export."
    ],
    iconUrl: '/assets/microsaas/promptgenius/icon.png',
    featureUrl: '/assets/microsaas/promptgenius/feature.png',
    appStore: 'https://apps.apple.com/us/app/pixelforge-text-to-image-ai/id6788649609',
    platforms: ['iOS'],
    features: [
      'Text-to-image AI generation',
      'Multiple art and photo style presets',
      'High-resolution image rendering',
      'Batch generation and history log'
    ]
  },
  {
    slug: 'cardvault',
    name: 'CardVault: Sports Card Scanner',
    tagline: 'Sports card scanner & value tracker',
    description: 'Scans, values, and tracks sports cards.',
    longDescription: [
      "CardVault is the fastest way to identify, value, and manage a sports card collection — whether you're a seasoned investor or just rediscovered a childhood shoebox of cards.",
      "Using AI image recognition, CardVault identifies the player, year, and set from a single photo, then pulls real-time market pricing so you know what a card is actually worth.",
      "Your full collection lives in one place, searchable and organized, with running totals so you can track the value of your holdings over time."
    ],
    iconUrl: '/assets/microsaas/cardvault/icon.png',
    featureUrl: '/assets/microsaas/cardvault/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=studio.shaaddev.sport_card_scanner',
    appStore: 'https://apps.apple.com/us/app/cardvault-sports-card-scanner/id6762130458',
    platforms: ['iOS', 'Android'],
    features: [
      'Instant card identification from a photo',
      'Real-time market value estimates',
      'Organize your full collection in one place',
      'Track total collection value over time',
      'Built for both casual and serious collectors'
    ]
  },
  {
    slug: 'incomemap',
    name: 'IncomeMap: Income & Expenses',
    tagline: 'Personal expense tracker & budget planner',
    description: 'Personal expense and income tracker.',
    longDescription: [
      "IncomeMap is a secure, lightweight money manager designed for modern financial control, without the clutter of a full banking app.",
      "Log income and expenses in seconds, categorize spending automatically, and see exactly where your money goes each month.",
      "Whether you're building your first budget or refining years of financial habits, IncomeMap keeps your data private and gives you a clear, honest picture of your finances."
    ],
    iconUrl: '/assets/microsaas/incomemap/icon.jpg',
    featureUrl: '/assets/microsaas/incomemap/feature.png',
    appStore: 'https://apps.apple.com/us/app/incomemap-income-expenses/id6763291145',
    platforms: ['iOS'],
    features: [
      'Track income and expenses in seconds',
      'Automatic spending categorization',
      'Clear monthly and yearly breakdowns',
      'Private, on-device data by default',
      'Lightweight — no unnecessary banking features'
    ]
  },
  {
    slug: 'stamp-id',
    name: 'Stamp ID: Scanner & Value',
    tagline: 'AI stamp identification & cataloger',
    description: 'Scans stamps and checks their value.',
    longDescription: [
      "Stamp ID uses computer vision to scan and identify postage stamps from around the world.",
      "Instantly catalog your stamp collection, view historical value estimates, and track rare series.",
      "Essential utility for philatelists and collectors."
    ],
    iconUrl: 'https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/app_icon.png',
    featureUrl: 'https://raw.githubusercontent.com/jr270504/jrpc29092025/refs/heads/main/stamp_pedia_graphic_main.png',
    appStore: 'https://apps.apple.com/us/app/stamp-id-scanner-value/id6761055547',
    platforms: ['iOS'],
    features: [
      'Instant AI stamp identification',
      'Catalog and organize stamp collections',
      'Historical valuation and origin details',
      'Works offline for field identification'
    ]
  },
  {
    slug: 'promptgenius',
    name: 'PromptGenius: AI Prompts',
    tagline: 'AI prompt engineering tool',
    description: 'AI prompt library tool.',
    longDescription: [
      "PromptGenius is a prompt engineering tool built for anyone tired of generic output from AI models.",
      "Browse a curated library of tested prompts, adapt them to your use case, and copy them straight into ChatGPT, Midjourney, or any other AI tool you use.",
      "Whether you're a professional refining a workflow, a student learning prompt engineering, or a hobbyist experimenting with AI art and text, PromptGenius shortens the distance between an idea and a great result."
    ],
    iconUrl: '/assets/microsaas/promptgenius/icon.png',
    featureUrl: '/assets/microsaas/promptgenius/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.sds.promptgenius',
    appStore: 'https://apps.apple.com/us/app/promptgenius-ai-prompts/id6760140851',
    platforms: ['iOS', 'Android'],
    features: [
      'Curated library of tested AI prompts',
      'One-tap copy for any AI tool',
      'Categories for text, image, and code prompts',
      'Regularly updated with trending prompts'
    ]
  },
  {
    slug: 'volume-lock',
    name: 'Volume Lock: Parental Control',
    tagline: 'Lock & limit device volume',
    description: 'Volume lock and limiter with parental controls to keep child sound volume safe.',
    longDescription: [
      "Volume Lock gives you full control over your device's volume, locking it at a safe maximum so it can't be changed accidentally — or by curious little hands.",
      "Built-in parental controls let you set a hard volume ceiling to protect a child's hearing, ideal for shared tablets and phones used for videos, games, or music."
    ],
    iconUrl: '/assets/microsaas/volume-lock/icon.jpg',
    featureUrl: '/assets/microsaas/volume-lock/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.volumelock.limiter.control',
    appStore: 'https://apps.apple.com/us/app/volume-lock-parental-control/id6760347207',
    platforms: ['iOS', 'Android'],
    features: [
      'Lock volume at a safe maximum',
      'Parental controls for shared devices',
      'Prevent accidental volume changes',
      'Protects hearing on long listening sessions'
    ]
  },
  {
    slug: 'bdvibes',
    name: 'BDVibes: Birthday Reminders',
    tagline: 'Smart birthday reminder app',
    description: 'Smart birthday reminder app.',
    longDescription: [
      "BDVibes is a birthday reminder app built to help you keep your social circle happy without relying on social media to remember for you.",
      "Add birthdays once and BDVibes handles the rest — smart, timely reminders before the big day so you're never scrambling for a last-minute message or gift."
    ],
    iconUrl: '/assets/microsaas/bdvibes/icon.png',
    featureUrl: '/assets/microsaas/bdvibes/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.bdayvibes.app',
    appStore: 'https://apps.apple.com/us/app/bdvibes-birthday-reminders/id6760343022',
    platforms: ['iOS', 'Android'],
    features: [
      'Smart reminders before every birthday',
      'Organize family, friends, and coworkers',
      'Never rely on social media reminders again',
      'Works fully offline once dates are added'
    ]
  },
  {
    slug: 'pixprompter',
    name: 'PixPrompter: AI Prompt Library',
    tagline: 'Trending AI image prompts for iOS',
    description: 'AI prompt generator, sister app to PhotoGem on Android.',
    longDescription: [
      "PixPrompter provides instant access to hundreds of vetted text prompts for generative AI art tools.",
      "Copy prompt formulas, explore lighting parameters, and achieve consistent artistic styles."
    ],
    iconUrl: '/assets/microsaas/promptgenius/icon.png',
    featureUrl: '/assets/microsaas/promptgenius/feature.png',
    appStore: 'https://apps.apple.com/us/app/pixprompter-ai-prompt-library/id6754501908',
    platforms: ['iOS'],
    features: [
      'Midjourney & DALL-E prompt formulas',
      'One-tap copy to clipboard',
      'Lighting and camera style parameter tags'
    ]
  },
  {
    slug: 'promptcraft',
    name: 'PromptCraft: AI Photo Editing',
    tagline: 'AI photo editing & prompt generator',
    description: 'AI photo prompt generator for photo editing.',
    longDescription: [
      "PromptCraft is designed for photographers and visual artists using generative fill and AI photo editing tools.",
      "Craft exact descriptive prompts for object removal, style transfer, and photo enhancement."
    ],
    iconUrl: '/assets/microsaas/promptgenius/icon.png',
    featureUrl: '/assets/microsaas/promptgenius/feature.png',
    appStore: 'https://apps.apple.com/us/app/promptcraft-ai-photo-editing/id6754223912',
    platforms: ['iOS'],
    features: [
      'Tailored for AI photo retouching',
      'Generative fill prompt templates',
      'Style transfer guides'
    ]
  },
  {
    slug: 'photogem',
    name: 'PhotoGem: AI Pix Video Prompts',
    tagline: 'Ready-made AI photo & video prompts',
    description: 'Ready-made AI photo/video text prompts for creating stylized Pix content.',
    longDescription: [
      "PhotoGem provides a rich library of visual prompts designed for video generators (Sora, Runway, Pika) and photo AI models.",
      "Discover trending camera movement prompts, lighting setups, and aesthetic styles."
    ],
    iconUrl: '/assets/microsaas/promptgenius/icon.png',
    featureUrl: '/assets/microsaas/promptgenius/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.shaaddevstudio.picsprompt',
    platforms: ['Android'],
    features: [
      'AI video generation prompt guides',
      'Camera movement parameter tags',
      'Stylized Pix content templates'
    ]
  },
  {
    slug: 'flashpad',
    name: 'FlashPad – Quick Notes',
    tagline: 'Lightweight note-taking on the fly',
    description: 'Quick note-taking app.',
    longDescription: [
      "FlashPad is optimized for speed. Open the app and start typing immediately with zero startup delay.",
      "Organize notes with simple tags, color coding, and quick search."
    ],
    iconUrl: 'https://play-lh.googleusercontent.com/uR121GleN04e6U97e5T40h9Jd3fR5k9_V77651z47W7_2I6g5g6k=w240-h480-rw',
    featureUrl: '/assets/projects/flashpad_preview.jpg',
    playStore: 'https://play.google.com/store/apps/details?id=com.flashpad.flashpad',
    platforms: ['Android'],
    features: [
      'Instant launch note editor',
      'Lightweight storage footprint',
      'Color coding and tag filtering'
    ]
  },
  {
    slug: 'dimmer',
    name: 'Dimmer: Night Screen OLED Lens',
    tagline: 'Screen dimmer for OLED displays',
    description: 'Night screen dimmer for OLED displays.',
    longDescription: [
      "Dimmer protects your eyes during late-night reading by dimming your screen beyond Android's default minimum brightness.",
      "Features amber blue-light filtering, status bar overlay support, and battery optimization for OLED screens."
    ],
    iconUrl: '/assets/microsaas/volume-lock/icon.jpg',
    featureUrl: '/assets/microsaas/volume-lock/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.nightscreen.dimmer',
    platforms: ['Android'],
    features: [
      'Dim screen below system minimum',
      'Amber blue-light filter tint',
      'OLED dark mode battery optimization'
    ]
  },
  {
    slug: 'ryk-hub',
    name: 'RYK Hub: Rahim Yar Khan App',
    tagline: 'Local city information & utility hub',
    description: 'Local city information/utility app for Rahim Yar Khan.',
    longDescription: [
      "RYK Hub connects residents of Rahim Yar Khan with essential city services, emergency directory contacts, local news updates, and utility bill tracking."
    ],
    iconUrl: '/assets/microsaas/volume-lock/icon.jpg',
    featureUrl: '/assets/microsaas/volume-lock/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.sds.digital.ryk.hub',
    platforms: ['Android'],
    features: [
      'City services directory',
      'Emergency helpline contacts',
      'Local utility management portal'
    ]
  },
  {
    slug: 'volume-locker',
    name: 'Volume Locker',
    tagline: 'Volume & brightness lock utility',
    description: 'Volume and brightness lock utility (earlier/alternate version of the Volume Lock app).',
    longDescription: [
      "Volume Locker locks Android system audio channels to prevent accidental button presses during calls, games, or video playback."
    ],
    iconUrl: '/assets/microsaas/volume-lock/icon.jpg',
    featureUrl: '/assets/microsaas/volume-lock/feature.png',
    playStore: 'https://play.google.com/store/apps/details?id=com.vblock.volumebrightnesslock',
    platforms: ['Android'],
    features: [
      'Lock volume levels per audio stream',
      'Prevent accidental side-button changes',
      'One-tap toggle notification widget'
    ]
  }
];

export function getMicrosaasApp(slug: string): MicroSaasApp | undefined {
  if (!slug) return undefined;
  const target = slug.toLowerCase();
  return microsaasApps.find((app) => 
    app.slug === target ||
    (app.slug === 'stamp-id' && target === 'stamppedia') ||
    (app.slug === 'fish-audio' && (target === 'shad-audio' || target === 'fish-audio'))
  );
}
