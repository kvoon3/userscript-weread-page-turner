# WeRead Page Turner

Turn pages with the mouse wheel or keyboard on [WeChat Reading](https://weread.qq.com/) web, without stealing scroll from side panels or overlays. Save a bookmark with a shortcut that clicks the native control.

Available as a **Chrome / Edge Manifest V3 extension** (unpacked) and a **Greasy Fork userscript**.

[Install on Greasy Fork](https://greasyfork.org/zh-CN/scripts/520296-weread-page-turner)

## What it does

On `https://weread.qq.com/web/reader/*` in paginated (horizontal) mode:

### Mouse wheel

- Wheel down → next page
- Wheel up → previous page

It prefers clicking the native pager buttons, and falls back to `ArrowLeft` / `ArrowRight` when a button is missing (for example previous on the first page).

### Keyboard

Letter keys are case-insensitive and ignored when Ctrl / Meta / Alt / Shift is held (so browser and IME shortcuts stay intact). Shortcuts also skip when focus is in an input, textarea, or contenteditable field.

| Action | Keys |
| --- | --- |
| Previous page | `a`, `h` (horizontal mode only) |
| Next page | `d`, `l` (horizontal mode only) |
| Previous / next (native) | `ArrowLeft` / `ArrowRight` — left alone when no overlay; blocked when a panel is open so the book does not turn behind it |
| Save bookmark | `s`, `j`, and `ArrowDown` |

`ArrowDown` is remapped to bookmark **only in paginated horizontal mode** when a native bookmark control exists (it stops the native next-page behavior so the page does not also turn). On the flyleaf, where no bookmark control exists, `ArrowDown` keeps native next-page. In continuous / vertical scroll mode it is left alone so the page can keep scrolling; letter page-turn keys also do not intercept in scroll mode. Letter bookmark keys (`s` / `j`) may still click the native bookmark control in scroll mode when one exists.

Bookmark click order:

1. `.wr_reader_float_corner_bookmark_actionArea` if present (page-corner ribbon; JS click works even when translated off-screen until hover)
2. Otherwise `div.readerCatalog_list_item_meta_add_bookMark` on the selected catalog row (works while the catalog is closed; does not open the catalog)
3. No-op if neither exists (for example on the flyleaf)

Catalog may stay open for bookmark; other overlays (notes, reviews, font, AI, search, login) skip the shortcut. Success and failure (including logged-out toast) are left to WeRead.

It does **not** intercept the wheel when:

- A catalog, notes, reviews, font, AI, search, login, or other overlay/panel is open
- The pointer is over a scrollable container (including Perfect Scrollbar panels)
- The reader is not in paginated horizontal mode (so continuous / vertical scroll keeps native scrolling)

## Install the unpacked extension (Chrome / Edge)

1. Clone or download this repository.
2. Optional but recommended after pulling changes that touch the wheel / keyboard logic:

   ```bash
   node sync-shared.js
   ```

3. Open `chrome://extensions` (Chrome) or `edge://extensions` (Edge).
4. Enable **Developer mode**.
5. Click **Load unpacked** and select the `extension/` folder in this repo.
6. Open a book reader URL (`https://weread.qq.com/web/reader/...`) and use the mouse wheel or keyboard on the reading surface.

No accounts, tokens, or extra permissions are required. The extension only injects a content script on WeRead reader pages.

## Install the userscript

Use the [Greasy Fork install link](https://greasyfork.org/zh-CN/scripts/520296-weread-page-turner) with Tampermonkey / Violentmonkey / Greasemonkey, or load `index.js` manually in your userscript manager.

## Development

Wheel + keyboard policy source of truth: `shared/weread-wheel.js`.

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
- Letter keys `a` `d` `s` `h` `l` `j` are unused by the site when no input is focused
- Native `ArrowLeft` / `ArrowUp` go previous; `ArrowRight` / `ArrowDown` go next
- With the catalog open, `ArrowRight` turns the book behind the panel (this extension blocks that)
- Bookmark: selected-row `+书签` (`div.readerCatalog_list_item_meta_add_bookMark`); CSS also defines `.wr_reader_float_corner_bookmark_actionArea` (translateY(-100%) until hover / bookmarked)
- Clicking `+书签` logged out shows toast “添加书签失败，请重试” — native behavior; the extension only clicks the control

Still needs a logged-in session to confirm: successful bookmark, notes panel, reviews/thoughts, font-size panel, AI panel, and continuous / vertical scroll mode. The implementation uses a generic “visible overlay or scrollable ancestor” policy so those panels should work once opened.
