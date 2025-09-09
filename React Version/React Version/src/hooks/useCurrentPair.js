import { useSyncExternalStore } from "react";
import { getCurrentPair, setCurrentPair, onPairChange } from "../lib/api";

const subscribe = (cb) => onPairChange(cb);
const getSnap = () => getCurrentPair();

export function useCurrentPair() {
  const pair = useSyncExternalStore(subscribe, getSnap, getSnap);
  return [pair, setCurrentPair];
}
