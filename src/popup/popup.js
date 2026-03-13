// popup.js - 지갑 팝업 UI의 동작 로직을 담당합니다.

document.getElementById('send-btn').addEventListener('click', () => {
    alert("이것은 PoC 지갑입니다. 실제 송금 로직은 연결되지 않았습니다!");
});

document.getElementById('lock-btn').addEventListener('click', () => {
    alert("지갑이 로컬 메모리에서 잠금처리 되었습니다 (마치 AES 암호화로 돌아간 것처럼).");
    document.querySelector('.balance').innerText = 'Locked';
    document.getElementById('address-box').innerText = '0xHidden...';
});
