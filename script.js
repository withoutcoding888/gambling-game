// ================= BIẾN TOÀN CỤC =================
let balance = 100000;

function updateBalance(amount) {
    balance += amount;
    document.getElementById('global-balance').innerText = balance;
    document.getElementById('pk-my-balance').innerText = balance; 
}

function switchTab(tabId) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.game-section').forEach(s => s.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById(tabId).classList.add('active');
}

// ================= HÀM XỬ LÝ MÀU NỀN THÔNG BÁO (MỚI) =================
// Tự động đổi màu nền thông báo dựa trên kết quả Thắng/Thua/Hòa
function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    el.innerText = text;
    
    if (type === 'win') {
        el.style.background = "linear-gradient(90deg, #006b3c, #00b38f)";
        el.style.boxShadow = "0 0 15px #00ffcc";
        el.style.borderColor = "#00ffcc";
        el.style.color = "#fff";
    } else if (type === 'lose') {
        el.style.background = "linear-gradient(90deg, #8a0000, #e74c3c)";
        el.style.boxShadow = "0 0 15px #ff0055";
        el.style.borderColor = "#ff0055";
        el.style.color = "#fff";
    } else if (type === 'tie') {
        el.style.background = "linear-gradient(90deg, #b8860b, #f1c40f)";
        el.style.boxShadow = "0 0 15px #ffd700";
        el.style.borderColor = "#ffd700";
        el.style.color = "#fff";
    } else {
        // Mặc định (Đang chơi / Chờ đợi)
        el.style.background = "#000";
        el.style.boxShadow = "inset 0 0 10px #00ffcc";
        el.style.borderColor = "#00ffcc";
        el.style.color = "#00ffcc";
    }
}

// ================= HỆ THỐNG BÀI CHUNG =================
const suits = ['♠', '♥', '♣', '♦'];
const values = ['2','3','4','5','6','7','8','9','10','J','Q','K','A'];

function createDeck() {
    let deck = [];
    for (let s of suits) {
        for (let i = 0; i < values.length; i++) {
            deck.push({ suit: s, val: values[i], weight: i + 2, color: (s === '♥' || s === '♦') ? '#e74c3c' : '#222' });
        }
    }
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
}

function getCardHTML(card, isFlipped = false, animClass = "", customId = "") {
    let flippedClass = isFlipped ? "flipped" : "";
    return `
    <div class="card-wrapper ${flippedClass} ${animClass} ${customId}">
        <div class="card-inner">
            <div class="card-face card-back"></div>
            <div class="card-face card-front" style="color: ${card.color}">
                <div>${card.val}</div><div class="suit">${card.suit}</div>
            </div>
        </div>
    </div>`;
}

// ================= 1. LOGIC SLOT CẦN GẠT =================
let isSpinningSlot = false;

function pullLever() {
    if (isSpinningSlot) return;
    const lever = document.getElementById('slot-lever');
    
    lever.classList.add('pulled');
    setTimeout(() => { lever.classList.remove('pulled'); }, 400);

    playSlot();
}

function playSlot() {
    const betInput = document.getElementById('slot-bet-input');
    let currentSlotBet = parseInt(betInput.value);

    if (isNaN(currentSlotBet) || currentSlotBet <= 0) return alert("Vui lòng nhập tiền cược hợp lệ!");
    if (balance < currentSlotBet) return alert("Bạn không đủ tiền!");
    
    updateBalance(-currentSlotBet); 
    isSpinningSlot = true; 
    betInput.disabled = true; 
    
    showMessage('msg-slot', "VẬN MAY ĐANG ĐẾN...", 'default');
    
    const r1El = document.getElementById('reel1');
    const r2El = document.getElementById('reel2');
    const r3El = document.getElementById('reel3');
    
    r1El.classList.add('reel-blur'); r2El.classList.add('reel-blur'); r3El.classList.add('reel-blur');

    const sym = ['🍒', '🍋', '🍉', '⭐', '🔔', '💎', '💵', '7'];
    const renderSymbol = (s) => s === '7' ? '<span style="color: #ff0055; text-shadow: 0 0 20px #ff0055; font-weight: 900;">7</span>' : s;

    let spins = 0;
    let res1, res2, res3;
    
    let timer = setInterval(() => {
        res1 = sym[Math.floor(Math.random() * sym.length)];
        res2 = sym[Math.floor(Math.random() * sym.length)];
        res3 = sym[Math.floor(Math.random() * sym.length)];
        
        r1El.innerHTML = renderSymbol(res1);
        r2El.innerHTML = renderSymbol(res2);
        r3El.innerHTML = renderSymbol(res3);
        
        spins++;
        
        if (spins > 20) {
            clearInterval(timer);
            r1El.classList.remove('reel-blur'); r2El.classList.remove('reel-blur'); r3El.classList.remove('reel-blur');
            
            if (res1 === res2 && res2 === res3) {
                let multiplier = 2; 
                if (res1 === '7') multiplier = 7;
                else if (res1 === '💵') multiplier = 4;
                else if (res1 === '💎') multiplier = 3;
                
                let win = currentSlotBet * multiplier;
                updateBalance(win); 
                showMessage('msg-slot', `🎉 NỔ HŨ! BẠN THẮNG ${win}$ 🎉`, 'win');
            } 
            else if (res1 === res2 || res2 === res3 || res1 === res3) {
                let win = Math.floor(currentSlotBet * 1);
                updateBalance(win); 
                showMessage('msg-slot', `HOÀ VỐN! BẠN NHẬN LẠI ${win}$`, 'tie');
            } 
            else { 
                showMessage('msg-slot', "TRẬT RỒI! HÃY KÉO CẦN LẠI", 'lose');
            }
            
            isSpinningSlot = false;
            betInput.disabled = false;
        }
    }, 50);
}

// ================= 2. LOGIC BLACKJACK 3D =================
let bjDeck = [], bjPlayer = [], bjDealer = [];
let currentBjBet = 0;

function getBjScore(hand) {
    let score = 0, aces = 0;
    hand.forEach(c => {
        if (c.val === 'A') { aces++; score += 11; }
        else if (['J','Q','K'].includes(c.val)) { score += 10; }
        else { score += parseInt(c.val); }
    });
    while (score > 21 && aces > 0) { score -= 10; aces--; }
    return score;
}

function updateBjUI(hideDealerCard = true) {
    document.getElementById('bj-player-hand').innerHTML = bjPlayer.map(c => getCardHTML(c, true, "anim-p")).join('');
    document.getElementById('bj-player-score').innerText = `(${getBjScore(bjPlayer)})`;
    let dealerHTML = "";
    if (hideDealerCard && bjDealer.length > 0) {
        dealerHTML = getCardHTML(bjDealer[0], true, "anim-d") + getCardHTML(bjDealer[1], false, "anim-d");
        document.getElementById('bj-dealer-score').innerText = `(?)`;
    } else {
        dealerHTML = bjDealer.map(c => getCardHTML(c, true, "anim-d")).join('');
        document.getElementById('bj-dealer-score').innerText = `(${getBjScore(bjDealer)})`;
    }
    document.getElementById('bj-dealer-hand').innerHTML = dealerHTML;
}

function startBlackjack() {
    const betInput = document.getElementById('bj-bet-input');
    let desiredBet = parseInt(betInput.value);
    
    if (isNaN(desiredBet) || desiredBet <= 0) return alert("Vui lòng nhập số tiền cược hợp lệ!");
    if (balance < desiredBet) return alert("Không đủ tiền cược!");
    
    currentBjBet = desiredBet;
    updateBalance(-currentBjBet);
    
    bjDeck = createDeck(); bjPlayer = [bjDeck.pop(), bjDeck.pop()]; bjDealer = [bjDeck.pop(), bjDeck.pop()];
    
    showMessage('msg-bj', "Hành động của bạn...", 'default');
    document.getElementById('bj-bet-area').style.display = "none"; 
    document.getElementById('btn-bj-restart').style.display = "none";
    document.getElementById('bj-play-btns').style.display = "flex"; 
    
    updateBjUI(true);
    if (getBjScore(bjPlayer) === 21) { endBlackjack("🎉 BLACKJACK! Bạn thắng tuyệt đối!", 'win'); updateBalance(currentBjBet * 2.5); }
}

function hitBlackjack() {
    bjPlayer.push(bjDeck.pop()); updateBjUI(true);
    if (getBjScore(bjPlayer) > 21) endBlackjack("💥 BẠN QUẮC (Bust)! Nhà cái thắng.", 'lose');
}

function standBlackjack() {
    document.getElementById('bj-play-btns').style.display = "none";
    function dealerDraw() {
        if (getBjScore(bjDealer) < 17) { bjDealer.push(bjDeck.pop()); updateBjUI(false); setTimeout(dealerDraw, 800); }
        else { compareBlackjack(); }
    }
    updateBjUI(false); setTimeout(dealerDraw, 800);
}

function compareBlackjack() {
    let pScore = getBjScore(bjPlayer); let dScore = getBjScore(bjDealer);
    if (dScore > 21) { updateBalance(currentBjBet * 2); endBlackjack("Nhà cái quắc! Bạn thắng.", 'win'); }
    else if (pScore > dScore) { updateBalance(currentBjBet * 2); endBlackjack("Bạn thắng!", 'win'); }
    else if (dScore > pScore) { endBlackjack("Bạn thua.", 'lose'); }
    else { updateBalance(currentBjBet); endBlackjack("Hòa! Trả lại tiền cược.", 'tie'); }
}

function endBlackjack(msg, status) {
    showMessage('msg-bj', msg, status);
    document.getElementById('btn-bj-restart').style.display = "block"; 
    document.getElementById('bj-play-btns').style.display = "none";
    updateBjUI(false);
}

function resetBlackjack() {
    document.getElementById('bj-player-hand').innerHTML = "";
    document.getElementById('bj-dealer-hand').innerHTML = "";
    document.getElementById('bj-player-score').innerText = "";
    document.getElementById('bj-dealer-score').innerText = "";
    
    showMessage('msg-bj', "Sẵn sàng đánh bại Nhà Cái!", 'default');
    
    document.getElementById('btn-bj-restart').style.display = "none";
    document.getElementById('bj-bet-area').style.display = "flex"; 
}

// ================= 3. LOGIC POKER =================
function evaluate5Cards(hand) {
    let sorted = [...hand].sort((a,b) => b.weight - a.weight);
    let w = sorted.map(c => c.weight);
    let isFlush = sorted.every(c => c.suit === sorted[0].suit);
    let isStraight = false; let straightHigh = 0;
    if (w[0] === w[1]+1 && w[1] === w[2]+1 && w[2] === w[3]+1 && w[3] === w[4]+1) { isStraight = true; straightHigh = w[0]; } 
    else if (w[0] === 14 && w[1] === 5 && w[2] === 4 && w[3] === 3 && w[4] === 2) { isStraight = true; straightHigh = 5; w = [5, 4, 3, 2, 14]; }
    let counts = {}; w.forEach(x => counts[x] = (counts[x] || 0) + 1);
    let freq = Object.entries(counts).map(([val, count]) => ({v: parseInt(val), c: count}));
    freq.sort((a, b) => b.c - a.c || b.v - a.v);
    let calc = (rankNum, c1=0, c2=0, c3=0, c4=0, c5=0) => rankNum * 10000000000 + c1 * 100000000 + c2 * 1000000 + c3 * 10000 + c4 * 100 + c5;

    if (isStraight && isFlush && straightHigh === 14) return { score: calc(10), name: "Royal Flush" };
    if (isStraight && isFlush) return { score: calc(9, straightHigh), name: "Straight Flush" };
    if (freq[0].c === 4) return { score: calc(8, freq[0].v, freq[1].v), name: "Four of a Kind" };
    if (freq[0].c === 3 && freq[1].c === 2) return { score: calc(7, freq[0].v, freq[1].v), name: "Full House" };
    if (isFlush) return { score: calc(6, w[0], w[1], w[2], w[3], w[4]), name: "Flush" };
    if (isStraight) return { score: calc(5, straightHigh), name: "Straight" };
    if (freq[0].c === 3) return { score: calc(4, freq[0].v, freq[1].v, freq[2].v), name: "Three of a Kind" };
    if (freq[0].c === 2 && freq[1].c === 2) return { score: calc(3, freq[0].v, freq[1].v, freq[2].v), name: "Two Pair" };
    if (freq[0].c === 2) return { score: calc(2, freq[0].v, freq[1].v, freq[2].v, freq[3].v), name: "Pair" };
    return { score: calc(1, w[0], w[1], w[2], w[3], w[4]), name: "High Card" };
}

function getCombinations(arr, size) {
    let result = [];
    function combine(start, combo) {
        if (combo.length === size) { result.push(combo); return; }
        for (let i = start; i < arr.length; i++) combine(i + 1, combo.concat([arr[i]]));
    }
    combine(0, []); return result;
}

function getBestHand(holeCards, commCards) {
    if (commCards.length < 3) return {score: 0, name: ""};
    let combos = getCombinations(holeCards.concat(commCards), 5);
    let bestRank = { score: -1, name: "" };
    combos.forEach(combo => {
        let rank = evaluate5Cards(combo);
        if (rank.score > bestRank.score) bestRank = rank;
    });
    return bestRank;
}

let txDeck = [], txPlayer = [], txDealer = [], txCommunity = [];
let txState = 0; let txPot = 0; let currentBetToCall = 0;
const MIN_BET = 50;

function updateRankBadge(elId, handData) {
    const el = document.getElementById(elId);
    if (handData.name) { el.innerText = handData.name; el.style.display = "block"; } else { el.style.display = "none"; }
}

function toggleBetPanel(show) {
    const panel = document.getElementById('bet-panel'); const mainControls = document.getElementById('pk-controls-play');
    if (show) {
        panel.style.display = "flex"; mainControls.style.display = "none";
        const slider = document.getElementById('bet-slider');
        slider.max = balance; slider.min = currentBetToCall > 0 ? currentBetToCall * 2 : MIN_BET;
        slider.value = slider.min; updateSliderText(slider.value);
    } else { panel.style.display = "none"; mainControls.style.display = "flex"; }
}

function updateSliderText(val) { document.getElementById('slider-val').innerText = val; }

function setQuickBet(multiplier) {
    const slider = document.getElementById('bet-slider');
    let amount = (multiplier === 'allin') ? balance : Math.floor(txPot * multiplier);
    if (amount < parseInt(slider.min)) amount = slider.min; if (amount > balance) amount = balance;
    slider.value = amount; updateSliderText(amount);
}

function startTexas() {
    if (balance < MIN_BET) return alert("Hết tiền cược!");
    updateBalance(-MIN_BET); txPot = MIN_BET * 2; currentBetToCall = 0;
    document.getElementById('pk-pot').innerText = txPot;
    txDeck = createDeck(); txPlayer = [txDeck.pop(), txDeck.pop()]; txDealer = [txDeck.pop(), txDeck.pop()]; txCommunity = [];
    
    document.getElementById('pk-community-hand').innerHTML = `<div class="card-empty"></div>`.repeat(5);
    document.getElementById('pk-dealer-rank').style.display = "none"; updateRankBadge('pk-player-rank', {name: ""});
    
    document.getElementById('pk-player-hand').innerHTML = getCardHTML(txPlayer[0], true, "anim-p") + getCardHTML(txPlayer[1], true, "anim-p");
    document.getElementById('pk-dealer-hand').innerHTML = getCardHTML(txDealer[0], false, "anim-d", "dealer-card") + getCardHTML(txDealer[1], false, "anim-d", "dealer-card");

    document.getElementById('pk-controls-start').style.display = "none"; document.getElementById('pk-controls-play').style.display = "flex";
    document.getElementById('btn-check-call').innerText = "CHECK"; 
    
    showMessage('msg-pk', "Vòng Pre-Flop: Chọn hành động của bạn.", 'default');
    txState = 1;
}

function playerAction(actionType) {
    if (actionType === 'fold') { 
        showMessage('msg-pk', "Bạn đã Úp Bỏ. Nhà cái thắng " + txPot + "$", 'lose'); 
        resetPoker(); 
        return; 
    }
    if (actionType === 'check') {
        if (currentBetToCall > 0) {
            if (balance < currentBetToCall) return alert("Không đủ tiền Theo!");
            updateBalance(-currentBetToCall); txPot += currentBetToCall; 
            showMessage('msg-pk', "Bạn Đã THEO " + currentBetToCall + "$.", 'default');
        } else { 
            showMessage('msg-pk', "Bạn CHECK.", 'default'); 
        }
        currentBetToCall = 0; setTimeout(dealerAction, 800);
    }
}

function confirmBet() {
    const betAmount = parseInt(document.getElementById('bet-slider').value);
    if (balance < betAmount) return alert("Lỗi số dư!");
    updateBalance(-betAmount); txPot += betAmount; currentBetToCall = betAmount;
    document.getElementById('pk-pot').innerText = txPot; 
    showMessage('msg-pk', "Bạn đã TỐ thêm " + betAmount + "$!", 'default');
    toggleBetPanel(false); document.getElementById('pk-controls-play').style.display = "none"; setTimeout(dealerAction, 1200); 
}

function dealerAction() {
    document.getElementById('pk-controls-play').style.display = "flex";
    if (currentBetToCall > 0) { 
        txPot += currentBetToCall; 
        showMessage('msg-pk', "Nhà cái ĐÃ THEO " + currentBetToCall + "$.", 'default'); 
        currentBetToCall = 0; 
    } 
    else { 
        showMessage('msg-pk', "Nhà cái CHECK.", 'default'); 
    }
    document.getElementById('pk-pot').innerText = txPot; document.getElementById('btn-check-call').innerText = "CHECK"; setTimeout(advanceStreet, 500);
}

function flipNewCards() {
    setTimeout(() => {
        document.querySelectorAll('.card-wrapper:not(.flipped):not(.dealer-card)').forEach(el => el.classList.add('flipped'));
        updateRankBadge('pk-player-rank', getBestHand(txPlayer, txCommunity));
    }, 300);
}

function advanceStreet() {
    let commEl = document.getElementById('pk-community-hand');
    if (txState === 1) { 
        txCommunity.push(txDeck.pop(), txDeck.pop(), txDeck.pop());
        let html = ""; for (let i=0; i<3; i++) html += getCardHTML(txCommunity[i], false, "anim-c"); html += `<div class="card-empty"></div><div class="card-empty"></div>`;
        commEl.innerHTML = html; flipNewCards(); txState = 2; 
        showMessage('msg-pk', "Vòng FLOP. Hãy ra quyết định.", 'default');
    } else if (txState === 2) { 
        txCommunity.push(txDeck.pop()); let html = ""; for (let i=0; i<4; i++) html += getCardHTML(txCommunity[i], i < 3, i === 3 ? "anim-c" : ""); html += `<div class="card-empty"></div>`;
        commEl.innerHTML = html; flipNewCards(); txState = 3; 
        showMessage('msg-pk', "Vòng TURN.", 'default');
    } else if (txState === 3) { 
        txCommunity.push(txDeck.pop()); let html = ""; for (let i=0; i<5; i++) html += getCardHTML(txCommunity[i], i < 4, i === 4 ? "anim-c" : "");
        commEl.innerHTML = html; flipNewCards(); txState = 4; 
        showMessage('msg-pk', "Vòng RIVER.", 'default');
    } else if (txState === 4) { document.getElementById('pk-controls-play').style.display = "none"; showdownTexas(); }
}

function showdownTexas() {
    document.querySelectorAll('.dealer-card').forEach(el => el.classList.add('flipped'));
    let pBest = getBestHand(txPlayer, txCommunity); let dBest = getBestHand(txDealer, txCommunity);
    updateRankBadge('pk-dealer-rank', dBest);
    
    if (pBest.score > dBest.score) { 
        updateBalance(txPot); 
        showMessage('msg-pk', `🎉 BẠN THẮNG với ${pBest.name}! Ăn Pot ${txPot}$`, 'win'); 
    } 
    else if (dBest.score > pBest.score) { 
        showMessage('msg-pk', `💥 NHÀ CÁI THẮNG với ${dBest.name}!`, 'lose'); 
    } 
    else { 
        updateBalance(txPot / 2); 
        showMessage('msg-pk', "HÒA BÀI! Chia đôi Pot.", 'tie'); 
    }
    resetPoker();
}

function resetPoker() {
    document.getElementById('pk-controls-play').style.display = "none"; toggleBetPanel(false);
    document.getElementById('pk-controls-start').style.display = "flex"; document.getElementById('btn-check-call').innerText = "CHECK";
    txState = 0; currentBetToCall = 0;
}

// ================= 4. LOGIC ROULETTE & ÂM THANH =================
const rlReds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36];
// Trình tự chính xác của các số trên vòng quay Châu Âu
const wheelSeq = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];

let currentRlChip = 10;
let rlBets = {}; 
let isRlSpinning = false;
let currentWheelAngle = 0;

// Hệ thống tạo âm thanh va chạm tự động
// Hệ thống tạo âm thanh va chạm (Đã chỉnh âm "Lạch Cạch" gỗ)
// Hệ thống tạo âm thanh va chạm chuẩn "Cạch Cạch" đanh tiếng gỗ
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playTickSound() {
    if(audioCtx.state === 'suspended') audioCtx.resume();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // Đổi sang sóng triangle (tam giác) để lấy họa âm giòn, đanh như vật rắn va chạm
    osc.type = 'triangle'; 
    
    // Đẩy tần số xuất phát lên cực cao (2500Hz) lướt xuống nhanh để tạo tiếng click mộc
    osc.frequency.setValueAtTime(2500, audioCtx.currentTime); 
    osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + 0.015); 
    
    // Ép âm lượng tắt cực bạo và cực ngắn (chỉ 0.015 giây) để loại bỏ hoàn toàn tiếng "bụp"
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.015);
    
    osc.start();
    osc.stop(audioCtx.currentTime + 0.015);
}

// Khởi tạo Bàn Cược và Bánh Xe
function initRoulette() {
    // 1. VẼ BÁNH XE
    const wheelBg = document.getElementById('rl-wheel-bg');
    let gradientParts = [];
    let html = '';
    const anglePerSlice = 360 / 37;
    
    for(let i = 0; i < 37; i++) {
        let num = wheelSeq[i];
        let color = (num === 0) ? '#27ae60' : (rlReds.includes(num) ? '#e74c3c' : '#222');
        
        let startAngle = i * anglePerSlice;
        let endAngle = (i + 1) * anglePerSlice;
        gradientParts.push(`${color} ${startAngle}deg ${endAngle}deg`);
        
        // Căn số nằm giữa vạch
        let textAngle = startAngle + anglePerSlice/2;
        html += `<div class="rl-wheel-num" style="transform: rotate(${textAngle}deg)">${num}</div>`;
    }
    wheelBg.style.background = `conic-gradient(${gradientParts.join(', ')})`;
    wheelBg.innerHTML = html;

    // 2. VẼ BÀN CƯỢC CHÍP
    const board = document.getElementById('rl-board');
    let boardHtml = `<div class="rl-cell rl-zero" onclick="placeRlBet('num_0')">0</div>`;
    for (let r = 3; r >= 1; r--) {
        for (let c = 0; c < 12; c++) {
            let num = r + c * 3;
            let colorClass = rlReds.includes(num) ? "rl-red" : "rl-black";
            boardHtml += `<div class="rl-cell ${colorClass}" style="grid-row: ${4-r}; grid-column: ${c+2}" onclick="placeRlBet('num_${num}')">${num}</div>`;
        }
    }
    boardHtml += `<div class="rl-cell rl-dozen" style="grid-column: 2 / span 4" onclick="placeRlBet('doz_1')">1st 12</div>`;
    boardHtml += `<div class="rl-cell rl-dozen" style="grid-column: 6 / span 4" onclick="placeRlBet('doz_2')">2nd 12</div>`;
    boardHtml += `<div class="rl-cell rl-dozen" style="grid-column: 10 / span 4" onclick="placeRlBet('doz_3')">3rd 12</div>`;
    
    boardHtml += `<div class="rl-cell rl-half" style="grid-column: 2 / span 2" onclick="placeRlBet('half_low')">1-18</div>`;
    boardHtml += `<div class="rl-cell rl-half" style="grid-column: 4 / span 2" onclick="placeRlBet('even')">CHẴN</div>`;
    boardHtml += `<div class="rl-cell rl-half rl-red" style="grid-column: 6 / span 2" onclick="placeRlBet('color_red')">ĐỎ</div>`;
    boardHtml += `<div class="rl-cell rl-half rl-black" style="grid-column: 8 / span 2" onclick="placeRlBet('color_black')">ĐEN</div>`;
    boardHtml += `<div class="rl-cell rl-half" style="grid-column: 10 / span 2" onclick="placeRlBet('odd')">LẺ</div>`;
    boardHtml += `<div class="rl-cell rl-half" style="grid-column: 12 / span 2" onclick="placeRlBet('half_high')">19-36</div>`;
    board.innerHTML = boardHtml;
}
initRoulette(); // Gọi vẽ bàn ngay lập tức

function selectRlChip(amount, el) {
    currentRlChip = amount;
    document.querySelectorAll('.rl-chip').forEach(c => c.classList.remove('active'));
    el.classList.add('active');
}

function placeRlBet(betType) {
    if (isRlSpinning) return;
    if (balance < currentRlChip) return alert("Bạn không đủ tiền!");
    
    updateBalance(-currentRlChip);
    if (!rlBets[betType]) rlBets[betType] = 0;
    rlBets[betType] += currentRlChip;
    
    // Cập nhật chip hiển thị trên bàn
    document.querySelectorAll('.placed-chip').forEach(c => c.remove());
    for (let type in rlBets) {
        let cell = document.querySelector(`[onclick="placeRlBet('${type}')"]`);
        if (cell) {
            let chip = document.createElement('div');
            chip.className = 'placed-chip';
            chip.innerText = rlBets[type] >= 1000 ? (rlBets[type]/1000) + 'k' : rlBets[type];
            cell.appendChild(chip);
        }
    }
}

function clearRlBets() {
    if (isRlSpinning) return;
    let refund = 0;
    for (let type in rlBets) refund += rlBets[type];
    updateBalance(refund);
    rlBets = {};
    document.querySelectorAll('.placed-chip').forEach(c => c.remove());
}

function spinRoulette() {
    if (isRlSpinning) return;
    if (Object.keys(rlBets).length === 0) return alert("Vui lòng đặt chip lên bàn trước khi quay!");
    
    isRlSpinning = true;
    showMessage('msg-rl', "BÓNG ĐANG LĂN...", 'default');
    
    const wheelBg = document.getElementById('rl-wheel-bg');
    const ballWrapper = document.getElementById('rl-ball-wrapper');
    const ball = document.getElementById('rl-ball');
    
    // Random số trúng thưởng
    const winIndex = Math.floor(Math.random() * 37);
    const winningNum = wheelSeq[winIndex];
    
    // Tính toán góc để quay bánh xe (Đưa số trúng thưởng lên góc 12h)
    const sliceAngle = 360 / 37;
    const targetAngle = 360 * 5 - (winIndex * sliceAngle) - (sliceAngle / 2);
    
    // Reset trạng thái quay
    wheelBg.style.transition = "none";
    wheelBg.style.transform = `rotate(${currentWheelAngle % 360}deg)`;
    ballWrapper.style.transition = "none";
    ballWrapper.style.transform = `rotate(0deg)`;
    ball.classList.remove('ball-bouncing');
    
    // Force Reflow
    void wheelBg.offsetWidth;
    
    // Kích hoạt Quay
    currentWheelAngle = targetAngle;
    wheelBg.style.transition = "transform 5s cubic-bezier(0.2, 0.1, 0.2, 1)";
    wheelBg.style.transform = `rotate(${currentWheelAngle}deg)`;
    
    ballWrapper.style.transition = "transform 5s cubic-bezier(0.2, 0.1, 0.2, 1)";
    ballWrapper.style.transform = `rotate(-1440deg)`; // Bóng quay ngược chiều 4 vòng và chốt hạ ở góc 12h
    
    // Thêm hiệu ứng Bóng nảy rớt vào lỗ
    ball.classList.add('ball-bouncing');

    // MÔ PHỎNG ÂM THANH BÓNG LĂN CHẬM DẦN
    let delay = 30;
    let spinTime = 0;
    function playBounceSound() {
        if (!isRlSpinning) return;
        playTickSound();
        delay *= 1.08; // Càng quay delay càng lâu (chậm dần)
        spinTime += delay;
        if (spinTime < 4500) setTimeout(playBounceSound, delay);
    }
    playBounceSound();
    
    // Chờ 5s cho quay xong để chốt sổ
    setTimeout(() => {
        calculateRlWin(winningNum);
        isRlSpinning = false;
        rlBets = {};
        setTimeout(() => {
            if(!isRlSpinning) document.querySelectorAll('.placed-chip').forEach(c => c.remove());
        }, 3000); 
    }, 5000);
}

function calculateRlWin(winNum) {
    let totalWin = 0;
    let isRed = rlReds.includes(winNum);
    let isBlack = (!isRed && winNum !== 0);
    let isEven = (winNum !== 0 && winNum % 2 === 0);
    let isOdd = (winNum !== 0 && winNum % 2 !== 0);
    
    for (let type in rlBets) {
        let betAmt = rlBets[type];
        if (type === `num_${winNum}`) totalWin += betAmt * 36;
        if (winNum === 0) continue; 
        
        if (type === 'color_red' && isRed) totalWin += betAmt * 2;
        if (type === 'color_black' && isBlack) totalWin += betAmt * 2;
        if (type === 'even' && isEven) totalWin += betAmt * 2;
        if (type === 'odd' && isOdd) totalWin += betAmt * 2;
        if (type === 'half_low' && winNum >= 1 && winNum <= 18) totalWin += betAmt * 2;
        if (type === 'half_high' && winNum >= 19 && winNum <= 36) totalWin += betAmt * 2;
        if (type === 'doz_1' && winNum >= 1 && winNum <= 12) totalWin += betAmt * 3;
        if (type === 'doz_2' && winNum >= 13 && winNum <= 24) totalWin += betAmt * 3;
        if (type === 'doz_3' && winNum >= 25 && winNum <= 36) totalWin += betAmt * 3;
    }
    
    if (totalWin > 0) {
        updateBalance(totalWin);
        showMessage('msg-rl', `SỐ ${winNum} - TRÚNG LỚN! BẠN ĂN ${totalWin}$ 🎉`, 'win');
    } else {
        showMessage('msg-rl', `SỐ ${winNum} - Ván này nhà cái hốt!`, 'lose');
    }
}