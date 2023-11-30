<template>
  <h1 class="text-5xl font-bold mb-16">Simple Playlist Exporter</h1>
  <!-- 1. Login with Spotify -->
  <button v-if="!state.userProfile" class="btn" @click="login">Login with Spotify</button>
  <section v-else id="profile">
    <div class="flex items-center justify-between mb-5">
      <div class="flex items-center gap-4 p-4">
        <img :src="state.userProfile.images[0].url" width="64" alt="Spotify profile picture" class="rounded-full" />
        <div class="flex flex-col">
          <strong class="cursor-default text-slate-900 font-semibold dark:text-slate-200 flex">{{ state.userProfile.display_name }}</strong>
          <a
            :href="state.userProfile.external_urls.spotify"
            target="_blank"
            class="text-slate-500 hover:text-slate-600 dark:text-slate-400 dark:hover:text-slate-300 flex items-center"
          >
            View profile <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"
              class="w-5 h-5 ml-1">
              <path fill-rule="evenodd"
                d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z"
                clip-rule="evenodd" />
              <path fill-rule="evenodd"
                d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z"
                clip-rule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
      <button class="btn" @click="logout">Logout</button>
    </div>
    <div v-if="state.playlists.length > 0"
      class="max-w-md border-y border-slate-500 divide-y divide-slate-500 divide-dashed my-6">
      <PlaylistCard
        v-for="playlist in state.playlists"
        :key="playlist.id"
        :playlist="playlist"
        :isSelected="playlist.id === selectedPlaylist"
        @select="selectPlaylist"
      />
    </div>
    <div v-else>
      <div class="flex rounded bg-amber-50 dark:bg-amber-200 text-yellow-700 dark:text-yellow-900 p-3">
        <div class="shrink-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" class="fill-yellow-400 dark:fill-yellow-600 w-5 h-5">
            <path fill-rule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clip-rule="evenodd" />
          </svg>
        </div>
        <div class="flex flex-col text-left ml-3 leading-5 -mt-0.5">
          <h3 class="font-semibold mb-2">No public playlists</h3>
          <p>You don't have any public playlists <u>attached to your profile</u>, please make sure to add them in Spotify.</p>
        </div>
      </div>
      <!-- TODO: loading status -->
      <button class="btn my-4" @click="getPlaylists">Retry</button>
    </div>
    <transition
      enter-active-class="transition-all ease-out duration-500"
      leave-active-class="transition-all ease-out duration-300"
      enter-from-class="opacity-0 max-h-0"
      enter-to-class="opacity-100 max-h-24"
      leave-from-class="opacity-100 max-h-24"
      leave-to-class="opacity-0 max-h-0"
    >
      <div v-if="selectedPlaylist" class="overflow-hidden">
        <ExportTo from="selectedPlaylist" @to-text="fetchAndExportTo('text')" @to-csv="fetchAndExportTo('csv')" />
      </div>
    </transition>
  </section>
  <!-- 2. or paste link to public playlist -->
  <div class="my-6">——— or ———</div>
  <p class="mb-2">Paste link to public playlist</p>
  <input type="text" v-model="playlistUrl" class="caret-slate-300 border-slate-300 border rounded px-5 py-2 mb-5" />
  <!-- TODO: validate and show error -->
  <transition
    enter-active-class="transition-opacity duration-500"
    leave-active-class="transition-opacity duration-300"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <!-- TODO: loading/ready status -->
    <ExportTo v-if="playlistUrl" from="playlistUrl" @to-text="fetchAndExportTo('text')" @to-csv="fetchAndExportTo('csv')" />
  </transition>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { redirectToAuthCodeFlow, getAccessToken, getRefreshToken } from "./authCodeWithPkce";
import { UserProfile, Playlist } from './types';
import PlaylistCard from './components/PlaylistCard.vue';
import ExportTo from './components/ExportTo.vue';

const selectedPlaylist = ref('');
const playlistUrl = ref('');

const clientId = import.meta.env.VITE_CLIENT_ID;
const state = reactive({
  userProfile: null as UserProfile | null,
  playlists: [] as Playlist[],
});

const login = () => {
  redirectToAuthCodeFlow(clientId);
};

const logout = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  state.userProfile = null;
};

const fetchProfile = async (code: string): Promise<UserProfile | null> => {
  try {
    const result = await fetch("https://api.spotify.com/v1/me", {
      method: "GET", headers: { Authorization: `Bearer ${code}` }
    });
    if (!result.ok) {
      throw new Error('TokenExpired');
    }
    return await result.json();
  } catch (error: any) {
    if (error.message === 'TokenExpired') {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        const { access_token: newAccessToken, refresh_token: newRefreshToken } = await getRefreshToken(clientId, refreshToken);
        localStorage.setItem("accessToken", newAccessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        return fetchProfile(newAccessToken);
      } else {
        throw error;
      }
    }
  }
  return null;
};

const getPlaylists = async () => {
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedAccessToken) {
      const profile = await fetchProfile(storedAccessToken);
      if (profile) {
        const result = await fetch(`https://api.spotify.com/v1/users/${profile.id}/playlists`, {
          method: "GET", headers: { Authorization: `Bearer ${storedAccessToken}` }
        });
        const data = await result.json();
        state.playlists = data.items;
      }
    }
  } catch (error: any) {
    console.log(error);
  }
};

const selectPlaylist = (playlistId: string) => {
  selectedPlaylist.value = playlistId;
};

const formatFilename = (playlist: Playlist, extension: string) => {
  const name = playlist.name;
  const owner = playlist.owner.display_name;
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const formattedDate = `${year}-${month}-${day}`;
  return `${formattedDate}-${owner}'s-${name}.${extension}`;
}

const fetchAndExportTo = async (exportTo: string) => {
  const playlistId = selectedPlaylist.value ? selectedPlaylist.value : playlistUrl.value;
  try {
    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedAccessToken) {
      const result = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}`, {
        method: "GET", headers: { Authorization: `Bearer ${storedAccessToken}` }
      });
      const data = await result.json();
      exportTo === 'text' ? exportToText(data) : exportToCSV(data);
    }
  } catch (error: any) {
    console.log(error);
  }
};

const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const downloadLink = document.createElement('a');
  downloadLink.href = URL.createObjectURL(blob);
  downloadLink.download = filename;
  document.body.appendChild(downloadLink);
  downloadLink.click();
  document.body.removeChild(downloadLink);
};

const exportToText = async (playlist: Playlist) => {
  const text = playlist.tracks?.items.map((item: any) => `${item.track.artists[0].name} - ${item.track.name}`).join('\n');
  downloadFile(text, formatFilename(playlist, 'txt'), 'text/plain');
};

const exportToCSV = (playlist: Playlist) => {
  const csvRows = playlist.tracks?.items.map((item: any) => `${item.track.artists[0].name}, ${item.track.name}`);
  const csvData = ['Artist, Track Name', ...csvRows].join('\n');
  downloadFile(csvData, formatFilename(playlist, 'csv'), 'text/csv');
};

onMounted(async () => {
  const storedAccessToken = localStorage.getItem('accessToken');
  if (storedAccessToken) {
    const profile = await fetchProfile(storedAccessToken);
    if (profile) state.userProfile = profile;
    await getPlaylists();
  } else {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      const { access_token: accessToken, refresh_token: refreshToken } = await getAccessToken(clientId, code);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const profile = await fetchProfile(accessToken);
      if (profile) state.userProfile = profile;
    }
  }
});
</script>

<style>
.btn {
  @apply text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 rounded-lg border border-transparent px-5 py-2 cursor-pointer transition-colors duration-200 hover:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200;
}
</style>