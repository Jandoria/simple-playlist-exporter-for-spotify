<script setup lang="ts">
const props = defineProps({
  playlist: Object,
  isSelected: Boolean,
})

const emit = defineEmits(['select']);

const onSelected = () => {
  emit('select', props.playlist?.id);
};

function decodeHtmlCharCodes (str: string): string {
  const textArea = document.createElement('textarea');
  textArea.innerHTML = str;
  return textArea.value;
}
</script>

<template>
  <div v-if="playlist" class="flex items-center gap-4">
    <label
      class="flex items-center cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2"
      :class="{ 'hover:bg-slate-50 dark:bg-slate-700 dark:hover:bg-slate-600': isSelected }"
    >
      <input
        type="radio"
        class="appearance-none"
        :checked="isSelected"
        @change="onSelected"
      >
      <img :src="playlist.images[0].url" width="64" :alt="playlist.name" class="rounded mr-2" />
      <div class="flex flex-col text-left">
        <strong class="w-80 truncate text-slate-900 font-semibold dark:text-slate-200" :title="decodeHtmlCharCodes(playlist.name)">
          {{ playlist.name }}
        </strong>
        <span class="w-80 truncate text-slate-500 dark:text-slate-400" :title="decodeHtmlCharCodes(playlist.description)">
          {{ decodeHtmlCharCodes(playlist.description) }}
        </span>
      </div>
    </label>
    <a
      :href="playlist.external_urls.spotify"
      target="_blank"
      title="Open in Spotify"
      class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 ml-auto mr-2"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5">
        <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clip-rule="evenodd" />
        <path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd" />
      </svg>
    </a>
  </div>
</template>
