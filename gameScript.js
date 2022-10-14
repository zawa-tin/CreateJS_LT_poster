const screenSizeX = 960;
const screenSizeY = 540;
const screenEllipseX = 450;
const screenEllipseY = 240;
const groundRadius = 50;
const playerRadius = 10;
const enemyRadius = 10;
const enemyUpperLimit = 25;

const init = () => {

    // ステージを追加
    let stage = new createjs.Stage("myCanvas");
    let bg = new createjs.Shape();
    bg.graphics.beginFill("black").drawRect(0, 0, screenSizeX, screenSizeY);
    stage.addChild(bg);

    /*
        プレイ画面
    */

    /*
        キーボードの入力情報
    */

    class KeyboardInfo {
        constructor() {
            this.a = false;
            this.d = false;
        }
    }

    const keyboardInfo = new KeyboardInfo();

    /*
        player情報
    */

    let ground;

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
            const position = { };
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
    }

    const player = new Player();

    const gameInit = () => {
        ground = new createjs.Shape();
        ground.graphics.beginFill("White");
        ground.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, groundRadius);
        stage.addChild(ground);

        player.initialize();
    }

    const gameUpdate = () => {
        player.move();
    }

    const handleKeydown = (event) => {
        if (event.key === 'a') {
            keyboardInfo.a = true;
        }
        if (event.key === 'd') {
            keyboardInfo.d = true;
        }
    }

    const handleKeyup = (event) => {
        if (event.key === 'a') {
            keyboardInfo.a = false;
        }
        if (event.key === 'd') {
            keyboardInfo.d = false;
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
            this.posEllipseX = 750;
            this.posEllipseY = 540;
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

    function handleTick() {
        if (!isTitle) {
            gameUpdate();
            if (enemies.length < enemyUpperLimit) {
                enemyGenerate();
            }
            enemies.forEach(enemy => enemy.move());
        }
        stage.update();
    }
}

window.addEventListener("load", init);