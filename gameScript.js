const screenSizeX = 960;
const screenSizeY = 540;
const screenEllipseX = 450;
const screenEllipseY = 240;
const groundRadius = 50;
const playerRadius = 10;
const enemyRadius = 10;
const enemyUpperLimit = 10;
const playerBulletUpperLimit = 200;
const enemyBulletUpperLimit = 2500;
const playerBulletSize = 5;
const enemyBulletSize = 5;
const HP = 5;

const init = () => {

    // ステージを追加
    let stage = new createjs.Stage("myCanvas");
    let bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, screenSizeX, screenSizeY);
    stage.addChild(bg);

    /*
        Queueを利用してみます
        (中身のswapとかができる超なんちゃってカスQueueです)
        (二分探索木はさすがに面倒くさかった・・・・)
    */

    class Queue {
        constructor(size) {
            this.data = []
            this.head = 0;
            this.tail = 0;
            this.size = size;
        }

        isEmpty() {
            return (this.head === this.tail);
        }
        
        isFull() {
            return ((this.tail + 1) % this.size === this.head);
        } 

        dequeue() {
            if (this.isEmpty()) {
                return;
            }
            stage.removeChild(this.data[this.head].body);
            this.head = (this.head + 1) % this.size;
        }

        enqueue(value) {
            if (this.isFull()) {
                this.dequeue();
            }
            this.data[this.tail] = value;
            this.tail = (this.tail + 1) % this.size;
        }

        getLength() {
            return ((this.tail - this.head) + this.size) % this.size;
        }

        erase(index) {
            [this.data[this.head], this.data[index]] = [this.data[index], this.data[this.head]];
            this.dequeue();
        }
    }

    /*
        プレイ画面
    */

    // 地面
    let ground;

    /*
        キーボードの入力情報
        KKEEYY
    */

    class KeyboardInfo {
        constructor() {
            this.a = false;
            this.d = false;
            this.k = false;
            this.enter = false;
        }
    }

    const keyboardInfo = new KeyboardInfo();

    class Vector {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        getDist() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        getBetweenDist(opponent) {
            return Math.sqrt((this.x - opponent.x) * (this.x - opponent.x) + (this.y - opponent.y) * (this.y - opponent.y));
        }

        normalize() {
            const dist = this.getDist();
            return new Vector(this.x / dist, this.y / dist);
        }
    }

    const generateVector = (body) => {
        return new Vector(body.x, body.y);
    }

    /*
        弾丸の情報
        BBUULLLLEETT
    */

    let playerBullets = new Queue(playerBulletUpperLimit);
    let enemiesBullets = new Queue(enemyBulletUpperLimit);

    class Bullet {
        constructor(radius) {
            this.body = new createjs.Shape();
            this.body.graphics.beginFill("White").drawCircle(screenSizeX / 2, screenSizeY / 2, radius);
            this.body.radius = radius;
            this.speed = 0;
            this.vector = new Vector(0, 0);
        } 

        fire(body, vector, speed) {
            this.body.x = body.x;
            this.body.y = body.y;
            this.vector = vector;
            this.speed = speed;
            stage.addChild(this.body);
        }

        move() {
            this.body.x += this.speed * this.vector.x;
            this.body.y += this.speed * this.vector.y;
        }

        isIn() {
            let res = true;
            res &&= (-screenSizeX / 2 <= this.body.x && this.body.x <= screenSizeX / 2);
            res &&= (-screenSizeY / 2 <= this.body.y && this.body.y <= screenSizeY / 2);
            return res;
        }

    }

    /*
        player情報
        PPLLAAYYEERR
    */

    class Player {
        constructor() {
        }

        initialize() {
            this.body = new createjs.Shape();
            this.body.graphics.beginFill("Red");
            this.body.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, playerRadius);
            this.body.radius = playerRadius;
            this.theta = 270;
            this.HP = HP;
            stage.addChild(player.body);
        }

        getPosition() {
            const position = new Vector(0, 0);
            const rad = (player.theta / 180.0) * Math.PI;
            position.x = (groundRadius + playerRadius) * Math.cos(rad);
            position.y = (groundRadius + playerRadius) * Math.sin(rad);
            return position;
        }

        move() {
            if (keyboardInfo.d) {
                this.theta += 3;
            }
            if (keyboardInfo.a) {
                this.theta -= 3;
            }
            const position = this.getPosition();
            this.body.x = position.x;
            this.body.y = position.y;
        }

        attack() {
            const bullet = new Bullet(playerBulletSize);
            let vector = this.getPosition();
            vector = vector.normalize();
            bullet.fire(this.body, vector, 10);
            playerBullets.enqueue(bullet);
        }
    }

    const player = new Player();

    const gameInit = () => {
        ground = new createjs.Shape();
        ground.graphics.beginFill("White");
        ground.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, groundRadius);
        ground.radius = groundRadius;
        stage.addChild(ground);

        player.initialize();
    }



    /*
        Enemy情報
        EENNEEMMYY
    */

    class Enemy {
        constructor(initTheta) {
            this.body = new createjs.Shape();
            this.body.graphics.beginFill("Blue");
            this.body.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, enemyRadius);
            this.body.radius = enemyRadius;
            this.theta = initTheta;
            this.posEllipseX = screenEllipseX + 100;
            this.posEllipseY = screenEllipseY + 100;
            this.attackTime = Date.now();
            this.move();
            stage.addChild(this.body);
        }

        move() {
            if (this.posEllipseX > screenEllipseX) {
                this.posEllipseX--;
            }
            if (this.posEllipseY > screenEllipseY) {
                this.posEllipseY--;
            }
            const rad = (this.theta / 180.0) * Math.PI;
            this.body.x = this.posEllipseX * Math.cos(rad);
            this.body.y = -this.posEllipseY * Math.sin(rad);
        }

        attack() {
            this.attackTime = Date.now();
            const direction = new Vector(player.body.x - this.body.x, player.body.y - this.body.y).normalize(); 
            const bullet = new Bullet(enemyBulletSize);
            enemiesBullets.enqueue(bullet);
            bullet.fire(this.body, direction, enemyBulletSize);
        }
    }

    let enemies = new Queue(enemyUpperLimit);

    const enemyGenerate = () => {
        const enemy = new Enemy(Math.floor(Math.random() * 360))
        enemies.enqueue(enemy);
    }

    /*
        図形の衝突判定
        （CreateJSに実装されていますが、自前で用意したくなったので自前実装します)
        // CCOOLLIIDDEE
    */

    const collide = (data1, data2) => {
        const dist = generateVector(data1).getBetweenDist(generateVector(data2));
        return (dist <= data1.radius + data2.radius);
    }

    /* 
        タイトル画面
        TTIITTLLEE
        isTitle: タイトル画面を描画するべきかどうか
        startButton: 中央の四角形
        handleStartButtonClick: 四角形が押されたらタイトル画面の情報を破棄する
        startText: "Please click this rectangle" と書いているやつ
    */

    let isTitle = true;

    const startButton = new createjs.Shape();
    startButton.graphics.beginFill("White");
    startButton.graphics.drawRect(screenSizeX / 2 - 100, screenSizeY / 2 - 50, 200, 100);
    stage.addChild(startButton);

    const startText = new createjs.Text("Please click this rectangle", "20px Arial", "#ffffff");
    startText.textAlign = "center";
    startText.x = screenSizeX / 2;
    startText.y = screenSizeY / 2 - 100;
    stage.addChild(startText);

    /* 
        Result画面
        RREESSUULLTT
    */

    const displayResult = () => {
        const resultText = new createjs.Text("Your score is " + score.toString() + "!!", "80px Arial", "#ffffff");
        resultText.textAlign = "center";
        resultText.x = screenSizeX / 2;
        resultText.y = screenSizeY / 2;
        stage.addChild(resultText);

        const restartText = new createjs.Text("You can restart if you press Enter", "20px Arial", "#ffffff");
        restartText.textAlign = "center";
        restartText.x = screenSizeX / 2;
        restartText.y = screenSizeY / 2 - 100;
        stage.addChild(restartText)
    }

    let isResult = false;

    /*
        ゲーム進行管理、その他
        OOTTHHEERR
    */

    // score
    let score = 0;

    const handleKeydown = (event) => {
        if (event.key === 'a') {
            keyboardInfo.a = true;
        }
        if (event.key === 'd') {
            keyboardInfo.d = true;
        }
        if (event.key === 'k') {
            keyboardInfo.k = true;
        }
        if (event.key === 'Enter') {
            keyboardInfo.enter = true;
        }
    }

    const handleKeyup = (event) => {
        if (event.key === 'a') {
            keyboardInfo.a = false;
        }
        if (event.key === 'd') {
            keyboardInfo.d = false;
        }
        if (event.key === 'k') {
            keyboardInfo.k = false;
        }
        if (event.key === 'enter') {
            keyboardInfo.enter = false;
        }
    }
    const handleStartButtonClick = () => {
        isTitle = false; 
        stage.removeChild(startButton);
        stage.removeChild(startText);
        gameInit();
    }

    startButton.addEventListener("click", handleStartButtonClick);

    createjs.Ticker.setFPS(60);
    createjs.Ticker.addEventListener("tick", handleTick);
    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("keyup", handleKeyup);

    // UUPPDDAATTEE
    const gameUpdate = () => {
        player.move();
        // 敵の生成
        if (enemies.getLength() < enemyUpperLimit - 1) {
            enemyGenerate();
        }
        // 敵の移動
        for (let i = enemies.head ; i != enemies.tail ; i = (i + 1) % enemies.size) {
            enemies.data[i].move();
        }
        // 敵の攻撃
        for (let i = enemies.head ; i != enemies.tail ; i = (i + 1) % enemies.size) {
            if (Date.now() - enemies.data[i].attackTime > 500) {
                enemies.data[i].attack();
            }
        }
        // プレイ屋ーのアタック
        if (keyboardInfo.k) {
            player.attack();
        }
        // プレイヤーの弾の移動
        for (let i = playerBullets.head ; i != playerBullets.tail ; i = (i + 1) % playerBullets.size) {
            playerBullets.data[i].move();
        }
        // 敵の弾の移動
        for (let i = enemiesBullets.head ; i != enemiesBullets.tail ; i = (i + 1) % enemiesBullets.size) {
            enemiesBullets.data[i].move();
        }
        // playerの弾と敵のあたり判定
        for (let i = playerBullets.head ; i != playerBullets.tail ; i = (i + 1) % playerBullets.size) {
            for (let j = enemies.head ; j != enemies.tail ; j = (j + 1) % enemies.size) {
                if (collide(playerBullets.data[i].body, enemies.data[j].body)) {
                    score += 10;
                    playerBullets.erase(i);
                    enemies.erase(j);
                }
            }
        }
        // 敵の弾と地面のあたり判定
        for (let i = enemiesBullets.head ; i != enemiesBullets.tail ; i = (i + 1) % enemiesBullets.size) {
            if (collide(enemiesBullets.data[i].body, ground)) {
                enemiesBullets.erase(i);
            }
        }
        // 敵の弾とプレイヤーのあたり判定
        for (let i = enemiesBullets.head ; i != enemiesBullets.tail ; i = (i + 1) % enemiesBullets.size) {
            if (collide(enemiesBullets.data[i].body, player.body)) {
                enemiesBullets.erase(i);
                player.HP--;
                if (player.HP == 0) {
                    alert("game over");
                    stage.removeAllChildren();
                    stage.addChild(bg);
                    isResult = true;
                    displayResult();
                }
            }
        }
    }

    function handleTick() {
        if (!isTitle && !isResult) {
            gameUpdate();
        }
        stage.update();
        if (isResult && keyboardInfo.enter) {
            location.reload();
        }
    }
}

window.addEventListener("load", init);