// background.js - 확장 프로그램의 두뇌 역할을 하는 백그라운드 스크립트.
// 실제 키 저장 및 원격 노드(RPC)와의 통신을 관리합니다.

// [주의] 테스트용 더미 데이터입니다. (실제로는 로컬 스토리지에 암호화 보관 필요)
const MY_WALLET_ADDRESS = "0xYourCustomWalletAddress1234...";

// Content Script(DApp)로부터 오는 요청 처리기
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log("Background received a request from DApp:", request.method);

  // DApp의 "지갑 연결" 요청 (eth_requestAccounts) 가로채기
  if (request.method === 'eth_requestAccounts' || request.method === 'eth_accounts') {
    // 팝업창을 띄워 사용자 승인을 받아야 하지만, 이번 PoC에서는 바로 주소를 넘겨주며 연결된 척을 합니다.
    console.log("DApp requested account! Giving the dummy address.");
    sendResponse({ result: [MY_WALLET_ADDRESS] });
    return true; // 비동기 응답 처리 허용
  }
  
  // DApp의 "서명/트랜잭션 요청" 가로채기 (eth_sendTransaction)
  else if (request.method === 'eth_sendTransaction') {
    // 여기서 서명 팝업 UI를 띄워야 함
    console.log("DApp requested transaction:", request.params);
    
    // 단순 PoC이므로 이 요청을 임시로 차단하거나 에러를 내뿜어 확인 가능성을 테스트
    sendResponse({ error: "User rejected the transaction from background script." });
    return true;
  }
  
  // 처리할 수 없는 기타 모든 요청
  else {
    console.log("Unsupported method:", request.method);
    sendResponse({ error: `Method ${request.method} not supported in this PoC wallet.` });
    return true;
  }
});
