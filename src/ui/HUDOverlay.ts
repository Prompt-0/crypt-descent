import { Entity } from '../entities/Entity';
import { EquipSlot, LogMessage, GameState, Tile, Skill, PlayerClassType } from '../types';
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
          <h1 class="font-cinzel text-base font-bold tracking-widest text-dungeon-gold">CRYPT DESCENT</h1>
        </div>
        <div class="flex items-center space-x-3 text-xs font-mono text-slate-300">
          <span class="bg-dungeon-panel px-3 py-1 rounded border border-dungeon-border flex items-center space-x-1.5">
            <span class="w-4 h-4 text-sky-400">${ICONS.DUNGEON_GATE}</span>
            <span>Floor <strong id="val-floor" class="text-sky-400 font-bold">1 / 5</strong></span>
          </span>
          <span class="bg-dungeon-panel px-3 py-1 rounded border border-dungeon-border flex items-center space-x-1.5">
            <span class="w-3.5 h-3.5 text-slate-400">${ICONS.HOURGLASS}</span>
            <span>Turn <strong id="val-turn" class="text-slate-200">0</strong></span>
          </span>
          <span class="bg-dungeon-panel px-3 py-1 rounded border border-dungeon-border flex items-center space-x-1.5">
            <span class="w-4 h-4 text-amber-400">${ICONS.GOLD_COIN}</span>
            <span><strong id="val-gold" class="text-amber-400 font-bold">0</strong> Gold</span>
          </span>
        </div>
      </div>

      <!-- BOSS BAR -->
      <div id="boss-bar-wrap" class="flex-1 max-w-md mx-6 flex-col items-center hidden">
        <div class="flex justify-between w-full text-xs font-cinzel font-bold text-rose-400 mb-1">
          <span id="boss-name">Malakor</span>
          <span id="boss-hp-text">240 / 240 HP</span>
        </div>
        <div class="w-full h-3 bg-dungeon-darkest rounded-full overflow-hidden border border-rose-900 glow-crimson">
          <div id="boss-hp-bar" class="h-full bg-gradient-to-r from-rose-700 to-rose-500 transition-all duration-200" style="width: 100%"></div>
        </div>
      </div>

      <div class="flex items-center space-x-2">
        <button id="btn-auto-explore" class="px-3 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 rounded text-xs border border-indigo-700 transition-all text-indigo-200 font-bold flex items-center space-x-1.5">
          <span class="w-3.5 h-3.5">${ICONS.COMPASS}</span>
          <span>Auto-Explore (Tab)</span>
        </button>
        <button id="btn-sound" class="p-2 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors flex items-center space-x-1">
          <span class="w-4 h-4 text-slate-300" id="sound-icon">${ICONS.SPEAKER}</span>
        </button>
        <button id="btn-help" class="px-2.5 py-1.5 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors flex items-center space-x-1">
          <span class="w-3.5 h-3.5 text-slate-300">${ICONS.SCROLL}</span>
          <span>Guide (?)</span>
        </button>
        <button id="btn-inventory" class="px-3 py-1.5 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors font-bold text-dungeon-gold flex items-center space-x-1.5">
          <span class="w-4 h-4 text-dungeon-gold">${ICONS.BAG}</span>
          <span>Knapsack (I)</span>
        </button>
      </div>
    `;

    // 2. Sidebar (Strict fixed layout with no outer page scrollbar)
    this.sidebarEl.innerHTML = `
      <!-- HERO HEADER & ATTRIBUTES -->
      <div class="p-3.5 space-y-3 border-b border-dungeon-border bg-dungeon-panel/40 shrink-0">
        <div>
          <div class="flex justify-between items-center mb-1">
            <span id="player-name-display" class="font-cinzel font-bold text-sm text-slate-100">Hero</span>
            <span id="player-level-display" class="text-xs text-dungeon-gold font-bold">Level 1</span>
          </div>
          <div class="w-full h-1.5 bg-dungeon-darkest rounded-full overflow-hidden">
            <div id="player-xp-bar" class="h-full bg-dungeon-gold transition-all duration-300" style="width: 0%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>Experience</span>
            <span id="player-xp-text">0 / 100</span>
          </div>
        </div>

        <!-- HP GAUGE -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-rose-400 font-bold flex items-center space-x-1">
              <span class="w-3.5 h-3.5">${ICONS.HEART}</span>
              <span>Health</span>
            </span>
            <span id="player-hp-text" class="text-slate-200 font-mono text-xs">100 / 100</span>
          </div>
          <div class="w-full h-3 bg-dungeon-darkest rounded border border-rose-950 overflow-hidden">
            <div id="player-hp-bar" class="h-full bg-gradient-to-r from-red-700 to-rose-500 transition-all duration-200" style="width: 100%"></div>
          </div>
        </div>

        <!-- MANA GAUGE -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-blue-400 font-bold flex items-center space-x-1">
              <span class="w-3.5 h-3.5">${ICONS.MANA}</span>
              <span>Mana</span>
            </span>
            <span id="player-mana-text" class="text-slate-200 font-mono text-xs">50 / 50</span>
          </div>
          <div class="w-full h-2.5 bg-dungeon-darkest rounded border border-blue-950 overflow-hidden">
            <div id="player-mana-bar" class="h-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-200" style="width: 100%"></div>
          </div>
        </div>

        <!-- ATTRIBUTES GRID -->
        <div class="grid grid-cols-2 gap-1.5 text-xs font-mono">
          <div class="bg-dungeon-darkest/70 p-1.5 rounded border border-dungeon-border/50 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-slate-300">${ICONS.SWORD}</span><span>ATK:</span></span>
            <strong id="stat-atk" class="text-slate-100">12</strong>
          </div>
          <div class="bg-dungeon-darkest/70 p-1.5 rounded border border-dungeon-border/50 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-sky-400">${ICONS.SHIELD}</span><span>DEF:</span></span>
            <strong id="stat-def" class="text-slate-100">3</strong>
          </div>
          <div class="bg-dungeon-darkest/70 p-1.5 rounded border border-dungeon-border/50 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-amber-400">${ICONS.AGILITY}</span><span>AGI:</span></span>
            <strong id="stat-agi" class="text-slate-100">12</strong>
          </div>
          <div class="bg-dungeon-darkest/70 p-1.5 rounded border border-dungeon-border/50 flex items-center justify-between">
            <span class="text-slate-400 flex items-center space-x-1"><span class="w-3.5 h-3.5 text-purple-400">${ICONS.ARCANA}</span><span>ARC:</span></span>
            <strong id="stat-arc" class="text-slate-100">10</strong>
          </div>
        </div>

        <!-- ACTIVE SKILLS HOTBAR -->
        <div>
          <h3 class="font-cinzel text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-wider">Active Skills</h3>
          <div id="skills-hotbar" class="grid grid-cols-3 gap-1.5"></div>
        </div>

        <!-- STATUS EFFECTS -->
        <div id="status-effects-wrap" class="flex flex-wrap gap-1"></div>
      </div>

      <!-- EQUIPMENT SLOTS -->
      <div class="p-3 border-b border-dungeon-border shrink-0">
        <h2 class="font-cinzel text-[11px] font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Equipped Gear</h2>
        <div id="equip-slots-wrap" class="grid grid-cols-2 gap-1.5 text-xs"></div>
      </div>

      <!-- COMBAT / DUNGEON LOG (Scrollable inner box only) -->
      <div class="flex-1 p-3 flex flex-col min-h-0 overflow-hidden">
        <h2 class="font-cinzel text-[11px] font-bold text-slate-400 mb-1 uppercase tracking-wider shrink-0">Dungeon Log</h2>
        <div id="log-container" class="flex-1 overflow-y-auto space-y-1 text-[11px] font-mono pr-1 bg-dungeon-darkest/60 p-2 rounded border border-dungeon-border/40"></div>
      </div>

      <!-- MINIMAP -->
      <div class="p-2.5 border-t border-dungeon-border bg-dungeon-panel/30 flex items-center justify-center shrink-0">
        <canvas id="minimap-canvas" width="150" height="90" class="rounded border border-dungeon-border bg-dungeon-darkest"></canvas>
      </div>
    `;

    // 3. Targeting Overlay
    this.targetingEl.innerHTML = `
      <div class="bg-indigo-950/95 border border-indigo-400 px-4 py-2 rounded-lg shadow-2xl text-xs text-indigo-200 flex items-center space-x-2.5 font-cinzel">
        <span class="w-4 h-4 animate-spin text-indigo-400">${ICONS.COMPASS}</span>
        <span>Select Target Tile or Press <strong>ESC</strong> to Cancel</span>
      </div>
    `;

    // Static event listeners
    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.onAction('TOGGLE_SOUND');
      const iconEl = document.getElementById('sound-icon');
      if (iconEl) iconEl.innerHTML = sound.getIsMuted() ? ICONS.SPEAKER_OFF : ICONS.SPEAKER;
    });

    document.getElementById('btn-help')?.addEventListener('click', () => this.onAction('TOGGLE_HELP'));
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
    shopItems: ShopItemEntry[] = []
  ): void {
    // 1. Header Counters
    const floorEl = document.getElementById('val-floor');
    if (floorEl) floorEl.textContent = `${currentFloor} / 5`;

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
    if (levelEl) levelEl.textContent = `Level ${player.stats.level}`;

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
          <button class="btn-skill p-1.5 rounded border text-left flex flex-col justify-between relative transition-all ${
            onCd || noMana
              ? 'bg-slate-900/80 border-slate-700 opacity-50 cursor-not-allowed'
              : 'bg-dungeon-panel border-dungeon-border hover:border-amber-500 hover:shadow-lg'
          }" data-skill-idx="${idx}">
            <div class="flex justify-between items-center text-[10px]">
              <span class="font-bold text-slate-100 truncate">${s.name}</span>
              <span class="text-amber-400 font-bold font-mono">[${idx + 1}]</span>
            </div>
            <div class="flex justify-between text-[9px] text-slate-400 mt-0.5">
              <span class="text-blue-300 font-mono">${s.manaCost} MP</span>
              ${onCd ? `<span class="text-rose-400 font-bold font-mono">${s.cooldownCurrent}t CD</span>` : '<span class="text-emerald-400 font-bold">RDY</span>'}
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
          <span class="text-[10px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900/80 font-mono flex items-center space-x-1" style="color: ${e.color}">
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
        ${this.renderEquipSlot(player, EquipSlot.MAIN_HAND, 'Weapon')}
        ${this.renderEquipSlot(player, EquipSlot.OFF_HAND, 'Offhand')}
        ${this.renderEquipSlot(player, EquipSlot.BODY, 'Armor')}
        ${this.renderEquipSlot(player, EquipSlot.HEAD, 'Helmet')}
        ${this.renderEquipSlot(player, EquipSlot.RING, 'Ring')}
        ${this.renderEquipSlot(player, EquipSlot.AMULET, 'Amulet')}
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
          <div class="leading-relaxed" style="color: ${l.color}">
            <span class="text-slate-600 select-none">[T${l.turn}]</span> ${l.text}
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

    // 8. Modals
    if (gameState !== this.lastGameState) {
      this.lastGameState = gameState;
      this.renderModals(gameState, player, shopItems);
    }

    // 9. Minimap
    this.drawMinimap(tiles, player);
  }

  private renderEquipSlot(player: Entity, slot: EquipSlot, label: string): string {
    const item = player.equipment[slot];
    if (item) {
      return `
        <div class="bg-dungeon-panel p-1.5 rounded border border-dungeon-border flex items-center justify-between group relative cursor-pointer hover:border-amber-500/50" data-unequip-slot="${slot}">
          <div class="truncate">
            <span class="text-[9px] text-slate-500 block uppercase">${label}</span>
            <span class="font-bold truncate text-[11px]" style="color: ${item.color}">${item.name}</span>
          </div>
          <button class="text-slate-500 hover:text-rose-400 text-xs px-1" title="Unequip">✕</button>
        </div>
      `;
    }
    return `
      <div class="bg-dungeon-darkest/40 p-1.5 rounded border border-dungeon-border/30 text-slate-600">
        <span class="text-[9px] text-slate-600 block uppercase">${label}</span>
        <span class="text-[11px] italic">Empty</span>
      </div>
    `;
  }

  private renderModals(gameState: GameState, player: Entity, shopItems: ShopItemEntry[]): void {
    if (gameState === GameState.CLASS_SELECT) {
      this.modalsEl.innerHTML = this.getClassSelectModalHTML();
      this.bindClassSelectModal();
    } else if (gameState === GameState.INVENTORY) {
      this.modalsEl.innerHTML = this.getInventoryModalHTML(player);
      this.bindInventoryModal(player);
    } else if (gameState === GameState.SHOP) {
      this.modalsEl.innerHTML = this.getShopModalHTML(player, shopItems);
      this.bindShopModal(player);
    } else if (gameState === GameState.ALTAR) {
      this.modalsEl.innerHTML = this.getAltarModalHTML();
      this.bindAltarModal();
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
            <h2 class="font-cinzel text-3xl font-bold text-dungeon-gold tracking-widest uppercase">CHOOSE YOUR CHAMPION</h2>
            <p class="text-xs text-slate-400 font-mono">Select your hero archetype to brave the depths of Malakor's Crypt</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            ${classes.map((cls) => `
              <div class="bg-dungeon-panel p-5 rounded-xl border border-dungeon-border hover:border-amber-500 hover:shadow-2xl transition-all duration-200 flex flex-col justify-between space-y-4 group relative overflow-hidden">
                <div class="space-y-3">
                  <div class="w-16 h-16 mx-auto">${crests[cls.type]}</div>
                  <div class="text-center">
                    <h3 class="font-cinzel font-bold text-sm tracking-wider" style="color: ${cls.color}">${cls.name}</h3>
                    <span class="text-[10px] text-slate-400 block mt-0.5">${cls.tagline}</span>
                  </div>
                  <p class="text-[11px] text-slate-300 leading-relaxed text-center">${cls.description}</p>
                </div>

                <div class="bg-dungeon-darkest/80 p-3 rounded border border-dungeon-border/50 text-[11px] font-mono space-y-1">
                  <div class="flex justify-between"><span class="text-rose-400">Health:</span> <strong>${cls.baseHp}</strong></div>
                  <div class="flex justify-between"><span class="text-blue-400">Mana:</span> <strong>${cls.baseMana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Strength:</span> <strong>${cls.strength}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Agility:</span> <strong>${cls.agility}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Arcana:</span> <strong>${cls.arcana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">Defense:</span> <strong>${cls.defense}</strong></div>
                </div>

                <button class="btn-select-class w-full py-2.5 gothic-button-primary rounded-lg text-xs tracking-wider uppercase" data-class-type="${cls.type}">
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
        <div class="bg-dungeon-darker border border-amber-600/70 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] gothic-panel">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <div class="flex items-center space-x-3">
              <div class="w-6 h-6 text-amber-400">${ICONS.GOLD_COIN}</div>
              <div>
                <h2 class="font-cinzel text-base font-bold text-dungeon-gold tracking-wider">GRIMM'S CRYPT BAZAAR</h2>
                <span class="text-[10px] text-slate-400 font-mono">Your Purse: <strong class="text-amber-400">${player.stats.gold} Gold</strong></span>
              </div>
            </div>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-xs font-mono px-3 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6">
            <div>
              <h3 class="font-cinzel text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Wares for Sale</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${shopItems.map((entry) => `
                  <div class="bg-dungeon-panel p-3.5 rounded-lg border border-dungeon-border flex flex-col justify-between space-y-2">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-xs" style="color: ${entry.item.color}">${entry.item.name}</h4>
                        <span class="text-[10px] text-slate-400 uppercase font-mono">${entry.item.rarity}</span>
                      </div>
                      <span class="text-amber-400 font-bold font-mono text-xs">${entry.price} Gold</span>
                    </div>
                    <p class="text-[11px] text-slate-300 leading-snug">${entry.item.description}</p>
                    <button class="btn-buy-shop w-full py-1.5 rounded text-xs font-bold transition-all ${
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
              <h3 class="font-cinzel text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sell Possessions</h3>
              ${player.inventory.length === 0 ? `
                <p class="text-slate-500 text-xs italic">Knapsack is empty.</p>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  ${player.inventory.map((item) => `
                    <div class="bg-dungeon-darkest p-2 rounded border border-dungeon-border flex items-center justify-between">
                      <div class="truncate mr-2">
                        <span class="text-xs font-bold truncate block" style="color: ${item.color}">${item.name}</span>
                        <span class="text-[10px] text-amber-400 font-mono">+${Math.max(2, Math.floor(item.value * 0.45))} Gold</span>
                      </div>
                      <button class="btn-sell-shop px-2.5 py-1 bg-emerald-900/80 hover:bg-emerald-800 rounded text-[11px] text-emerald-200 border border-emerald-700 font-bold" data-item-id="${item.id}">
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
            <h2 class="font-cinzel text-xl font-bold text-purple-400 tracking-wider">ANCIENT ALTAR OF SACRIFICE</h2>
            <p class="text-xs text-slate-300 font-mono">Offer earthly riches or lifeblood in exchange for otherworldly power.</p>
          </div>

          <div class="grid grid-cols-1 gap-3 text-left">
            <button class="btn-altar-choice bg-dungeon-panel hover:bg-purple-950/80 p-4 rounded-xl border border-dungeon-border hover:border-purple-500 transition-all flex items-center justify-between" data-altar-choice="GOLD">
              <div>
                <h4 class="font-cinzel font-bold text-sm text-amber-400">Offer Gold (50 Gold)</h4>
                <p class="text-[11px] text-slate-300 mt-0.5">Empower spirit with +15 Max Mana and +10% Critical Strike Chance.</p>
              </div>
              <div class="w-6 h-6 text-amber-400 shrink-0 ml-3">${ICONS.GOLD_COIN}</div>
            </button>

            <button class="btn-altar-choice bg-dungeon-panel hover:bg-rose-950/80 p-4 rounded-xl border border-dungeon-border hover:border-rose-500 transition-all flex items-center justify-between" data-altar-choice="BLOOD">
              <div>
                <h4 class="font-cinzel font-bold text-sm text-rose-400">Blood Sacrifice (20 Health)</h4>
                <p class="text-[11px] text-slate-300 mt-0.5">Infuse soul with +4 Permanent Attack Power and +2 Armor.</p>
              </div>
              <div class="w-6 h-6 text-rose-500 shrink-0 ml-3">${ICONS.DROPLET}</div>
            </button>
          </div>

          <button id="modal-close" class="w-full py-2 bg-dungeon-darkest hover:bg-dungeon-panel text-slate-400 text-xs font-mono rounded border border-dungeon-border">
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
        <div class="bg-dungeon-darker border border-dungeon-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] gothic-panel">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <div class="flex items-center space-x-2.5">
              <div class="w-5 h-5 text-amber-400">${ICONS.BAG}</div>
              <h2 class="font-cinzel text-base font-bold text-dungeon-gold">HERO'S KNAPSACK</h2>
            </div>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-xs font-mono px-3 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>

          <div class="p-6 overflow-y-auto flex-1 space-y-4">
            ${player.inventory.length === 0 ? `
              <p class="text-center text-slate-500 py-12 italic font-mono text-xs">Your knapsack is empty. Slay monsters and unlock chests to claim equipment!</p>
            ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${player.inventory.map((item) => `
                  <div class="bg-dungeon-panel p-3.5 rounded-lg border border-dungeon-border hover:border-amber-500/60 transition-colors flex flex-col justify-between space-y-2">
                    <div class="flex items-start justify-between">
                      <div>
                        <h4 class="font-bold text-xs" style="color: ${item.color}">${item.name}</h4>
                        <span class="text-[10px] text-slate-400 uppercase font-mono">${item.type} • ${item.rarity}</span>
                      </div>
                    </div>
                    <p class="text-[11px] text-slate-300 leading-snug">${item.description}</p>
                    <div class="flex items-center space-x-2 pt-1 border-t border-dungeon-border/40">
                      ${item.equipSlot ? `
                        <button class="btn-use flex-1 py-1 px-2 bg-indigo-900/70 hover:bg-indigo-800 rounded text-xs text-indigo-200 border border-indigo-700 transition-colors font-bold" data-item-id="${item.id}">
                          Equip
                        </button>
                      ` : `
                        <button class="btn-use flex-1 py-1 px-2 bg-emerald-900/70 hover:bg-emerald-800 rounded text-xs text-emerald-200 border border-emerald-700 transition-colors font-bold" data-item-id="${item.id}">
                          Use
                        </button>
                      `}
                      <button class="btn-drop py-1 px-2.5 bg-rose-950/70 hover:bg-rose-900 rounded text-xs text-rose-300 border border-rose-800 transition-colors" data-item-id="${item.id}">
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

  private getHelpModalHTML(): string {
    return `
      <div class="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-dungeon-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] gothic-panel">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <div class="flex items-center space-x-2">
              <div class="w-5 h-5 text-amber-400">${ICONS.SCROLL}</div>
              <h2 class="font-cinzel text-base font-bold text-dungeon-gold">CRYPT EXPLORATION GUIDE</h2>
            </div>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-xs font-mono px-3 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>
          <div class="p-6 overflow-y-auto space-y-4 text-xs font-mono leading-relaxed text-slate-300">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h3 class="font-cinzel text-dungeon-gold font-bold text-sm mb-2">Controls</h3>
                <ul class="space-y-1.5">
                  <li><strong class="text-slate-100">WASD / Arrows</strong>: Move / Attack</li>
                  <li><strong class="text-slate-100">1, 2, 3</strong>: Active Class Skills</li>
                  <li><strong class="text-slate-100">Q / E</strong>: Quick Health / Mana Potion</li>
                  <li><strong class="text-slate-100">Tab / O</strong>: Auto-Explore Dungeon</li>
                  <li><strong class="text-slate-100">Left Click</strong>: Pathfind / Attack</li>
                  <li><strong class="text-slate-100">Space / .</strong>: Wait 1 Turn</li>
                  <li><strong class="text-slate-100">I</strong>: Inventory Knapsack</li>
                </ul>
              </div>
              <div>
                <h3 class="font-cinzel text-dungeon-gold font-bold text-sm mb-2">Dungeon Elements</h3>
                <ul class="space-y-1.5">
                  <li><span class="text-rose-400 font-bold">Barrels</span>: Explodes on impact</li>
                  <li><span class="text-amber-400 font-bold">Cracked Wall</span>: Secret Vaults</li>
                  <li><span class="text-purple-400 font-bold">Altar</span>: Stat Sacrifices</li>
                  <li><span class="text-sky-400 font-bold">Stairs</span>: Descend Deeper</li>
                </ul>
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
        <div class="bg-dungeon-darker border-2 border-rose-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-7 text-center space-y-6 glow-crimson gothic-panel">
          <div class="space-y-2">
            <div class="w-12 h-12 mx-auto text-rose-500">${ICONS.SKULL}</div>
            <h2 class="font-cinzel text-2xl font-bold text-rose-500 tracking-wider">YOU HAVE PERISHED</h2>
            <p class="text-xs text-slate-400 font-mono">Your bones join the endless legions of the crypt...</p>
          </div>

          <div class="bg-dungeon-panel/90 p-4 rounded-xl border border-dungeon-border text-xs font-mono space-y-2 text-left">
            <div class="flex justify-between"><span>Dungeon Depth:</span> <strong class="text-slate-100 font-bold">${player.stats.dungeonDepth} / 5</strong></div>
            <div class="flex justify-between"><span>Level Reached:</span> <strong class="text-dungeon-gold font-bold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400 font-bold">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Damage Dealt:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Elapsed:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Gold Gathered:</span> <strong class="text-amber-400 font-bold">${player.stats.gold} Gold</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-3 bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-white font-cinzel font-bold text-xs tracking-wider uppercase rounded-lg shadow-lg transition-all duration-200">
            Descend Once More
          </button>
        </div>
      </div>
    `;
  }

  private getVictoryModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border-2 border-amber-600 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-7 text-center space-y-6 glow-gold gothic-panel">
          <div class="space-y-2">
            <div class="w-12 h-12 mx-auto text-amber-400">${ICONS.WARRIOR_CREST}</div>
            <h2 class="font-cinzel text-2xl font-bold text-dungeon-gold tracking-wider">VICTORY ACHIEVED!</h2>
            <p class="text-xs text-slate-300 font-mono">Malakor the Necromancer Lord is vanquished and the Crypt is purified!</p>
          </div>

          <div class="bg-dungeon-panel/90 p-4 rounded-xl border border-dungeon-border text-xs font-mono space-y-2 text-left">
            <div class="flex justify-between"><span>Final Level:</span> <strong class="text-dungeon-gold font-bold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400 font-bold">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Total Damage:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Taken:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Treasure Gold:</span> <strong class="text-amber-400 font-bold">${player.stats.gold} Gold</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-3 gothic-button-primary rounded-lg text-xs font-bold tracking-wider uppercase shadow-lg transition-all duration-200">
            Begin New Run
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

    ctx.fillStyle = '#06080e';
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
