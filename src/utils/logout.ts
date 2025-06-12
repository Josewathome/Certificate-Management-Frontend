let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(cb: () => void) {
  logoutCallback = cb;
}

export function triggerLogout() {
  console.log('triggerLogout called');
  if (logoutCallback) logoutCallback();
  else console.log('No logoutCallback set');
} 