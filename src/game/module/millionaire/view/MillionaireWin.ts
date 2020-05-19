/**
 * 大富翁入口
 */
class MillionaireWin extends BaseEuiView {

    private count: eui.Label;
    private dicecount: eui.Label;
    private go: eui.Button;
    private closeBtn: eui.Button;

    //box0~3
    private paycount: eui.Label;
    private autoGo: eui.Button;

    private roleSelect: RoleSelectPanel;
    private millionaireView: MillionaireView;//地图

    private y1: eui.Label;
    private y2: eui.Image;
    private desc: eui.Label;

    private reward: eui.Group;
    private touchGroup: eui.Group;
    private arrowleft: eui.Image;
    private arrowright: eui.Image;
    //box0desc~box3desc
    private bar1: eui.ProgressBar;
    private group1: eui.Group;
    private group2: eui.Group;
    //box1~box8

    private static MaxBoxGroup: number = 2;
    private startBoxId: number;
    private beginPoint: number;
    private touchMoving: boolean;
    private ewtime: number;
    private masksp: egret.Sprite;
    private actCircle: MovieClip[];
    private dice: eui.Image;
    private dicenum: number;
    private isShowDice = false;//展示摇到的骰子
    private rewardIndex : number;

    constructor() {
        super();
        this.skinName = "richmanSkin";
        this.isTopLevel = true;
        // this.setSkinPart("roleSelect", new RoleSelectPanel());
    }

    public initUI(): void {
        super.initUI();

    }

    public destoryView(): void {
        super.destoryView();

        this.roleSelect.destructor();
    }
    public static isOpen() {
        if (GameServer.serverOpenDay < GlobalConfig.RichManBaseConfig.openDay) {
            return false;
        }
        return true;
    }
    public static openCheck(...param: any[]): boolean {
        let open: boolean = MillionaireWin.isOpen();
        if (!open)
            UserTips.ins().showTips(`开服` + (GlobalConfig.RichManBaseConfig.openDay + 1) + `天开启`);
        return open;
    }
    public open(...param: any[]): void {
        this.addTouchEvent(this.go, this.onClick);
        this.addTouchEvent(this.autoGo, this.onClick);
        this.addTouchEvent(this.arrowleft, this.onClick);
        this.addTouchEvent(this.arrowright, this.onClick);
        this.addTouchEvent(this.closeBtn, this.onCloseBtn);
        this.observe(Millionaire.ins().postMillionaireInfo, this.callbackInfo);
        this.observe(Millionaire.ins().postTurnDice, this.callbackTurnDice);//摇骰子返回
        this.observe(Millionaire.ins().postRoundReward, this.callbackRoundReward);//返回领取圈数奖励
        this.observe(Millionaire.ins().postMillionaireUpdate, this.callbackMillionaireUpdate);//大富翁相关的数据更新
        this.observe(GameApp.ins().postZeroInit, this.initZero);
        this.touchGroup.touchEnabled = false;
        this.reward.touchEnabled = false;
        this.paycount.touchEnabled = false;
        this.y1.touchEnabled = false;
        this.y2.touchEnabled = false;
        this.touchMoving = false;
        this.dice.visible = false;
        for (let i = 1; i <= 8; i++) {
            this.addTouchEvent(this["box" + i], this.onTab);
        }
        // this.touchGroup.addEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
        // this.touchGroup.addEventListener(egret.TouchEvent.TOUCH_END, this.onEnd, this);
        // for( let i = 1;i <= 2;i++ ){
        // 	this.addTouchEvent(this["group"+i], this.onTouch);
        // }

        let roundRewards: number = Object.keys(GlobalConfig.RichManRoundAwardConfig).length;
        MillionaireWin.MaxBoxGroup = Math.floor(roundRewards / 4);

        Millionaire.ins().isAutoGo = false;

        this.startBoxId = 0;
        this.beginPoint = 0;
        this.touchMoving = false;
        this.ewtime = 300;
        this.actCircle = [];
        this.dicenum = 1;
        this.isShowDice = false;

        //if (!this.masksp) {
        //	this.masksp = new egret.Sprite();
        //	let square: egret.Shape = new egret.Shape();
        //	square.graphics.beginFill(0xffff00);
        //	square.graphics.drawRect(this.group1.x, this.group1.y, this.group1.width, this.group1.height);
        //	square.graphics.endFill();
        //	this.masksp.addChild(square);
        //	this.reward.addChild(this.masksp);
        //	this.reward.mask = this.masksp;
        //}


        this.init();
        this.millionaireView.open();
        TimerManager.ins().remove(this.updateMillionaire, this);
        TimerManager.ins().doTimer(100, 0, this.updateMillionaire, this);
    }

    public initZero() {
        Millionaire.ins().sendMillionaireInfo();
        ViewManager.ins().close(this);
        ViewManager.ins().open(MillionaireWin);
    }
    /**检测UI上的变化**/
    private updateMillionaire() {
        // if( Millionaire.ins().dice ){
        // 	this.go.iconDisplay.source = "zdbossskin_json.zdbossqiangjiangli";
        // 	this.paycount.visible = false;
        // 	this.y1.visible = this.paycount.visible;
        // 	this.y2.visible = this.paycount.visible;
        // 	this.desc.visible = !this.paycount.visible;
        // }else{
        // 	this.go.iconDisplay.source = "btn2";
        // 	this.paycount.visible = true;
        // 	this.y1.visible = this.paycount.visible;
        // 	this.y2.visible = this.paycount.visible;
        // 	this.desc.visible = !this.paycount.visible;
        // }
        if (this.millionaireView.diceimg) {
            this.dice.visible = true;
            if (this.isShowDice && this.millionaireView.countDown <= GlobalConfig.RichManBaseConfig.diceTime / 2)
                this.dice.source = `richman_dice${Millionaire.ins().dicePoint}`;
            else {
                this.dice.source = `richman_dice${this.dicenum}`;
                this.dicenum++;
                if (this.dicenum > 6)
                    this.dicenum = 1;
            }
            return;
        }
        this.isShowDice = false;
        this.dice.visible = true;
        this.dicenum = 1;
        if (Millionaire.ins().isAutoGo)
            this.turnDice();

    }
    private callbackMillionaireUpdate() {
        this.init();
    }
    /**获取大富翁数据返回**/
    private callbackInfo() {
        this.init();
    }
    /**摇骰子返回**/
    private callbackTurnDice() {
        this.isShowDice = true;
        this.init();
    }
    /**返回领取圈数奖励**/
    private callbackRoundReward() {
        UserTips.ins().showTips(`|C:0x00ff00&T:领取成功`);
        if (this.actCircle[this.rewardIndex])
        DisplayUtils.removeFromParent(this.actCircle[this.rewardIndex]);
        this.init();
    }
    private init() {
        this.checkStartIndex();
        this.startBoxId = this.startBoxId ? this.startBoxId : 1;
        this.dicecount.text = Millionaire.ins().dice + "";
        this.count.text = `当前圈数： ${Millionaire.ins().round + 1}`;

        this.go.label = Millionaire.ins().dice > 0? "免费": "元宝20";

        this.paycount.text = GlobalConfig.RichManBaseConfig.dicePrice + "";
        this.setBoxPos();
    }

    private setProgressBar() {
        let curRound: number = Millionaire.ins().round;
        let maxRound: number = GlobalConfig.RichManRoundAwardConfig[Object.keys(GlobalConfig.RichManRoundAwardConfig).length].round;
        let percent: number = 0;
        let pos: number = (this.startBoxId - 1) * 4;
        let num: number = 100;//每段进度的值
        // for( let i = pos,idx = 0; i < pos+4;i++,idx++ ){
        // 	let index:number = i+1;
        // 	if( !idx ){
        // 		if( curRound >= GlobalConfig.RichManRoundAwardConfig[index].round )
        // 			percent += 0;//只有三段
        // 		else
        // 			break;
        // 		continue;
        // 	}
        // 	let cfg:RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[index];
        // 	let precfg:RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[index-1];
        // 	let needRound:number = cfg.round - precfg.round;//差值是段的百分比总数
        // 	let cnRound:number = curRound-precfg.round;
        // 	cnRound = cnRound>0?cnRound:0;
        // 	let pcent:number = cnRound/needRound;
        // 	if( pcent >= 1 ){
        // 		percent += num;
        // 	}else{
        // 		percent += Math.floor(num*pcent);
        // 	}
        // }
        //
        // this.bar1.value   = percent>=99?100:percent;
        // // this.bar1.maximum = maxRound;
        // this.bar1.labelFunction = function () {
        // 	// return `${percent}/100`;
        // 	// return `${curRound}/${maxRound}`;
        // 	return "";
        // }
        for (let i = pos, idx = 0; i < pos + 4; i++ , idx++) {
            let index: number = i + 1;
            if (!idx) {
                continue;
            }
            if (this["bar" + (idx - 1)] && this["bar" + (idx - 1)].value < 100) {
                this["bar" + idx].value = 0;
                this["bar" + idx].labelFunction = function () {
                    // return `${percent}/100`;
                    // return `${curRound}/${maxRound}`;
                    return "";
                }
                continue;
            }
            let cfg: RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[index];
            let precfg: RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[index - 1];
            let needRound: number = cfg.round - precfg.round;//差值是段的百分比总数
            let cnRound: number = curRound - precfg.round;
            cnRound = cnRound > 0 ? cnRound : 0;
            let pcent: number = cnRound / needRound;
            if (pcent >= 1) {
                percent = num;
            } else {
                percent = Math.floor(num * pcent);
            }
            this["bar" + idx].value = percent >= 100 ? 100 : percent;
            this["bar" + idx].labelFunction = function () {
                // return `${percent}/100`;
                // return `${curRound}/${maxRound}`;
                return "";
            }
        }

    }

    public onClick(e: egret.TouchEvent): void {
        switch (e.currentTarget) {
            case this.go:
                this.turnDice();
                break;
            case this.autoGo:
                Millionaire.ins().isAutoGo = !Millionaire.ins().isAutoGo;
                this.autoGo.label = Millionaire.ins().isAutoGo ? "停止" : "自动掷骰子";
                break;
            case this.arrowleft:
                this.MoveLeft();
                break;
            case this.arrowright:
                this.MoveRight();
                break;

        }
    }
    private turnDice() {
        //不允许在某些情况点击
        if (this.millionaireView.effing || this.millionaireView.btnUp)
            return;

        if (Millionaire.ins().dice > 0) {
            Millionaire.ins().sendTurnDice();
            this.millionaireView.btnUp = true;
            this.go.label =  "免费";
            if (!Millionaire.ins().isAutoGo)
                this.millionaireView.diceimg = true;//摇骰中
        }
        else {
            this.go.label = "元宝20";

            if (Millionaire.ins().autoTurnDice) {//勾选了不弹出提示框
                this.cost();
            }
            else {
                //如果自动摇骰子 即便没勾选 也不会弹框
                if (Millionaire.ins().isAutoGo) {
                    this.cost();
                    return;
                }
                //确认框
                WarnWin.show(`是否消费${GlobalConfig.RichManBaseConfig.dicePrice}元宝投掷一次?`, () => {
                    this.cost();
                }, this, () => {
                    SysSetting.ins().setBool(SysSetting.DICE, false);
                    Millionaire.ins().autoTurnDice = 0;
                }, this, "check");
            }

            // UserTips.ins().showTips(`|C:0xff0000&T:剩余骰子数量不足`);
        }
    }
    private cost() {
        if (Actor.yb >= GlobalConfig.RichManBaseConfig.dicePrice) {
            Millionaire.ins().sendTurnDice();
            this.millionaireView.btnUp = true;
            if (!Millionaire.ins().isAutoGo)
                this.millionaireView.diceimg = true;//摇骰中
            this.flyRMB(GlobalConfig.RichManBaseConfig.dicePrice);
        } else {
            UserTips.ins().showTips(`|C:0xf3311e&T:元宝不足|`);
            Millionaire.ins().isAutoGo = false;
            this.millionaireView.btnUp = false;
            this.autoGo.label = "自动掷骰子";
        }
    }
    public onTab(e: egret.TouchEvent): void {
        for (let i = 1; i <= 8; i++) {
            if (e.currentTarget == this["box" + i]) {
                this.rewardIndex = i;
                this.getReward(i);
                console.log("tab" + i);
                break;
            }
        }
    }
    private getReward(i: number) {
        // i = i+(this.startBoxId-1)*4;
        ViewManager.ins().open(MillionaireTipsWin, i);
        console.log("reward" + i);
        // let cfg:RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[i];
        // if(cfg){
        // 	if ( Millionaire.ins().roundReward >> i & 1 ){
        // 		UserTips.ins().showTips(`|C:0xff0000&T:已领取`);
        // 	}else{
        // 		// ViewManager.ins().open(MillionaireTipsWin,i);
        // 		if( Millionaire.ins().round >= cfg.round ){
        // 			Millionaire.ins().sendRoundReward(i);
        // 		}else{
        // 			// UserTips.ins().showTips(`|C:0xff0000&T:所需圈数:${cfg.round}`);
        // 			ViewManager.ins().open(MillionaireTipsWin);
        // 		}
        // 	}
        // }
    }

    public onBegin(e: egret.TouchEvent): void {
        //移动中
        if (this.touchMoving)
            return;
        this.beginPoint = e.stageX;
    }
    public onEnd(e: egret.TouchEvent): void {
        //移动中
        if (this.touchMoving)
            return;

        if (this.beginPoint == 0)
            return;
        //取触控点移动的偏移量
        let offset: number = e.stageX - this.beginPoint;
        if (Math.abs(offset) < 5) {
            //由于适配问题 在e.stageX永远获取的是舞台X 这边没办法锁定区域范围
            // let p:egret.Point = this.arrowleft.localToGlobal();
            // this.touchGroup.globalToLocal(p.x,p.y,p);
            // let p2:egret.Point = this.arrowright.localToGlobal();
            // this.touchGroup.globalToLocal(p2.x,p2.y,p2);
            // egret.log("e.stageX = "+e.stageX);
            // if( e.stageX <= p.x + this.arrowleft.width + 20 || e.stageX >= p2.x )
            // 	return;
            // let i = 0;
            // //位置1
            // if( e.stageX > p.x + this.arrowleft.width + 20 &&
            // 	e.stageX < p.x + this.arrowleft.width + 91){
            // 	i = 1;
            // }
            // //位置2
            // else if( e.stageX > p.x + this.arrowleft.width + 126 &&
            // 		 e.stageX < p.x + this.arrowleft.width + 126 + 91){
            // 	i = 2;
            // }
            // //位置3
            // else if( e.stageX > p.x + this.arrowleft.width + 243 &&
            // 	e.stageX < p.x + this.arrowleft.width + 243 + 91){
            // 	i = 3;
            // }
            // //位置4
            // else if( e.stageX > p.x + this.arrowleft.width + 364 &&
            // 	e.stageX < p.x + this.arrowleft.width + 364 + 91){
            // 	i = 4;
            // }
            // egret.log("位置 = "+i+"  奖励索引 = "+(i+(this.startBoxId-1)*4));
            // if( !i )return;
            // this.getReward(i);
            return;
        }
        this.Moving(offset);

    }
    private Moving(offset: number) {
        //往左滑
        if (offset < 0) {
            this.MoveRight();
        }
        //往右滑
        else {
            this.MoveLeft();
        }
    }
    //按右键 往左滑
    private MoveRight() {
        this.touchMoving = true;
        let self = this;
        if (this.startBoxId >= MillionaireWin.MaxBoxGroup) {
            //已经在最右边上了
            this.touchMoving = false;
            this.arrowright.visible = false;
            this.arrowleft.visible = !this.arrowright.visible;
            return;
        }
        this.startBoxId++;
        if (this.startBoxId >= MillionaireWin.MaxBoxGroup) {
            this.startBoxId = MillionaireWin.MaxBoxGroup;
            this.arrowright.visible = false;
            this.arrowleft.visible = !this.arrowright.visible;
        }
        for (let i = 1; i <= MillionaireWin.MaxBoxGroup; i++) {
            egret.Tween.get(this["group" + i]).
            to({ x: this["group" + i].x - this["group" + i].width }, this.ewtime).call(() => {
                egret.Tween.removeTweens(self["group" + i]);
                if (i == MillionaireWin.MaxBoxGroup) {
                    self.setBoxPos();
                    self.touchMoving = false;
                    this.arrowleft.visible = true;
                }
            });
        }


    }
    //按左键 往右滑
    private MoveLeft() {
        this.touchMoving = true;
        let self = this;
        if (this.startBoxId <= 1) {
            //已经在最左边上了
            this.touchMoving = false;
            this.arrowleft.visible = false;
            this.arrowright.visible = !this.arrowleft.visible;
            let roundRewards: number = Object.keys(GlobalConfig.RichManRoundAwardConfig).length;
            if (Math.floor(roundRewards / 4) == 1) {
                this.arrowright.visible = false;
            }
            return;
        }
        this.startBoxId--;
        if (this.startBoxId <= 1) {
            this.startBoxId = 1;
            this.arrowleft.visible = false;
            this.arrowright.visible = !this.arrowleft.visible;
            let roundRewards: number = Object.keys(GlobalConfig.RichManRoundAwardConfig).length;
            if (Math.floor(roundRewards / 4) == 1) {
                this.arrowright.visible = false;
            }
        }
        for (let i = 1; i <= MillionaireWin.MaxBoxGroup; i++) {
            egret.Tween.get(this["group" + i]).
            to({ x: this["group" + i].x + this["group" + i].width }, this.ewtime).call(() => {
                egret.Tween.removeTweens(self["group" + i]);
                if (i == MillionaireWin.MaxBoxGroup) {
                    self.setBoxPos();
                    self.touchMoving = false;
                    this.arrowright.visible = true;
                }
            });
        }

    }
    private setBoxPos() {
        //初始化一遍位置
        for (let i = 1; i <= MillionaireWin.MaxBoxGroup; i++) {
            if (i == 1) {
                this["group" + i].x = 48;
                continue;
            }
            let dix: number = i - this.startBoxId;
            this["group" + i].x = this["group" + (i - 1)].x + this["group" + i].width * dix;
        }
        for (let i = 1; i <= MillionaireWin.MaxBoxGroup; i++) {
            if (i == this.startBoxId) {
                this["group" + i].x = 48;
            } else if (i < this.startBoxId) {
                let dix: number = this.startBoxId - i;
                let index: number = i - 1 > 0 ? i - 1 : 1;
                this["group" + i].x = this["group" + index].x - this["group" + i].width * dix;
            } else {
                let dix: number = i - this.startBoxId;
                this["group" + i].x = this["group" + (i - 1)].x + this["group" + i].width * dix;
            }
        }
        this.updateRewardUI();
    }
    private updateRewardUI() {
        let pos: number = (this.startBoxId - 1) * 4;
        let idx: number = 0;
        for (let i = pos; i < pos + 4; i++) {
            let index: number = i + 1;
            let round: number = GlobalConfig.RichManRoundAwardConfig[index].round;
            this["box" + idx + "desc"].textFlow = TextFlowMaker.generateTextFlow1(`|C:0xD1C28F&T:${round}`);
            if (Millionaire.ins().roundReward >> index & 1) {
                // this[`box${idx}desc`].textFlow = TextFlowMaker.generateTextFlow1(`|C:0x35E62D&T:已领取`);
                this.clearEff(index);
            }
            else {
                // this["box"+idx+"desc"].text = `第${round}圈`;
                this.updateEff(index, round);
            }
            idx++;
        }
        this.setProgressBar();
    }

    private updateEff(idx: number, round: number) {
        if (Millionaire.ins().round >= round) {
            this["box" + idx].source = "rich_p2_json.rich_gift_get";
            this.seteff(idx);
        } else {
            this["box" + idx].source = "rich_p2_json.rich_gift_lock";
        }
    }

    //设置特效渲染
    private seteff(idx:number):void{
        if (!this.actCircle[idx])
        this.actCircle[idx] = new MovieClip;
        if (!this.actCircle[idx].parent)
        this.reward.addChild(this.actCircle[idx]);
        let x = 6;
        this.actCircle[idx].x = this["box" + idx].x + (82-(4-idx)*x);
        if (idx==4){
            this.actCircle[idx].y = this["box" + idx].y + 76;
        }else if (idx == 1){
            this.actCircle[idx].y = this["box" + idx].y + 81;
        } else {
            this.actCircle[idx].y = this["box" + idx].y + 77;
        }
        this.actCircle[idx].rotation = this["box" + idx].rotation;
        this.actCircle[idx].playFile(RES_DIR_EFF + "richeff", -1);
    }

    private clearEff(idx: number) {
        this["box" + idx].source = "rich_p2_json.rich_gift_got";
    }

    private checkStartIndex() {
        for (let i = 1; i <= Object.keys(GlobalConfig.RichManRoundAwardConfig).length; i++) {
            let cfg: RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[i];
            if (cfg) {
                if (Millionaire.ins().roundReward >> i & 1) {
                    // UserTips.ins().showTips(`|C:0xff0000&T:已领取`);
                } else {
                    this.startBoxId = Math.floor(i / 5) + 1;
                    break;
                }
            }
        }

        if (this.startBoxId <= 1) {
            this.arrowleft.visible = false;
            this.arrowright.visible = !this.arrowleft.visible;
            let roundRewards: number = Object.keys(GlobalConfig.RichManRoundAwardConfig).length;
            if (Math.floor(roundRewards / 4) == 1) {
                this.arrowright.visible = false;
            }
        } else if (this.startBoxId >= MillionaireWin.MaxBoxGroup) {
            this.arrowleft.visible = true;
            this.arrowright.visible = !this.arrowleft.visible;
        } else {
            this.arrowleft.visible = true;
            this.arrowright.visible = true;
        }

    }

    private flyRMB(rmb: number) {
        let obj: eui.BitmapLabel = new eui.BitmapLabel();
        obj.font = <any>'num_2_fnt';
        // obj.size = 18;
        // obj.textFlow = TextFlowMaker.generateTextFlow1(`|C:0xff0000&T:-${rmb}`);
        obj.y = this.roleSelect.y + 10;
        obj.x = this.roleSelect.x + 490;
        obj.scaleX = obj.scaleY = 1.5;
        obj.text = `-${rmb}`;
        this.roleSelect.parent.addChild(obj);
        egret.Tween.get(obj).
        to({ y: obj.y + 50 }, 1000).call(() => {
            DisplayUtils.removeFromParent(obj);
        });

        // let obj: egret.DisplayObjectContainer = new egret.DisplayObjectContainer();
        // BitmapNumber.ins().changeNum(obj, '-'+rmb, '2', 1, 0);
        // obj.anchorOffsetX = obj.width/2;
        // obj.y = this.roleSelect.y;
        // obj.x = this.roleSelect.x + 500;
        // obj.scaleX = obj.scaleY = 1;
        // this.roleSelect.parent.addChild(obj);

        // egret.Tween.get(obj).
        // to({y:obj.y + 80,scaleX:2,scaleY:2},200).
        // to({scaleX:1.2,scaleY:1.2},100).wait(1000).
        // to({alpha:0,y:obj.y+140},1000).call(()=>{
        // 	DisplayUtils.removeFromParent(obj);
        // });
    }
    public close(...param: any[]): void {
        this.removeTouchEvent(this.go, this.onClick);
        this.removeTouchEvent(this.autoGo, this.onClick);
        // this.touchGroup.removeEventListener(egret.TouchEvent.TOUCH_BEGIN, this.onBegin, this);
        // this.touchGroup.removeEventListener(egret.TouchEvent.TOUCH_END, this.onEnd, this);

        this.millionaireView.close();
        for (let i = 1; i <= 8; i++) {
            this.removeTouchEvent(this["box" + i], this.onTab);
        }
        TimerManager.ins().remove(this.updateMillionaire, this);

        for (let i = 0; i < this.actCircle.length; i++) {
            if (this.actCircle[i])
                DisplayUtils.removeFromParent(this.actCircle[i]);
        }
        //DisplayUtils.removeFromParent(this.masksp);
        //this.masksp = null;
        this.removeObserve();
    }

    private onCloseBtn(): void {
        ViewManager.ins().close(this);
    }


}
ViewManager.ins().reg(MillionaireWin, LayerManager.UI_Main);
