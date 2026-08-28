import { Position } from '../types';

export class InputManager {
  private canvas: HTMLCanvasElement;
  private onDirectionInput: (dx: number, dy: number) => void;
  private onWaitTurn: () => void;
  private onTileClick: (pos: Position) => void;
  private onTileHover: (pos: Position | null) => void;
  private onKeyAction: (action: string, data?: any) => void;
  private getTileSize: () => number;
  private getCameraOffset: () => { x: number; y: number };

  constructor(
    canvas: HTMLCanvasElement,
    handlers: {
      onDirectionInput: (dx: number, dy: number) => void;
      onWaitTurn: () => void;
      onTileClick: (pos: Position) => void;
      onTileHover: (pos: Position | null) => void;
      onKeyAction: (action: string, data?: any) => void;
      getTileSize: () => number;
      getCameraOffset: () => { x: number; y: number };
    }
  ) {
    this.canvas = canvas;
    this.onDirectionInput = handlers.onDirectionInput;
    this.onWaitTurn = handlers.onWaitTurn;
    this.onTileClick = handlers.onTileClick;
    this.onTileHover = handlers.onTileHover;
    this.onKeyAction = handlers.onKeyAction;
    this.getTileSize = handlers.getTileSize;
    this.getCameraOffset = handlers.getCameraOffset;

    this.bindEvents();
  }

  private bindEvents(): void {
    window.addEventListener('keydown', (e) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        // Space / Enter (Handles Continue Descent on Transition, or Wait Turn during gameplay)
        case ' ':
        case 'Enter':
          e.preventDefault();
          this.onKeyAction('SPACE_OR_ENTER');
          break;

        case '.':
        case '5':
          e.preventDefault();
          this.onWaitTurn();
          break;

        // Cardinals
        case 'ArrowUp':
        case 'w':
        case 'W':
        case 'k':
        case 'K':
          e.preventDefault();
          this.onDirectionInput(0, -1);
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
        case 'j':
        case 'J':
          e.preventDefault();
          this.onDirectionInput(0, 1);
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
        case 'h':
        case 'H':
          e.preventDefault();
          this.onDirectionInput(-1, 0);
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
        case 'l':
        case 'L':
          e.preventDefault();
          this.onDirectionInput(1, 0);
          break;

        // Diagonals (Vi keys)
        case 'y':
        case 'Y':
          e.preventDefault();
          this.onDirectionInput(-1, -1);
          break;
        case 'u':
        case 'U':
          e.preventDefault();
          this.onDirectionInput(1, -1);
          break;
        case 'b':
        case 'B':
          e.preventDefault();
          this.onDirectionInput(-1, 1);
          break;
        case 'n':
        case 'N':
          e.preventDefault();
          this.onDirectionInput(1, 1);
          break;

        // Skills Hotkeys 1, 2, 3
        case '1':
          e.preventDefault();
          this.onKeyAction('USE_SKILL', { skillIndex: 0 });
          break;
        case '2':
          e.preventDefault();
          this.onKeyAction('USE_SKILL', { skillIndex: 1 });
          break;
        case '3':
          e.preventDefault();
          this.onKeyAction('USE_SKILL', { skillIndex: 2 });
          break;

        // Quick Potions Q (Health) & E (Mana)
        case 'q':
        case 'Q':
          e.preventDefault();
          this.onKeyAction('QUICK_HEAL');
          break;
        case 'e':
        case 'E':
          e.preventDefault();
          this.onKeyAction('QUICK_MANA');
          break;

        // Auto-Explore Tab & O
        case 'Tab':
        case 'o':
        case 'O':
          e.preventDefault();
          this.onKeyAction('AUTO_EXPLORE');
          break;

        // Modals & Hotkeys
        case 'i':
        case 'I':
          e.preventDefault();
          this.onKeyAction('TOGGLE_INVENTORY');
          break;
        case 'c':
        case 'C':
        case '?':
        case '/':
          e.preventDefault();
          this.onKeyAction('TOGGLE_CODEX');
          break;
        case 'Escape':
          e.preventDefault();
          this.onKeyAction('ESCAPE');
          break;
        case '>':
          e.preventDefault();
          this.onKeyAction('DESCEND_STAIRS');
          break;
      }
    });

    // Mouse Clicks
    this.canvas.addEventListener('click', (e) => {
      const tilePos = this.screenToTileCoords(e.clientX, e.clientY);
      if (tilePos) {
        this.onTileClick(tilePos);
      }
    });

    // Mouse Move Hover
    this.canvas.addEventListener('mousemove', (e) => {
      const tilePos = this.screenToTileCoords(e.clientX, e.clientY);
      this.onTileHover(tilePos);
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.onTileHover(null);
    });
  }

  private screenToTileCoords(clientX: number, clientY: number): Position | null {
    const rect = this.canvas.getBoundingClientRect();
    const xInCanvas = clientX - rect.left;
    const yInCanvas = clientY - rect.top;

    const tileSize = this.getTileSize();
    const camera = this.getCameraOffset();

    const worldX = xInCanvas + camera.x;
    const worldY = yInCanvas + camera.y;

    const tileX = Math.floor(worldX / tileSize);
    const tileY = Math.floor(worldY / tileSize);

    return { x: tileX, y: tileY };
  }
}
