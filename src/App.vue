<template>
  <h1 class="text-5xl font-bold mb-5">Simple Playlist Exporter</h1>

  <button v-if="!userProfile" @click="login">Login with Spotify</button>
  <section v-else id="profile">
    <div class="flex items-center gap-4 p-4">
      <img :src="userProfile.images[0].url" width="64" alt="Spotify profile picture" class="rounded-full" />
      <div class="flex flex-col">
        <strong class="text-slate-900 font-medium dark:text-slate-200">{{ userProfile.display_name }}</strong>
        <a
          :href="userProfile.external_urls.spotify"
          target="_blank"
          class="text-slate-500 font-medium dark:text-slate-400 flex items-center"
        >
          View profile <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 ml-1">
            <path fill-rule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clip-rule="evenodd" />
          </svg>
        </a>
      </div>
    </div>
    <button id="get-playlists" class="mr-4" @click="getPlaylists">Get my playlists</button>
    <button id="close" @click="logout">Close session</button>
  </section>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue';
import { redirectToAuthCodeFlow, getAccessToken, getRefreshToken } from "./authCodeWithPkce";

export default defineComponent({
  name: 'App',
  setup() {
    const clientId = import.meta.env.VITE_CLIENT_ID;
    const state = reactive({
      userProfile: null as UserProfile | null,
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
            console.log(result);
            return await result.json();
          }
        }
      } catch (error: any) {
        console.log(error);
      }
    };

    onMounted(async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      if (storedAccessToken) {
        const profile = await fetchProfile(storedAccessToken);
        if (profile) state.userProfile = profile;
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

    return { ...toRefs(state), login, logout, getPlaylists };
  },
});
</script>
