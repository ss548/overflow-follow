// @vitest-environment happy-dom

import { createApp, h, nextTick } from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { OverflowFollow } from '../src';

describe('OverflowFollow for Vue 3', () => {
  let unmount: (() => void) | undefined;

  afterEach(() => unmount?.());

  it('mounts text without generating an aria-label', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    const app = createApp({ render: () => h(OverflowFollow, { text: 'Vue 3 content' }) });
    app.mount(root);
    unmount = () => app.unmount();
    await nextTick();

    const viewport = root.querySelector('.overflow-follow');
    expect(viewport?.textContent).toBe('Vue 3 content');
    expect(viewport?.hasAttribute('aria-label')).toBe(false);
  });
});
