<script setup lang="ts">
import { shallowRef } from 'vue';
import { OverflowFollow } from 'overflow-follow-vue';

const flexibleWidth = shallowRef(440);
const demoSentence =
  'Move the pointer from left to right to reveal every part of this long sentence, then leave the area to reset it instantly to the beginning.';
</script>

<template>
  <main class="page">
    <header class="hero">
      <p class="eyebrow">POINTER-MAPPED OVERFLOW</p>
      <h1>Overflow Follow</h1>
      <p>Long content follows the pointer continuously and resets when the pointer leaves.</p>
    </header>

    <section class="demo-card">
      <div class="file-row">
        <span class="file-icon">↔</span>
        <strong>Pointer preview</strong>
        <div class="path-cell">
          <OverflowFollow :text="demoSentence" />
        </div>
        <span class="size">Live</span>
      </div>
    </section>

    <section class="demo-card">
      <div class="section-title">
        <div>
          <h2>Responsive container</h2>
          <p>ResizeObserver recalculates the offset whenever the Flex width changes.</p>
        </div>
        <output>{{ flexibleWidth }}px</output>
      </div>
      <input v-model.number="flexibleWidth" type="range" min="180" max="760" />
      <div class="resizable-row" :style="{ width: `${flexibleWidth}px` }">
        <span>Text</span>
        <OverflowFollow :text="demoSentence" />
      </div>
    </section>
  </main>
</template>
