import { lazy, Suspense, useState } from "react";
import type { AvatarCallEndReason } from "realtime-avatar/react";
import { avatar } from "./avatar";

const Call = lazy(() => import("./Call"));

const endedCopy: Record<AvatarCallEndReason, string> = {
  user_ended: "Call ended.",
  session_cap: "That was the time limit for one call.",
  idle: "The call ended after a quiet stretch.",
  disconnected: "The connection dropped.",
  out_of_credits: "The account is out of credits.",
  agent_ended: `${avatar.name} ended the call.`,
  failed: "The call could not start. Check the server logs and your API key.",
};

export default function App() {
  // Each call is a fresh mount: an ended <AvatarCall> stays ended, so a new key starts a new call.
  const [callKey, setCallKey] = useState<number | null>(null);
  const [ended, setEnded] = useState<AvatarCallEndReason | null>(null);

  const start = () => {
    setEnded(null);
    setCallKey(Date.now());
  };

  return (
    <main className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center px-4 py-10 gap-6">
      <header className="text-center space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">Talk to {avatar.name}</h1>
        <p className="text-neutral-400">A live, interruptible AI avatar. Allow the microphone and just talk.</p>
      </header>

      <section className="w-full max-w-md aspect-[3/4] rounded-2xl overflow-hidden bg-neutral-900 ring-1 ring-white/10 relative">
        {callKey === null ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <img src={avatar.poster} alt={avatar.name} className="absolute inset-0 h-full w-full object-cover opacity-60" />
            <button
              type="button"
              onClick={start}
              className="relative rounded-full bg-white text-neutral-950 px-6 py-3 font-medium shadow-lg hover:bg-neutral-200"
            >
              {ended ? "Call again" : `Call ${avatar.name}`}
            </button>
            {ended && <p className="relative text-sm text-neutral-200 bg-black/60 rounded px-3 py-1">{endedCopy[ended]}</p>}
          </div>
        ) : (
          <Suspense fallback={<p className="absolute inset-0 grid place-items-center text-neutral-400">Loading...</p>}>
            <Call
              key={callKey}
              onEnded={(reason) => {
                setEnded(reason);
                setCallKey(null);
              }}
            />
          </Suspense>
        )}
      </section>

      <footer className="text-xs text-neutral-500">
        Powered by <a className="underline" href="https://realtimeavatar.ai">Realtime Avatar</a>
      </footer>
    </main>
  );
}
