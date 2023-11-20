<script setup lang="ts">
defineProps({
  image: String,
  name: String,
  description: String,
  external_url: String,
})
</script>

<template>
  <div class="flex items-center max-w-md gap-4 p-2">
    <img :src="image" width="64" :alt="name" class="rounded" />
    <div class="flex flex-col">
      <strong class="text-slate-900 font-semibold dark:text-slate-200">{{ name }}</strong>
      <span target="_blank" class="text-slate-500 dark:text-slate-400 flex items-center">
        {{ description }}
      </span>
    </div>
    <a :href="external_url" target="_blank" title="Open in Spotify" class="ml-auto">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clip-rule="evenodd" />
        <path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd" />
      </svg>
    </a>
  </div>
</template>
