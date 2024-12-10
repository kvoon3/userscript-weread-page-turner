// ==UserScript==
// @name         Wechat Page Turner
// @namespace    https://kvoonme.netlify.app/
// @version      0.0.0
// @description  Better WeRead web page turning experience
// @author       Kevin Kwong
// @homepageURL  https://github.com/kvoon3/userscript-weread-page-turner
// @supportURL   https://github.com/kvoon3/userscript-weread-page-turner
// @match        https://weread.qq.com/web/reader/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=weread.qq.com
// @grant        none
// @run-at       document-body
// @license      MIT
// ==/UserScript==

(function () {
  'use strict'
  document.addEventListener('wheel', (e) => {
    e.preventDefault()

    const to = e.deltaY > 0 ? 'next' : 'prev'

    if (to === 'next') {
      document
        .querySelector('.renderTarget_pager_button.renderTarget_pager_button_right')
        ?.click()
    }
    else {
      document
        .querySelector('.renderTarget_pager_button:not(.renderTarget_pager_button_right)')
        ?.click()
    }
  }, { passive: false })
})()
