import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const mq = window.matchMedia("(max-width: 767px)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia("(max-width: 767px)").matches;
}

function getServerSnapshot() {
  return false;
}

export function useIsMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
