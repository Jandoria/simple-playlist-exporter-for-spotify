<template>
  <h1 class="text-5xl font-bold mb-16">Simple Playlist Exporter</h1>
  <!-- 1. Login with Spotify -->
  <button v-if="!state.userProfile" class="btn" @click="login">Login with Spotify</button>
  <section v-else id="profile">
    <div class="flex items-center justify-between">
      <div class="flex items-center gap-4 p-4">
        <img :src="state.userProfile.images[0].url" width="64" alt="Spotify profile picture" class="rounded-full" />
        <div class="flex flex-col">
          <strong class="text-slate-900 font-semibold dark:text-slate-200 flex">{{ state.userProfile.display_name }}</strong>
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
    <button v-if="!state.playlists.length" class="btn my-4" @click="getPlaylists">Get my playlists</button>
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
    <div v-if="selectedPlaylist">
      <p class="mb-4">Export to:</p>
      <button class="btn mr-4" @click="exportToText">Text</button>
      <button class="btn" @click="exportToCSV">CSV</button>
    </div>
  </section>
  <!-- 2. or paste link to public playlist -->
  <div class="my-6">——— or ———</div>
  <p class="mb-2">Paste link to public playlist</p>
  <input type="text" class="caret-slate-300 border-slate-300 border rounded p-2" />
  <!-- TODO  v-model="playlistUrl"-->
  <!-- 3. Export -->
  <!-- TODO -->
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { redirectToAuthCodeFlow, getAccessToken, getRefreshToken } from "./authCodeWithPkce";
import { UserProfile, Playlist } from './types';
import PlaylistCard from './components/PlaylistCard.vue';

const selectedPlaylist = ref('');

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

const exportToText = () => {
  console.log("Playlist a exportar a TEXTO:", selectedPlaylist.value);
};

const exportToCSV = () => {
  console.log("Playlist a exportar a CSV:", selectedPlaylist.value);
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

<style scoped>
.btn {
  @apply rounded-lg border border-transparent px-5 py-2 bg-slate-950 cursor-pointer transition-colors duration-200 hover:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-200;
}
</style>