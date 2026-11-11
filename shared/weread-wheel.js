/**
 * Shared WeRead wheel → page-turn policy.
 * Used by the Greasy Fork userscript (index.js) and the MV3 extension content script.
 *
 * Only intercepts wheel in paginated horizontal mode when the pointer is on the
 * reading surface and no overlay / scrollable panel should receive the scroll.
 */
'use strict'

function installWereadPageTurner(doc, win) {
  doc = doc || document
  win = win || window

  const WHEEL_THRESHOLD = 40
  const COOLDOWN_MS = 280

  /** Known overlays / panels that steal scroll when visible (verified + DOM-backed). */
  const OVERLAY_SELECTORS = [
    '.wr_mask_Show',
    '.login_dialog_container',
    '.wr_dialog_container',
    '.readerCatalog',
    '.readerNotePanel',
    '.readerAIChatPanel',
    '.reader-font-control-panel-wrapper',
    '.font-panel-content',
    '.reviews_panel',
    '.top_reviews_panel',
    '.search_panel',
    '.reader_float_panel_container',
    '.reader_common_dialog',
    '.wr_dialog_mask',
  ]

  let cooldownUntil = 0
  let deltaCarry = 0

  function isElementVisible(el) {
    if (!el || !(el instanceof Element))
      return false

    const style = win.getComputedStyle(el)
    if (style.display === 'none' || style.visibility === 'hidden')
      return false
    if (Number.parseFloat(style.opacity) === 0)
      return false

    const rect = el.getBoundingClientRect()
    // Off-screen .wr_mask (left:-9999px) and zero-box hidden dialogs.
    if (rect.width <= 0 || rect.height <= 0)
      return false
    if (rect.right <= 0 || rect.bottom <= 0)
      return false
    if (rect.left >= win.innerWidth || rect.top >= win.innerHeight)
      return false

    return true
  }

  function isScrollableElement(el) {
    if (!(el instanceof Element))
      return false

    // Perfect Scrollbar marks overflow even when overflow is hidden.
    if (el.classList.contains('ps--active-y') || el.classList.contains('ps--active-x'))
      return true

    const style = win.getComputedStyle(el)
    const oy = style.overflowY
    const ox = style.overflowX
    const yScrollable = (oy === 'auto' || oy === 'scroll' || oy === 'overlay')
      && el.scrollHeight > el.clientHeight + 1
    const xScrollable = (ox === 'auto' || ox === 'scroll' || ox === 'overlay')
      && el.scrollWidth > el.clientWidth + 1

    return yScrollable || xScrollable
  }

  function isEditableTarget(el) {
    if (!(el instanceof Element))
      return false
    const tag = el.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT')
      return true
    if (el.isContentEditable)
      return true
    return false
  }

  function pointerHasScrollableAncestor(target) {
    let el = target instanceof Element ? target : (target && target.parentElement)
    while (el && el !== doc.body && el !== doc.documentElement) {
      if (isEditableTarget(el) || isScrollableElement(el))
        return true
      el = el.parentElement
    }
    return false
  }

  function isOverlayOpen() {
    for (let i = 0; i < OVERLAY_SELECTORS.length; i++) {
      const nodes = doc.querySelectorAll(OVERLAY_SELECTORS[i])
      for (let j = 0; j < nodes.length; j++) {
        if (isElementVisible(nodes[j]))
          return true
      }
    }
    return false
  }

  function isPaginatedHorizontalMode() {
    return !!doc.querySelector('.wr_horizontalReader')
  }

  function dispatchArrowKey(key) {
    const opts = { key, code: key, keyCode: key === 'ArrowRight' ? 39 : 37, which: key === 'ArrowRight' ? 39 : 37, bubbles: true, cancelable: true }
    doc.dispatchEvent(new KeyboardEvent('keydown', opts))
    doc.dispatchEvent(new KeyboardEvent('keyup', opts))
  }

  function turnPage(direction) {
    if (direction === 'next') {
      const next = doc.querySelector('button.renderTarget_pager_button.renderTarget_pager_button_right')
      if (next && isElementVisible(next)) {
        next.click()
        return
      }
      dispatchArrowKey('ArrowRight')
      return
    }

    const prev = doc.querySelector('button.renderTarget_pager_button:not(.renderTarget_pager_button_right)')
    if (prev && isElementVisible(prev)) {
      prev.click()
      return
    }
    dispatchArrowKey('ArrowLeft')
  }

  function shouldHandleWheel(event) {
    if (!isPaginatedHorizontalMode())
      return false
    if (isOverlayOpen())
      return false
    if (pointerHasScrollableAncestor(event.target))
      return false
    return true
  }

  function onWheel(event) {
    if (!shouldHandleWheel(event)) {
      deltaCarry = 0
      return
    }

    // Reading surface is not a scroll container in horizontal mode; claim the wheel.
    event.preventDefault()

    const now = Date.now()
    if (now < cooldownUntil)
      return

    deltaCarry += event.deltaY
    if (Math.abs(deltaCarry) < WHEEL_THRESHOLD)
      return

    const direction = deltaCarry > 0 ? 'next' : 'prev'
    deltaCarry = 0
    cooldownUntil = now + COOLDOWN_MS
    turnPage(direction)
  }

  doc.addEventListener('wheel', onWheel, { passive: false, capture: false })

  return function uninstallWereadPageTurner() {
    doc.removeEventListener('wheel', onWheel, { capture: false })
  }
}

if (typeof globalThis !== 'undefined')
  globalThis.installWereadPageTurner = installWereadPageTurner
else if (typeof window !== 'undefined')
  window.installWereadPageTurner = installWereadPageTurner
