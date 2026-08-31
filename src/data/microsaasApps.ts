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
    slug: 'shad-audio',
    name: 'Shad Audio',
    tagline: 'AI voice clone & text-to-speech',
    description: 'Clone any voice from a short recording and generate natural-sounding speech, or choose from a library of AI voices.',
    longDescription: [
      "Shad Audio is an AI-powered voice cloning and text-to-speech platform built for creators, podcasters, and developers who need natural-sounding audio fast.",
      "Record a short voice sample and Shad Audio creates a digital twin of your voice, ready to read out any script you give it. Prefer not to use your own voice? Pick from a library of AI voices instead.",
      "Under the hood, Shad Audio is powered by Fish Audio's speech technology, tuned for clarity and natural intonation across long-form scripts as well as short clips."
    ],
    iconUrl: '/assets/microsaas/shad-audio/icon.png',
    featureUrl: '/assets/microsaas/shad-audio/feature.webp',
    playStore: 'https://play.google.com/store/apps/details?id=com.fishaudio.studio',
    appStore: 'https://apps.apple.com/pk/app/fish-audio-ai-voice-clone-tts/id6775396336',
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
    slug: 'cardvault',
    name: 'CardVault',
    tagline: 'Sports card scanner & value tracker',
    description: 'Point your camera at any sports or trading card to instantly identify it, check its market value, and manage your collection.',
    longDescription: [
      "CardVault is the fastest way to identify, value, and manage a sports card collection — whether you're a seasoned investor or just rediscovered a childhood shoebox of cards.",
      "Using AI image recognition, CardVault identifies the player, year, and set from a single photo, then pulls real-time market pricing so you know what a card is actually worth.",
      "Your full collection lives in one place, searchable and organized, with running totals so you can track the value of your holdings over time."
    ],
    iconUrl: '/assets/microsaas/cardvault/icon.png',
    featureUrl: '/assets/microsaas/cardvault/feature.webp',
    playStore: 'https://play.google.com/store/apps/details?id=studio.shaaddev.sport_card_scanner',
    appStore: 'https://apps.apple.com/pk/app/cardvault-sports-card-scanner/id6762130458',
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
    name: 'IncomeMap',
    tagline: 'Personal expense tracker & budget planner',
    description: 'A secure, lightweight money manager for tracking income and expenses and building a real budget.',
    longDescription: [
      "IncomeMap is a secure, lightweight money manager designed for modern financial control, without the clutter of a full banking app.",
      "Log income and expenses in seconds, categorize spending automatically, and see exactly where your money goes each month.",
      "Whether you're building your first budget or refining years of financial habits, IncomeMap keeps your data private and gives you a clear, honest picture of your finances."
    ],
    iconUrl: '/assets/microsaas/incomemap/icon.jpg',
    featureUrl: '/assets/microsaas/incomemap/feature.webp',
    playStore: 'https://play.google.com/store/apps/details?id=com.incomemap.budgettracker',
    appStore: 'https://apps.apple.com/pk/app/incomemap-income-expenses/id6763291145',
    platforms: ['iOS', 'Android'],
    features: [
      'Track income and expenses in seconds',
      'Automatic spending categorization',
      'Clear monthly and yearly breakdowns',
      'Private, on-device data by default',
      'Lightweight — no unnecessary banking features'
    ]
  },
  {
    slug: 'promptgenius',
    name: 'PromptGenius',
    tagline: 'AI prompt engineering tool',
    description: 'A prompt engineering tool for professionals, students, and hobbyists who want better output from their favorite AI models.',
    longDescription: [
      "PromptGenius is a prompt engineering tool built for anyone tired of generic output from AI models.",
      "Browse a curated library of tested prompts, adapt them to your use case, and copy them straight into ChatGPT, Midjourney, or any other AI tool you use.",
      "Whether you're a professional refining a workflow, a student learning prompt engineering, or a hobbyist experimenting with AI art and text, PromptGenius shortens the distance between an idea and a great result."
    ],
    iconUrl: '/assets/microsaas/promptgenius/icon.png',
    featureUrl: '/assets/microsaas/promptgenius/feature.webp',
    playStore: 'https://play.google.com/store/apps/details?id=com.sds.promptgenius',
    appStore: 'https://apps.apple.com/pk/app/promptgenius-ai-prompts/id6760140851',
    platforms: ['iOS', 'Android'],
    features: [
      'Curated library of tested AI prompts',
      'One-tap copy for any AI tool',
      'Categories for text, image, and code prompts',
      'Regularly updated with trending prompts',
      'Built for professionals, students, and hobbyists'
    ]
  },
  {
    slug: 'bdvibes',
    name: 'BDVibes',
    tagline: 'Birthday reminders',
    description: 'Never miss a birthday again — smart reminders that help you celebrate the people who matter most.',
    longDescription: [
      "BDVibes is a birthday reminder app built to help you keep your social circle happy without relying on social media to remember for you.",
      "Add birthdays once and BDVibes handles the rest — smart, timely reminders before the big day so you're never scrambling for a last-minute message or gift.",
      "Whether it's family, close friends, or coworkers, BDVibes keeps every important date organized in one place."
    ],
    iconUrl: '/assets/microsaas/bdvibes/icon.png',
    featureUrl: '/assets/microsaas/bdvibes/feature.webp',
    playStore: 'https://play.google.com/store/apps/details?id=com.bdayvibes.app',
    appStore: 'https://apps.apple.com/pk/app/bdvibes-birthday-reminders/id6760343022',
    platforms: ['iOS', 'Android'],
    features: [
      'Smart reminders before every birthday',
      'Organize family, friends, and coworkers',
      'Never rely on social media reminders again',
      'Simple, distraction-free interface',
      'Works fully offline once dates are added'
    ]
  },
  {
    slug: 'voice-cloning',
    name: 'AI Voice Cloning',
    tagline: 'Clone voices & generate speech',
    description: 'Turn any script into natural speech in a cloned voice, a celebrity-style voice, or one of hundreds of AI voices.',
    longDescription: [
      "This AI voice cloning app turns any script into natural, lifelike speech — in your own cloned voice, a celebrity-style voice, or one of hundreds of built-in AI voices.",
      "Record a short sample and the app builds a digital voice clone in moments, ready to read out any text you provide.",
      "Note: this app is listed as Persona Voices on Google Play and VoiceTwin AI on the App Store — same app, published under different names on each store."
    ],
    iconUrl: '/assets/microsaas/voice-cloning/icon.png',
    featureUrl: '/assets/microsaas/voice-cloning/feature.webp',
    playStore: 'https://play.google.com/store/apps/details?id=com.fishaudio.ai.tts.clone',
    playStoreLabel: 'Persona Voices',
    appStore: 'https://apps.apple.com/pk/app/voicetwin-ai-voice-cloning/id6766869439',
    appStoreLabel: 'VoiceTwin AI',
    platforms: ['iOS', 'Android'],
    features: [
      'Clone any voice from a short recording',
      'Celebrity-style voice options',
      'Hundreds of built-in AI voices',
      'Natural-sounding text-to-speech output',
      'Fast generation for scripts of any length'
    ]
  },
  {
    slug: 'volume-lock',
    name: 'Volume Lock',
    tagline: 'Lock & limit device volume',
    description: "Lock your device's volume to a safe maximum and prevent accidental changes — built-in parental controls included.",
    longDescription: [
      "Volume Lock gives you full control over your device's volume, locking it at a safe maximum so it can't be changed accidentally — or by curious little hands.",
      "Built-in parental controls let you set a hard volume ceiling to protect a child's hearing, ideal for shared tablets and phones used for videos, games, or music.",
      "Note: this app is listed as Volume locker on Google Play and Volume Lock: Parental Control on the App Store — same app, published under different names on each store."
    ],
    iconUrl: '/assets/microsaas/volume-lock/icon.jpg',
    featureUrl: '/assets/microsaas/volume-lock/feature.webp',
    playStore: 'https://play.google.com/store/apps/details?id=com.vblock.volumebrightnesslock',
    playStoreLabel: 'Volume locker',
    appStore: 'https://apps.apple.com/pk/app/volume-lock-parental-control/id6760347207',
    appStoreLabel: 'Volume Lock: Parental Control',
    platforms: ['iOS', 'Android'],
    features: [
      'Lock volume at a safe maximum',
      'Parental controls for shared devices',
      'Prevent accidental volume changes',
      'Protects hearing on long listening sessions',
      'Simple, one-tap lock and unlock'
    ]
  }
];

export function getMicrosaasApp(slug: string): MicroSaasApp | undefined {
  return microsaasApps.find((app) => app.slug === slug);
}
