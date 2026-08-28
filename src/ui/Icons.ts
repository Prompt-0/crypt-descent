// High-quality dark fantasy SVG icons (Zero emojis)

export const ICONS = {
  // Class Crests & Emblems
  WARRIOR_CREST: `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full drop-shadow-md">
      <path d="M32 4L48 10V28C48 42 32 58 32 58C32 58 16 42 16 28V10L32 4Z" fill="url(#warrior-grad)" stroke="#38bdf8" stroke-width="2.5"/>
      <path d="M32 12V50" stroke="#0284c7" stroke-width="2"/>
      <path d="M22 24H42" stroke="#0284c7" stroke-width="2"/>
      <circle cx="32" cy="24" r="5" fill="#f59e0b" stroke="#b45309" stroke-width="1.5"/>
      <defs>
        <linearGradient id="warrior-grad" x1="16" y1="4" x2="48" y2="58" gradientUnits="userSpaceOnUse">
          <stop stop-color="#1e293b"/>
          <stop offset="1" stop-color="#0f172a"/>
        </linearGradient>
      </defs>
    </svg>
  `,

  MAGE_CREST: `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full drop-shadow-md">
      <circle cx="32" cy="32" r="26" fill="#1c1917" stroke="#f97316" stroke-width="2"/>
      <path d="M32 8L39 25L57 25L42 36L48 53L32 42L16 53L22 36L7 25L25 25Z" fill="url(#mage-grad)" stroke="#fb923c" stroke-width="1.5"/>
      <circle cx="32" cy="32" r="8" fill="#facc15" filter="drop-shadow(0 0 6px #ea580c)"/>
      <defs>
        <linearGradient id="mage-grad" x1="7" y1="8" x2="57" y2="53" gradientUnits="userSpaceOnUse">
          <stop stop-color="#c2410c"/>
          <stop offset="1" stop-color="#7c2d12"/>
        </linearGradient>
      </defs>
    </svg>
  `,

  ASSASSIN_CREST: `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full drop-shadow-md">
      <circle cx="32" cy="32" r="26" fill="#1e1035" stroke="#c084fc" stroke-width="2"/>
      <path d="M16 16L32 32M32 32L48 48M48 16L32 32M32 32L16 48" stroke="#a855f7" stroke-width="3" stroke-linecap="round"/>
      <path d="M28 8L36 8L34 28L30 28Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <path d="M28 56L36 56L34 36L30 36Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1"/>
      <circle cx="32" cy="32" r="4" fill="#a855f7" filter="drop-shadow(0 0 5px #c084fc)"/>
    </svg>
  `,

  CLERIC_CREST: `
    <svg viewBox="0 0 64 64" fill="none" class="w-full h-full drop-shadow-md">
      <circle cx="32" cy="32" r="26" fill="#064e3b" stroke="#34d399" stroke-width="2"/>
      <path d="M26 14H38V26H50V38H38V50H26V38H14V26H26V14Z" fill="url(#cleric-grad)" stroke="#fde047" stroke-width="2"/>
      <circle cx="32" cy="32" r="6" fill="#fef08a" filter="drop-shadow(0 0 8px #fbbf24)"/>
      <defs>
        <linearGradient id="cleric-grad" x1="14" y1="14" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop stop-color="#f59e0b"/>
          <stop offset="1" stop-color="#b45309"/>
        </linearGradient>
      </defs>
    </svg>
  `,

  // Core UI Glyphs
  SKULL: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M12 2C7.58 2 4 5.58 4 10C4 12.79 5.43 15.24 7.6 16.63V20C7.6 20.55 8.05 21 8.6 21H15.4C15.95 21 16.4 20.55 16.4 20V16.63C18.57 15.24 20 12.79 20 10C20 5.58 16.42 2 12 2ZM9 10C8.17 10 7.5 9.33 7.5 8.5C7.5 7.67 8.17 7 9 7C9.83 7 10.5 7.67 10.5 8.5C10.5 9.33 9.83 10 9 10ZM15 10C14.17 10 13.5 9.33 13.5 8.5C13.5 7.67 14.17 7 15 7C15.83 7 16.5 7.67 16.5 8.5C16.5 9.33 15.83 10 15 10ZM10 18H9V16H10V18ZM13 18H11V16H13V18ZM15 18H14V16H15V18Z"/>
    </svg>
  `,

  HEART: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z"/>
    </svg>
  `,

  MANA: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M12 2.69L6.63 9.43C4.97 11.52 4 13.71 4 16C4 20.42 7.58 24 12 24C16.42 24 20 20.42 20 16C20 13.71 19.03 11.52 17.37 9.43L12 2.69Z"/>
    </svg>
  `,

  GOLD_COIN: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <circle cx="12" cy="12" r="10" stroke="#b45309" stroke-width="1.5" fill="#f59e0b"/>
      <circle cx="12" cy="12" r="7" stroke="#fbbf24" stroke-width="1" fill="#d97706"/>
      <path d="M12 7V17M9 9H15M9 15H15" stroke="#fef08a" stroke-width="1.5" stroke-linecap="round"/>
    </svg>
  `,

  SWORD: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5"/>
      <line x1="13" y1="19" x2="19" y2="13"/>
      <line x1="16" y1="16" x2="20" y2="20"/>
      <line x1="19" y1="21" x2="21" y2="19"/>
    </svg>
  `,

  SHIELD: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    </svg>
  `,

  AGILITY: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>
  `,

  ARCANA: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
    </svg>
  `,

  HOURGLASS: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>
    </svg>
  `,

  DUNGEON_GATE: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M3 21h18M5 21V7a7 7 0 0 1 14 0v14M9 21V11h6v10"/>
    </svg>
  `,

  BAG: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0"/>
    </svg>
  `,

  COMPASS: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <circle cx="12" cy="12" r="10"/>
      <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>
    </svg>
  `,

  SPEAKER: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>
    </svg>
  `,

  SPEAKER_OFF: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
      <line x1="23" y1="9" x2="17" y2="15"/>
      <line x1="17" y1="9" x2="23" y2="15"/>
    </svg>
  `,

  SCROLL: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h14zm0 0v3c0 .6-.4 1-1 1H4a2 2 0 0 1-2-2v-4c0-.6.4-1 1-1h2"/>
    </svg>
  `,

  ALTAR: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M3 21h18M5 21v-4h14v4M7 17v-6h10v6M9 11V6a3 3 0 0 1 6 0v5"/>
      <circle cx="12" cy="4" r="2" fill="#c084fc"/>
    </svg>
  `,

  TOMBSTONE: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M12 2C7.58 2 4 5.58 4 10V20H20V10C20 5.58 16.42 2 12 2ZM11 7H13V10H16V12H13V17H11V12H8V10H11V7Z"/>
      <rect x="2" y="20" width="20" height="2" rx="1"/>
    </svg>
  `,

  CROWN: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M5 16L3 5L8.5 10L12 4L15.5 10L21 5L19 16H5ZM19 19C19 19.55 18.55 20 18 20H6C5.45 20 5 19.55 5 19V18H19V19Z"/>
    </svg>
  `,

  BOOK: `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  `,

  DROPLET: `
    <svg viewBox="0 0 24 24" fill="currentColor" class="w-full h-full">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  `
};
