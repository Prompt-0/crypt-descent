import { Entity } from '../entities/Entity';
import { EquipSlot, LogMessage, GameState, Tile, Skill, PlayerClassType, LevelUpPerk } from '../types';
import { sound } from '../audio/SoundSynth';
import { CLASS_CATALOG } from '../classes/ClassCatalog';
import { ShopItemEntry } from '../shop/ShopManager';
import { ICONS } from './Icons';

export class HUDOverlay {
  private topBarEl: HTMLElement;
  private sidebarEl: HTMLElement;
  private targetingEl: HTMLElement;
  private modalsEl: HTMLElement;
  private onAction: (action: string, data?: any) => void;

  private lastGameState: GameState | null = null;
  private lastLogCount: number = 0;

  constructor(onAction: (action: string, data?: any) => void) {
    this.topBarEl = document.getElementById('hud-top-bar')!;
    this.sidebarEl = document.getElementById('hud-sidebar')!;
    this.targetingEl = document.getElementById('targeting-overlay')!;
    this.modalsEl = document.getElementById('hud-modals')!;
    this.onAction = onAction;

    this.initStructure();
  }

  private initStructure(): void {
    // 1. Top Bar
    this.topBarEl.innerHTML = `
      <div class="flex items-center space-x-6">
        <div class="flex items-center space-x-2.5">
          <div class="w-6 h-6 text-amber-500">${ICONS.SKULL}</div>
          <h1 class="font-display text-lg font-bold tracking-widest text-dungeon-gold drop-shadow-md">CRYPT DESCENT</h1>
        </div>
        <div class="flex items-center space-x-3 text-xs font-data text-slate-300">
          <span class="bg-dungeon-panel px-3 py-1 rounded border border-dungeon-border flex items-center space-x-1.5 shadow-inner">
            <span class="w-4 h-4 text-sky-400">${ICONS.DUNGEON_GATE}</span>
            <span>DEPTH <strong id="val-floor" class="text-sky-400 font-bold">I / V</strong></span>
          </span>
          <span class="bg-dungeon-panel px-3 py-1 rounded border border-dungeon-border flex items-center space-x-1.5 shadow-inner">
            <span class="w-3.5 h-3.5 text-slate-400">${ICONS.HOURGLASS}</span>
            <span>TURN <strong id="val-turn" class="text-slate-100">0</strong></span>
          </span>
          <span class="bg-dungeon-panel px-3 py-1 rounded border border-dungeon-border flex items-center space-x-1.5 shadow-inner">
            <span class="w-4 h-4 text-amber-400">${ICONS.GOLD_COIN}</span>
            <span><strong id="val-gold" class="text-amber-400 font-bold">0</strong> GOLD</span>
          </span>
        </div>
      </div>

      <!-- BOSS HEALTH BAR -->
      <div id="boss-bar-wrap" class="flex-1 max-w-md mx-6 flex-col items-center hidden">
        <div class="flex justify-between w-full text-xs font-title font-bold text-rose-400 mb-1 tracking-wider">
          <span id="boss-name">MALAKOR</span>
          <span id="boss-hp-text" class="font-data">240 / 240 HP</span>
        </div>
        <div class="w-full h-3 bg-dungeon-darkest rounded-full overflow-hidden border border-rose-900 glow-crimson">
          <div id="boss-hp-bar" class="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-200" style="width: 100%"></div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button id="btn-auto-explore" class="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 rounded text-xs border border-indigo-700 transition-all text-indigo-200 font-title font-bold flex items-center space-x-1.5">
          <span class="w-3.5 h-3.5">${ICONS.COMPASS}</span>
          <span>AUTO-EXPLORE (TAB)</span>
        </button>
        <button id="btn-sound" class="p-2 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors flex items-center space-x-1" title="Toggle Sound">
          <span class="w-4 h-4 text-slate-300" id="sound-icon">${ICONS.SPEAKER}</span>
        </button>
        <button id="btn-codex" class="px-2.5 py-1.5 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors font-title flex items-center space-x-1">
          <span class="w-3.5 h-3.5 text-slate-300">${ICONS.BOOK}</span>
          <span>CODEX</span>
        </button>
        <button id="btn-inventory" class="px-3 py-1.5 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors font-title font-bold text-dungeon-gold flex items-center space-x-1.5">
          <span class="w-4 h-4 text-dungeon-gold">${ICONS.BAG}</span>
          <span>KNAPSACK (I)</span>
        </button>
      </div>
    `;

    // 2. Sidebar (Fixed Viewport Layout)
    this.sidebarEl.innerHTML = `
      <!-- HERO HEADER & ATTRIBUTES -->
      <div class="p-4 space-y-3.5 border-b border-dungeon-border bg-dungeon-panel/40 shrink-0">
        <div>
          <div class="flex justify-between items-center mb-1">
            <span id="player-name-display" class="font-title font-bold text-sm tracking-wider text-slate-100">Hero</span>
            <span id="player-level-display" class="text-xs font-title text-dungeon-gold font-bold">LEVEL 1</span>
          </div>
          <div class="w-full h-1.5 bg-dungeon-darkest rounded-full overflow-hidden">
            <div id="player-xp-bar" class="h-full bg-dungeon-gold transition-all duration-300" style="width: 0%"></div>
          </div>
          <div class="flex justify-between text-[11px] font-data text-slate-400 mt-0.5">
            <span>XP</span>
            <span id="player-xp-text">0 / 100</span>
          </div>
        </div>

        <!-- HP GAUGE -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-rose-400 font-title font-bold flex items-center space-x-1.5">
              <span class="w-3.5 h-3.5">${ICONS.HEART}</span>
              <span>HEALTH</span>
            </span>
            <span id="player-hp-text" class="text-slate-200 font-data text-xs">100 / 100</span>
          </div>
          <div class="w-full h-3 bg-dungeon-darkest rounded border border-rose-950 overflow-hidden shadow-inner">
            <div id="player-hp-bar" class="h-full bg-gradient-to-r from-red-700 to-rose-500 transition-all duration-200" style="width: 100%"></div>
          </div>
        </div>

        <!-- MANA GAUGE -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-blue-400 font-title font-bold flex items-center space-x-1.5">
              <span class="w-3.5 h-3.5">${ICONS.MANA}</span>
              <span>MANA</span>
            </span>
            <span id="player-mana-text" class="text-slate-200 font-data text-xs">50 / 50</span>
          </div>
          <div class="w-full h-2.5 bg-dungeon-darkest rounded border border-blue-950 overflow-hidden shadow-inner">
            <div id="player-mana-bar" class="h-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-200" style="width: 100%"></div>
          </div>
        </div>

        <!-- ATTRIBUTES GRID -->
        <div class="grid grid-cols-2 gap-1.5 text-xs font-data">
          <div class="bg-dungeon-darkest/80 p-2 rounded border border-dungeon-border/60 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-slate-300">${ICONS.SWORD}</span><span>ATK:</span></span>
            <strong id="stat-atk" class="text-slate-100 font-bold">12</strong>
          </div>
          <div class="bg-dungeon-darkest/80 p-2 rounded border border-dungeon-border/60 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-sky-400">${ICONS.SHIELD}</span><span>DEF:</span></span>
            <strong id="stat-def" class="text-slate-100 font-bold">3</strong>
          </div>
          <div class="bg-dungeon-darkest/80 p-2 rounded border border-dungeon-border/60 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-amber-400">${ICONS.AGILITY}</span><span>AGI:</span></span>
            <strong id="stat-agi" class="text-slate-100 font-bold">12</strong>
          </div>
          <div class="bg-dungeon-darkest/80 p-2 rounded border border-dungeon-border/60 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-purple-400">${ICONS.ARCANA}</span><span>ARC:</span></span>
            <strong id="stat-arc" class="text-slate-100 font-bold">10</strong>
          </div>
        </div>

        <!-- ACTIVE SKILLS HOTBAR -->
        <div>
          <h3 class="font-title text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Active Combat Skills</h3>
          <div id="skills-hotbar" class="grid grid-cols-3 gap-1.5"></div>
        </div>

        <!-- STATUS EFFECTS -->
        <div id="status-effects-wrap" class="flex flex-wrap gap-1"></div>
      </div>

      <!-- EQUIPMENT SLOTS -->
      <div class="p-3.5 border-b border-dungeon-border shrink-0">
        <h2 class="font-title text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Equipped Relics & Gear</h2>
        <div id="equip-slots-wrap" class="grid grid-cols-2 gap-1.5 text-xs"></div>
      </div>

      <!-- COMBAT / DUNGEON LOG -->
      <div class="flex-1 p-3.5 flex flex-col min-h-0 overflow-hidden">
        <h2 class="font-title text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider shrink-0">Sanctum Chronicle</h2>
        <div id="log-container" class="flex-1 overflow-y-auto space-y-1 text-xs font-crimson pr-1 bg-dungeon-darkest/70 p-2.5 rounded border border-dungeon-border/40 leading-snug"></div>
      </div>

      <!-- MINIMAP -->
      <div class="p-3 border-t border-dungeon-border bg-dungeon-panel/30 flex items-center justify-center shrink-0">
        <canvas id="minimap-canvas" width="160" height="95" class="rounded border border-dungeon-border bg-dungeon-darkest"></canvas>
      </div>
    `;

    // 3. Targeting Overlay
    this.targetingEl.innerHTML = `
      <div class="bg-indigo-950/95 border-2 border-indigo-400 px-5 py-2.5 rounded-lg shadow-2xl text-xs text-indigo-200 flex items-center space-x-3 font-title">
        <span class="w-4 h-4 animate-spin text-indigo-400">${ICONS.COMPASS}</span>
        <span>SELECT TARGET TILE OR PRESS <strong class="text-white">ESC</strong> TO CANCEL</span>
      </div>
    `;

    // Static event listeners
    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.onAction('TOGGLE_SOUND');
      const iconEl = document.getElementById('sound-icon');
      if (iconEl) iconEl.innerHTML = sound.getIsMuted() ? ICONS.SPEAKER_OFF : ICONS.SPEAKER;
    });

    document.getElementById('btn-codex')?.addEventListener('click', () => this.onAction('TOGGLE_CODEX'));
    document.getElementById('btn-inventory')?.addEventListener('click', () => this.onAction('TOGGLE_INVENTORY'));
    document.getElementById('btn-auto-explore')?.addEventListener('click', () => this.onAction('AUTO_EXPLORE'));
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
    if (levelEl) levelEl.textContent = `LEVEL ${player.stats.level}`;

    const xpPercent = Math.max(0, Math.min(100, (player.stats.xp / player.stats.xpToNextLevel) * 100));
    const xpBar = document.getElementById('player-xp-bar');
    if (xpBar) xpBar.style.width = `${xpPercent}%`;

    const xpText = document.getElementById('player-xp-text');
    if (xpText) xpText.textContent = `${player.stats.xp} / ${player.stats.xpToNextLevel}`;

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
          <button class="btn-skill p-2 rounded border text-left flex flex-col justify-between relative transition-all ${
            onCd || noMana
              ? 'bg-slate-900/90 border-slate-800 opacity-50 cursor-not-allowed'
              : 'bg-dungeon-panel border-dungeon-border hover:border-amber-500 hover:shadow-lg'
          }" data-skill-idx="${idx}">
            <div class="flex justify-between items-center text-[10px]">
              <span class="font-title font-bold text-slate-100 truncate">${s.name}</span>
              <span class="text-amber-400 font-bold font-data">[${idx + 1}]</span>
            </div>
            <div class="flex justify-between text-[9px] font-data text-slate-400 mt-1">
              <span class="text-blue-300">${s.manaCost} MP</span>
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

    // 4. Status Effects
    const statusWrap = document.getElementById('status-effects-wrap');
    if (statusWrap) {
      if (player.statusEffects.length > 0) {
        statusWrap.innerHTML = player.statusEffects.map((e) => `
          <span class="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900/80 font-data flex items-center space-x-1" style="color: ${e.color}">
            <span>${e.name} (${e.duration}t)</span>
          </span>
        `).join('');
      } else {
        statusWrap.innerHTML = '';
      }
    }

    // 5. Equipment Slots
    const equipWrap = document.getElementById('equip-slots-wrap');
    if (equipWrap) {
      equipWrap.innerHTML = `
        ${this.renderEquipSlot(player, EquipSlot.MAIN_HAND, 'Main Hand')}
        ${this.renderEquipSlot(player, EquipSlot.OFF_HAND, 'Off Hand')}
        ${this.renderEquipSlot(player, EquipSlot.BODY, 'Chest Armor')}
        ${this.renderEquipSlot(player, EquipSlot.HEAD, 'Greathelm')}
        ${this.renderEquipSlot(player, EquipSlot.RING, 'Signet Ring')}
        ${this.renderEquipSlot(player, EquipSlot.AMULET, 'Relic Amulet')}
      `;

      equipWrap.querySelectorAll('[data-unequip-slot]').forEach((el) => {
        el.addEventListener('click', () => {
          const slot = el.getAttribute('data-unequip-slot') as EquipSlot;
          if (slot) this.onAction('UNEQUIP_ITEM', { slot });
        });
      });
    }

    // 6. Logs
    if (logs.length !== this.lastLogCount) {
      this.lastLogCount = logs.length;
      const logContainer = document.getElementById('log-container');
      if (logContainer) {
        logContainer.innerHTML = logs.slice(-50).map((l) => `
          <div class="leading-relaxed border-b border-dungeon-border/20 pb-0.5" style="color: ${l.color}">
            <span class="text-slate-600 font-data select-none text-[10px] mr-1">[T${l.turn}]</span> ${l.text}
          </div>
        `).join('');
        logContainer.scrollTop = logContainer.scrollHeight;
      }
    }

    // 7. Targeting Banner
    if (gameState === GameState.TARGETING) {
      this.targetingEl.classList.remove('hidden');
    } else {
      this.targetingEl.classList.add('hidden');
    }

    // 8. Modals & Screens
    if (gameState !== this.lastGameState) {
      this.lastGameState = gameState;
      this.renderModals(gameState, player, shopItems, levelUpPerks, currentFloor);
    }

    // 9. Minimap
    this.drawMinimap(tiles, player);
  }

  private renderEquipSlot(player: Entity, slot: EquipSlot, label: string): string {
    const item = player.equipment[slot];
    if (item) {
      return `
        <div class="bg-dungeon-panel p-2 rounded border border-dungeon-border flex items-center justify-between group relative cursor-pointer hover:border-amber-500/50 transition-all shadow" data-unequip-slot="${slot}">
          <div class="truncate">
            <span class="text-[9px] font-title text-slate-500 block uppercase tracking-wider">${label}</span>
            <span class="font-bold truncate text-[11px] font-crimson" style="color: ${item.color}">${item.name}</span>
          </div>
          <button class="text-slate-500 hover:text-rose-400 text-xs px-1" title="Unequip">✕</button>
        </div>
      `;
    }
    return `
      <div class="bg-dungeon-darkest/50 p-2 rounded border border-dungeon-border/30 text-slate-600">
        <span class="text-[9px] font-title text-slate-600 block uppercase tracking-wider">${label}</span>
        <span class="text-[11px] italic font-crimson">Empty</span>
      </div>
    `;
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
        <!-- Atmospheric Background Vignette -->
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-950/20 via-black to-black"></div>

        <div class="relative z-10 w-full max-w-2xl text-center flex flex-col items-center space-y-8 animate-fade-in">
          <!-- Skull Emblem -->
          <div class="w-16 h-16 text-amber-500 filter drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">${ICONS.SKULL}</div>

          <div class="space-y-3">
            <h1 class="font-display text-5xl md:text-6xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 drop-shadow-[0_4px_25px_rgba(217,119,6,0.6)]">
              CRYPT DESCENT
            </h1>
            <p class="font-title text-sm tracking-[0.25em] text-amber-500/90 uppercase">
              The Abyssal Sanctum of Malakor
            </p>
          </div>

          <div class="w-full max-w-sm space-y-3.5 pt-4">
            <button id="btn-start-game" class="w-full py-3.5 gothic-button-primary rounded-xl text-sm font-bold tracking-widest uppercase shadow-2xl">
              BEGIN NEW DESCENT
            </button>
            <button id="btn-open-codex" class="w-full py-3 gothic-button rounded-xl text-xs font-bold tracking-widest uppercase">
              EXPLORER'S CODEX & BESTIARY
            </button>
          </div>

          <p class="text-xs text-slate-500 font-data tracking-wider">
            Version 2.0 • Dark Fantasy Procedural Dungeon Engine
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
      { name: "THE SANCTUM OF MALAKOR", lore: 'The throne room of the Necromancer Lord. The air vibrates with pure necrotic fury. Prepare for the final confrontation.' }
    ];
    const info = floorTitles[floor - 1] || floorTitles[0];

    return `
      <div class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="w-full max-w-lg text-center space-y-6 gothic-panel p-8 rounded-2xl border-2 border-amber-600/70 shadow-2xl">
          <div class="w-12 h-12 mx-auto text-sky-400">${ICONS.DUNGEON_GATE}</div>
          <div class="space-y-2">
            <span class="text-xs font-data text-amber-500 uppercase tracking-widest">DESCENDING TO DEPTH ${floor} OF 5</span>
            <h2 class="font-display text-2xl font-bold text-dungeon-gold tracking-wider">${info.name}</h2>
          </div>
          <p class="text-sm font-crimson italic text-slate-300 leading-relaxed border-y border-dungeon-border/60 py-4">
            "${info.lore}"
          </p>
          <button id="btn-continue-descent" class="w-full py-3.5 gothic-button-primary rounded-xl text-xs font-title font-bold tracking-widest uppercase">
            ENTER THE SHADOWS (SPACE)
          </button>
        </div>
      </div>
    `;
  }

  private getLevelUpModalHTML(perks: LevelUpPerk[]): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-6">
        <div class="w-full max-w-3xl gothic-panel p-8 rounded-2xl border-2 border-amber-500 shadow-2xl space-y-6">
          <div class="text-center space-y-2">
            <div class="w-10 h-10 mx-auto text-amber-400">${ICONS.CROWN}</div>
            <h2 class="font-display text-3xl font-bold text-dungeon-gold tracking-wider uppercase">LEVEL UP ACHIEVED!</h2>
            <p class="text-xs font-crimson text-slate-300">Choose a permanent boon to hone your dark powers</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            ${perks.map((p, idx) => `
              <div class="bg-dungeon-panel p-5 rounded-xl border border-dungeon-border hover:border-amber-400 hover:shadow-2xl transition-all flex flex-col justify-between space-y-4">
                <div class="space-y-2 text-center">
                  <h3 class="font-title font-bold text-sm text-amber-400 tracking-wider">${p.title}</h3>
                  <p class="text-xs font-crimson text-slate-300 leading-relaxed">${p.description}</p>
                </div>
                <button class="btn-select-perk w-full py-2 gothic-button-primary rounded-lg text-xs font-title tracking-wider uppercase" data-perk-idx="${idx}">
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
        <div class="bg-dungeon-darker border-2 border-dungeon-border rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl p-8 flex flex-col space-y-8 gothic-panel">
          <div class="text-center space-y-2">
            <div class="w-10 h-10 mx-auto text-amber-500 mb-1">${ICONS.SKULL}</div>
            <h2 class="font-display text-3xl font-bold text-dungeon-gold tracking-widest uppercase">CHOOSE YOUR CHAMPION</h2>
            <p class="text-xs text-slate-400 font-mono">Select your hero archetype to brave the depths of Malakor's Crypt</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            ${classes.map((cls) => `
              <div class="bg-dungeon-panel p-5 rounded-xl border border-dungeon-border hover:border-amber-500 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden">
                <div class="space-y-3">
                  <div class="w-16 h-16 mx-auto">${crests[cls.type]}</div>
                  <div class="text-center">
                    <h3 class="font-title font-bold text-sm tracking-wider" style="color: ${cls.color}">${cls.name}</h3>
                    <span class="text-[10px] font-title text-slate-400 block mt-0.5">${cls.tagline}</span>
                  </div>
                  <p class="text-xs font-crimson text-slate-300 leading-relaxed text-center">${cls.description}</p>
                </div>

                <div class="bg-dungeon-darkest/80 p-3 rounded border border-dungeon-border/50 text-[11px] font-data space-y-1">
                  <div class="flex justify-between"><span class="text-rose-400">Health:</span> <strong>${cls.baseHp}</strong></div>
                  <div class="flex justify-between"><span class="text-blue-400">Mana:</span> <strong>${cls.baseMana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Strength:</span> <strong>${cls.strength}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Agility:</span> <strong>${cls.agility}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Arcana:</span> <strong>${cls.arcana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Defense:</span> <strong>${cls.defense}</strong></div>
                </div>

                <button class="btn-select-class w-full py-2.5 gothic-button-primary rounded-lg text-xs font-title tracking-wider uppercase" data-class-type="${cls.type}">
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

  private getShopModalHTML(player: Entity, shopItems: ShopItemEntry[]): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border-2 border-amber-600/70 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] gothic-panel">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 text-amber-400">${ICONS.GOLD_COIN}</div>
              <div>
                <h2 class="font-title text-base font-bold text-dungeon-gold tracking-wider">GRIMM'S CRYPT BAZAAR</h2>
                <span class="text-xs font-data text-slate-400">Purse: <strong class="text-amber-400">${player.stats.gold} Gold</strong></span>
              </div>
            </div>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-xs font-title px-3 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6">
            <div>
              <h3 class="font-title text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Wares for Sale</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${shopItems.map((entry) => `
                  <div class="bg-dungeon-panel p-3.5 rounded-lg border border-dungeon-border flex flex-col justify-between space-y-2 shadow">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-xs font-title" style="color: ${entry.item.color}">${entry.item.name}</h4>
                        <span class="text-[10px] text-slate-400 uppercase font-data">${entry.item.rarity}</span>
                      </div>
                      <span class="text-amber-400 font-bold font-data text-xs">${entry.price} Gold</span>
                    </div>
                    <p class="text-xs font-crimson text-slate-300 leading-snug">${entry.item.description}</p>
                    <button class="btn-buy-shop w-full py-1.5 rounded text-xs font-title font-bold transition-all ${
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

            <!-- SELL INVENTORY SECTION -->
            <div>
              <h3 class="font-title text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sell Possessions</h3>
              ${player.inventory.length === 0 ? `
                <p class="text-slate-500 text-xs italic font-crimson">Knapsack is empty.</p>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  ${player.inventory.map((item) => `
                    <div class="bg-dungeon-darkest p-2 rounded border border-dungeon-border flex items-center justify-between">
                      <div class="truncate mr-2">
                        <span class="text-xs font-bold truncate block font-crimson" style="color: ${item.color}">${item.name}</span>
                        <span class="text-[10px] text-amber-400 font-data">+${Math.max(2, Math.floor(item.value * 0.45))} Gold</span>
                      </div>
                      <button class="btn-sell-shop px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 rounded text-[11px] font-title text-emerald-200 border border-emerald-700 font-bold" data-item-id="${item.id}">
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
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border-2 border-purple-900 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-7 text-center space-y-6 gothic-panel glow-amethyst">
          <div class="space-y-2">
            <div class="w-10 h-10 mx-auto text-purple-400">${ICONS.ALTAR}</div>
            <h2 class="font-display text-2xl font-bold text-purple-400 tracking-wider">ALTAR OF SACRIFICE</h2>
            <p class="text-xs font-crimson text-slate-300">Offer earthly riches or lifeblood in exchange for otherworldly boons.</p>
          </div>

          <div class="grid grid-cols-1 gap-3 text-left">
            <button class="btn-altar-choice bg-dungeon-panel hover:bg-purple-950/80 p-4 rounded-xl border border-dungeon-border hover:border-purple-500 transition-all flex items-center justify-between shadow" data-altar-choice="GOLD">
              <div>
                <h4 class="font-title font-bold text-sm text-amber-400">Offer Gold (50 Gold)</h4>
                <p class="text-xs font-crimson text-slate-300 mt-0.5">Empower spirit with +15 Max Mana and +10% Critical Strike Chance.</p>
              </div>
              <div class="w-6 h-6 text-amber-400 shrink-0 ml-3">${ICONS.GOLD_COIN}</div>
            </button>

            <button class="btn-altar-choice bg-dungeon-panel hover:bg-rose-950/80 p-4 rounded-xl border border-dungeon-border hover:border-rose-500 transition-all flex items-center justify-between shadow" data-altar-choice="BLOOD">
              <div>
                <h4 class="font-title font-bold text-sm text-rose-400">Blood Sacrifice (20 Health)</h4>
                <p class="text-xs font-crimson text-slate-300 mt-0.5">Infuse soul with +4 Permanent Attack Power and +2 Armor.</p>
              </div>
              <div class="w-6 h-6 text-rose-500 shrink-0 ml-3">${ICONS.DROPLET}</div>
            </button>
          </div>

          <button id="modal-close" class="w-full py-2 gothic-button rounded text-xs">
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

  private getInventoryModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border-2 border-dungeon-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] gothic-panel">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <div class="flex items-center space-x-2.5">
              <div class="w-5 h-5 text-amber-400">${ICONS.BAG}</div>
              <h2 class="font-title text-base font-bold text-dungeon-gold tracking-wider">HERO'S KNAPSACK</h2>
            </div>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-xs font-title px-3 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>

          <div class="p-6 overflow-y-auto flex-1 space-y-4">
            ${player.inventory.length === 0 ? `
              <p class="text-center text-slate-500 py-12 italic font-crimson text-sm">Your knapsack is empty. Slay monsters and unlock chests to claim equipment!</p>
            ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${player.inventory.map((item) => `
                  <div class="bg-dungeon-panel p-3.5 rounded-lg border border-dungeon-border hover:border-amber-500/60 transition-colors flex flex-col justify-between space-y-2 shadow">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-xs font-title" style="color: ${item.color}">${item.name}</h4>
                        <span class="text-[10px] text-slate-400 uppercase font-data">${item.type} • ${item.rarity}</span>
                      </div>
                    </div>
                    <p class="text-xs font-crimson text-slate-300 leading-snug">${item.description}</p>
                    <div class="flex items-center space-x-2 pt-1 border-t border-dungeon-border/40">
                      ${item.equipSlot ? `
                        <button class="btn-use flex-1 py-1 px-2 bg-indigo-900/70 hover:bg-indigo-800 rounded text-xs font-title text-indigo-200 border border-indigo-700 transition-colors font-bold" data-item-id="${item.id}">
                          Equip
                        </button>
                      ` : `
                        <button class="btn-use flex-1 py-1 px-2 bg-emerald-900/70 hover:bg-emerald-800 rounded text-xs font-title text-emerald-200 border border-emerald-700 transition-colors font-bold" data-item-id="${item.id}">
                          Use
                        </button>
                      `}
                      <button class="btn-drop py-1 px-2.5 bg-rose-950/70 hover:bg-rose-900 rounded text-xs font-title text-rose-300 border border-rose-800 transition-colors" data-item-id="${item.id}">
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
  }

  private getCodexModalHTML(): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border-2 border-dungeon-border rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] gothic-panel">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <div class="flex items-center space-x-2.5">
              <div class="w-5 h-5 text-amber-400">${ICONS.BOOK}</div>
              <h2 class="font-display text-lg font-bold text-dungeon-gold tracking-wider">EXPLORER'S CODEX & BESTIARY</h2>
            </div>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-xs font-title px-3 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>
          <div class="p-6 overflow-y-auto space-y-6 text-slate-300">
            <!-- Controls & Hotkeys -->
            <div class="space-y-2">
              <h3 class="font-title text-sm font-bold text-amber-400 uppercase tracking-wider">Survival Controls</h3>
              <div class="grid grid-cols-2 gap-3 text-xs font-data bg-dungeon-darkest/70 p-3 rounded border border-dungeon-border/50">
                <div><strong class="text-slate-100">WASD / Arrow Keys</strong>: Move & Melee</div>
                <div><strong class="text-slate-100">1, 2, 3</strong>: Trigger Active Skills</div>
                <div><strong class="text-slate-100">Tab / O</strong>: Auto-Explore Hallways</div>
                <div><strong class="text-slate-100">Q / E</strong>: Quick Health / Mana Potions</div>
                <div><strong class="text-slate-100">Space / .</strong>: Wait 1 Turn</div>
                <div><strong class="text-slate-100">I</strong>: Open Knapsack</div>
              </div>
            </div>

            <!-- Bestiary Overview -->
            <div class="space-y-2">
              <h3 class="font-title text-sm font-bold text-amber-400 uppercase tracking-wider">Sanctum Bestiary</h3>
              <div class="space-y-2 font-crimson text-xs">
                <div class="p-2.5 bg-dungeon-panel rounded border border-dungeon-border/50">
                  <h4 class="font-title text-xs font-bold text-rose-400">Crypt Rat & Skeletons (Depth I-II)</h4>
                  <p class="text-slate-300">Skittering rodents and ancient bone swordsmen. Watch out for Skeleton Archers kiting at range.</p>
                </div>
                <div class="p-2.5 bg-dungeon-panel rounded border border-dungeon-border/50">
                  <h4 class="font-title text-xs font-bold text-purple-400">Shadow Wraiths & Cultists (Depth III-IV)</h4>
                  <p class="text-slate-300">Wraiths glide through solid walls. Cultist acolytes chant dark fireballs and summon skeleton reinforcements.</p>
                </div>
                <div class="p-2.5 bg-dungeon-panel rounded border border-dungeon-border/50">
                  <h4 class="font-title text-xs font-bold text-amber-400">Malakor, the Necromancer Lord (Depth V)</h4>
                  <p class="text-slate-300">Master of the Sanctum. Wields bone spears, dark novae, and necrotic soul orbs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private getGameOverModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border-2 border-rose-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center space-y-6 glow-crimson gothic-panel">
          <div class="space-y-2">
            <div class="w-14 h-14 mx-auto text-rose-500">${ICONS.TOMBSTONE}</div>
            <h2 class="font-display text-3xl font-bold text-rose-500 tracking-wider uppercase">HERE LIES THE FALLEN</h2>
            <p class="text-xs font-crimson italic text-slate-400">"Your bones join the endless legions of the subterranean abyss..."</p>
          </div>

          <div class="bg-dungeon-panel/90 p-4 rounded-xl border border-dungeon-border text-xs font-data space-y-2 text-left">
            <div class="flex justify-between"><span>Deepest Floor:</span> <strong class="text-slate-100 font-bold">${player.stats.dungeonDepth} / 5</strong></div>
            <div class="flex justify-between"><span>Final Level:</span> <strong class="text-dungeon-gold font-bold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400 font-bold">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Damage Dealt:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Elapsed:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Gold Gathered:</span> <strong class="text-amber-400 font-bold">${player.stats.gold} Gold</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-3.5 bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-white font-title font-bold text-xs tracking-widest uppercase rounded-xl shadow-lg transition-all duration-200">
            DESCEND ONCE MORE
          </button>
        </div>
      </div>
    `;
  }

  private getVictoryModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border-2 border-amber-600 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-8 text-center space-y-6 glow-gold gothic-panel">
          <div class="space-y-2">
            <div class="w-14 h-14 mx-auto text-amber-400">${ICONS.CROWN}</div>
            <h2 class="font-display text-3xl font-bold text-dungeon-gold tracking-wider uppercase">VICTORY ACHIEVED!</h2>
            <p class="text-xs font-crimson italic text-slate-300">"Malakor is vanquished. The Sanctum is purified in golden dawn."</p>
          </div>

          <div class="bg-dungeon-panel/90 p-4 rounded-xl border border-dungeon-border text-xs font-data space-y-2 text-left">
            <div class="flex justify-between"><span>Final Level:</span> <strong class="text-dungeon-gold font-bold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400 font-bold">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Total Damage:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Taken:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Treasure Gold:</span> <strong class="text-amber-400 font-bold">${player.stats.gold} Gold</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-3.5 gothic-button-primary rounded-xl text-xs font-title font-bold tracking-widest uppercase shadow-lg transition-all duration-200">
            BEGIN NEW JOURNEY
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

    ctx.fillStyle = '#04060a';
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
