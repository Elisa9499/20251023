// =================================================================
// 步驟一：模擬成績數據接收
// -----------------------------------------------------------------


// let scoreText = "成績分數: " + finalScore + "/" + maxScore;
// 確保這是全域變數
let finalScore = 0; 
let maxScore = 0;
let scoreText = ""; // 用於 p5.js 繪圖的文字

// !!! 新增：用於煙火效果的全域變數 !!!
let fireworks = []; // 用來存放 Firework 物件的陣列
let gravity; // 重力向量


window.addEventListener('message', function (event) {
    // 執行來源驗證...
    // ...
    const data = event.data;
    
    if (data && data.type === 'H5P_SCORE_RESULT') {
        
        // !!! 關鍵步驟：更新全域變數 !!!
        finalScore = data.score; // 更新全域變數
        maxScore = data.maxScore;
        scoreText = `最終成績分數: ${finalScore}/${maxScore}`;
        
        console.log("新的分數已接收:", scoreText); 
        
        // ----------------------------------------
        // 關鍵步驟 2: 呼叫重新繪製 (見方案二)
        // ----------------------------------------
        if (typeof redraw === 'function') {
            redraw(); 
        }
    }
}, false);


// =================================================================
// 步驟二：使用 p5.js 繪製分數 (在網頁 Canvas 上顯示)
// -----------------------------------------------------------------

function setup() { 
    // ... (其他設置)
    createCanvas(windowWidth / 2, windowHeight / 2); 
    background(255); 
    // !!! 新增：設定重力向量和色調模式 !!!
    gravity = createVector(0, 0.2); // 模擬向下的重力
    colorMode(HSB); // 使用 HSB 模式方便顏色變化 (Hue, Saturation, Brightness)

    // 煙火是動態的，因此需要 noLoop() 以外的持續繪製
    // 由於您的原始程式碼使用 noLoop()，我們在 draw() 結尾手動呼叫 loop() / noLoop()
    // 或直接移除 noLoop()，改為在 draw() 裡檢查是否需要更新煙火
} 

// score_display.js 中的 draw() 函數片段

function draw() { 
    // -----------------------------------------------------------------
    // 由於煙火是動態的，我們需要每幀更新畫面，但要保留一點尾跡效果。
    // 使用帶透明度的黑色背景，可以模擬尾跡。
    background(0, 0, 0, 0.15); // HSB: 黑色，輕微透明
    
    // 如果您希望分數不為 0 時才開始畫布為黑色，請將其放入 if (percentage > 0) 區塊
    // 為了煙火效果，我們假設畫布總是黑色的。
    
    // 計算百分比
    let percentage = (finalScore / maxScore) * 100;
    
    // -----------------------------------------------------------------
    // C. 煙火特效的觸發與更新 (新增步驟)
    // -----------------------------------------------------------------
    
    // 檢查是否滿分 (100%)
    if (finalScore === maxScore && maxScore > 0) {
        // A. 滿分或高分：顯示鼓勵文本，使用鮮豔顏色
        textSize(80); 
        textAlign(CENTER);
        fill(100, 200, 255); // 滿分時使用亮色系
        text("恭喜！滿分成就解鎖！", width / 2, height / 2 - 50);

        // 每隔一定機率 (例如 5%) 發射一個新的煙火
        if (random(1) < 0.05) {
            fireworks.push(new Firework());
        }

    } else if (percentage >= 90) {
        // 90% 以上 (但非滿分) 的邏輯
        textSize(80); 
        textAlign(CENTER);
        fill(100, 255, 255); // 綠色
        text("恭喜！優異成績！", width / 2, height / 2 - 50);
        
    } else if (percentage >= 60) {
        // 中等分數：顯示一般文本，使用黃色 [6]
        textSize(80); 
        textAlign(CENTER);
        fill(45, 255, 255); // 黃色
        text("成績良好，請再接再厲。", width / 2, height / 2 - 50);
        
    } else if (percentage >= 0) {
        // 低分：顯示警示文本，使用紅色 [6]
        textSize(80); 
        textAlign(CENTER);
        fill(0, 200, 255); // 紅色
        text("需要加強努力！", width / 2, height / 2 - 50);
        
    } else {
        // 尚未收到分數或分數為 0
        textSize(80); 
        textAlign(CENTER);
        fill(0, 0, 150); // 灰色
        text(scoreText, width / 2, height / 2);
    }
    
    // 顯示具體分數
    textSize(50);
    fill(0, 0, 255); // 白色/亮色
    text(`得分: ${finalScore}/${maxScore}`, width / 2, height / 2 + 50);
    
    
    // -----------------------------------------------------------------
    // B. 根據分數觸發不同的幾何圖形反映 (畫面反映二) - 僅保留非滿分和非 0 的邏輯
    // -----------------------------------------------------------------
    
    if (percentage >= 90 && finalScore < maxScore) {
        // 畫一個大圓圈代表完美 [7]
        fill(100, 255, 255, 0.6); // 帶透明度
        noStroke();
        circle(width / 2, height / 2 + 150, 150);
        
    } else if (percentage >= 60) {
        // 畫一個方形 [4]
        fill(45, 255, 255, 0.6);
        rectMode(CENTER);
        rect(width / 2, height / 2 + 150, 150, 150);
    }
    
    // -----------------------------------------------------------------
    // D. 更新和繪製煙火 (新增步驟)
    // -----------------------------------------------------------------
    
    // 倒序迴圈以安全地移除已完成的煙火
    for (let i = fireworks.length - 1; i >= 0; i--) {
        fireworks[i].update();
        fireworks[i].show();
        
        if (fireworks[i].done()) {
            // 煙火表演結束，從陣列中移除
            fireworks.splice(i, 1);
        }
    }
    
    // 如果有煙火在表演，強制執行 loop()
    if (fireworks.length > 0 || percentage > 0) {
        loop(); 
    } else {
        // 否則，停止繪製以節省資源 (類似於 noLoop() 的效果)
        noLoop();
    }
}


// =================================================================
// 步驟三：定義 Firework 和 Particle 類 (新增程式碼區塊)
// -----------------------------------------------------------------

// Particle 類：煙火的單個小粒子
class Particle {
    constructor(x, y, hu, firework) {
        this.pos = createVector(x, y);
        this.firework = firework; // 是否為發射中的火箭 (true) 或爆炸後的碎片 (false)
        this.lifespan = 255;
        this.hu = hu;
        this.acc = createVector(0, 0);

        if (this.firework) {
            // 初始火箭向上發射的速度
            this.vel = createVector(0, random(-12, -8));
        } else {
            // 爆炸碎片的速度 (向四面八方)
            this.vel = p5.Vector.random2D();
            this.vel.mult(random(2, 10));
        }
    }

    applyForce(force) {
        this.acc.add(force);
    }

    update() {
        if (!this.firework) {
            this.vel.mult(0.9); // 模擬爆炸後的阻力
            this.lifespan -= 4; // 碎片逐漸消失
        }
        
        this.vel.add(this.acc);
        this.pos.add(this.vel);
        this.acc.mult(0); // 清除加速度
    }

    show() {
        colorMode(HSB);
        
        if (!this.firework) {
            // 爆炸碎片
            strokeWeight(2);
            stroke(this.hu, 255, 255, this.lifespan);
        } else {
            // 發射中的火箭
            strokeWeight(4);
            stroke(this.hu, 255, 255);
        }

        point(this.pos.x, this.pos.y);
    }

    done() {
        return this.lifespan < 0;
    }
}

// Firework 類：煙火火箭
class Firework {
    constructor() {
        // 煙火從底部隨機 X 座標發射
        this.hu = random(255); // 隨機顏色
        this.firework = new Particle(random(width), height, this.hu, true);
        this.exploded = false;
        this.particles = [];
    }

    update() {
        if (!this.exploded) {
            this.firework.applyForce(gravity);
            this.firework.update();

            // 檢查火箭是否到達頂點 (y 速度轉為正，開始向下落)
            if (this.firework.vel.y >= 0) {
                this.exploded = true;
                this.explode();
            }
        }
        
        // 更新所有爆炸碎片
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].applyForce(gravity);
            this.particles[i].update();
            if (this.particles[i].done()) {
                this.particles.splice(i, 1);
            }
        }
    }

    explode() {
        // 爆炸成 100 個碎片
        for (let i = 0; i < 100; i++) {
            const p = new Particle(this.firework.pos.x, this.firework.pos.y, this.hu, false);
            this.particles.push(p);
        }
    }

    show() {
        if (!this.exploded) {
            this.firework.show();
        }
        
        // 顯示所有爆炸碎片
        for (let i = 0; i < this.particles.length; i++) {
            this.particles[i].show();
        }
    }

    done() {
        // 只有在爆炸且所有碎片都消失後才算完成
        return this.exploded && this.particles.length === 0;
    }
}
