const screenSizeX = 960;
const screenSizeY = 540;
const screenEllipseX = 450;
const screenEllipseY = 240;
const groundRadius = 50;
const playerRadius = 10;
const enemyRadius = 10;
const enemyUpperLimit = 25;
const playerBulletUpperLimit = 200;

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
            stage.removeChild(this.data[this.head]);
            this.head = (this.head + 1) % this.size;
        }

        enqueue(value) {
            if (this.isFull()) {
                this.dequeue();
            }
            this.data[this.tail] = value;
            this.tail = (this.tail + 1) % this.size;
        }
    }

    /*
        プレイ画面
    */

    // 地面
    let ground;

    /*
        キーボードの入力情報
    */

    class KeyboardInfo {
        constructor() {
            this.a = false;
            this.d = false;
            this.k = false;
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

        normalize() {
            const dist = this.getDist();
            return new Vector(this.x / dist, this.y / dist);
        }
    }

    /*
        弾丸の情報
    */

    let playerBullets = new Queue(playerBulletUpperLimit);

    class Bullet {
        constructor() {
            this.body = new createjs.Shape();
            this.body.graphics.beginFill("White").drawCircle(screenSizeX / 2, screenSizeY / 2, 10);
            this.speed = 0;
            this.vector = new Vector(0, 0);
        } 

        fire(isPlayer, body, vector, speed) {
            this.isPlayer = isPlayer;
            this.body.x = body.x;
            this.body.y = body.y;
            this.vector = vector;
            this.speed = speed;
            stage.addChild(this.body);
            playerBullets.enqueue(this);
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
        
        destruct(index) {
            stage.removeChild(this);
        }

    }

    /*
        player情報
    */

    class Player {
        constructor() {
        }

        initialize() {
            this.body = new createjs.Shape();
            this.body.graphics.beginFill("Red");
            this.body.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, playerRadius);
            this.theta = 270;
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
            const bullet = new Bullet();
            let vector = this.getPosition();
            vector = vector.normalize();
            bullet.fire(true, this.body, vector, 10);
        }
    }

    const player = new Player();

    const gameInit = () => {
        ground = new createjs.Shape();
        ground.graphics.beginFill("White");
        ground.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, groundRadius);
        stage.addChild(ground);

        player.initialize();
    }


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
    }

    /*
        Enemy情報
    */

    class Enemy {
        constructor(initTheta) {
            this.body = new createjs.Shape();
            this.body.graphics.beginFill("Blue");
            this.body.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, enemyRadius);
            this.theta = initTheta;
            this.posEllipseX = screenEllipseX + 300;
            this.posEllipseY = screenEllipseY + 300;
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

        destruct() {
            // TODO
        }        
    }

    let enemies = [];

    const enemyGenerate = () => {
        const enemy = new Enemy(Math.floor(Math.random() * 360))
        enemies.push(enemy);
    }

    /* 
        タイトル画面
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

    const gameUpdate = () => {
        player.move();
        if (enemies.length < enemyUpperLimit) {
            enemyGenerate();
        }
        enemies.forEach(enemy => enemy.move());
        if (keyboardInfo.k) {
            player.attack();
        }
        for (let i = playerBullets.head ; i != playerBullets.tail ; i = (i + 1) % playerBullets.size) {
            playerBullets.data[i].move();
        }
    }

    function handleTick() {
        if (!isTitle) {
            gameUpdate();
        }
        stage.update();
    }
}

window.addEventListener("load", init);