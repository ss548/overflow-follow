// @vitest-environment happy-dom

import { describe, expect, it, vi } from 'vitest';
import { createOverflowFollow } from '../src';

function createFixture() {
  const viewport = document.createElement('div');
  const content = document.createElement('span');
  viewport.append(content);

  Object.defineProperty(viewport, 'clientWidth', { value: 200, configurable: true });
  Object.defineProperty(content, 'scrollWidth', { value: 600 });
  viewport.getBoundingClientRect = () => new DOMRect(100, 20, 200, 40);

  return { viewport, content };
}

describe('createOverflowFollow', () => {
  it('maps a pointer entering from any edge to the corresponding content position', () => {
    const { viewport, content } = createFixture();
    createOverflowFollow(viewport, content);

    viewport.dispatchEvent(new PointerEvent('pointerenter', { clientX: 200, clientY: 20 }));

    expect(content.style.transform).toBe('translate3d(-200px, 0, 0)');
  });

  it('shows the content end at the right edge and resets after leaving', () => {
    const { viewport, content } = createFixture();
    createOverflowFollow(viewport, content);

    viewport.dispatchEvent(new PointerEvent('pointermove', { clientX: 300, clientY: 40 }));
    expect(content.style.transform).toBe('translate3d(-400px, 0, 0)');

    viewport.dispatchEvent(new PointerEvent('pointerleave'));
    expect(content.style.transform).toBe('translate3d(0px, 0, 0)');
  });

  it('supports keyboard navigation without blocking keys when content fits', () => {
    const { viewport, content } = createFixture();
    const onProgress = vi.fn();
    createOverflowFollow(viewport, content, { keyboardStep: 0.25, onProgress });

    viewport.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight' }));
    expect(content.style.transform).toBe('translate3d(-100px, 0, 0)');
    expect(onProgress).toHaveBeenLastCalledWith(0.25);
  });

  it('restores original inline styles when destroyed', () => {
    const { viewport, content } = createFixture();
    content.style.transform = 'scale(1)';
    const controller = createOverflowFollow(viewport, content);

    controller.destroy();

    expect(content.style.transform).toBe('scale(1)');
    expect(viewport.style.getPropertyValue('--overflow-follow-progress')).toBe('');
  });

  it('recalculates the offset when a flexible viewport changes width', () => {
    const { viewport, content } = createFixture();
    let viewportWidth = 200;
    Object.defineProperty(viewport, 'clientWidth', { get: () => viewportWidth });
    const controller = createOverflowFollow(viewport, content);

    viewport.dispatchEvent(new PointerEvent('pointermove', { clientX: 200, clientY: 40 }));
    expect(content.style.transform).toBe('translate3d(-200px, 0, 0)');

    viewportWidth = 300;
    viewport.getBoundingClientRect = () => new DOMRect(100, 20, 300, 40);
    controller.refresh();

    expect(content.style.transform).toBe('translate3d(-100px, 0, 0)');
  });
});
