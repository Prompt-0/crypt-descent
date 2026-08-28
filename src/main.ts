import './styles.css';
import { Engine } from './core/Engine';

function initApp(): void {
  const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
  const canvasContainer = document.getElementById('canvas-container');

  if (!canvas || !canvasContainer) {
    throw new Error('Canvas or container element not found');
  }

  // Initialize Core Engine
  const engine = new Engine(canvas);

  const updateSize = () => {
    const rect = canvasContainer.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      engine.resize(rect.width, rect.height);
    }
  };

  // Initial resize
  updateSize();

  // ResizeObserver for reliable container sizing
  const resizeObserver = new ResizeObserver(() => {
    updateSize();
  });
  resizeObserver.observe(canvasContainer);
  window.addEventListener('resize', updateSize);

  // Expose on window for debugging/testing
  (window as any).__ENGINE__ = engine;
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
