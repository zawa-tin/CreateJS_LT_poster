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
        player情報
    */

    let player = { };
    let ground;

    const getPos = () => {
        let position = { };
        const rad = (player.theta / 180.0) * Math.PI;
        position.x = (groundRadius + playerRadius) * Math.cos(rad);
        position.y = (groundRadius + playerRadius) * Math.sin(rad);
        return position;
    }

    const gameInit = () => {
        ground = new createjs.Shape();
        ground.graphics.beginFill("White");
        ground.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, groundRadius);
        stage.addChild(ground);

        player.body = new createjs.Shape();
        player.body.graphics.beginFill("Red");
        player.body.graphics.drawCircle(screenSizeX / 2, screenSizeY / 2, playerRadius);
        player.theta = 270;
        player.isMovePositive = false;
        player.isMoveNegative = false;
        stage.addChild(player.body);
    }

    const playerMove = () => {
        if (player.isMovePositive) {
            player.theta += 3;
        }
        if (player.isMoveNegative) {
            player.theta -= 3;
        }
        const position = getPos();
        player.body.x = position.x;
        player.body.y = position.y;
    }

    const gameUpdate = () => {
        playerMove();
    }

    const handleKeydown = (event) => {
        if (event.key === 'a') {
            player.isMoveNegative = true;
        }
        if (event.key === 'd') {
            player.isMovePositive = true;
        }
    }

    const handleKeyup = (event) => {
        if (event.key === 'a') {
            player.isMoveNegative = false;
        }
        if (event.key === 'd') {
            player.isMovePositive = false;
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
            // this.posRadius = 1000;
            this.posEllipseX = 750;
            this.posEllipseY = 540;
            this.move();
            stage.addChild(this.body);
        }

        move() {
            /* 
            if (this.posRadius > 300) {
                this.posRadius--;
            }
            this.body.x = this.posRadius * Math.cos((this.theta / 180.0) * Math.PI);
            this.body.y = this.posRadius * Math.sin((this.theta / 180.0) * Math.PI);
            */
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