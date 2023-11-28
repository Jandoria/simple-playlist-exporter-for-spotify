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
  <div v-if="playlist" class="flex items-center">
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
      <div class="w-full flex flex-col text-left">
        <strong class="w-[19.5rem] truncate text-slate-900 font-semibold dark:text-slate-200" :title="decodeHtmlCharCodes(playlist.name)">
          {{ playlist.name }}
        </strong>
        <span class="w-[19.5rem] truncate text-slate-500 dark:text-slate-400" :title="decodeHtmlCharCodes(playlist.description)">
          {{ decodeHtmlCharCodes(playlist.description) }}
        </span>
      </div>
    </label>
    <div class="flex flex-col p-2">
      <div class="flex items-center mb-2" title="Songs">
        <small class="cursor-default mr-1">{{ playlist.tracks?.total }}</small>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="fill-slate-50 w-4 h-4">
          <path class="st0" d="M13.3,8.1C13.3,8,13.4,8,13.3,8.1c1.1-1.9,0.3-4.2-1.5-5.3c-0.6-0.3-1.1-0.7-1.5-1.2c-0.3-0.4-0.5-0.8-0.7-1.2	C9.2-0.3,8.2,0,8.1,0.8c-0.1,0.8,0,1.7,0,2.5c0,1.6,0,3.2,0,4.8c0,0.8,0,1.6,0,2.5C6.6,9.8,4.7,10.1,3.4,11	c-1.1,0.8-1.9,2.3-1.1,3.6c1.7,2.7,7.3,1.2,7.2-2c0,0,0-0.1,0-0.1c0-1.8,0-3.5,0-5.3c0-0.2,0-0.5,0-0.7c0.1-0.9,1.1-1.4,1.8-0.8	C11.8,6,12,6.6,12,7.1c0,0.3,0,0.6,0.1,0.9C12.3,8.5,12.9,8.5,13.3,8.1C13.3,8.1,13.3,8.1,13.3,8.1C13.3,8.1,13.3,8.1,13.3,8.1z"/>
        </svg>
      </div>
      <a
        :href="playlist.external_urls.spotify"
        target="_blank"
        title="Open in Spotify"
        class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 ml-auto mr-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="fill-current w-5 h-5">
          <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clip-rule="evenodd" />
          <path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd" />
        </svg>
      </a>
    </div>
  </div>
</template>
