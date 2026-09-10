// @vitest-environment happy-dom

import Vue from 'vue';
import { afterEach, describe, expect, it } from 'vitest';
import { OverflowFollow } from '../src';

Vue.config.productionTip = false;
Vue.config.devtools = false;

describe('OverflowFollow for Vue 2', () => {
  let instance: Vue | undefined;

  afterEach(() => instance?.$destroy());

  it('mounts text without generating an aria-label', async () => {
    const root = document.createElement('div');
    document.body.append(root);
    instance = new Vue({
      render: (createElement) =>
        createElement(OverflowFollow, { props: { text: 'Vue 2 content' } }),
    });
    instance.$mount(root);
    await Vue.nextTick();

    const viewport = document.querySelector('.overflow-follow');
    expect(viewport?.textContent).toBe('Vue 2 content');
    expect(viewport?.hasAttribute('aria-label')).toBe(false);
  });
});
