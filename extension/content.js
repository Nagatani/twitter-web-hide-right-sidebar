let styleElement = null;
const STYLE_ID = 'custom-home-style-for-twitter';

/**
 * 現在のURLをチェックし、必要に応じてCSSを適用・削除する関数
 */
async function updateStyles() {
  const pathname = window.location.pathname;
  // console.log('Hide-Sidebar: Current pathname:', pathname);

  // パスが特定の条件に合致する場合はCSSを削除
  if (pathname === '/' ||
    pathname === '/tos' ||
    pathname === '/privacy' ||
    pathname.startsWith('/messages') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/i/')) {

    const existingStyle = document.getElementById(STYLE_ID);
    if (existingStyle) {
      existingStyle.remove();
      console.log('Hide-Sidebar: Home CSS removed.');
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
        console.log('Hide-Sidebar: Home CSS applied.');

      } catch (error) {
        console.error('Hide-Sidebar: Failed to fetch and apply CSS:', error);
      }
    }
  }
}

/**
 * ページの<title>タグの変更を監視するMutationObserver
 * X.comではページ遷移時に必ず<title>が書き換わるため、これをトリガーにする
 */
const observer = new MutationObserver(() => {
  //console.log('Hide-Sidebar: Observer triggered! Title has changed.');
  updateStyles();
});


/**
 * titleタグを探して、見つかれば監視を開始する関数
 * @returns {boolean} 成功すればtrue、失敗すればfalseを返す
 */
function tryStartObserver() {
  const titleElement = document.querySelector('title');

  if (titleElement) {
    console.log('Hide-Sidebar: ✅ Title element found. Starting observer.');
    observer.observe(titleElement, { childList: true, characterData: true, subtree: true });
    return true; // 監視開始に成功
  }

  return false; // titleが見つからず失敗
}


/**
 * メインの処理
 */
function main() {
  // まず一度、監視の開始を試みる
  if (tryStartObserver()) {
    updateStyles(); // 成功したら、初回分のスタイル更新を実行
    return;
  }

  // 失敗した場合、titleが見つかるまでリトライ処理を開始する
  console.log('Hide-Sidebar: Title not found, will retry every 500ms...');

  const retryInterval = setInterval(() => {
    // リトライで監視開始を試みる
    if (tryStartObserver()) {
      // 成功したら、インターバルを停止
      clearInterval(retryInterval);
      console.log('Hide-Sidebar: Retry successful. Observer started.');
      updateStyles(); // 成功したので、初回分のスタイル更新を実行
    }
  }, 500); // 500ミリ秒（0.5秒）ごとにリトライ

  // 念のため、10秒経っても見つからない場合はリトライを停止する（無限ループ防止）
  setTimeout(() => {
    clearInterval(retryInterval);
  }, 10000);
}

// 処理を開始
main();