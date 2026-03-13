// injected.js - 웹페이지의 window 전역 객체에 직접 삽입되는 코드
// DApp(예: 유니스왑)은 window.ethereum이 있는지를 기준으로 지갑 설치 여부를 판단합니다.

window.ethereum = {
  isMetaMask: true, // DApp에게 메타마스크라고 거짓말(?)을 칩니다.
  // RPC 메소드 요청을 가로채는 핵심 함수
  request: async (args) => {
    return new Promise((resolve, reject) => {
      // 1. DApp이 window.ethereum.request()를 쓰면, 이 이벤트를 Content Script로 보냅니다.
      window.postMessage({
        direction: 'from-page-script',
        message: args
      }, '*');

      // 2. Content Script -> Background 로 갔다가 리턴되는 이벤트를 기다립니다.
      const handleResponse = (event) => {
        if (event.source === window && event.data && event.data.direction === 'from-content-script') {
          window.removeEventListener('message', handleResponse);
          
          if (event.data.response.error) {
            reject(new Error(event.data.response.error));
          } else {
            resolve(event.data.response.result);
          }
        }
      };
      window.addEventListener('message', handleResponse);
    });
  }
};

console.log('✅ Custom Wallet Provider Injected!');
