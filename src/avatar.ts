// The character this page calls. The example avatar below is public and works on a fresh API
// key. To use your own, create one at https://realtimeavatar.ai/platform/avatars, put its
// `ava_...` id here, and add the same id to the server's REALTIME_AVATAR_IDS.
export const avatar = {
  id: import.meta.env.VITE_REALTIME_AVATAR_ID ?? "seed-rin-ashfall",
  name: import.meta.env.VITE_REALTIME_AVATAR_NAME ?? "Rin",
  // Optional: shown while the call connects. These two belong to the example avatar; the
  // filenames differ per character, so copy your own avatar's URLs rather than guessing.
  poster: "https://realtimeavatar.ai/api/assets/public/characters/rin-ashfall/portrait.png",
  idleVideoUrl: "https://realtimeavatar.ai/api/assets/public/characters/rin-ashfall/idle-10s.mp4",
} as const;
