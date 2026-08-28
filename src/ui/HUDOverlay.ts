import { Entity } from '../entities/Entity';
import { EquipSlot, LogMessage, GameState, Tile, Skill, PlayerClassType } from '../types';
import { sound } from '../audio/SoundSynth';
import { CLASS_CATALOG } from '../classes/ClassCatalog';
import { ShopItemEntry } from '../shop/ShopManager';

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
        <div class="flex items-center space-x-2">
          <span class="text-xl">💀</span>
          <h1 class="font-cinzel text-base font-bold tracking-wider text-dungeon-amber">CRYPT DESCENT</h1>
        </div>
        <div class="flex items-center space-x-3 text-xs font-mono text-slate-300">
          <span class="bg-dungeon-panel px-2.5 py-1 rounded border border-dungeon-border">
            Floor <strong id="val-floor" class="text-dungeon-gold font-bold">1 / 5</strong>
          </span>
          <span class="bg-dungeon-panel px-2.5 py-1 rounded border border-dungeon-border">
            Turn <strong id="val-turn" class="text-slate-200">0</strong>
          </span>
          <span class="bg-dungeon-panel px-2.5 py-1 rounded border border-dungeon-border">
            Gold <strong id="val-gold" class="text-yellow-400 font-bold">0 🪙</strong>
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
        <button id="btn-auto-explore" class="p-2 bg-indigo-950/70 hover:bg-indigo-900 rounded text-xs border border-indigo-700 transition-colors text-indigo-200 font-bold">
          ⚡ Auto-Explore (Tab)
        </button>
        <button id="btn-sound" class="p-2 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors">
          🔊 Audio ON
        </button>
        <button id="btn-help" class="p-2 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors">
          ❓ Controls (?)
        </button>
        <button id="btn-inventory" class="p-2 bg-dungeon-panel hover:bg-dungeon-border rounded text-xs border border-dungeon-border transition-colors font-bold text-dungeon-amber">
          🎒 Inventory (I)
        </button>
      </div>
    `;

    // 2. Sidebar
    this.sidebarEl.innerHTML = `
      <!-- PLAYER STATS -->
      <div class="p-4 space-y-3.5 border-b border-dungeon-border bg-dungeon-panel/40">
        <div>
          <div class="flex justify-between items-center mb-1">
            <span id="player-name-display" class="font-cinzel font-bold text-sm text-slate-100">Crypt Walker</span>
            <span id="player-level-display" class="text-xs text-dungeon-amber font-bold">Level 1</span>
          </div>
          <div class="w-full h-1.5 bg-dungeon-darkest rounded-full overflow-hidden">
            <div id="player-xp-bar" class="h-full bg-dungeon-gold transition-all duration-300" style="width: 0%"></div>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-0.5">
            <span>XP</span>
            <span id="player-xp-text">0 / 100</span>
          </div>
        </div>

        <!-- HP GAUGE -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-rose-400 font-bold">❤️ Health</span>
            <span id="player-hp-text" class="text-slate-200 font-mono">100 / 100</span>
          </div>
          <div class="w-full h-3.5 bg-dungeon-darkest rounded border border-rose-950 overflow-hidden">
            <div id="player-hp-bar" class="h-full bg-gradient-to-r from-red-700 to-rose-500 transition-all duration-200" style="width: 100%"></div>
          </div>
        </div>

        <!-- MANA GAUGE -->
        <div>
          <div class="flex justify-between text-xs mb-1">
            <span class="text-blue-400 font-bold">💧 Mana</span>
            <span id="player-mana-text" class="text-slate-200 font-mono">50 / 50</span>
          </div>
          <div class="w-full h-3 bg-dungeon-darkest rounded border border-blue-950 overflow-hidden">
            <div id="player-mana-bar" class="h-full bg-gradient-to-r from-blue-700 to-cyan-500 transition-all duration-200" style="width: 100%"></div>
          </div>
        </div>

        <!-- ATTRIBUTES GRID -->
        <div class="grid grid-cols-2 gap-2 text-xs font-mono">
          <div class="bg-dungeon-darkest/70 p-2 rounded border border-dungeon-border/50">
            <span class="text-slate-400">⚔️ ATK:</span>
            <strong id="stat-atk" class="text-slate-100 ml-1">12</strong>
          </div>
          <div class="bg-dungeon-darkest/70 p-2 rounded border border-dungeon-border/50">
            <span class="text-slate-400">🛡️ DEF:</span>
            <strong id="stat-def" class="text-slate-100 ml-1">3</strong>
          </div>
          <div class="bg-dungeon-darkest/70 p-2 rounded border border-dungeon-border/50">
            <span class="text-slate-400">⚡ AGI:</span>
            <strong id="stat-agi" class="text-slate-100 ml-1">12</strong>
          </div>
          <div class="bg-dungeon-darkest/70 p-2 rounded border border-dungeon-border/50">
            <span class="text-slate-400">✨ ARC:</span>
            <strong id="stat-arc" class="text-slate-100 ml-1">10</strong>
          </div>
        </div>

        <!-- ACTIVE SKILLS HOTBAR -->
        <div class="pt-1">
          <h3 class="font-cinzel text-[11px] font-bold text-slate-300 mb-1.5 uppercase tracking-wider">Active Skills</h3>
          <div id="skills-hotbar" class="grid grid-cols-3 gap-1.5"></div>
        </div>

        <!-- STATUS EFFECTS -->
        <div id="status-effects-wrap" class="flex flex-wrap gap-1.5 pt-0.5"></div>
      </div>

      <!-- EQUIPMENT SLOTS -->
      <div class="p-4 border-b border-dungeon-border">
        <h2 class="font-cinzel text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Equipped Gear</h2>
        <div id="equip-slots-wrap" class="grid grid-cols-2 gap-2 text-xs"></div>
      </div>

      <!-- COMBAT LOG -->
      <div class="flex-1 p-3 flex flex-col min-h-[160px] max-h-[220px]">
        <h2 class="font-cinzel text-xs font-bold text-slate-400 mb-1.5 uppercase tracking-wider">Dungeon Log</h2>
        <div id="log-container" class="flex-1 overflow-y-auto space-y-1 text-xs font-mono pr-1 bg-dungeon-darkest/50 p-2 rounded border border-dungeon-border/40"></div>
      </div>

      <!-- MINIMAP -->
      <div class="p-3 border-t border-dungeon-border bg-dungeon-panel/30 flex items-center justify-center">
        <canvas id="minimap-canvas" width="160" height="110" class="rounded border border-dungeon-border bg-dungeon-darkest"></canvas>
      </div>
    `;

    // 3. Targeting Overlay
    this.targetingEl.innerHTML = `
      <div class="bg-indigo-950/90 border border-indigo-500 px-4 py-2 rounded-lg shadow-xl text-xs text-indigo-200 flex items-center space-x-3">
        <span class="animate-pulse">🎯</span>
        <span>Click a target tile or press <strong>ESC</strong> to cancel</span>
      </div>
    `;

    // Static event listeners
    document.getElementById('btn-sound')?.addEventListener('click', () => {
      this.onAction('TOGGLE_SOUND');
      const btn = document.getElementById('btn-sound');
      if (btn) btn.textContent = sound.getIsMuted() ? '🔇 Unmute' : '🔊 Audio ON';
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
    if (goldEl) goldEl.textContent = `${player.stats.gold} 🪙`;

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
              ? 'bg-slate-900/80 border-slate-700 opacity-60'
              : 'bg-dungeon-panel border-dungeon-border hover:border-dungeon-amber hover:shadow-lg'
          }" data-skill-idx="${idx}">
            <div class="flex justify-between items-center text-[10px]">
              <span class="font-bold text-slate-100 truncate">${s.icon} ${s.name}</span>
              <span class="text-dungeon-gold font-bold font-mono">[${idx + 1}]</span>
            </div>
            <div class="flex justify-between text-[9px] text-slate-400 mt-1">
              <span class="text-blue-300 font-mono">${s.manaCost} MP</span>
              ${onCd ? `<span class="text-rose-400 font-bold font-mono">${s.cooldownCurrent}t CD</span>` : '<span class="text-emerald-400 font-bold">READY</span>'}
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
          <span class="text-[11px] px-2 py-0.5 rounded border border-slate-700 bg-slate-900/80 flex items-center space-x-1" style="color: ${e.color}">
            <span>${e.icon}</span>
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
        <div class="bg-dungeon-panel p-2 rounded border border-dungeon-border flex items-center justify-between group relative cursor-pointer" data-unequip-slot="${slot}">
          <div class="truncate">
            <span class="text-[10px] text-slate-400 block">${label}</span>
            <span class="font-bold truncate text-xs" style="color: ${item.color}">${item.name}</span>
          </div>
          <button class="text-slate-500 hover:text-rose-400 text-xs px-1" title="Unequip">✕</button>
        </div>
      `;
    }
    return `
      <div class="bg-dungeon-darkest/40 p-2 rounded border border-dungeon-border/30 text-slate-500">
        <span class="text-[10px] text-slate-500 block">${label}</span>
        <span class="text-xs italic">Empty</span>
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
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-dungeon-border rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl p-8 flex flex-col space-y-6">
          <div class="text-center space-y-2">
            <span class="text-4xl">💀</span>
            <h2 class="font-cinzel text-3xl font-bold text-dungeon-gold tracking-widest uppercase">Choose Your Class</h2>
            <p class="text-xs text-slate-400 font-mono">Select your hero archetype to brave the depths of Malakor's Crypt</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            ${classes.map((cls) => `
              <div class="bg-dungeon-panel p-5 rounded-xl border border-dungeon-border hover:border-dungeon-gold hover:shadow-2xl transition-all duration-200 flex flex-col justify-between space-y-4 group">
                <div class="space-y-2">
                  <div class="flex items-center space-x-3">
                    <span class="text-3xl">${cls.icon}</span>
                    <div>
                      <h3 class="font-cinzel font-bold text-sm" style="color: ${cls.color}">${cls.name}</h3>
                      <span class="text-[10px] text-slate-400 block">${cls.tagline}</span>
                    </div>
                  </div>
                  <p class="text-[11px] text-slate-300 leading-relaxed">${cls.description}</p>
                </div>

                <div class="bg-dungeon-darkest/70 p-3 rounded border border-dungeon-border/50 text-[11px] font-mono space-y-1">
                  <div class="flex justify-between"><span class="text-rose-400">HP:</span> <strong>${cls.baseHp}</strong></div>
                  <div class="flex justify-between"><span class="text-blue-400">Mana:</span> <strong>${cls.baseMana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">STR:</span> <strong>${cls.strength}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">AGI:</span> <strong>${cls.agility}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">ARC:</span> <strong>${cls.arcana}</strong></div>
                  <div class="flex justify-between"><span class="text-slate-400">DEF:</span> <strong>${cls.defense}</strong></div>
                </div>

                <button class="btn-select-class w-full py-2.5 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-dungeon-darkest font-cinzel font-bold text-xs rounded-lg shadow-lg transition-all" data-class-type="${cls.type}">
                  Select ${cls.name}
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
      <div class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-amber-600/70 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <div class="flex items-center space-x-3">
              <span class="text-2xl">🪙</span>
              <div>
                <h2 class="font-cinzel text-lg font-bold text-dungeon-gold">Grimm's Crypt Bazaar</h2>
                <span class="text-[10px] text-slate-400">Your Purse: <strong class="text-yellow-400">${player.stats.gold} Gold</strong></span>
              </div>
            </div>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-sm font-mono px-2 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Leave Shop (ESC)</button>
          </div>

          <div class="p-6 overflow-y-auto space-y-6">
            <div>
              <h3 class="font-cinzel text-xs font-bold text-amber-400 uppercase tracking-wider mb-3">Grimm's Wares for Sale</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                ${shopItems.map((entry) => `
                  <div class="bg-dungeon-panel p-3 rounded-lg border border-dungeon-border flex flex-col justify-between space-y-2">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center space-x-2">
                        <span class="text-base font-bold font-mono px-2 py-0.5 rounded bg-dungeon-darkest" style="color: ${entry.item.color}">${entry.item.char}</span>
                        <div>
                          <h4 class="font-bold text-xs" style="color: ${entry.item.color}">${entry.item.name}</h4>
                          <span class="text-[10px] text-slate-400 uppercase">${entry.item.rarity}</span>
                        </div>
                      </div>
                      <span class="text-yellow-400 font-bold font-mono text-xs">${entry.price} 🪙</span>
                    </div>
                    <p class="text-[11px] text-slate-300 leading-snug">${entry.item.description}</p>
                    <button class="btn-buy-shop w-full py-1.5 rounded text-xs font-bold transition-colors ${
                      entry.purchased
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : player.stats.gold >= entry.price
                        ? 'bg-amber-600 hover:bg-amber-500 text-dungeon-darkest'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }" data-shop-id="${entry.id}" ${entry.purchased || player.stats.gold < entry.price ? 'disabled' : ''}>
                      ${entry.purchased ? 'Sold Out' : 'Purchase'}
                    </button>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- SELL INVENTORY SECTION -->
            <div>
              <h3 class="font-cinzel text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Sell Inventory for Gold</h3>
              ${player.inventory.length === 0 ? `
                <p class="text-slate-500 text-xs italic">Nothing in knapsack to sell.</p>
              ` : `
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  ${player.inventory.map((item) => `
                    <div class="bg-dungeon-darkest p-2 rounded border border-dungeon-border flex items-center justify-between">
                      <div class="truncate mr-2">
                        <span class="text-xs font-bold truncate block" style="color: ${item.color}">${item.name}</span>
                        <span class="text-[10px] text-yellow-400">+${Math.max(2, Math.floor(item.value * 0.45))} Gold</span>
                      </div>
                      <button class="btn-sell-shop px-2 py-1 bg-emerald-900/60 hover:bg-emerald-800 rounded text-[11px] text-emerald-200 border border-emerald-700 font-bold" data-item-id="${item.id}">
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
      <div class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-purple-600 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 text-center space-y-6 glow-shadow">
          <div class="space-y-2">
            <span class="text-4xl">§</span>
            <h2 class="font-cinzel text-xl font-bold text-purple-400 tracking-wider">Ancient Altar of Sacrifice</h2>
            <p class="text-xs text-slate-300 font-mono">Sacrifice your earthly treasures or lifeblood for mystical blessings.</p>
          </div>

          <div class="grid grid-cols-1 gap-3 text-left">
            <button class="btn-altar-choice bg-dungeon-panel hover:bg-purple-950/80 p-4 rounded-xl border border-dungeon-border hover:border-purple-500 transition-all flex items-center justify-between" data-altar-choice="GOLD">
              <div>
                <h4 class="font-cinzel font-bold text-sm text-yellow-400">Offer Gold (50 🪙)</h4>
                <p class="text-[11px] text-slate-300">Grant +15 Max Mana and +10% Critical Strike Chance.</p>
              </div>
              <span class="text-xl">🪙</span>
            </button>

            <button class="btn-altar-choice bg-dungeon-panel hover:bg-rose-950/80 p-4 rounded-xl border border-dungeon-border hover:border-rose-500 transition-all flex items-center justify-between" data-altar-choice="BLOOD">
              <div>
                <h4 class="font-cinzel font-bold text-sm text-rose-400">Blood Sacrifice (20 HP)</h4>
                <p class="text-[11px] text-slate-300">Infuse your soul with +4 Permanent Attack Power and +2 Armor.</p>
              </div>
              <span class="text-xl">🩸</span>
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
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-dungeon-border rounded-xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <h2 class="font-cinzel text-lg font-bold text-dungeon-gold">🎒 Adventurer's Knapsack</h2>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-sm font-mono px-2 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>

          <div class="p-6 overflow-y-auto flex-1 space-y-4">
            ${player.inventory.length === 0 ? `
              <p class="text-center text-slate-500 py-12 italic">Your knapsack is empty. Defeat monsters and loot chests to acquire equipment and potions!</p>
            ` : `
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                ${player.inventory.map((item) => `
                  <div class="bg-dungeon-panel p-3 rounded-lg border border-dungeon-border hover:border-dungeon-amber transition-colors flex flex-col justify-between space-y-2">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center space-x-2">
                        <span class="text-base font-bold font-mono px-2 py-0.5 rounded bg-dungeon-darkest border border-slate-700" style="color: ${item.color}">${item.char}</span>
                        <div>
                          <h4 class="font-bold text-xs" style="color: ${item.color}">${item.name}</h4>
                          <span class="text-[10px] text-slate-400 uppercase tracking-wide">${item.type} • ${item.rarity}</span>
                        </div>
                      </div>
                    </div>
                    <p class="text-[11px] text-slate-300 leading-snug">${item.description}</p>
                    <div class="flex items-center space-x-2 pt-1 border-t border-dungeon-border/40">
                      ${item.equipSlot ? `
                        <button class="btn-use flex-1 py-1 px-2 bg-indigo-900/60 hover:bg-indigo-800 rounded text-xs text-indigo-200 border border-indigo-700 transition-colors font-bold" data-item-id="${item.id}">
                          Equip
                        </button>
                      ` : `
                        <button class="btn-use flex-1 py-1 px-2 bg-emerald-900/60 hover:bg-emerald-800 rounded text-xs text-emerald-200 border border-emerald-700 transition-colors font-bold" data-item-id="${item.id}">
                          Use
                        </button>
                      `}
                      <button class="btn-drop py-1 px-2.5 bg-rose-950/60 hover:bg-rose-900 rounded text-xs text-rose-300 border border-rose-800 transition-colors" data-item-id="${item.id}">
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
      <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-dungeon-border rounded-xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
          <div class="px-6 py-4 border-b border-dungeon-border flex justify-between items-center bg-dungeon-panel">
            <h2 class="font-cinzel text-lg font-bold text-dungeon-gold">📜 Dungeon Guide & Controls</h2>
            <button id="modal-close" class="text-slate-400 hover:text-slate-100 text-sm font-mono px-2 py-1 rounded bg-dungeon-darkest border border-dungeon-border">✕ Close (ESC)</button>
          </div>
          <div class="p-6 overflow-y-auto space-y-4 text-xs font-mono leading-relaxed text-slate-300">
            <div class="grid grid-cols-2 gap-4">
              <div>
                <h3 class="font-cinzel text-dungeon-amber font-bold text-sm mb-2">Controls</h3>
                <ul class="space-y-1.5">
                  <li><strong class="text-slate-100">WASD / Arrows</strong>: Move / Attack</li>
                  <li><strong class="text-slate-100">Numpad (1-9)</strong>: 8-way Diagonal Move</li>
                  <li><strong class="text-slate-100">1, 2, 3</strong>: Trigger Active Skills</li>
                  <li><strong class="text-slate-100">Q / E</strong>: Quick Health / Mana Potion</li>
                  <li><strong class="text-slate-100">Tab / O</strong>: Auto-Explore Dungeon</li>
                  <li><strong class="text-slate-100">Left Click</strong>: A* Pathfind / Attack</li>
                  <li><strong class="text-slate-100">Space / .</strong>: Wait 1 Turn</li>
                  <li><strong class="text-slate-100">I</strong>: Inventory</li>
                </ul>
              </div>
              <div>
                <h3 class="font-cinzel text-dungeon-amber font-bold text-sm mb-2">Dungeon Hazards & Glyphs</h3>
                <ul class="space-y-1.5">
                  <li><span class="text-red-500 font-bold">Ø</span> : Explosive Barrel (AoE blast)</li>
                  <li><span class="text-yellow-500 font-bold">▓</span> : Cracked Wall (Secret Vault)</li>
                  <li><span class="text-purple-500 font-bold">~</span> : Flammable Oil Puddle</li>
                  <li><span class="text-amber-400 font-bold">@</span> : You (Player Hero)</li>
                  <li><span class="text-sky-400 font-bold">&gt;</span> : Descend Stairs</li>
                  <li><span class="text-purple-400 font-bold">§</span> : Sacrifice Altar</li>
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
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-rose-900 rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-6 glow-crimson animate-fade-in">
          <div class="space-y-2">
            <span class="text-5xl">💀</span>
            <h2 class="font-cinzel text-2xl font-bold text-rose-500 tracking-wider">YOU HAVE PERISHED</h2>
            <p class="text-xs text-slate-400 font-mono">Your bones join the nameless legions of the crypt...</p>
          </div>

          <div class="bg-dungeon-panel/80 p-4 rounded-lg border border-dungeon-border text-xs font-mono space-y-2 text-left">
            <div class="flex justify-between"><span>Dungeon Depth:</span> <strong class="text-slate-100">${player.stats.dungeonDepth} / 5</strong></div>
            <div class="flex justify-between"><span>Level Reached:</span> <strong class="text-dungeon-gold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Damage Dealt:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Elapsed:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Gold Gathered:</span> <strong class="text-yellow-400">${player.stats.gold} 🪙</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-3 bg-gradient-to-r from-rose-800 to-rose-600 hover:from-rose-700 hover:to-rose-500 text-white font-cinzel font-bold text-sm rounded-lg shadow-lg transition-all duration-200">
            Descend Again
          </button>
        </div>
      </div>
    `;
  }

  private getVictoryModalHTML(player: Entity): string {
    return `
      <div class="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-dungeon-darker border border-amber-600 rounded-xl w-full max-w-md overflow-hidden shadow-2xl p-6 text-center space-y-6 glow-gold animate-fade-in">
          <div class="space-y-2">
            <span class="text-5xl">👑</span>
            <h2 class="font-cinzel text-2xl font-bold text-dungeon-gold tracking-wider">VICTORY ACHIEVED!</h2>
            <p class="text-xs text-slate-300 font-mono">Malakor the Necromancer Lord is vanquished and the Crypt is purified!</p>
          </div>

          <div class="bg-dungeon-panel/80 p-4 rounded-lg border border-dungeon-border text-xs font-mono space-y-2 text-left">
            <div class="flex justify-between"><span>Final Level:</span> <strong class="text-dungeon-gold">${player.stats.level}</strong></div>
            <div class="flex justify-between"><span>Monsters Slain:</span> <strong class="text-rose-400">${player.stats.monstersSlain}</strong></div>
            <div class="flex justify-between"><span>Total Damage Dealt:</span> <strong class="text-slate-100">${player.stats.damageDealt}</strong></div>
            <div class="flex justify-between"><span>Turns Taken:</span> <strong class="text-slate-100">${player.stats.turnsElapsed}</strong></div>
            <div class="flex justify-between"><span>Treasure Gold:</span> <strong class="text-yellow-400">${player.stats.gold} 🪙</strong></div>
          </div>

          <button id="btn-restart" class="w-full py-3 bg-gradient-to-r from-amber-600 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-dungeon-darkest font-cinzel font-bold text-sm rounded-lg shadow-lg transition-all duration-200">
            Start New Run
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

    ctx.fillStyle = '#090a0f';
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
