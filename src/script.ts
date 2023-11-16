import { redirectToAuthCodeFlow, getAccessToken, getRefreshToken } from "./authCodeWithPkce";

const clientId = import.meta.env.VITE_CLIENT_ID;

document.addEventListener('DOMContentLoaded', async function () {
  const userContent = document.getElementById('profile');
  const loginButton = document.getElementById('login');
  loginButton!.addEventListener('click', login);

  const storedAccessToken = localStorage.getItem('accessToken');

  if (storedAccessToken) {
    showProfile();
  } else {
    showLogin();
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");

    if (code) {
      const { access_token: accessToken, refresh_token: refreshToken } = await getAccessToken(clientId, code);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      showProfile();
    }
  }

  async function fetchProfile(code: string): Promise<UserProfile | null> {
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
  }

  function login() {
    redirectToAuthCodeFlow(clientId);
  }

  function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    showLogin();
  }

  function populateUI(profile: UserProfile) {
    document.getElementById("displayName")!.innerText = profile.display_name;
    document.getElementById("avatar")!.setAttribute("src", profile.images[1].url)
    document.getElementById("email")!.innerText = profile.email;
    document.getElementById("uri")!.setAttribute("href", profile.external_urls.spotify);
    document.getElementById("imgUrl")!.innerText = profile.images[1].url;
  }

  async function showProfile() {
    userContent!.classList.remove('hidden');
    loginButton!.classList.add('hidden');

    const storedAccessToken = localStorage.getItem('accessToken');
    if (storedAccessToken) {
      const profile = await fetchProfile(storedAccessToken);
      if (profile) {
        populateUI(profile);
      }
    }
  }

  function showLogin() {
    userContent!.classList.add('hidden');
    loginButton!.classList.remove('hidden');
  }

  document.getElementById('close')!.addEventListener('click', logout);
});
