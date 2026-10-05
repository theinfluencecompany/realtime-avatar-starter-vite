import type { ReactNode } from "react";
import { AvatarCall, type AvatarCallEndReason, type AvatarCallHandle } from "realtime-avatar/react";
import { avatar } from "./avatar";
import { avatarClient } from "./lib/avatar-client";

// Loaded lazily by App.tsx: the live-media stack (LiveKit, WebRTC) is most of the bundle and
// is only needed once someone presses Call.
export default function Call({ onEnded }: { onEnded: (reason: AvatarCallEndReason) => void }) {
  return (
    <AvatarCall
      client={avatarClient}
      avatarId={avatar.id}
      poster={avatar.poster}
      idleVideoUrl={avatar.idleVideoUrl}
      style={{ width: "100%", height: "100%" }}
      onEnded={({ reason }) => onEnded(reason)}
    >
      {(call) => <CallControls call={call} />}
    </AvatarCall>
  );
}

function CallControls({ call }: { call: AvatarCallHandle }) {
  const muted = call.microphone.status === "muted";
  const micProblem = call.microphone.status === "blocked" || call.microphone.status === "unavailable" ? call.microphone : null;

  return (
    <div className="absolute inset-x-0 bottom-0 p-4 flex flex-col items-center gap-2">
      {call.status === "connecting" && <Badge>Connecting...</Badge>}
      {call.status === "waiting" && <Badge>All lines busy, you are number {call.queuePosition ?? "?"} in line</Badge>}
      {call.status === "recovering" && <Badge>Reconnecting...</Badge>}
      {micProblem && (
        <Badge>
          {micProblem.message} {micProblem.hint}{" "}
          <button type="button" className="underline" onClick={() => void call.retryMicrophone()}>
            Try again
          </button>
        </Badge>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => void call.setMicrophoneEnabled(muted)}
          className="rounded-full bg-white/15 backdrop-blur px-4 py-2 text-sm hover:bg-white/25"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
        <button
          type="button"
          onClick={call.end}
          className="rounded-full bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-500"
        >
          End call
        </button>
      </div>
      {call.secondsRemaining !== null && call.status === "live" && (
        <span className="text-xs text-neutral-300">{Math.max(0, Math.round(call.secondsRemaining))}s left</span>
      )}
    </div>
  );
}

function Badge({ children }: { children: ReactNode }) {
  return <p className="text-sm text-center bg-black/70 rounded-lg px-3 py-1.5 max-w-full">{children}</p>;
}
