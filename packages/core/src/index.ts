/** 配置指针与键盘如何控制溢出内容。 */
export interface OverflowFollowOptions {
  /** 指针离开可视区域时是否回到内容开头。默认 true。 */
  resetOnLeave?: boolean;
  /** 是否监听 Home、End 和左右方向键。默认 true。 */
  keyboard?: boolean;
  /** 方向键每次移动的比例，取值 0～1。默认 0.05。 */
  keyboardStep?: number;
  /** 临时关闭所有交互并复位。默认 false。 */
  disabled?: boolean;
  /** 每次位置变化后的回调。 */
  onProgress?: (progress: number) => void;
}

export interface OverflowFollowController {
  /** 当前展示进度，范围为 0～1。 */
  readonly progress: number;
  /** 根据最新元素尺寸重新计算位置。 */
  refresh: () => void;
  /** 立即回到内容开头。 */
  reset: () => void;
  /** 运行时更新配置。 */
  updateOptions: (options: OverflowFollowOptions) => void;
  /** 移除事件监听、观察器并还原组件写入的行内样式。 */
  destroy: () => void;
}

type InteractionMode = 'idle' | 'pointer' | 'keyboard';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const normalizeOptions = (options: OverflowFollowOptions = {}) => ({
  resetOnLeave: options.resetOnLeave ?? true,
  keyboard: options.keyboard ?? true,
  keyboardStep: clamp(options.keyboardStep ?? 0.05, 0, 1),
  disabled: options.disabled ?? false,
  onProgress: options.onProgress,
});

/**
 * 创建一个与框架无关的溢出内容控制器。
 *
 * viewport 是负责裁切的区域；content 必须是按内容真实宽度撑开的单行元素。
 * 位移与指针横坐标一一对应，不使用 transition、缓动或惯性。
 */
export function createOverflowFollow(
  viewport: HTMLElement,
  content: HTMLElement,
  options: OverflowFollowOptions = {},
): OverflowFollowController {
  let config = normalizeOptions(options);
  let progress = 0;
  let mode: InteractionMode = 'idle';
  let lastClientX = 0;
  let lastClientY = 0;
  let destroyed = false;

  // 销毁时还原调用方原有的行内样式，避免控制器留下副作用。
  const originalTransform = content.style.transform;
  const originalProgress = viewport.style.getPropertyValue('--overflow-follow-progress');

  const getMaxOffset = () => Math.max(0, content.scrollWidth - viewport.clientWidth);

  const render = (nextProgress = progress) => {
    if (destroyed) return;

    progress = config.disabled ? 0 : clamp(nextProgress, 0, 1);
    const offset = -getMaxOffset() * progress;

    content.style.transform = `translate3d(${offset}px, 0, 0)`;
    viewport.style.setProperty('--overflow-follow-progress', `${progress * 100}%`);
    config.onProgress?.(progress);
  };

  const renderFromPointer = () => {
    const rect = viewport.getBoundingClientRect();

    if (rect.width <= 0 || rect.height <= 0) {
      render(0);
      return;
    }

    const isInside =
      lastClientX >= rect.left &&
      lastClientX <= rect.right &&
      lastClientY >= rect.top &&
      lastClientY <= rect.bottom;

    if (!isInside) {
      mode = 'idle';
      render(0);
      return;
    }

    render((lastClientX - rect.left) / rect.width);
  };

  const refresh = () => {
    if (config.disabled) {
      mode = 'idle';
      render(0);
      return;
    }

    if (mode === 'pointer') {
      renderFromPointer();
      return;
    }

    render(mode === 'keyboard' ? progress : 0);
  };

  const handlePointer = (event: PointerEvent) => {
    if (config.disabled) return;
    mode = 'pointer';
    lastClientX = event.clientX;
    lastClientY = event.clientY;
    renderFromPointer();
  };

  const reset = () => {
    mode = 'idle';
    render(0);
  };

  const handlePointerLeave = () => {
    if (config.resetOnLeave) {
      reset();
    } else {
      // 固定当前位置，后续尺寸变化只更新溢出距离，不再使用已经离开的指针坐标。
      mode = 'keyboard';
    }
  };

  const handleKeydown = (event: KeyboardEvent) => {
    if (!config.keyboard || config.disabled || getMaxOffset() <= 0) return;

    let nextProgress: number | undefined;
    switch (event.key) {
      case 'Home':
        nextProgress = 0;
        break;
      case 'End':
        nextProgress = 1;
        break;
      case 'ArrowLeft':
        nextProgress = progress - config.keyboardStep;
        break;
      case 'ArrowRight':
        nextProgress = progress + config.keyboardStep;
        break;
      default:
        return;
    }

    event.preventDefault();
    mode = 'keyboard';
    render(nextProgress);
  };

  viewport.addEventListener('pointerenter', handlePointer);
  viewport.addEventListener('pointermove', handlePointer);
  viewport.addEventListener('pointerleave', handlePointerLeave);
  viewport.addEventListener('keydown', handleKeydown);

  const ResizeObserverConstructor = viewport.ownerDocument.defaultView?.ResizeObserver;
  const resizeObserver = ResizeObserverConstructor
    ? new ResizeObserverConstructor(refresh)
    : undefined;

  resizeObserver?.observe(viewport);
  resizeObserver?.observe(content);
  render(0);

  return {
    get progress() {
      return progress;
    },
    refresh,
    reset,
    updateOptions(nextOptions) {
      config = normalizeOptions({ ...config, ...nextOptions });
      refresh();
    },
    destroy() {
      if (destroyed) return;

      resizeObserver?.disconnect();
      viewport.removeEventListener('pointerenter', handlePointer);
      viewport.removeEventListener('pointermove', handlePointer);
      viewport.removeEventListener('pointerleave', handlePointerLeave);
      viewport.removeEventListener('keydown', handleKeydown);
      content.style.transform = originalTransform;

      if (originalProgress) {
        viewport.style.setProperty('--overflow-follow-progress', originalProgress);
      } else {
        viewport.style.removeProperty('--overflow-follow-progress');
      }

      destroyed = true;
    },
  };
}
