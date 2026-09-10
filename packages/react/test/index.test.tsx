// @vitest-environment happy-dom

import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import { OverflowFollow } from '../src';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

describe('OverflowFollow for React', () => {
  let root: Root | undefined;

  afterEach(() => {
    if (root) act(() => root?.unmount());
  });

  it('mounts text without generating an aria-label', async () => {
    const rootElement = document.createElement('div');
    document.body.append(rootElement);
    root = createRoot(rootElement);

    await act(async () => {
      root?.render(<OverflowFollow text="React content" />);
    });

    const viewport = rootElement.querySelector('.overflow-follow');
    expect(viewport?.textContent).toBe('React content');
    expect(viewport?.hasAttribute('aria-label')).toBe(false);
  });
});
