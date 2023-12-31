export interface UserProfile {
  country: string;
  display_name: string;
  email: string;
  explicit_content: {
      filter_enabled: boolean,
      filter_locked: boolean
  },
  external_urls: { spotify: string; };
  followers: { href: string; total: number; };
  href: string;
  id: string;
  images: Image[];
  product: string;
  type: string;
  uri: string;
}

interface Image {
  url: string;
  height: number;
  width: number;
}

export interface Playlist {
  collaborative: boolean;
  description: string;
  external_urls: { spotify: string; };
  followers: { href: string; total: number; };
  href: string;
  id: string;
  images: Image[];
  name: string;
  owner: { display_name: string; href: string; id: string; type: string; uri: string; };
  public: boolean;
  tracks: { href: string; total: number; items: Track[]; };
  uri: string;
}
