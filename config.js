// ─────────────────────────────────────────────────────────────
//  SF-FS configuration  (see SETUP.md)
//  Until `firebase` is filled in, the app runs in "this device
//  only" mode and keeps everything in this browser.
// ─────────────────────────────────────────────────────────────
window.SFFS_CONFIG = {
  // Paste the web-app config from Firebase console → Project settings → Your apps
  firebase: {
    apiKey: "AIzaSyD95n_Uld-Fjq_1KcoItp3HXYZtujm6Y_A",
    authDomain: "sf-fs-21942.firebaseapp.com",
    projectId: "sf-fs-21942",
    storageBucket: "sf-fs-21942.firebasestorage.app",
    messagingSenderId: "882983126724",
    appId: "1:882983126724:web:7fbc7da74da8c885ebab91"
  },
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
