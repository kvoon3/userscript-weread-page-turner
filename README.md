# WeRead Page Turner

Turn pages with the mouse wheel on [WeChat Reading](https://weread.qq.com/) web, without stealing scroll from side panels or overlays.

Available as a **Chrome / Edge Manifest V3 extension** (unpacked) and a **Greasy Fork userscript**.

[Install on Greasy Fork](https://greasyfork.org/zh-CN/scripts/520296-weread-page-turner)

## What it does

On `https://weread.qq.com/web/reader/*` in paginated (horizontal) mode:

- Wheel down → next page
- Wheel up → previous page

It prefers clicking the native pager buttons, and falls back to `ArrowLeft` / `ArrowRight` when a button is missing (for example previous on the first page).

It does **not** intercept the wheel when:

- A catalog, notes, reviews, font, AI, search, login, or other overlay/panel is open
- The pointer is over a scrollable container (including Perfect Scrollbar panels)
- The reader is not in paginated horizontal mode (so continuous / vertical scroll keeps native scrolling)

## Install the unpacked extension (Chrome / Edge)

1. Clone or download this repository.
2. Optional but recommended after pulling changes that touch the wheel logic:

   ```bash
   node sync-shared.js
   ```

3. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the `extension/` folder in this repo.
6. Open a book reader URL (`https://weread.qq.com/web/reader/...`) and use the mouse wheel on the reading surface.

No accounts, tokens, or extra permissions are required. The extension only injects a content script on WeRead reader pages.

## Install the userscript

Use the [Greasy Fork install link](https://greasyfork.org/zh-CN/scripts/520296-weread-page-turner) with Tampermonkey / Violentmonkey / Greasemonkey, or load `index.js` manually in your userscript manager.

## Development

Wheel policy source of truth: `shared/weread-wheel.js`.

```bash
pnpm install
node sync-shared.js   # copies shared → extension/weread-wheel.js and rebuilds index.js
pnpm lint
```

## Live page notes (2026-11-11)

Verified on a public sample book while logged out, in two-column horizontal mode:

- Native turns via `button.renderTarget_pager_button` / `_right`, plus arrow keys
- Catalog overlay + Perfect Scrollbar list; dimmer `.wr_mask_Show`
- Login QR (`.login_dialog_container`) has no `.wr_mask_Show`

Still needs a logged-in session to confirm: notes panel, reviews/thoughts, font-size panel, AI panel, and continuous / vertical scroll mode. The implementation uses a generic “visible overlay or scrollable ancestor” policy so those panels should work once opened.
