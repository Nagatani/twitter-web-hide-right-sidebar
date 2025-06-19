let styleElement = null;
const STYLE_ID = 'custom-home-style-for-twitter';

/**
 * 現在のURLをチェックし、必要に応じてCSSを適用・削除する関数
 */
async function updateStyles() {
  const pathname = window.location.pathname;
  console.log('Current pathname:', pathname);

  if (pathname === '/' ||
    pathname === '/messages' ||
    pathname.startsWith("/settings") ||
    pathname.startsWith("/i/")) {

    const existingStyle = document.getElementById(STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
      console.log('Home CSS removed.');
    }
  } else {
    
    if (!document.getElementById(STYLE_ID)) {
      try {
        const response = await fetch(chrome.runtime.getURL('styles/hide-sidebar.css'));
        const css = await response.text();
        
        styleElement = document.createElement('style');
        styleElement.id = STYLE_ID;
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
        console.log('Home CSS applied.');

      } catch (error) {
        console.error('Failed to fetch and apply CSS:', error);
      }
    }
  }
}

/**
 * ページの<title>タグの変更を監視するMutationObserver
 * X.comではページ遷移時に必ず<title>が書き換わるため、これをトリガーにする
 */
const observer = new MutationObserver(() => {
  // titleが変更されたら、URLを再チェックしてCSSの状態を更新する
  updateStyles();
});

// 最初の<title>要素を見つけて監視を開始
const titleElement = document.querySelector('title');
if (titleElement) {
  observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
}

// ページ読み込み時の初回実行
updateStyles();