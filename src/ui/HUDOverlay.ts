import { Entity } from '../entities/Entity';
import { EquipSlot, LogMessage, GameState, Tile, Skill, PlayerClassType, LevelUpPerk } from '../types';
import { sound } from '../audio/SoundSynth';
import { CLASS_CATALOG } from '../classes/ClassCatalog';
import { ShopItemEntry } from '../shop/ShopManager';
import { ICONS } from './Icons';

export class HUDOverlay {
  private topBarEl: HTMLElement;
  private bottomBarEl: HTMLElement;
  private targetingEl: HTMLElement;
  private modalsEl: HTMLElement;
  private onAction: (action: string, data?: any) => void;

  private lastGameState: GameState | null = null;
  private lastLogCount: number = 0;

  constructor(onAction: (action: string, data?: any) => void) {
    this.topBarEl = document.getElementById('hud-top-bar')!;
    this.bottomBarEl = document.getElementById('hud-bottom-bar')!;
    this.targetingEl = document.getElementById('targeting-overlay')!;
    this.modalsEl = document.getElementById('hud-modals')!;
    this.onAction = onAction;

    this.initStructure();
  }

  private initStructure(): void {
    // 1. Top Minimal Header Bar
    this.topBarEl.innerHTML = `
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-3">
          <div class="w-7 h-7 text-amber-400 drop-shadow">${ICONS.SKULL}</div>
          <h1 class="font-title text-lg font-extrabold tracking-widest text-dungeon-gold drop-shadow">GANDHARV</h1>
        </div>
        <div class="flex items-center space-x-3.5 text-xs font-data text-slate-200">
          <span class="bg-slate-900/95 px-4 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-2 shadow">
            <span class="w-4 h-4 text-sky-400">${ICONS.DUNGEON_GATE}</span>
            <span>SANCTUM <strong id="val-floor" class="text-sky-400 font-bold text-sm">I / V</strong></span>
          </span>
          <span class="bg-slate-900/95 px-4 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-2 shadow">
            <span class="w-4 h-4 text-slate-400">${ICONS.HOURGLASS}</span>
            <span>CYCLE <strong id="val-turn" class="text-slate-100 font-bold text-sm">0</strong></span>
          </span>
          <span class="bg-slate-900/95 px-4 py-1.5 rounded-lg border border-slate-700 flex items-center space-x-2 shadow">
            <span class="w-4 h-4 text-amber-400">${ICONS.GOLD_COIN}</span>
            <span><strong id="val-gold" class="text-amber-400 font-bold text-sm">0</strong> GOLD</span>
          </span>
        </div>
      </div>

      <!-- BOSS HEALTH BAR -->
      <div id="boss-bar-wrap" class="flex-1 max-w-md mx-8 flex-col items-center hidden">
        <div class="flex justify-between w-full text-xs font-title font-bold text-rose-400 mb-1 tracking-wider">
          <span id="boss-name">ASURA MALAKOR</span>
          <span id="boss-hp-text" class="font-data">240 / 240 HP</span>
        </div>
        <div class="w-full h-3.5 bg-dungeon-darkest rounded-full overflow-hidden border border-rose-900 glow-crimson">
          <div id="boss-hp-bar" class="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-200" style="width: 100%"></div>
        </div>
      </div>

      <div class="flex items-center space-x-3">
        <button id="btn-primer" class="px-3 py-1.5 bg-amber-950/80 hover:bg-amber-900 rounded-lg border border-amber-600 text-xs font-title font-bold text-amber-300 flex items-center space-x-1.5 shadow transition-all" title="Combat & How-To-Play Guide">
          <span class="w-4 h-4">${ICONS.BOOK}</span>
          <span>COMBAT PRIMER (?)</span>
        </button>
        <button id="btn-sound" class="p-2 bg-slate-900 hover:bg-slate-800 rounded-lg border border-slate-700 text-slate-200 transition-colors" title="Toggle Sound">
          <span class="w-4 h-4 block" id="sound-icon">${ICONS.SPEAKER}</span>
        </button>
      </div>
    `;

    // 2. Bottom RPG Action Belt
    this.bottomBarEl.innerHTML = `
      <!-- LEFT: HERO GAUGES & ATTRIBUTES -->
      <div class="flex items-center space-x-6">
        <div class="space-y-1.5 w-64">
          <div class="flex justify-between items-center text-xs">
            <span id="player-name-display" class="font-title font-bold text-amber-400 tracking-wider text-sm">Hero</span>
            <span id="player-level-display" class="font-data font-bold text-slate-200 text-xs">RANK 1</span>
          </div>

          <!-- HP GAUGE -->
          <div>
            <div class="flex justify-between text-xs mb-0.5">
              <span class="text-rose-400 font-title font-bold flex items-center space-x-1.5">
                <span class="w-3.5 h-3.5">${ICONS.HEART}</span>
                <span>VITALITY</span>
              </span>
              <span id="player-hp-text" class="text-slate-100 font-data font-bold text-xs">100 / 100</span>
            </div>
            <div class="w-full h-3.5 bg-slate-950 rounded-md border border-rose-900 overflow-hidden shadow-inner">
              <div id="player-hp-bar" class="h-full bg-gradient-to-r from-red-700 to-rose-500 transition-all duration-200" style="width: 100%"></div>
            </div>
          </div>

          <!-- MANA GAUGE -->
          <div>
            <div class="flex justify-between text-xs mb-0.5">
              <span class="text-sky-400 font-title font-bold flex items-center space-x-1.5">
                <span class="w-3.5 h-3.5">${ICONS.MANA}</span>
                <span>PRANA (MANA)</span>
              </span>
              <span id="player-mana-text" class="text-slate-100 font-data font-bold text-xs">50 / 50</span>
            </div>
            <div class="w-full h-3 bg-slate-950 rounded-md border border-blue-900 overflow-hidden shadow-inner">
              <div id="player-mana-bar" class="h-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-200" style="width: 100%"></div>
            </div>
          </div>
        </div>

        <!-- ATTRIBUTES PILL -->
        <div class="bg-slate-900/95 border border-slate-700 rounded-xl p-3 grid grid-cols-2 gap-x-5 gap-y-1.5 text-xs font-data shadow">
          <div class="flex items-center space-x-1.5 text-slate-300">
            <span class="w-3.5 h-3.5 text-slate-400">${ICONS.SWORD}</span>
            <span>ATK: <strong id="stat-atk" class="text-slate-100 text-sm font-bold">12</strong></span>
          </div>
          <div class="flex items-center space-x-1.5 text-slate-300">
            <span class="w-3.5 h-3.5 text-sky-400">${ICONS.SHIELD}</span>
            <span>DEF: <strong id="stat-def" class="text-slate-100 text-sm font-bold">3</strong></span>
          </div>
          <div class="flex items-center space-x-1.5 text-slate-300">
            <span class="w-3.5 h-3.5 text-amber-400">${ICONS.AGILITY}</span>
            <span>AGI: <strong id="stat-agi" class="text-slate-100 text-sm font-bold">12</strong></span>
          </div>
          <div class="flex items-center space-x-1.5 text-slate-300">
            <span class="w-3.5 h-3.5 text-purple-400">${ICONS.ARCANA}</span>
            <span>ARC: <strong id="stat-arc" class="text-slate-100 text-sm font-bold">10</strong></span>
          </div>
        </div>
      </div>

      <!-- CENTER: ACTIVE COMBAT SKILLS & QUICK POTIONS -->
      <div class="flex items-center space-x-4">
        <div id="skills-hotbar" class="flex items-center space-x-3"></div>

        <div class="h-11 w-px bg-slate-700 mx-1"></div>

        <!-- QUICK BELT -->
        <div class="flex items-center space-x-2">
          <button id="btn-quick-heal" class="px-3.5 py-2.5 bg-rose-950 hover:bg-rose-900 border border-rose-700 rounded-xl text-xs font-title font-bold text-rose-100 flex flex-col items-center shadow transition-all" title="Drink Healing Elixir (Q)">
            <span>HEAL [Q]</span>
            <span class="text-[10px] font-data text-rose-300">ELIXIR</span>
          </button>
          <button id="btn-quick-mana" class="px-3.5 py-2.5 bg-blue-950 hover:bg-blue-900 border border-blue-700 rounded-xl text-xs font-title font-bold text-blue-100 flex flex-col items-center shadow transition-all" title="Drink Prana Potion (E)">
            <span>PRANA [E]</span>
            <span class="text-[10px] font-data text-sky-300">POTION</span>
          </button>
        </div>
      </div>

      <!-- RIGHT: SHORTCUTS & MINIMAP -->
      <div class="flex items-center space-x-5">
        <div class="flex flex-col space-y-2">
          <button id="btn-inventory" class="px-4 py-2 gothic-button-primary rounded-lg text-xs font-bold tracking-wider flex items-center space-x-2 shadow">
            <span class="w-4 h-4">${ICONS.BAG}</span>
            <span>KNAPSACK (I)</span>
          </button>
          <div class="flex space-x-2">
            <button id="btn-auto-explore" class="flex-1 px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 rounded-md text-[11px] font-title font-bold text-indigo-200 transition-all" title="Auto-Explore (Tab)">
              EXPLORE (TAB)
            </button>
            <button id="btn-codex" class="flex-1 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-md text-[11px] font-title font-bold text-slate-200 transition-all" title="Open Codex (C)">
              CODEX (C)
            </button>
          </div>
        </div>

        <!-- MINIMAP RADAR -->
        <canvas id="minimap-canvas" width="115" height="80" class="rounded-lg border border-slate-700 bg-black shadow-inner"></canvas>
      </div>
    `;

    // 3. Targeting Overlay
    this.targetingEl.innerHTML = `
      <div class="bg-indigo-950/98 border-2 border-indigo-400 px-7 py-3 rounded-xl shadow-2xl text-sm text-indigo-100 flex items-center space-x-3 font-title font-bold">
        <span class="w-5 h-5 animate-spin text-indigo-300">${ICONS.COMPASS}</span>
        <span>SELECT TARGET TILE OR PRESS <strong class="text-white font-data">ESC</strong> TO CANCEL</span>
      </div>
    `;

    // Event listeners
    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.onAction('TOGGLE_SOUND');
      const iconEl = document.getElementById('sound-icon');
      if (iconEl) iconEl.innerHTML = sound.getIsMuted() ? ICONS.SPEAKER_OFF : ICONS.SPEAKER;
    });

    document.getElementById('btn-primer')?.addEventListener('click', () => this.onAction('TOGGLE_HELP'));
    document.getElementById('btn-codex')?.addEventListener('click', () => this.onAction('TOGGLE_CODEX'));
    document.getElementById('btn-inventory')?.addEventListener('click', () => this.onAction('TOGGLE_INVENTORY'));
    document.getElementById('btn-auto-explore')?.addEventListener('click', () => this.onAction('AUTO_EXPLORE'));
    document.getElementById('btn-quick-heal')?.addEventListener('click', () => this.onAction('QUICK_HEAL'));
    document.getElementById('btn-quick-mana')?.addEventListener('click', () => this.onAction('QUICK_MANA'));
  }

  public render(
    player: Entity,
    logs: LogMessage[],
    gameState: GameState,
    currentFloor: number,
    tiles: Tile[][],
    boss?: Entity | null,
    playerSkills: Skill[] = [],
    shopItems: ShopItemEntry[] = [],
    levelUpPerks: LevelUpPerk[] = []
  ): void {
    // 1. Header Counters
    const romanFloors = ['I', 'II', 'III', 'IV', 'V'];
    const floorEl = document.getElementById('val-floor');
    if (floorEl) floorEl.textContent = `${romanFloors[currentFloor - 1] || currentFloor} / V`;

    const turnEl = document.getElementById('val-turn');
    if (turnEl) turnEl.textContent = `${player.stats.turnsElapsed}`;

    const goldEl = document.getElementById('val-gold');
    if (goldEl) goldEl.textContent = `${player.stats.gold}`;

    // Boss Bar
    const bossWrap = document.getElementById('boss-bar-wrap');
    if (bossWrap) {
      if (boss && boss.stats.hp > 0) {
        bossWrap.classList.remove('hidden');
        bossWrap.classList.add('flex');
        const nameEl = document.getElementById('boss-name');
        const hpTextEl = document.getElementById('boss-hp-text');
        const hpBarEl = document.getElementById('boss-hp-bar');
        if (nameEl) nameEl.textContent = boss.name;
        if (hpTextEl) hpTextEl.textContent = `${boss.stats.hp} / ${boss.stats.maxHp} HP`;
        if (hpBarEl) hpBarEl.style.width = `${Math.max(0, (boss.stats.hp / boss.stats.maxHp) * 100)}%`;
      } else {
        bossWrap.classList.add('hidden');
        bossWrap.classList.remove('flex');
      }
    }

    // 2. Player Stats
    const nameEl = document.getElementById('player-name-display');
    if (nameEl) nameEl.textContent = player.name;

    const levelEl = document.getElementById('player-level-display');
    if (levelEl) levelEl.textContent = `RANK ${player.stats.level}`;

    const hpPercent = Math.max(0, Math.min(100, (player.stats.hp / player.stats.maxHp) * 100));
    const hpBar = document.getElementById('player-hp-bar');
    if (hpBar) hpBar.style.width = `${hpPercent}%`;

    const hpText = document.getElementById('player-hp-text');
    if (hpText) hpText.textContent = `${player.stats.hp} / ${player.stats.maxHp}`;

    const manaPercent = Math.max(0, Math.min(100, (player.stats.mana / player.stats.maxMana) * 100));
    const manaBar = document.getElementById('player-mana-bar');
    if (manaBar) manaBar.style.width = `${manaPercent}%`;

    const manaText = document.getElementById('player-mana-text');
    if (manaText) manaText.textContent = `${player.stats.mana} / ${player.stats.maxMana}`;

    const atkEl = document.getElementById('stat-atk');
    if (atkEl) atkEl.textContent = `${player.getEffectiveAttackPower()}`;

    const defEl = document.getElementById('stat-def');
    if (defEl) defEl.textContent = `${player.getEffectiveDefense()}`;

    const agiEl = document.getElementById('stat-agi');
    if (agiEl) agiEl.textContent = `${player.stats.agility}`;

    const arcEl = document.getElementById('stat-arc');
    if (arcEl) arcEl.textContent = `${player.stats.arcana}`;

    // 3. Active Skills Hotbar
    const hotbarEl = document.getElementById('skills-hotbar');
    if (hotbarEl && playerSkills.length > 0) {
      hotbarEl.innerHTML = playerSkills.map((s, idx) => {
        const onCd = s.cooldownCurrent > 0;
        const noMana = player.stats.mana < s.manaCost;
        return `
          <button class="btn-skill px-4 py-2.5 rounded-xl border text-left flex flex-col justify-between w-36 shadow transition-all ${
            onCd || noMana
              ? 'bg-slate-900/90 border-slate-800 opacity-50 cursor-not-allowed'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-700 hover:border-amber-400'
          }" data-skill-idx="${idx}">
            <div class="flex justify-between items-center text-xs">
              <span class="font-title font-bold text-slate-100 truncate">${s.name}</span>
              <span class="text-amber-400 font-bold font-data ml-1">[${idx + 1}]</span>
            </div>
            <div class="flex justify-between text-xs font-data text-slate-300 mt-1">
              <span class="text-blue-300 font-bold">${s.manaCost} MP</span>
              ${onCd ? `<span class="text-rose-400 font-bold">${s.cooldownCurrent}t CD</span>` : '<span class="text-emerald-400 font-bold">READY</span>'}
            </div>
          </button>
        `;
      }).join('');

      hotbarEl.querySelectorAll('.btn-skill').forEach((el) => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-skill-idx') || '0', 10);
          this.onAction('USE_SKILL', { skillIndex: idx });
        });
      });
    }

    // 4. Floating Dungeon Log
    if (logs.length !== this.lastLogCount) {
      this.lastLogCount = logs.length;
      const logContainer = document.getElementById('log-container');
      if (logContainer) {
        logContainer.innerHTML = logs.slice(-30).map((l) => `
          <div class="leading-relaxed border-b border-slate-800/80 pb-1" style="color: ${l.color}">
            <span class="text-slate-400 font-data select-none text-xs mr-1">[T${l.turn}]</span> ${l.text}
          </div>
        `).join('');
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }

    // 5. Targeting Banner
    if (gameState === GameState.TARGETING) {
      this.targetingEl.classList.remove('hidden');
    } else {
      this.targetingEl.classList.add('hidden');
    }

    // 6. Modals & Screens
    if (gameState !== this.lastGameState) {
      this.lastGameState = gameState;
      this.renderModals(gameState, player, shopItems, levelUpPerks, currentFloor);
    }

    // 7. Minimap
    this.drawMinimap(tiles, player);
  }

  private renderModals(gameState: GameState, player: Entity, shopItems: ShopItemEntry[], levelUpPerks: LevelUpPerk[], currentFloor: number): void {
    if (gameState === GameState.TITLE) {
      this.modalsEl.innerHTML = this.getTitleScreenHTML();
      this.bindTitleScreen();
    } else if (gameState === GameState.CLASS_SELECT) {
      this.modalsEl.innerHTML = this.getClassSelectModalHTML();
      this.bindClassSelectModal();
    } else if (gameState === GameState.TRANSITION) {
      this.modalsEl.innerHTML = this.getTransitionScreenHTML(currentFloor);
      document.getElementById('btn-continue-descent')?.addEventListener('click', () => this.onAction('CONTINUE_DESCENT'));
    } else if (gameState === GameState.LEVEL_UP) {
      this.modalsEl.innerHTML = this.getLevelUpModalHTML(levelUpPerks);
      this.bindLevelUpModal();
    } else if (gameState === GameState.INVENTORY) {
      this.modalsEl.innerHTML = this.getInventoryModalHTML(player);
      this.bindInventoryModal(player);
    } else if (gameState === GameState.SHOP) {
      this.modalsEl.innerHTML = this.getShopModalHTML(player, shopItems);
      this.bindShopModal(player);
    } else if (gameState === GameState.ALTAR) {
      this.modalsEl.innerHTML = this.getAltarModalHTML();
      this.bindAltarModal();
    } else if (gameState === GameState.CODEX) {
      this.modalsEl.innerHTML = this.getCodexModalHTML();
      document.getElementById('modal-close')?.addEventListener('click', () => this.onAction('CLOSE_MODAL'));
    } else if (gameState === GameState.HELP) {
      this.modalsEl.innerHTML = this.getHelpModalHTML();
      document.getElementById('modal-close')?.addEventListener('click', () => this.onAction('CLOSE_MODAL'));
    } else if (gameState === GameState.GAME_OVER) {
      this.modalsEl.innerHTML = this.getGameOverModalHTML(player);
      document.getElementById('btn-restart')?.addEventListener('click', () => this.onAction('RESTART_GAME'));
    } else if (gameState === GameState.VICTORY) {
      this.modalsEl.innerHTML = this.getVictoryModalHTML(player);
      document.getElementById('btn-restart')?.addEventListener('click', () => this.onAction('RESTART_GAME'));
    } else {
      this.modalsEl.innerHTML = '';
    }
  }

  private getTitleScreenHTML(): string {
    return `
      <div class="fixed inset-0 bg-black z-50 flex items-center justify-center p-6 overflow-hidden">
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/25 via-black to-black"></div>

        <div class="relative z-10 w-full max-w-2xl text-center flex flex-col items-center space-y-8 animate-fade-in">
          <!-- Celestial Sunburst Crest -->
          <div class="w-20 h-20 text-amber-400 filter drop-shadow-[0_0_25px_rgba(245,158,11,0.7)]">${ICONS.CLERIC_CREST}</div>

          <div class="space-y-3">
            <h1 class="font-title text-6xl md:text-7xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-100 via-amber-400 to-amber-700 drop-shadow-[0_4px_35px_rgba(217,119,6,0.8)]">
              GANDHARV
            </h1>
            <p class="font-title text-lg tracking-[0.25em] text-amber-400 uppercase font-bold">
              The Celestial Crypts • Sanctum of the Asuras
            </p>
          </div>

          <div class="w-full max-w-md space-y-4 pt-4">
            <button id="btn-start-game" class="w-full py-4 gothic-button-primary rounded-xl text-base font-bold tracking-widest uppercase shadow-2xl">
              BEGIN NEW JOURNEY
            </button>
            <button id="btn-open-codex" class="w-full py-3.5 gothic-button rounded-xl text-sm font-bold tracking-widest uppercase">
              EXPLORER'S CODEX & BESTIARY
            </button>
          </div>

          <p class="text-xs text-slate-400 font-data tracking-wider">
            Version 2.0 • Mythic Dark Fantasy Procedural Roguelike
          </p>
        </div>
      </div>
    `;
  }

  private bindTitleScreen(): void {
    document.getElementById('btn-start-game')?.addEventListener('click', () => this.onAction('START_GAME'));
    document.getElementById('btn-open-codex')?.addEventListener('click', () => this.onAction('TOGGLE_CODEX'));
  }

  private getTransitionScreenHTML(floor: number): string {
    const floorTitles = [
      { name: 'THE FORGOTTEN CATACOMBS', lore: 'Cold drafts whisper through crumbling stone vaults. Rotting vermin and restive bone warriors patrol the dark.' },
      { name: 'THE OSSUARY OF SORROW', lore: 'Piles of ancient dead litter the sunken chambers. Grimm the Wandering Trader has pitched his lantern nearby.' },
      { name: 'THE SPECTRAL DEPTHS', lore: 'Cursed ectoplasmic mist seeps through stone cracks. Phasing wraiths glide silently between the pillars.' },
      { name: 'THE BLOOD VAULT', lore: 'Dark cultists chant crimson incantations. Flapping blood bats and death knights guard the inner gates.' },
      { name: "THE SANCTUM OF ASURA MALAKOR", lore: 'The throne room of the Necromancer Lord. The air vibrates with pure necrotic fury. Prepare for the final confrontation.' }
    ];
    const info = floorTitles[floor - 1] || floorTitles[0];

    return `
      <div class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="w-full max-w-2xl text-center space-y-7 gothic-panel p-10 rounded-2xl border-2 border-amber-600 shadow-2xl">
          <div class="w-16 h-16 mx-auto text-sky-400">${ICONS.DUNGEON_GATE}</div>
          <div class="space-y-2">
            <span class="text-sm font-data text-amber-400 uppercase tracking-widest font-bold">DESCENDING TO SANCTUM ${floor} OF 5</span>
            <h2 class="font-title text-3xl font-extrabold text-dungeon-gold tracking-wider">${info.name}</h2>
          </div>
          <p class="text-lg font-spectral italic text-slate-200 leading-relaxed border-y border-slate-700/80 py-5">
            "${info.lore}"
          </p>
          <button id="btn-continue-descent" class="w-full py-4 gothic-button-primary rounded-xl text-sm font-title font-bold tracking-widest uppercase">
            ENTER THE SHADOWS (PRESS SPACE OR ENTER)
          </button>
        </div>
      </div>
    `;
  }

  private getCodexModalHTML(): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] gothic-panel">
          <div class="px-8 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/90">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 text-amber-400">${ICONS.BOOK}</div>
              <h2 class="font-title text-xl font-bold text-dungeon-gold tracking-wider">EXPLORER'S CODEX & BESTIARY</h2>
            </div>
            <button id="modal-close" class="text-slate-200 hover:text-white text-xs font-title px-4 py-2 rounded bg-slate-800 border border-slate-600 font-bold">✕ CLOSE (ESC)</button>
          </div>
          <div class="p-8 overflow-y-auto space-y-8 text-slate-200">
            <!-- Controls Matrix -->
            <div class="space-y-3">
              <h3 class="font-title text-base font-bold text-amber-400 uppercase tracking-wider">Survival Controls</h3>
              <div class="grid grid-cols-2 gap-4 text-sm font-data bg-black/70 p-5 rounded-xl border border-slate-700">
                <div><strong class="text-amber-300 font-bold">WASD / Arrow Keys</strong>: Move & Melee Attack</div>
                <div><strong class="text-amber-300 font-bold">1, 2, 3</strong>: Trigger Active Skills</div>
                <div><strong class="text-amber-300 font-bold">Tab / O</strong>: Auto-Explore Hallways</div>
                <div><strong class="text-amber-300 font-bold">Q / E</strong>: Quick Health / Mana Potions</div>
                <div><strong class="text-amber-300 font-bold">Space / .</strong>: Wait 1 Turn</div>
                <div><strong class="text-amber-300 font-bold">I</strong>: Open Hero Knapsack</div>
              </div>
            </div>

            <!-- Bestiary Overview -->
            <div class="space-y-3">
              <h3 class="font-title text-base font-bold text-amber-400 uppercase tracking-wider">Sanctum Bestiary</h3>
              <div class="space-y-3 font-spectral text-base">
                <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                  <h4 class="font-title text-sm font-bold text-rose-400">Crypt Rat & Skeleton Warriors (Depth I - II)</h4>
                  <p class="text-slate-300 mt-1">Skittering plague rats and ancient bone swordsmen. Beware of Skeleton Archers kiting at range from the dark.</p>
                </div>
                <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                  <h4 class="font-title text-sm font-bold text-purple-400">Shadow Wraiths & Dark Cultists (Depth III - IV)</h4>
                  <p class="text-slate-300 mt-1">Wraiths glide through solid stone walls. Cultist acolytes chant dark fireballs and summon skeleton reinforcements.</p>
                </div>
                <div class="p-4 bg-slate-900/80 rounded-xl border border-slate-700">
                  <h4 class="font-title text-sm font-bold text-amber-400">Malakor, the Necromancer Lord (Depth V)</h4>
                  <p class="text-slate-300 mt-1">Master of the Sanctum. Wields dark soul orbs, bone spears, and devastating area fire novae.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getHelpModalHTML(): string {
    return `
      <div class="fixed inset-0 bg-black/92 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-amber-500/80 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] gothic-panel">
          <div class="px-8 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/95">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 text-amber-400">${ICONS.BOOK}</div>
              <div>
                <h2 class="font-title text-xl font-bold text-dungeon-gold tracking-wider">COMBAT PRIMER & SURVIVAL GUIDE</h2>
                <span class="text-xs text-slate-300 font-data">Master the Turn-Based Mechanics of Gandharv</span>
              </div>
            </div>
            <button id="modal-close" class="text-slate-200 hover:text-white text-xs font-title px-4 py-2 rounded bg-slate-800 border border-slate-600 font-bold">✕ CLOSE (ESC)</button>
          </div>

          <div class="p-8 overflow-y-auto space-y-7 text-slate-200">
            <!-- 1. Turn-Based Flow -->
            <div class="bg-slate-900/90 p-5 rounded-xl border border-slate-700 space-y-2">
              <div class="flex items-center space-x-2.5">
                <span class="w-5 h-5 text-amber-400">${ICONS.HOURGLASS}</span>
                <h3 class="font-title text-base font-bold text-amber-400 uppercase tracking-wider">1. The Turn-Based Rule</h3>
              </div>
              <p class="font-spectral text-base text-slate-200 leading-relaxed">
                Time only moves when <strong class="text-amber-300">YOU take an action</strong>! Monsters never attack while you are standing still. Take as long as you need to plan your route, inspect enemies, check skill cooldowns, and position yourself tactically.
              </p>
            </div>

            <!-- 2. Combat Mechanics & Math -->
            <div class="bg-slate-900/90 p-5 rounded-xl border border-slate-700 space-y-3">
              <div class="flex items-center space-x-2.5">
                <span class="w-5 h-5 text-rose-400">${ICONS.SWORD}</span>
                <h3 class="font-title text-base font-bold text-rose-400 uppercase tracking-wider">2. How Combat Works</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-spectral text-slate-200">
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800">
                  <strong class="text-amber-300 block font-title mb-1">Striking Foes:</strong>
                  Walk directly into an adjacent monster (using <code class="text-sky-300 font-data">WASD</code>, <code class="text-sky-300 font-data">Arrow Keys</code>, or <code class="text-sky-300 font-data">Left Click</code>) to execute an automatic weapon strike.
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800">
                  <strong class="text-amber-300 block font-title mb-1">Damage & Armor Formula:</strong>
                  Your Damage is determined by <strong class="text-slate-100">Attack Power</strong>, reduced by enemy Defense: <code class="text-sky-300 font-data">Damage = Raw × 100 / (100 + DEF)</code>.
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800">
                  <strong class="text-amber-300 block font-title mb-1">Critical Strikes & Agility:</strong>
                  High Agility grants bonus accuracy and a high chance to land <strong class="text-rose-400">Critical Strikes</strong> dealing <strong class="text-slate-100">175% bonus damage</strong>!
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800">
                  <strong class="text-amber-300 block font-title mb-1">Skills & Prana:</strong>
                  Press <code class="text-sky-300 font-data">[1]</code>, <code class="text-sky-300 font-data">[2]</code>, or <code class="text-sky-300 font-data">[3]</code> to unleash powerful ranged spells, crowd-control stuns, and teleports using your Prana (Mana).
                </div>
              </div>
            </div>

            <!-- 3. Visual Landmark & Item Guide -->
            <div class="bg-slate-900/90 p-5 rounded-xl border border-slate-700 space-y-3">
              <div class="flex items-center space-x-2.5">
                <span class="w-5 h-5 text-sky-400">${ICONS.COMPASS}</span>
                <h3 class="font-title text-base font-bold text-sky-400 uppercase tracking-wider">3. Landmarks & Tile Directory</h3>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs font-spectral">
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <div class="w-7 h-7 text-sky-400 shrink-0">${ICONS.DUNGEON_GATE}</div>
                  <div>
                    <strong class="text-sky-300 font-title block">Descent Portal</strong>
                    <span>Glowing blue stone stairs. Stand on top and press <strong class="text-white font-data">SPACE</strong> to descend deeper.</span>
                  </div>
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <div class="w-7 h-7 text-amber-400 shrink-0">${ICONS.GOLD_COIN}</div>
                  <div>
                    <strong class="text-amber-300 font-title block">Grimm's Bazaar</strong>
                    <span>Merchant with glowing lantern. Walk next to him to purchase powerful relics and permanent stat elixirs.</span>
                  </div>
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <div class="w-7 h-7 text-rose-400 shrink-0">${ICONS.DROPLET}</div>
                  <div>
                    <strong class="text-rose-300 font-title block">Explosive TNT</strong>
                    <span>Red barrels with TNT tags. Strike to trigger a massive 3x3 blast that obliterates surrounding foes.</span>
                  </div>
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <div class="w-7 h-7 text-purple-400 shrink-0">${ICONS.ALTAR}</div>
                  <div>
                    <strong class="text-purple-300 font-title block">Altar of Sacrifice</strong>
                    <span>Sacrifice gold or blood in exchange for permanent celestial blessings.</span>
                  </div>
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <div class="w-7 h-7 text-emerald-400 shrink-0">${ICONS.BAG}</div>
                  <div>
                    <strong class="text-emerald-300 font-title block">Ground Loot</strong>
                    <span>Floating glowing relics, weapons, and potions. Walk over them to pick up into your Knapsack.</span>
                  </div>
                </div>
                <div class="p-3 bg-black/60 rounded-lg border border-slate-800 flex items-start space-x-2.5">
                  <div class="w-7 h-7 text-yellow-400 shrink-0">${ICONS.CROWN}</div>
                  <div>
                    <strong class="text-yellow-300 font-title block">Treasure Chests</strong>
                    <span>Ornate locked chests containing gold, rare affixes, and ancient parchment scrolls.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getClassSelectModalHTML(): string {
    const classes = Object.values(CLASS_CATALOG);
    const crests: Record<PlayerClassType, string> = {
      [PlayerClassType.WARRIOR]: ICONS.WARRIOR_CREST,
      [PlayerClassType.MAGE]: ICONS.MAGE_CREST,
      [PlayerClassType.ASSASSIN]: ICONS.ASSASSIN_CREST,
      [PlayerClassType.CLERIC]: ICONS.CLERIC_CREST
    };

    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-slate-700 rounded-2xl w-full max-w-6xl overflow-hidden shadow-2xl p-8 flex flex-col space-y-8 gothic-panel">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 mx-auto text-amber-500 mb-1">${ICONS.SKULL}</div>
            <h2 class="font-title text-3xl font-bold text-dungeon-gold tracking-widest uppercase">CHOOSE YOUR CHAMPION</h2>
            <p class="text-sm text-slate-300 font-data">Select your hero archetype to brave the celestial depths of Gandharv</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            ${classes.map((cls) => `
              <div class="bg-slate-900/90 p-6 rounded-2xl border border-slate-700 hover:border-amber-400 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between space-y-4 group">
                <div class="space-y-3">
                  <div class="w-18 h-18 mx-auto">${crests[cls.type]}</div>
                  <div class="text-center">
                    <h3 class="font-title font-bold text-base tracking-wider" style="color: ${cls.color}">${cls.name}</h3>
                    <span class="text-xs font-title text-slate-400 block mt-0.5">${cls.tagline}</span>
                  </div>
                  <p class="text-sm font-spectral text-slate-200 leading-relaxed text-center">${cls.description}</p>
                </div>

                <div class="bg-black/70 p-3.5 rounded-xl border border-slate-700/70 text-xs font-data space-y-1.5">
                  <div class="flex justify-between"><span class="text-rose-400 font-bold">Vitality:</span> <strong class="text-slate-100">${cls.baseHp}</strong></div>
                  <div class="flex justify-between"><span class="text-blue-400 font-bold">Prana:</span> <strong class="text-slate-100">${cls.baseMana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Strength:</span> <strong class="text-slate-100">${cls.strength}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Agility:</span> <strong class="text-slate-100">${cls.agility}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Arcana:</span> <strong class="text-slate-100">${cls.arcana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Defense:</span> <strong class="text-slate-100">${cls.defense}</strong></div>
                </div>

                <button class="btn-select-class w-full py-3 gothic-button-primary rounded-xl text-xs font-title tracking-wider uppercase" data-class-type="${cls.type}">
                  Choose ${cls.name}
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private bindClassSelectModal(): void {
    this.modalsEl.querySelectorAll('.btn-select-class').forEach((el) => {
      el.addEventListener('click', () => {
        const classType = el.getAttribute('data-class-type') as PlayerClassType;
        if (classType) this.onAction('SELECT_CLASS', { classType });
      });
    });
  }

  private getLevelUpModalHTML(perks: LevelUpPerk[]): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="w-full max-w-3xl gothic-panel p-8 rounded-2xl border-2 border-amber-500 shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-12 h-12 mx-auto text-amber-400">${ICONS.CROWN}</div>
            <h2 class="font-title text-3xl font-bold text-dungeon-gold tracking-wider uppercase">CELESTIAL BOON UNLOCKED!</h2>
            <p class="text-sm font-spectral text-slate-200">Choose a permanent blessing to empower your astral blade</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
            ${perks.map((p, idx) => `
              <div class="bg-slate-900/90 p-5 rounded-xl border border-slate-700 hover:border-amber-400 hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
                <div class="space-y-2 text-center">
                  <h3 class="font-title font-bold text-base text-amber-400 tracking-wider">${p.title}</h3>
                  <p class="text-sm font-spectral text-slate-200 leading-relaxed">${p.description}</p>
                </div>
                <button class="btn-select-perk w-full py-2.5 gothic-button-primary rounded-lg text-xs font-title tracking-wider uppercase" data-perk-idx="${idx}">
                  Claim Boon
                </button>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  private bindLevelUpModal(): void {
    this.modalsEl.querySelectorAll('.btn-select-perk').forEach((el) => {
      el.addEventListener('click', () => {
        const idx = parseInt(el.getAttribute('data-perk-idx') || '0', 10);
        this.onAction('SELECT_LEVEL_PERK', { perkIndex: idx });
      });
    });
  }

  private getInventoryModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-slate-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] gothic-panel">
          <div class="px-8 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/90">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 text-amber-400">${ICONS.BAG}</div>
              <h2 class="font-title text-lg font-bold text-dungeon-gold tracking-wider">HERO'S KNAPSACK & GEAR</h2>
            </div>
            <button id="modal-close" class="text-slate-200 hover:text-white text-xs font-title px-4 py-2 rounded bg-slate-800 border border-slate-600 font-bold">✕ CLOSE (ESC)</button>
          </div>

          <div class="p-8 overflow-y-auto flex-1 space-y-6">
            <!-- PAPERDOLL EQUIPMENT GRID -->
            <div>
              <h3 class="font-title text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">Equipped Relics & Armor</h3>
              <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
                ${this.renderPaperdollSlot(player, EquipSlot.MAIN_HAND, 'Main Hand Weapon')}
                ${this.renderPaperdollSlot(player, EquipSlot.OFF_HAND, 'Off Hand Shield')}
                ${this.renderPaperdollSlot(player, EquipSlot.BODY, 'Chest Armor')}
                ${this.renderPaperdollSlot(player, EquipSlot.HEAD, 'Greathelm')}
                ${this.renderPaperdollSlot(player, EquipSlot.RING, 'Signet Ring')}
                ${this.renderPaperdollSlot(player, EquipSlot.AMULET, 'Relic Amulet')}
              </div>
            </div>

            <!-- KNAPSACK ITEMS -->
            <div>
              <h3 class="font-title text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">Possessions</h3>
              ${player.inventory.length === 0 ? `
                <p class="text-center text-slate-400 py-8 italic font-spectral text-base">Your knapsack is empty.</p>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  ${player.inventory.map((item) => `
                    <div class="bg-slate-900/90 p-4 rounded-xl border border-slate-700 hover:border-amber-400 transition-colors flex flex-col justify-between space-y-3 shadow">
                      <div class="flex items-start justify-between">
                        <div>
                          <h4 class="font-bold text-sm font-title" style="color: ${item.color}">${item.name}</h4>
                          <span class="text-xs text-slate-400 uppercase font-data">${item.type} • ${item.rarity}</span>
                        </div>
                      </div>
                      <p class="text-sm font-spectral text-slate-200 leading-snug">${item.description}</p>
                      <div class="flex items-center space-x-2 pt-2 border-t border-slate-800">
                        ${item.equipSlot ? `
                          <button class="btn-use flex-1 py-1.5 px-3 bg-indigo-900 hover:bg-indigo-800 rounded text-xs font-title text-indigo-100 border border-indigo-700 font-bold" data-item-id="${item.id}">
                            Equip
                          </button>
                        ` : `
                          <button class="btn-use flex-1 py-1.5 px-3 bg-emerald-900 hover:bg-emerald-800 rounded text-xs font-title text-emerald-100 border border-emerald-700 font-bold" data-item-id="${item.id}">
                            Use
                          </button>
                        `}
                        <button class="btn-drop py-1.5 px-3 bg-rose-950 hover:bg-rose-900 rounded text-xs font-title text-rose-200 border border-rose-800" data-item-id="${item.id}">
                          Drop
                        </button>
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderPaperdollSlot(player: Entity, slot: EquipSlot, label: string): string {
    const item = player.equipment[slot];
    if (item) {
      return `
        <div class="bg-slate-900 p-3 rounded-xl border border-slate-700 flex items-center justify-between shadow" data-unequip-slot="${slot}">
          <div class="truncate">
            <span class="text-[10px] font-title text-slate-400 block uppercase tracking-wider">${label}</span>
            <span class="font-bold truncate text-xs font-spectral" style="color: ${item.color}">${item.name}</span>
          </div>
          <button class="btn-unequip text-slate-400 hover:text-rose-400 text-xs px-2 py-1 bg-slate-800 rounded border border-slate-700 ml-2" data-slot="${slot}">✕</button>
        </div>
      `;
    }
    return `
      <div class="bg-black/60 p-3 rounded-xl border border-slate-800 text-slate-500">
        <span class="text-[10px] font-title text-slate-500 block uppercase tracking-wider">${label}</span>
        <span class="text-xs italic font-spectral">Empty</span>
      </div>
    `;
  }

  private bindInventoryModal(player: Entity): void {
    document.getElementById('modal-close')?.addEventListener('click', () => this.onAction('CLOSE_MODAL'));

    this.modalsEl.querySelectorAll('.btn-use').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-item-id');
        const item = player.inventory.find((i) => i.id === id);
        if (item) this.onAction('USE_ITEM', { item });
      });
    });

    this.modalsEl.querySelectorAll('.btn-drop').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-item-id');
        const item = player.inventory.find((i) => i.id === id);
        if (item) this.onAction('DROP_ITEM', { item });
      });
    });

    this.modalsEl.querySelectorAll('.btn-unequip').forEach((el) => {
      el.addEventListener('click', () => {
        const slot = el.getAttribute('data-slot') as EquipSlot;
        if (slot) this.onAction('UNEQUIP_ITEM', { slot });
      });
    });
  }

  private getShopModalHTML(player: Entity, shopItems: ShopItemEntry[]): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-amber-600/70 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] gothic-panel">
          <div class="px-8 py-5 border-b border-slate-700 flex justify-between items-center bg-slate-900/90">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 text-amber-400">${ICONS.GOLD_COIN}</div>
              <div>
                <h2 class="font-title text-lg font-bold text-dungeon-gold tracking-wider">GRIMM'S CELESTIAL BAZAAR</h2>
                <span class="text-xs font-data text-slate-300">Purse: <strong class="text-amber-400">${player.stats.gold} Gold</strong></span>
              </div>
            </div>
            <button id="modal-close" class="text-slate-200 hover:text-white text-xs font-title px-4 py-2 rounded bg-slate-800 border border-slate-600 font-bold">✕ CLOSE (ESC)</button>
          </div>

          <div class="p-8 overflow-y-auto space-y-6">
            <div>
              <h3 class="font-title text-sm font-bold text-amber-400 uppercase tracking-wider mb-3">Wares for Sale</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                ${shopItems.map((entry) => `
                  <div class="bg-slate-900/90 p-4 rounded-xl border border-slate-700 flex flex-col justify-between space-y-3 shadow">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-sm font-title" style="color: ${entry.item.color}">${entry.item.name}</h4>
                        <span class="text-xs text-slate-400 uppercase font-data">${entry.item.rarity}</span>
                      </div>
                      <span class="text-amber-400 font-bold font-data text-sm">${entry.price} Gold</span>
                    </div>
                    <p class="text-sm font-spectral text-slate-200 leading-snug">${entry.item.description}</p>
                    <button class="btn-buy-shop w-full py-2 rounded-lg text-xs font-title font-bold transition-all ${
                      entry.purchased
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : player.stats.gold >= entry.price
                        ? 'gothic-button-primary'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }" data-shop-id="${entry.id}" ${entry.purchased || player.stats.gold < entry.price ? 'disabled' : ''}>
                      ${entry.purchased ? 'Purchased' : 'Buy Item'}
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <div>
              <h3 class="font-title text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Sell Possessions</h3>
              ${player.inventory.length === 0 ? `
                <p class="text-slate-400 text-sm italic font-spectral">Knapsack is empty.</p>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  ${player.inventory.map((item) => `
                    <div class="bg-black/70 p-3 rounded-xl border border-slate-700 flex items-center justify-between">
                      <div class="truncate mr-2">
                        <span class="text-sm font-bold truncate block font-spectral" style="color: ${item.color}">${item.name}</span>
                        <span class="text-xs text-amber-400 font-data">+${Math.max(2, Math.floor(item.value * 0.45))} Gold</span>
                      </div>
                      <button class="btn-sell-shop px-3 py-1.5 bg-emerald-900 hover:bg-emerald-800 rounded text-xs font-title text-emerald-100 border border-emerald-700 font-bold" data-item-id="${item.id}">
                        Sell
                      </button>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private bindShopModal(player: Entity): void {
    document.getElementById('modal-close')?.addEventListener('click', () => this.onAction('CLOSE_MODAL'));

    this.modalsEl.querySelectorAll('.btn-buy-shop').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-shop-id');
        if (id) this.onAction('BUY_SHOP_ITEM', { entryId: id });
      });
    });

    this.modalsEl.querySelectorAll('.btn-sell-shop').forEach((el) => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-item-id');
        const item = player.inventory.find((i) => i.id === id);
        if (item) this.onAction('SELL_SHOP_ITEM', { item });
      });
    });
  }

  private getAltarModalHTML(): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-purple-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-8 text-center space-y-6 gothic-panel glow-amethyst">
          <div class="space-y-2">
            <div class="w-12 h-12 mx-auto text-purple-400">${ICONS.ALTAR}</div>
            <h2 class="font-title text-2xl font-bold text-purple-400 tracking-wider">ALTAR OF SACRIFICE</h2>
            <p class="text-sm font-spectral text-slate-200">Offer earthly riches or lifeblood in exchange for astral boons.</p>
          </div>

          <div class="grid grid-cols-1 gap-4 text-left">
            <button class="btn-altar-choice bg-slate-900 hover:bg-purple-950/80 p-4 rounded-xl border border-slate-700 hover:border-purple-500 transition-all flex items-center justify-between shadow" data-altar-choice="GOLD">
              <div>
                <h4 class="font-title font-bold text-base text-amber-400">Offer Gold (50 Gold)</h4>
                <p class="text-sm font-spectral text-slate-300 mt-0.5">Empower spirit with +15 Max Prana and +10% Critical Strike Chance.</p>
              </div>
              <div class="w-7 h-7 text-amber-400 shrink-0 ml-3">${ICONS.GOLD_COIN}</div>
            </button>

            <button class="btn-altar-choice bg-slate-900 hover:bg-rose-950/80 p-4 rounded-xl border border-slate-700 hover:border-rose-500 transition-all flex items-center justify-between shadow" data-altar-choice="BLOOD">
              <div>
                <h4 class="font-title font-bold text-base text-rose-400">Blood Sacrifice (20 Health)</h4>
                <p class="text-sm font-spectral text-slate-300 mt-0.5">Infuse soul with +4 Permanent Attack Power and +2 Armor.</p>
              </div>
              <div class="w-7 h-7 text-rose-500 shrink-0 ml-3">${ICONS.DROPLET}</div>
            </button>
          </div>

          <button id="modal-close" class="w-full py-2.5 gothic-button rounded-xl text-xs font-bold uppercase">
            Walk Away (ESC)
          </button>
        </div>
      </div>
    `;
  }

  private bindAltarModal(): void {
    document.getElementById('modal-close')?.addEventListener('click', () => this.onAction('CLOSE_MODAL'));
    this.modalsEl.querySelectorAll('.btn-altar-choice').forEach((el) => {
      el.addEventListener('click', () => {
        const choice = el.getAttribute('data-altar-choice');
        this.onAction('ALTAR_OFFERING', { choice });
      });
    });
  }

  private getGameOverModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-rose-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-9 text-center space-y-7 glow-crimson gothic-panel">
          <div class="space-y-2">
            <div class="w-16 h-16 mx-auto text-rose-500">${ICONS.TOMBSTONE}</div>
            <h2 class="font-title text-3xl font-extrabold text-rose-500 tracking-wider uppercase">HERE LIES THE FALLEN</h2>
            <p class="text-sm font-spectral italic text-slate-300">"Your celestial spark fades into the endless abyss..."</p>
          </div>

          <div class="bg-black/70 p-5 rounded-2xl border border-slate-700 text-sm font-data space-y-2.5 text-left">
            <div class="flex justify-between"><span>Deepest Sanctum Reached:</span> <strong class="text-slate-100 font-bold">${player.stats.dungeonDepth} / 5</strong></div>
            <div class="flex justify-between"><span>Final Rank:</span> <strong class="text-dungeon-gold font-bold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400 font-bold">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Damage Dealt:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Elapsed:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Gold Gathered:</span> <strong class="text-amber-400 font-bold">${player.stats.gold} Gold</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-4 bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-white font-title font-bold text-sm tracking-widest uppercase rounded-xl shadow-xl transition-all duration-200">
            BEGIN NEW JOURNEY
          </button>
        </div>
      </div>
    `;
  }

  private getVictoryModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="bg-dungeon-darker border-2 border-amber-600 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-9 text-center space-y-7 glow-gold gothic-panel">
          <div class="space-y-2">
            <div class="w-16 h-16 mx-auto text-amber-400">${ICONS.CROWN}</div>
            <h2 class="font-title text-3xl font-extrabold text-dungeon-gold tracking-wider uppercase">VICTORY ACHIEVED!</h2>
            <p class="text-sm font-spectral italic text-slate-200">"Asura Malakor is vanquished. The Sanctum is purified in radiant dawn."</p>
          </div>

          <div class="bg-black/70 p-5 rounded-2xl border border-slate-700 text-sm font-data space-y-2.5 text-left">
            <div class="flex justify-between"><span>Final Rank:</span> <strong class="text-dungeon-gold font-bold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400 font-bold">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Total Damage:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Taken:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Treasure Gold:</span> <strong class="text-amber-400 font-bold">${player.stats.gold} Gold</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-4 gothic-button-primary rounded-xl text-sm font-title font-bold tracking-widest uppercase shadow-xl transition-all duration-200">
            ASCEND ONCE MORE
          </button>
        </div>
      </div>
    `;
  }

  private drawMinimap(tiles: Tile[][], player: Entity): void {
    const canvas = document.getElementById('minimap-canvas') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridH = tiles.length;
    const gridW = tiles[0]?.length || 0;
    if (gridW === 0 || gridH === 0) return;

    ctx.fillStyle = '#03060a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cellW = canvas.width / gridW;
    const cellH = canvas.height / gridH;

    for (let y = 0; y < gridH; y++) {
      for (let x = 0; x < gridW; x++) {
        const tile = tiles[y][x];
        if (tile.explored) {
          if (tile.walkable) {
            ctx.fillStyle = tile.visible ? '#38bdf8' : '#1e293b';
            ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
          } else {
            ctx.fillStyle = '#0f172a';
            ctx.fillRect(x * cellW, y * cellH, cellW + 0.5, cellH + 0.5);
          }
        }
      }
    }

    ctx.fillStyle = '#fbbf24';
    ctx.fillRect(player.x * cellW - 1, player.y * cellH - 1, cellW + 2, cellH + 2);
  }
}
