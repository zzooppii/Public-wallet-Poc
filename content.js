// content.js - 웹페이지가 처음 열릴 때 실행되는 스크립트.
// 웹페이지 환경에서 메타마스크 객체를 사용하기 위해 injected.js를 주입합니다.

try {
  const scriptTag = document.createElement('script');
  scriptTag.src = chrome.runtime.getURL('injected.js');
  scriptTag.onload = function () {
    this.remove(); // 로드 완료 후 스크립트 태그 제거하여 깔끔하게 만듦
  };
  (document.head || document.documentElement).appendChild(scriptTag);
} catch (error) {
  console.error('Wallet injection failed.', error);
}

// 웹페이지(DApp)에서 온 메시지를 백그라운드로 전달해주는 중계기 역할
window.addEventListener('message', (event) => {
  // 웹페이지(injected.js)에서 보낸 메시지만 필터링
  if (event.source === window && event.data && event.data.direction === 'from-page-script') {
    // 크롬 백그라운드 스크립트로 전달
    chrome.runtime.sendMessage(event.data.message, (response) => {
      // 배경 스크립트에서 응답이 오면 다시 웹페이지로 돌려줍니다.
      window.postMessage({
        direction: 'from-content-script',
        response: response
      }, '*');
    });
  }
});
