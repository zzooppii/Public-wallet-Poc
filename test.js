// test.js
// 브라우저 없이 Node.js 터미널 환경에서 지갑의 "3단 통신 구조"가 어떻게 작동하는지 증명하는 로직 테스트입니다.

console.log("🦊 [MetaMask Clone] 통신 아키텍처 로직 테스트 시작...\n");

// ==========================================
// 1. 상태 변수 및 Mock(가짜 브라우저 환경) 
// ==========================================
const MY_WALLET_ADDRESS = "0xYourCustomWalletAddress1234...";

// ==========================================
// 2. 모의 Background Script (지갑의 두뇌)
// ==========================================
function mockBackgroundScript(request, sendResponse) {
    console.log(`[🛡️ Background] DApp으로부터 요청 수신 -> Method: ${request.method}`);
    
    if (request.method === 'eth_requestAccounts') {
        console.log(`[🛡️ Background] 지갑 계정 요청 확인. 내부 메모리에서 주소를 반환합니다.`);
        // 실제로는 여기서 팝업창 띄우고 서명 받는 로직이 들어갑니다.
        sendResponse({ result: [MY_WALLET_ADDRESS] });
    } else {
        sendResponse({ error: "지원하지 않는 메서드입니다." });
    }
}

// ==========================================
// 3. 모의 Content Script (중계기)
// ==========================================
function mockContentScript(messageFromDApp, callbackToDApp) {
    console.log(`[📡 ContentScript] DApp 메시지 가로챔! 백그라운드로 안전하게 스르륵 넘깁니다.`);
    
    // 크롬 백그라운드로 메시지를 전달 (chrome.runtime.sendMessage 역할)
    mockBackgroundScript(messageFromDApp, (responseFromBackground) => {
        console.log(`[📡 ContentScript] 백그라운드에서 응답 받음! DApp으로 다시 돌려줍니다.`);
        callbackToDApp(responseFromBackground);
    });
}

// ==========================================
// 4. 모의 Injected Script (DApp에 주입된 가짜 메타마스크 객체)
// ==========================================
const mockWindowEthereum = {
    isMetaMask: true,
    request: async (args) => {
        return new Promise((resolve, reject) => {
            console.log(`\n[🔗 DApp] window.ethereum.request('${args.method}') 호출됨!`);
            
            // Content Script로 메시지 전송 (window.postMessage 역할)
            mockContentScript(args, (response) => {
                if(response.error) {
                    reject(response.error);
                } else {
                    resolve(response.result);
                }
            });
        });
    }
};

// ==========================================
// 🧪 테스트 실행부 (가상의 Dapp - 예: Uniswap)
// ==========================================
async function runDAppTest() {
    try {
        console.log("-------------------------------------------------");
        console.log("🌐 가상의 웹사이트(DApp)에서 지갑 연결 버튼 클릭!");
        console.log("-------------------------------------------------");
        
        // 유니스왑이 내 지갑 주소를 달라고 요청함
        const accounts = await mockWindowEthereum.request({ method: 'eth_requestAccounts' });
        
        console.log("\n--------------------------------------------------");
        console.log(`🎉 [DApp] 로그인 성공! 가져온 지갑 주소: ${accounts[0]}`);
        console.log("--------------------------------------------------");
    } catch (error) {
        console.error("에러 발생:", error);
    }
}

runDAppTest();
