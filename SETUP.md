# SF-FS · Spencer Family Food Storage — setup

Dashes are fine in repo names, so the app lives at **https://shawnjspencer.github.io/SF-FS/**

The app works the moment it's on GitHub Pages (on one device). Steps 2–5 turn on syncing, alerts and the weekly email. Everything below is on free plans.

---

## 1. Put it on GitHub Pages (5 min)
1. github.com → **New repository** → name it `SF-FS` → Public → Create.
2. **Add file → Upload files** → drag in *everything* from this folder (including the hidden `.github` folder — on a Mac press ⌘⇧. in Finder to see it) → Commit.
3. Repo **Settings → Pages** → Source: *Deploy from a branch* → `main` / `(root)` → Save.
4. After a minute, open the link on your iPhone in **Safari → Share → Add to Home Screen**.
   The icon is the "I love you" barcode.

## 2. Make the shared database (Firebase, free)
1. https://console.firebase.google.com → **Add project** → name `sf-fs` (Analytics off).
2. **Build → Firestore Database → Create database** → *Production mode* → location `us-central` (any).
3. **Build → Authentication → Get started → Email/Password → Enable**.
4. **Project settings (gear) → Your apps → `</>` Web** → nickname `SF-FS` → Register.
   Copy the `firebaseConfig` block it shows into `config.js` (replace `firebase: null`).

## 3. Lock it to the two of you
1. `firestore.rules` already lists both of our emails (shawn@spencerfam.com and kinzspencer@gmail.com).
2. Firebase → **Firestore → Rules** → paste the whole file → **Publish**.
3. In the app: **settings → Sync → "first time? create login"** with your email + a password.
   The first sign-in uploads her tracker (all 232 items). Your wife then creates her own login the same way on her phone.

## 4. Weekly list + expiry emails
The hourly job in `.github/workflows/alerts.yml` does this. It needs a few secrets:
repo **Settings → Secrets and variables → Actions → New repository secret**

| Secret | Where it comes from |
|---|---|
| `FIREBASE_SERVICE_ACCOUNT` | Firebase → Project settings → **Service accounts → Generate new private key** → paste the whole JSON file's contents |
| `SMTP_USER` | the Google account that sends the emails, e.g. `shawn@spencerfam.com` |
| `SMTP_PASS` | a Google **App Password** for that account (myaccount.google.com → Security → 2-Step Verification → App passwords) |
| `SMTP_HOST` | only if your email *isn't* Google — your provider's SMTP server (port 465) |

Choose the day/time and both email addresses in the app under **settings → Alerts**.
To test: repo **Actions → "Food Storage alerts & weekly list" → Run workflow**.

## 5. iPhone / iPad / computer notifications
1. On any computer with Node: `npx web-push generate-vapid-keys`
2. Put the **public** key in `config.js` → `vapidPublicKey`, and add two more secrets: `VAPID_PUBLIC`, `VAPID_PRIVATE`.
3. On each device: open the app *from the Home Screen icon* → settings → **turn on alerts for this device** → Allow.
   (iPhone needs iOS 16.4+ and the app added to the Home Screen.)

---

### What the alerts do
* Once a day: anything within a month of its date (or past it) → phone notification + email. Each batch is only announced once.
* On your chosen day: the shopping list (everything below its *keep on hand* number) grouped by store, with "find" links, plus a *Use soon* section.
* "Email it to us now" in the shopping list sends it on the next hourly run.

### Good to know
* Colors are saved per device; the food storage itself is shared.
* Works offline in the basement — changes sync when you're back on Wi-Fi.
* Barcode lookups use Open Food Facts / Open Products Facts / UPCitemdb (free). First time you scan something from her tracker, pick the matching item once and it remembers the barcode.
* The stores don't offer public price/stock feeds, so the list links to each store's search instead of pulling prices.
* **Later:** the shelf map (tap a location → glowing spot on a drawing of the room) once the room sketch is in.
