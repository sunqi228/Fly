var __reflect = (this && this.__reflect) || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Games = (function (_super) {
    __extends(Games, _super);
    function Games() {
        var _this = _super.call(this) || this;
        //public
        _this._info = new Info(); //公用信息表
        _this._page = 1;
        //this game
        _this._person = new Bitmap("person_png"); //对象
        _this._bubble = new Bitmap("papaw_png");
        _this._topBarrier = new Bitmap("bg1_png");
        _this._bottomBarrier = new Bitmap("bg2_png");
        _this._isFall = false; //是否是自由落体
        _this._allIdiomArray = []; //所有成语数组
        _this._characterArray = []; //成语拆分成单个文字
        _this._characterBgArray = []; //textField背景数组
        _this._characterImgArray = []; //textField图片数组
        _this._characterTFArray = []; //textField数组
        // private _barrierArray = []; //障碍物数组
        _this._barrierBgArray = []; //障碍物数组
        _this._isHitBarrier = false; //是否碰撞了障碍物
        _this._clear = new Bitmap("magic_png"); //清空
        _this._clearBg = new egret.Sprite();
        _this._speed_up = false; //是否是加速状态(加速状态不检测障碍物碰撞)
        _this._protect = false; //加速状态结束后有1秒的保护状态,避免结束时直接碰到障碍物
        _this._default_speed = 5; //默认移动速度
        _this._fast_speed = 100; //加速时的速度(修改速度时,需修改执行次数)
        _this.addEventListener(egret.Event.ADDED_TO_STAGE, _this.createGameScene, _this);
        return _this;
    }
    Games.prototype.createGameScene = function () {
        //常量设置
        this._stageW = this.stage.stageWidth;
        this._stageH = this.stage.stageHeight;
        this._score = 0;
        this._isFall = true;
        this._scends = 180;
        this._info._vuid = localStorage.getItem("vuid").replace(/"/g, "");
        this._info._key = localStorage.getItem("key").replace(/"/g, "");
        this._info._isfrom = localStorage.getItem("isfrom").replace(/"/g, "");
        this._info._timenum = localStorage.getItem("timenum").replace(/"/g, "");
        this._info._activitynum = localStorage.getItem("activitynum").replace(/"/g, "");
        //减游戏次数
        this.minusGameCount();
    };
    Games.prototype.setupViews = function () {
        //背景音乐
        var sound = new egret.Sound();
        sound.addEventListener(egret.Event.COMPLETE, function () {
            this._backgroundChannel = sound.play(0, 0);
            this._backgroundChannel.volume = 0.9;
        }, this);
        sound.load("resource/sound/bg.mp3");
        //背景图片
        var bg = new Bitmap("bg_jpg");
        bg.x = 0;
        bg.y = 0;
        bg.width = this._stageW;
        bg.height = this._stageH;
        this.addChild(bg);
        //上边障碍物
        this._topBarrier.x = 0;
        this._topBarrier.y = 110;
        this._topBarrier.width = this._stageW * 2;
        this._topBarrier.height = 144;
        this.addChild(this._topBarrier);
        //下边障碍物
        this._bottomBarrier.x = 0;
        this._bottomBarrier.y = this._stageH - 144;
        this._bottomBarrier.width = this._stageW * 2;
        this._bottomBarrier.height = 144;
        this.addChild(this._bottomBarrier);
        //添加对象
        this._person.x = 200;
        this._person.y = 500;
        this._person.width = 80;
        this._person.height = 80;
        this.addChild(this._person);
        //对象气泡
        this._bubble.texture = RES.getRes("papaw_png");
        this._bubble.x = 180;
        this._bubble.y = 480;
        this._bubble.anchorOffsetX = 0;
        this._bubble.anchorOffsetY = 0;
        this._bubble.width = 120;
        this._bubble.height = 120;
        this.addChild(this._bubble);
        //提示箭头
        this._guide = new Movie();
        this._guide.init("guide_json", "guide_png", "guide", -1);
        this._guide.x = 200;
        this._guide.y = 200;
        this._guide.width = 100;
        this._guide.height = 60;
        this._guide.alpha = 0;
        this.addChild(this._guide);
        //对象自由落体
        this.addEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);
        //添加文字
        this.addCharacter();
        //文字移动
        this.addEventListener(egret.Event.ENTER_FRAME, this.textMoveEvent, this);
        //清空
        this._clearBg.x = 1200;
        this._clearBg.y = Math.random() * (this._stageH - 600) + 300;
        this._clearBg.width = 140;
        this._clearBg.height = 140;
        this._clearBg.graphics.beginFill(0xffffff, 0.001);
        this._clearBg.graphics.drawRect(0, 0, 160, 160);
        this._clearBg.graphics.endFill();
        this.addChild(this._clearBg);
        this._clear.x = 30;
        this._clear.y = 30;
        this._clear.width = 80;
        this._clear.height = 80;
        this._clearBg.addChild(this._clear);
        //已经吃的提示
        var my_word = new egret.TextField;
        my_word.x = 0;
        my_word.y = 250;
        my_word.width = this._stageW / 2;
        my_word.height = 50;
        my_word.textColor = 0xffffff;
        my_word.verticalAlign = egret.VerticalAlign.MIDDLE;
        my_word.textAlign = egret.HorizontalAlign.RIGHT;
        my_word.size = 35;
        my_word.text = "我的成语：";
        my_word.fontFamily = "Microsoft YaHei";
        this.addChild(my_word);
        //已经吃的字
        this._currentTF = new egret.TextField;
        this._currentTF.x = this._stageW / 2;
        this._currentTF.y = 250;
        this._currentTF.width = this._stageW / 2;
        this._currentTF.height = 50;
        this._currentTF.textColor = 0xFFFF00;
        this._currentTF.verticalAlign = egret.VerticalAlign.MIDDLE;
        this._currentTF.textAlign = egret.HorizontalAlign.LEFT;
        this._currentTF.size = 35;
        this._currentTF.text = "";
        this._currentTF.fontFamily = "Microsoft YaHei";
        this.addChild(this._currentTF);
        //分数提示
        this._scoreTF = new egret.TextField();
        this._scoreTF.x = 90;
        this._scoreTF.y = 35;
        this._scoreTF.width = 333;
        this._scoreTF.height = 55;
        this._scoreTF.textColor = 0xff6c14;
        this._scoreTF.textAlign = egret.HorizontalAlign.CENTER;
        this._scoreTF.size = 40;
        this._scoreTF.text = this._score + "分";
        this._scoreTF.fontFamily = "Microsoft YaHei";
        this.addChild(this._scoreTF);
        this._gameTimer = new egret.Timer(1000, 99999);
        this._gameTimer.addEventListener(egret.TimerEvent.TIMER, function () {
            this._score++;
            this._scoreTF.text = this._score;
        }, this);
        this._gameTimer.start();
        //倒计时提示
        this._scendsTF = new egret.TextField();
        this._scendsTF.x = this.stage.stageWidth * 0.85;
        this._scendsTF.y = 35;
        this._scendsTF.width = this.stage.stageWidth * 0.15;
        this._scendsTF.height = 55;
        this._scendsTF.fontFamily = "Microsoft YaHei";
        this._scendsTF.textColor = 0xff6c14;
        this._scendsTF.textAlign = egret.HorizontalAlign.CENTER;
        this._scendsTF.size = 40;
        this._scendsTF.text = this._scends;
        this.addChild(this._scendsTF);
        //游戏计时器
        this._gameoverTimer = new egret.Timer(1000, this._scends);
        this._gameoverTimer.addEventListener(egret.TimerEvent.TIMER, this.gameTimerFunc, this);
        this._gameoverTimer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, this.gameTimerCompleteFunc, this);
        this._gameoverTimer.start();
    };
    //每秒计时
    Games.prototype.gameTimerFunc = function () {
        this._scends--;
        this._scendsTF.text = this._scends;
        //剩5秒时播放倒计时音乐
        if (this._scends == 5) {
            var sound_1 = new egret.Sound();
            sound_1.addEventListener(egret.Event.COMPLETE, function () {
                this._countdownChannel = sound_1.play(0, 0);
            }, this);
            sound_1.load("resource/sound/countdown.mp3");
        }
    };
    //添加随机文字
    Games.prototype.addCharacter = function () {
        this._space = this._stageW / 2;
        this._bar_space = this._stageW / 2.3;
        for (var index = 0; index < 8; index++) {
            var tfBg = new egret.Sprite;
            tfBg.x = this._person.x + this._space * (index + 1);
            tfBg.y = Math.random() * (this._stageH - 500) + 250;
            tfBg.width = 160;
            tfBg.height = 160;
            tfBg.graphics.beginFill(0xffffff, 0.001);
            tfBg.graphics.drawRect(0, 0, 160, 160);
            tfBg.graphics.endFill();
            this.addChild(tfBg);
            var textImg = new Bitmap(index % 2 == 0 ? "ball1_png" : "ball2_png");
            textImg.x = 40;
            textImg.y = 40;
            textImg.width = 80;
            textImg.height = 80;
            tfBg.addChild(textImg);
            var textTF = new egret.TextField();
            textTF.x = 40; //随机x 300 ~ 3W-600	
            textTF.y = 40; //随机y 300 ~ H-600	
            textTF.width = 80;
            textTF.height = 80;
            textTF.text = this._characterArray[0];
            textTF.size = 35;
            textTF.textColor = 0xffffff;
            textTF.textAlign = egret.HorizontalAlign.CENTER;
            textTF.verticalAlign = egret.VerticalAlign.MIDDLE;
            tfBg.addChild(textTF);
            //创建之后删除数组中的文字
            this._characterArray.splice(0, 1);
            this._characterBgArray.push(tfBg);
            this._characterImgArray.push(textImg);
            this._characterTFArray.push(textTF);
        }
        for (var num = 0; num < 4; num++) {
            var barBg = new egret.Sprite;
            barBg.x = this._person.x + this._bar_space * (num + 1);
            barBg.y = Math.random() * (this._stageH - 500) + 250;
            barBg.width = 120;
            barBg.height = 120;
            barBg.graphics.beginFill(0xffffff, 0.001);
            barBg.graphics.drawCircle(60, 60, 60);
            barBg.graphics.endFill();
            this.addChild(barBg);
            var _barrier = new Bitmap("monster_png");
            _barrier.x = 20;
            _barrier.y = 20;
            _barrier.width = 80;
            _barrier.height = 80;
            barBg.addChild(_barrier);
            this._barrierBgArray.push(barBg);
        }
    };
    //文字向左移动事件
    Games.prototype.textMoveEvent = function () {
        this._topBarrier.x -= this._speed_up ? this._fast_speed : this._default_speed;
        this._bottomBarrier.x -= this._speed_up ? this._fast_speed : this._default_speed;
        if ((this._topBarrier.x == -this._stageW) || (this._topBarrier.x < -this._stageW))
            this._topBarrier.x = 0;
        if ((this._bottomBarrier.x == -this._stageW) || (this._bottomBarrier.x < -this._stageW))
            this._bottomBarrier.x = 0;
        //移动文字
        for (var index = 0; index < this._characterBgArray.length; index++) {
            var tfBg = this._characterBgArray[index];
            tfBg.x -= this._speed_up ? this._fast_speed : this._default_speed;
            tfBg.alpha = this._speed_up ? 0.1 : 1;
            //移动到最左边之后,删除他,并在末尾添加一个新的
            if (tfBg.x < -100) {
                this.addNewCharacter(index);
            }
        }
        //移动障碍物
        for (var index = 0; index < this._barrierBgArray.length; index++) {
            var barrier = this._barrierBgArray[index];
            barrier.x -= this._speed_up ? this._fast_speed : this._default_speed;
            barrier.alpha = this._speed_up ? 0.1 : 1;
            //移动到最左边之后,删除他,并在末尾添加一个新的
            if (barrier.x < -100) {
                this.addNewBarrier(index);
            }
        }
        //移动清空
        this._clearBg.x -= this._speed_up ? this._fast_speed : this._default_speed;
        this._clearBg.alpha = this._speed_up ? 0.1 : 1;
        if (this._clearBg.x < -100) {
            this._clearBg.x = 1300;
            this._clearBg.y = Math.random() * (this._stageH - 600) + 300;
        }
    };
    //增加新的障碍物
    Games.prototype.addNewBarrier = function (index) {
        var barrierBg = this._barrierBgArray[index];
        this.removeChild(barrierBg);
        //拿到最后一个,并在后边添加一个新的
        var lastBar = this._barrierBgArray[this._barrierBgArray.length - 1];
        var lastX = lastBar.x;
        var barBg = new egret.Sprite;
        barBg.x = lastX + this._bar_space;
        barBg.y = Math.random() * (this._stageH - 500) + 250;
        barBg.width = 120;
        barBg.height = 120;
        barBg.graphics.beginFill(0xffffff, 0.001);
        barBg.graphics.drawCircle(60, 60, 60);
        barBg.graphics.endFill();
        this.addChild(barBg);
        var _barrier = new Bitmap("monster_png");
        _barrier.x = 20;
        _barrier.y = 20;
        _barrier.width = 80;
        _barrier.height = 80;
        barBg.addChild(_barrier);
        this._barrierBgArray.splice(index, 1);
        this._barrierBgArray.push(barBg);
    };
    //增加新的文字
    Games.prototype.addNewCharacter = function (index) {
        console.log(index);
        //删除第一个
        var tfBg = this._characterBgArray[index];
        this.removeChild(tfBg);
        this._characterBgArray.splice(index, 1);
        this._characterImgArray.splice(index, 1);
        this._characterTFArray.splice(index, 1);
        //拿到最后一个,并在后边添加一个新的
        var lastBg = this._characterBgArray[this._characterBgArray.length - 1];
        var lastX = lastBg.x;
        var newTFBg = new egret.Sprite;
        newTFBg.x = lastX + this._space;
        newTFBg.y = Math.random() * (this._stageH - 500) + 250;
        newTFBg.width = 160;
        newTFBg.height = 160;
        newTFBg.graphics.beginFill(0xffffff, 0.001);
        newTFBg.graphics.drawRect(0, 0, 160, 160);
        newTFBg.graphics.endFill();
        this.addChild(newTFBg);
        var newTextImg = new Bitmap(index % 2 == 0 ? "ball1_png" : "ball2_png");
        newTextImg.x = 40;
        newTextImg.y = 40;
        newTextImg.width = 80;
        newTextImg.height = 80;
        newTFBg.addChild(newTextImg);
        var newTextTF = new egret.TextField();
        newTextTF.x = 40; //随机x 300 ~ 3W-600	
        newTextTF.y = 40; //随机y 300 ~ H-600	
        newTextTF.width = 80;
        newTextTF.height = 80;
        newTextTF.text = this._characterArray[index];
        newTextTF.size = 35;
        newTextTF.textColor = 0xffffff;
        newTextTF.textAlign = egret.HorizontalAlign.CENTER;
        newTextTF.verticalAlign = egret.VerticalAlign.MIDDLE;
        newTextTF.text = this._characterArray[0];
        newTFBg.addChild(newTextTF);
        this._characterArray.splice(index, 1);
        this._characterBgArray.push(newTFBg);
        this._characterImgArray.push(newTextImg);
        this._characterTFArray.push(newTextTF);
        if (this._characterArray.length < 20) {
            this._page++;
            this.getWords(2);
        }
    };
    //添加触摸事件
    Games.prototype.addTouchEvent = function () {
        this.stage.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);
        this.stage.addEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
    };
    //移除触摸事件
    Games.prototype.removeTouchEvent = function () {
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.touchBegin, this);
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_MOVE, this.touchMove, this);
        this.stage.removeEventListener(egret.TouchEvent.TOUCH_END, this.touchEnd, this);
    };
    Games.prototype.touchBegin = function (event) {
        this._isFall = false;
        this._touchX = event.localX;
        this._touchY = event.localY;
        this._touchPersonX = this._person.x;
        this._touchPersonY = this._person.y;
        //触摸时添加帧事件
        this.addEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
        //更新箭头方向
        this.rotationGuide();
    };
    Games.prototype.touchMove = function (event) {
        this._isFall = false;
        this._touchX = event.localX;
        this._touchY = event.localY;
        this._touchPersonX = this._person.x;
        this._touchPersonY = this._person.y;
        //更新箭头方向
        this.rotationGuide();
    };
    Games.prototype.touchEnd = function (event) {
        this._isFall = true;
        this._guide.alpha = 0;
        //移除帧事件
        this.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
    };
    //实时旋转引导箭头
    Games.prototype.rotationGuide = function () {
        this._guide.alpha = 1;
        this._guide.x = this._person.x;
        this._guide.y = this._touchY;
        //计算触摸点和当前对象的点构成的连线的夹角弧度 Math.atan2(y2-y1,x2-x1)
        var radian = Math.atan2((this._touchPersonY + this._person.height / 2) - this._touchY, (this._touchPersonX + this._person.width / 2) - this._touchX);
        //把弧度转成角度
        var angle = radian * 180 / Math.PI;
        if (this._touchY > this._person.y) {
            angle = -90;
        }
        else {
            angle = 90;
        }
        //旋转箭头图片
        this._guide.rotation = angle;
    };
    //触摸不松手或者移动时
    Games.prototype.touchChangeLocation = function () {
        //上下移动的速度
        this._person.y += (this._touchY < this._touchPersonY ? 10 : -8);
        this._bubble.y = this._person.y - 20;
    };
    //自由落体,改变对象和背景
    Games.prototype.freeFall = function () {
        if (this._isFall == true) {
            this._person.y += 6;
            this._bubble.y = this._person.y - 20;
        }
        if (this._protect == false) {
            //添加碰撞检测
            this.checkHit();
            //清空功能碰撞检测
            this.checkClear();
        }
        //障碍物碰撞检测
        this.checkBarrierHit();
    };
    //碰撞检测
    Games.prototype.checkHit = function () {
        for (var index = 0; index < this._characterBgArray.length; index++) {
            var bg = this._characterBgArray[index];
            var _isHit = bg.hitTestPoint(this._person.x + this._person.width / 2, this._person.y + this._person.height);
            if (_isHit) {
                this.hitAction(index);
            }
        }
    };
    Games.prototype.hitAction = function (index) {
        var sound = new egret.Sound();
        sound.addEventListener(egret.Event.COMPLETE, function () {
            var channel = sound.play(0, 1);
            channel.volume = 0.9;
        }, this);
        sound.load("resource/sound/jump.mp3");
        this._currentTF.text += this._characterTFArray[index].text;
        this.addNewCharacter(index);
        //检查对错
        if (this._currentTF.text.length == 4) {
            console.log(this._currentTF.text);
            var _loop_1 = function (ind) {
                if (this_1._currentTF.text == this_1._allIdiomArray[ind]) {
                    this_1._currentTF.text = "";
                    this_1._speed_up = true;
                    this_1._protect = true;
                    var sound_2 = new egret.Sound();
                    sound_2.addEventListener(egret.Event.COMPLETE, function () {
                        var channel = sound_2.play(0, 4);
                        channel.volume = 0.9;
                    }, this_1);
                    sound_2.load("resource/sound/rocket.mp3");
                    var timer = new egret.Timer(2000, 1);
                    timer.addEventListener(egret.TimerEvent.TIMER_COMPLETE, function () {
                        this._speed_up = false;
                    }, this_1);
                    timer.start();
                    var timer1 = new egret.Timer(4000, 1); //2秒保护时间
                    timer1.addEventListener(egret.TimerEvent.TIMER_COMPLETE, function () {
                        this._protect = false;
                    }, this_1);
                    timer1.start();
                    this_1.plusScore(20);
                    var score = new egret.Timer(100, 20);
                    score.addEventListener(egret.TimerEvent.TIMER, function () {
                        this._score += 1;
                        this._scoreTF.text = this._score;
                    }, this_1);
                    score.start();
                }
            };
            var this_1 = this;
            for (var ind = 0; ind < this._allIdiomArray.length; ind++) {
                _loop_1(ind);
            }
        }
    };
    Games.prototype.checkBarrierHit = function () {
        var _isTopHit = this._topBarrier.hitTestPoint(this._person.x + this._person.width / 2, this._person.y + this._person.height);
        var _isBottomHit = this._bottomBarrier.hitTestPoint(this._person.x + this._person.width / 2, this._person.y + this._person.height);
        if (_isTopHit || _isBottomHit) {
            if (this._isHitBarrier == false) {
                this.gameTimerCompleteFunc();
            }
            this._isHitBarrier = true;
        }
        //未加速时才检测该碰撞
        if (this._protect == false) {
            for (var index = 0; index < this._barrierBgArray.length; index++) {
                var bar = this._barrierBgArray[index];
                var _isHit = bar.hitTestPoint(this._person.x + this._person.width / 2, this._person.y + this._person.height);
                if (_isHit) {
                    if (this._isHitBarrier == false) {
                        this.gameTimerCompleteFunc();
                    }
                    this._isHitBarrier = true;
                }
            }
        }
    };
    Games.prototype.checkClear = function () {
        var _isHit = this._clearBg.hitTestPoint(this._person.x + this._person.width / 2, this._person.y + this._person.height);
        if (_isHit) {
            this._clearBg.x = 1300;
            this._clearBg.y = Math.random() * (this._stageH - 600) + 300;
            this._currentTF.text = "";
        }
    };
    //游戏结束
    Games.prototype.gameTimerCompleteFunc = function () {
        this.removeEventListener(egret.Event.ENTER_FRAME, this.freeFall, this);
        this.removeEventListener(egret.Event.ENTER_FRAME, this.textMoveEvent, this);
        this.removeEventListener(egret.Event.ENTER_FRAME, this.touchChangeLocation, this);
        this.removeTouchEvent();
        //提交游戏时间
        this.plusScore(180 - this._scends);
        if (this._backgroundChannel)
            this._backgroundChannel.stop();
        if (this._gameTimer)
            this._gameTimer.stop();
        if (this._countdownChannel)
            this._countdownChannel.stop();
        if (this._backgroundChannel)
            this._backgroundChannel.stop();
        if (this._gameoverTimer)
            this._gameoverTimer.stop();
        //气泡爆炸动画
        this._bubble.texture = RES.getRes("baozha1_png");
        this._bubble.width = 300;
        this._bubble.height = 300;
        this._bubble.anchorOffsetX = 180 / 2;
        this._bubble.anchorOffsetY = 200 / 2;
        this._bubble.x = this._person.x - 20;
        this._bubble.y = this._person.y - 20;
        var timer1 = new egret.Timer(200, 1);
        timer1.addEventListener(egret.TimerEvent.TIMER_COMPLETE, function () {
            this._bubble.texture = RES.getRes("baozha2_png");
            var timer2 = new egret.Timer(200, 1);
            timer2.addEventListener(egret.TimerEvent.TIMER_COMPLETE, function () {
                this._bubble.texture = RES.getRes("baozha3_png");
            }, this);
            timer2.start();
        }, this);
        timer1.start();
        //请求游戏结束接口
        var over = new egret.Timer(400, 1);
        over.addEventListener(egret.TimerEvent.TIMER_COMPLETE, function () {
            this.gameOver();
        }, this);
        over.start();
    };
    //接口-减游戏次数
    Games.prototype.minusGameCount = function () {
        var params = "?vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._downnum + params, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            if (result["code"] == 0) {
                this._linnum = parseInt(result["data"]["linnum"]);
                this._rands = result["data"]["rands"].toString();
                this._tid = result["data"]["tid"].toString();
                //请求单词
                this.getWords(1);
            }
            else if (result["code"] == 2) {
                var _overAlert = new Alert(Alert.GamePageShare, "", "", "", 0, this._stageW, this._stageH);
                _overAlert.addEventListener(AlertEvent.Share, this.shareButtonClick, this);
                _overAlert.addEventListener(AlertEvent.Cancle, function () {
                    window.location.reload();
                }, this);
                this.addChild(_overAlert);
            }
            else {
                alert(result["msg"]);
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("numdown5　post error : " + event);
        }, this);
    };
    //接口-请求单词, 只在初次请求时添加UI
    Games.prototype.getWords = function (type) {
        var params = "?vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&rands=" + this._rands +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._getWord + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            var currentIdiom = []; //档次请求到的数据
            if (result["code"] == 0) {
                for (var i = 0; i < result["data"].length; i++) {
                    var text = result["data"][i]["right"];
                    currentIdiom.push(text); //将成语添加到成语数组
                }
                Array.prototype.push.apply(this._allIdiomArray, currentIdiom); //追加到成语数组
                var characterString = currentIdiom.join().replace(/,/g, ""); //将单词数组转为字符串,并且去掉所有逗号
                var character = characterString.split(""); //将字母字符串转为数组
                Array.prototype.push.apply(this._characterArray, character); //追加到字母数组
                //第一次接口请求成功添加UI
                if (type == 1) {
                    this.setupViews();
                    this.addTouchEvent();
                }
            }
            else {
                alert(result["msg"]);
            }
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("GetBallwords　post error : " + event);
        }, this);
    };
    //接口-增加分数
    Games.prototype.plusScore = function (score) {
        var params = "?vuid=" + this._info._vuid +
            "&rands=" + this._rands +
            "&tid=" + this._tid +
            "&md5=" + score +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._typosTempjump + params, egret.HttpMethod.GET);
        request.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            // alert("typostempjump　post error : " + event);
        }, this);
    };
    //接口-游戏结束
    Games.prototype.gameOver = function () {
        var params = "?score=" + this._score +
            "&vuid=" + this._info._vuid +
            "&key=" + this._info._key +
            "&rands=" + this._rands +
            "&timenum=" + this._info._timenum +
            "&activitynum=" + this._info._activitynum +
            "&isfrom=" + this._info._isfrom;
        var request = new egret.HttpRequest();
        request.responseType = egret.HttpResponseType.TEXT;
        request.open(this._info._gameover + params, egret.HttpMethod.GET);
        request.send();
        request.addEventListener(egret.Event.COMPLETE, function () {
            var result = JSON.parse(request.response);
            var highScore = result["data"]["score"];
            if (this._score > parseInt(highScore)) {
                highScore = this._score;
            }
            this._normalAlert = new Alert(Alert.GamePageScore, this._score.toString(), highScore, result["data"]["order"], result["data"]["text"], this._stageW, this._stageH);
            this._normalAlert.addEventListener(AlertEvent.Ranking, this.checkRanking, this);
            this._normalAlert.addEventListener(AlertEvent.Restart, this.restartGame, this);
            this.addChild(this._normalAlert);
        }, this);
        request.addEventListener(egret.IOErrorEvent.IO_ERROR, function () {
            alert("GameOver　post error : " + event);
        }, this);
    };
    //游戏结束alert-查看排名
    Games.prototype.checkRanking = function () {
        if (this._normalAlert && this._normalAlert.parent) {
            this._normalAlert.parent.removeChild(this._normalAlert);
        }
        window.location.href = this._info._rankUrl + this._info._timenum + "/activitynum/" + this._info._activitynum + "/vuid/" + this._info._vuid + "/key/" + this._info._key + "/isfrom/" + this._info._isfrom;
    };
    //游戏结束alert-重玩
    Games.prototype.restartGame = function () {
        //移动当前场景
        this.removeChildren();
        //重玩时清空数组
        this._allIdiomArray.splice(0, this._allIdiomArray.length);
        this._characterArray.splice(0, this._characterArray.length);
        this._characterTFArray.splice(0, this._characterTFArray.length);
        this._characterBgArray.splice(0, this._characterBgArray.length);
        this._barrierBgArray.splice(0, this._barrierBgArray.length);
        //重新添加
        this._scends = 180;
        this._score = 0;
        this._isFall = true;
        this._isHitBarrier = false;
        this._page = 1;
        this.minusGameCount();
    };
    Games.prototype.shareButtonClick = function () {
        //分享引导图
        var _shareGuide = new Bitmap("shareGui_png");
        _shareGuide.touchEnabled = true;
        _shareGuide.x = 0;
        _shareGuide.y = 0;
        _shareGuide.width = this.stage.stageWidth;
        _shareGuide.height = this.stage.stageHeight;
        _shareGuide.addEventListener(egret.TouchEvent.TOUCH_TAP, function () {
            this.removeChild(_shareGuide);
        }, this);
        this.addChild(_shareGuide);
    };
    return Games;
}(egret.DisplayObjectContainer));
__reflect(Games.prototype, "Games");
//# sourceMappingURL=Games.js.map