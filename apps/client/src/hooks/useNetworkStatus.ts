import { useEffect, useState } from "react";

function readOnline(): boolean {
  return navigator.onLine;
}

export function useNetworkStatus(): boolean {
  const [online, setOnline] = useState(readOnline);
  useEffect(() => {
    const connect = () => setOnline(true);
    const disconnect = () => setOnline(false);
    window.addEventListener("online", connect);
    window.addEventListener("offline", disconnect);
    return () => {
      window.removeEventListener("online", connect);
      window.removeEventListener("offline", disconnect);
    };
  }, []);
  return online;
}
