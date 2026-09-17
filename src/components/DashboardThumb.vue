<script lang="ts" setup>
// Miniature of a dashboard grid: a KPI strip, a chart pair, then a table + chart row.
</script>

<template>
  <svg width="300" height="140" viewBox="0 0 300 140" fill="none" aria-hidden="true">
    <rect
      v-for="i in 4"
      :key="`k${i}`"
      :x="(i - 1) * 77"
      y="0"
      width="63"
      height="14"
      rx="3"
      fill="#e2e2e8"
    />

    <rect x="0" y="24" width="140" height="52" rx="4" fill="#fafafb" stroke="#eeeef1" />
    <rect
      v-for="(b, i) in [18, 26, 20, 34, 24, 16]"
      :key="`b${i}`"
      :x="10 + i * 21"
      :y="70 - b"
      width="13"
      :height="b"
      rx="2"
      :fill="i === 3 ? '#4f46e5' : 'rgba(79,70,229,0.4)'"
    />

    <rect x="152" y="24" width="148" height="52" rx="4" fill="#fafafb" stroke="#eeeef1" />
    <polyline
      points="162,64 186,56 210,60 234,44 258,38 290,32"
      stroke="#4f46e5"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />

    <rect x="0" y="86" width="176" height="54" rx="4" fill="#fafafb" stroke="#eeeef1" />
    <rect
      v-for="r in 4"
      :key="`t${r}`"
      x="10"
      :y="96 + (r - 1) * 11"
      width="156"
      height="6"
      rx="2"
      fill="#ededf1"
    />

    <rect x="188" y="86" width="112" height="54" rx="4" fill="#fafafb" stroke="#eeeef1" />
    <rect
      v-for="(b, i) in [16, 24, 18, 30, 22]"
      :key="`b2${i}`"
      :x="197 + i * 21"
      :y="132 - b"
      width="13"
      :height="b"
      rx="2"
      :fill="i === 3 ? '#4f46e5' : 'rgba(79,70,229,0.4)'"
    />
  </svg>
</template>
