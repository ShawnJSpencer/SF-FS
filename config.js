// ─────────────────────────────────────────────────────────────
//  SF-FS configuration  (see SETUP.md)
//  Until `firebase` is filled in, the app runs in "this device
//  only" mode and keeps everything in this browser.
// ─────────────────────────────────────────────────────────────
window.SFFS_CONFIG = {
  // Paste the web-app config from Firebase console → Project settings → Your apps
  firebase: null,
  /* firebase: {
    apiKey: "…",
    authDomain: "…firebaseapp.com",
    projectId: "…",
    storageBucket: "…appspot.com",
    messagingSenderId: "…",
    appId: "…"
  }, */

  // Public VAPID key for iPhone/iPad/computer notifications (SETUP.md step 5)
  vapidPublicKey: "",

  // Everyone shares this one household
  household: "spencer"
};
