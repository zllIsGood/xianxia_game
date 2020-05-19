/**
 * 大富翁主界面
 *
 */

//8个方位和中心区域
enum DIRECTION {
    LEFT_TOP = 1,  //左上
    TOP_MID,       //上中
    RIGHT_TOP, 	   //右上
    LEFT_MID,      //左中
    RIGHT_MID,     //右中
    LEFT_DOWN,     //左下
    DOWN_MID,      //下中
    RIGHT_DOWN,    //右下
    MOVING         //中心移动区域
}

class MillionaireView extends BaseEuiView {
    //同时对应人物模型方向
    public static DIR_UP = 1;
    public static DIR_RIGHT = 2;
    public static DIR_DOWN = 3;
    public static DIR_LEFT = 4;

    private step = 3;//每次移动像素
    private gridList: MillionaireItem[];//索引从1开始 0是Null
    private roleModel: MillionaireRole;
    private curGridId: number;

    private masksp: egret.Sprite;
    private mapGroup: eui.Group;

    private cameraWidth: number;
    private cameraHeight: number;

    private updateStop: boolean;
    private nextPos: number;//下一个点id
    public countDown: number;//走回经过起点等待时间(秒)
    private aniTime: number;//动画时间
    private dictime: number;//帧时间
    private count: number = 0;//帧计数器
    public effing: boolean;//是否正在播放特效
    public btnUp: boolean;//点击摇骰后到等到达目标重置

    private isUpdateRandom: boolean;//当圈前第一次摇到(57-4返回)

    private stepNum: number;//到达起点后剩余所走步数
    private arrEff: boolean[];
    private callfunc: any;

    public diceimg: boolean;//摇骰中(包括展示过程)
    constructor() {
        super();
        // this.skinName = 'richmanViewSkin';
        // this.isTopLevel = true;
        this.gridList = [];
        this.curGridId = Millionaire.ins().gridId ? Millionaire.ins().gridId : 1;
        this.nextPos = this.curGridId;
        //测试跑动全程
        // this.curGridId = 1;
        // Millionaire.ins().gridId = 108;
        this.cameraWidth = GlobalConfig.RichManBaseConfig.cameraWidth;//StageUtils.ins().getWidth();
        this.cameraHeight = GlobalConfig.RichManBaseConfig.cameraHeight;//StageUtils.ins().getHeight()/2;
        this.updateStop = true;//刚开始是静止
        this.countDown = 0;
        this.aniTime = 0;
        this.dictime = 10;
        this.count = 0;
        this.effing = false;
        this.btnUp = false;
        this.stepNum = 0;
        this.isUpdateRandom = false;
        this.step = GlobalConfig.RichManBaseConfig.speed;
        this.diceimg = false;
    }

    public close(...param: any[]): void {
        TimerManager.ins().remove(this.updateMillionaire, this);
        this.gridList = [];
        this.roleModel.destory();
        DisplayUtils.removeFromParent(this.masksp);
    }

    public open(...param: any[]): void {
        this.observe(Millionaire.ins().postMillionaireInfo, this.callbackMillionaireInfo);//回到起点会57-1主动推送
        this.observe(Millionaire.ins().postTurnDice, this.callbackTurnDice);//摇骰子返回
        this.observe(Millionaire.ins().postOverAllReward, this.callbackOverAllReward);//随机命运返回
        this.createMap();
        this.createRole();
        this.initPos();
        TimerManager.ins().remove(this.updateMillionaire, this);
        TimerManager.ins().doTimer(this.dictime, 0, this.updateMillionaire, this);
    }

    /**回到起点57-1主动推送**/
    private callbackMillionaireInfo() {

    }

    /**摇骰子返回**/
    private callbackTurnDice() {
        //是否跨越了起点,1是,0否
        if (Millionaire.ins().isStrideStart) {
            this.nextPos = 1;
            //总格子数列表 - 当前格子 = 离起点距离  点数-离起点距离=起点后要走的步数
            this.stepNum = Millionaire.ins().dicePoint - (this.gridList.length - this.curGridId);
        } else {
            //检查下一个目标点是否为传送门(注:服务器返回来的当前最新位置是被传送之后的)
            this.nextPos = this.curGridId + Millionaire.ins().dicePoint;
        }
        // if( this.nextPos > this.gridList.length-1 )
        // 	this.nextPos = 1;
        /**
         * 摇到随机命运有几种情况
         * 1.当圈第一次被摇到 (等待57-4返回) 此时全盘刷新
         * 2.当圈不是第一次 该格子被刷成随机命运奖励 此时是获取奖励(57-4不返回)
         * 3.当圈不是第一次 并且格子奖励被拿 由于传送门回传原因 回传再次回到该格子 此时什么都没发生(57-4不返回)
         * */
        let cfg: RichManGridConfig = GlobalConfig.RichManGridConfig[this.nextPos];
        if (cfg && cfg.action == MillionaireItem.ACTION_3) {//传送门
            //走到传送门
        }
        else {
            if (this.nextPos != 1)
                this.nextPos = Millionaire.ins().gridId;
        }

        //摇骰子结束展示骰子倒计时(时间的前一半是摇骰 后一半是展示)//自动摇骰子不展示骰子动画(包括展示)
        if (Millionaire.ins().isAutoGo)
            this.countDown = 0;
        else
            this.countDown = GlobalConfig.RichManBaseConfig.diceTime;
        this.updateStop = false;
    }

    /**随机命运返回57-4要比57-2快**/
    private callbackOverAllReward() {
        //this.updateMap();
        // this.updateMapEx();
        //有这条消息返回证明是摇中了每一圈的第一次随机命运
        this.isUpdateRandom = true;
    }

    private updateMapEx() {
        this.updateEff(() => {
            this.updateMap();
        });
    }

    private updateMapOnly() {
        let i = this.curGridId;
        this.gridList[i].setHideEff();
        //标识踩过
        Millionaire.ins().rewardIdByGrids[i] = -1;
    }

    private updateEff(callfunc: any) {
        //道具消失过程
        this.aniTime = 0.5;//动画时间
        this.effing = true;
        let self = this;
        this.arrEff = [];
        for (let i = 1; i <= this.gridList.length - 1; i++) {
            let mitem: MillionaireItem = this.gridList[i];
            if (GlobalConfig.RichManGridConfig[i].action == MillionaireItem.ACTION_3 ||
                GlobalConfig.RichManGridConfig[i].action == MillionaireItem.ACTION_4
            ) {
                //传送门和骰子不需要变
                this.arrEff[i] = true;
                continue;
            }
            this.arrEff[i] = false;
            if (mitem) {
                if (mitem.isEffing) {//资源当前正在网上飘
                    self.arrEff[i] = true;
                    continue;
                }
                egret.Tween.get(mitem.itemicon).to({scaleX: 0, scaleY: 0}, this.aniTime * 1000).call(() => {
                    egret.Tween.removeTweens(mitem.itemicon);
                    self.arrEff[i] = true;
                });
            }
        }
        this.callfunc = callfunc;
    }

    /**
     * 获取方位区域
     * **/
    private getDirection(): number {
        //地图大小小于镜头大小 直接默认左上角区域
        if (this.mapGroup.width <= this.cameraWidth && this.mapGroup.height <= this.cameraHeight)
            return DIRECTION.LEFT_TOP;

        //设置为当前最新格子为起点
        // let p:egret.Point = this.gridList[this.curGridId].localToGlobal();
        // this.globalToLocal(p.x,p.y,p);
        let p: egret.Point = new egret.Point();
        p.x = this.gridList[this.curGridId].x;
        p.y = this.gridList[this.curGridId].y;
        /***
         * 格子在可居中范围内(左上右下边界是屏幕宽高的一半所围成的矩形中间部分)
         */
        let grid_x = Math.floor(p.x + this.gridList[this.curGridId].width / 2);
        let grid_y = Math.floor(p.y + this.gridList[this.curGridId].height / 2);
        if (grid_x >= Math.floor(this.cameraWidth / 2) &&
            grid_y >= Math.floor(this.cameraHeight / 2) &&
            grid_x <= Math.floor((this.mapGroup.width - this.cameraWidth / 2)) &&
            grid_y <= Math.floor((this.mapGroup.height - this.cameraHeight / 2))
        ) {
            // egret.log("镜头区域");
            return DIRECTION.MOVING;
        }
        //环形8个边界
        else {
            //左上
            if (grid_x <= Math.floor(this.cameraWidth / 2) &&
                grid_y <= Math.floor(this.cameraHeight / 2)
            ) {
                // egret.log("左上区域");
                return DIRECTION.LEFT_TOP;

            }
            //上中(x居中)
            else if (grid_x >= Math.floor(this.cameraWidth / 2) &&
                grid_x <= Math.floor((this.mapGroup.width - this.cameraWidth / 2)) &&
                grid_y <= Math.floor(this.cameraHeight / 2)
            ) {
                // egret.log("上中区域");
                return DIRECTION.TOP_MID;
            }
            //右上
            else if (grid_x >= Math.floor(this.mapGroup.width - this.cameraWidth / 2) &&
                grid_y <= Math.floor(this.cameraHeight / 2)
            ) {
                // egret.log("右上区域");
                return DIRECTION.RIGHT_TOP;

            }
            //左中(y居中)
            else if (grid_x <= Math.floor((this.cameraWidth / 2)) &&
                grid_y >= Math.floor(this.cameraHeight / 2) &&
                grid_y <= Math.floor(this.mapGroup.height - this.cameraHeight / 2)
            ) {
                // egret.log("左中区域");
                return DIRECTION.LEFT_MID;

            }
            //右中(y居中)
            else if (grid_x >= Math.floor((this.mapGroup.width - this.cameraWidth / 2)) &&
                grid_y >= Math.floor(this.cameraHeight / 2) &&
                grid_y <= Math.floor(this.mapGroup.height - this.cameraHeight / 2)
            ) {
                // egret.log("右中区域");
                return DIRECTION.RIGHT_MID;

            }
            //左下
            else if (grid_x <= Math.floor(this.cameraWidth / 2) &&
                grid_y >= Math.floor((this.mapGroup.height - this.cameraHeight / 2))
            ) {
                // egret.log("左下区域");
                return DIRECTION.LEFT_DOWN;

            }
            //下中(x居中)
            else if (grid_x >= Math.floor(this.cameraWidth / 2) &&
                grid_x <= Math.floor((this.mapGroup.width - this.cameraWidth / 2)) &&
                grid_y >= Math.floor((this.mapGroup.height - this.cameraHeight / 2))
            ) {
                // egret.log("下中区域");
                return DIRECTION.DOWN_MID;

            }
            //右下
            else if (grid_x >= Math.floor(this.mapGroup.width - this.cameraWidth / 2) &&
                grid_y >= Math.floor((this.mapGroup.height - this.cameraHeight / 2))
            ) {
                // egret.log("右下区域");
                return DIRECTION.RIGHT_DOWN;

            }
            // egret.log("异常区域");
            return 0;
        }
    }

    //初始化位置
    private initPos() {
        /**这里需要做一个重置当前mapGroup的步骤 不然全局转本地就不是相对0,0点**/
        this.mapGroup.x = 0;
        this.mapGroup.y = 0;
        //设置为当前最新格子为起点
        let p: egret.Point = this.gridList[this.curGridId].localToGlobal();
        this.globalToLocal(p.x, p.y, p);

        /***
         * 格子在可居中范围内(左上右下边界是屏幕宽高的一半所围成的矩形中间部分)
         */
        let dir: number = this.getDirection();
        if (dir == DIRECTION.MOVING) {
            // egret.log("(中央区域)");
          //  this.mapGroup.x = this.cameraWidth / 2 - p.x - this.gridList[this.curGridId].width / 2;
           // this.mapGroup.y = this.cameraHeight / 2 - p.y - this.gridList[this.curGridId].height / 2;
            // this.roleModel.x = this.mapGroup.x;
            // this.roleModel.y = this.mapGroup.y;
        }
        //环形8个边界
        else {
            //左上
            if (dir == DIRECTION.LEFT_TOP) {
                // egret.log("(左上区域)");
           //     this.mapGroup.x = 0;
             //   this.mapGroup.y = 0;
                // this.roleModel.x = p.x + this.roleModel.width/62;
                // this.roleModel.y = p.y + this.roleModel.height/2;
            }
            //上中(x居中)
            else if (dir == DIRECTION.TOP_MID) {
                // egret.log("(上中区域)");
           //     this.mapGroup.x = -p.x + this.cameraWidth / 2 - this.gridList[this.curGridId].width / 2;
           //     this.mapGroup.y = 0;

            }
            //右上
            else if (dir == DIRECTION.RIGHT_TOP) {
                // egret.log("(右上区域)");
          //      this.mapGroup.x = this.cameraWidth - this.mapGroup.width - this.gridList[this.curGridId].width / 2;
           //     this.mapGroup.y = 0;

            }
            //左中(y居中)
            else if (dir == DIRECTION.LEFT_MID) {
                // egret.log("(左中区域)");
          //      this.mapGroup.x = 0;
          //      this.mapGroup.y = -p.y + this.cameraHeight / 2 - this.gridList[this.curGridId].height / 2;

            }
            //右中(y居中)
            else if (dir == DIRECTION.RIGHT_MID) {
                // egret.log("(右中区域)");
          //      this.mapGroup.x = this.cameraWidth - this.mapGroup.width - this.gridList[this.curGridId].width / 2;
           //     this.mapGroup.y = -p.y + this.cameraHeight / 2 - this.gridList[this.curGridId].height / 2;
            }
            //左下
            else if (dir == DIRECTION.LEFT_DOWN) {
                // egret.log("(左下区域)");
        //        this.mapGroup.x = 0;
        //        this.mapGroup.y = this.cameraHeight - this.mapGroup.height - this.gridList[this.curGridId].height / 2;
            }
            //下中(x居中)
            else if (dir == DIRECTION.DOWN_MID) {
                // egret.log("(下中区域)");
        //        this.mapGroup.x = -p.x + this.cameraWidth / 2 - this.gridList[this.curGridId].width / 2;
         //       this.mapGroup.y = this.cameraHeight - this.mapGroup.height - this.gridList[this.curGridId].height / 2;
            }
            //右下
            else if (dir == DIRECTION.RIGHT_DOWN) {
                // egret.log("(右下区域)");
          //      this.mapGroup.x = this.cameraWidth - this.mapGroup.width - this.gridList[this.curGridId].width / 2;
         //       this.mapGroup.y = this.cameraHeight - this.mapGroup.height - this.gridList[this.curGridId].height / 2;
            }
            // egret.log("this.curGridId = "+this.curGridId);
            // egret.log("p.x = "+p.x);
            // egret.log("p.y = "+p.y);
            // egret.log("this.mapGroup.x = "+this.mapGroup.x);
            // egret.log("this.mapGroup.y = "+this.mapGroup.y);
        }
        //除了左上以外  其他情况移动地图后要重新计算子类相对位置(这里为了统一也算上左上)
        p = this.gridList[this.curGridId].localToGlobal();
        this.globalToLocal(p.x, p.y, p);
        this.roleModel.x = p.x + this.roleModel.width / 2;
        this.roleModel.y = p.y + this.roleModel.height / 2;
    }

    //创建人物
    private createRole() {
        let role: Role = SubRoles.ins().getSubRoleByIndex(0);
        this.roleModel = new MillionaireRole(role.sex);
        let cfg: RichManGridConfig = GlobalConfig.RichManGridConfig[this.curGridId];
        if (cfg)
            this.roleModel.state = cfg.dir;//初始方向
        this.roleModel.width = 53;
        this.roleModel.height = 53 + 38;
        this.roleModel.x = this.roleModel.x + this.roleModel.width / 2;
        this.roleModel.y = this.roleModel.y + this.roleModel.height / 2;
        this.roleModel.updateModel();
        this.addChild(this.roleModel);
        // if( this.curGridId != 1 ){
        // 	let p:egret.Point = this.gridList[this.curGridId].localToGlobal();
        // 	this.globalToLocal(p.x,p.y,p);
        // 	this.roleModel.x = p.x + this.roleModel.width/2;
        // 	this.roleModel.y = p.y + this.roleModel.height/2;
        // }

    }

    //创建地图
    private createMap() {
        if (!this.mapGroup) {
            this.mapGroup = new eui.Group();//egret.Sprite
            this.mapGroup.x = 0;
            this.mapGroup.y = 0;
            this.addChild(this.mapGroup);
        }
        //初始化格子数据(格子控件内部包括了查看当前是否踩过随机命运)
        for (let i = 1; i <= Millionaire.ins().rewardIdByGrids.length - 1; i++) {
            let cfg: RichManGridConfig = GlobalConfig.RichManGridConfig[i];
            if (cfg) {
                if (i == 1) {
                    let mitem: MillionaireItem = new MillionaireItem();
                    mitem.x = 0;
                    mitem.y = 0;
                    mitem.data = {rewardId: Millionaire.ins().rewardIdByGrids[i], index: i};
                    this.mapGroup.addChild(mitem);
                    this.gridList[i] = mitem;
                    continue;
                }
                let precfg: RichManGridConfig = GlobalConfig.RichManGridConfig[i - 1];
                if (!precfg)
                    continue;
                let mitem: MillionaireItem = new MillionaireItem();
                mitem.data = {rewardId: Millionaire.ins().rewardIdByGrids[i], index: i};
                this.gridList[i] = mitem;
                this.mapGroup.addChild(mitem);
                //下一个方向
                switch (precfg.dir) {
                    case MillionaireView.DIR_UP:
                        mitem.x = this.gridList[i - 1].x;
                        mitem.y = this.gridList[i - 1].y - 72;
                        break;
                    case MillionaireView.DIR_RIGHT:
                        mitem.x = this.gridList[i - 1].x + 72;
                        mitem.y = this.gridList[i - 1].y;
                        break;
                    case MillionaireView.DIR_DOWN:
                        mitem.x = this.gridList[i - 1].x;
                        mitem.y = this.gridList[i - 1].y + 72;
                        break;
                    case MillionaireView.DIR_LEFT:
                        mitem.x = this.gridList[i - 1].x - 72;
                        mitem.y = this.gridList[i - 1].y;
                        break;
                }
            }
        }

        this.sortGrid();//重新分配格子层级
        //可视区域遮罩
        if (!this.masksp) {
            this.masksp = new egret.Sprite();
            let square: egret.Shape = new egret.Shape();
            square.graphics.beginFill(0xffff00);
            square.graphics.drawRect(this.mapGroup.x, this.mapGroup.y - 72, this.cameraWidth, this.cameraHeight + 170);
            square.graphics.endFill();
            this.masksp.addChild(square);
            this.addChild(this.masksp);
            this.mapGroup.mask = this.masksp;
        }
    }

    //更新地图(主要用于随机数据)
    private updateMap() {
        //如果碰到固定圈数奖励 优先奖励并且显示固定圈数的奖励)
        // let randomId:number = Millionaire.ins().randomGridById;
        for (let i = 1; i <= this.gridList.length - 1; i++) {
            this.gridList[i].data = {rewardId: Millionaire.ins().rewardIdByGrids[i], index: i};
            this.gridList[i].itemicon.scaleX = 1;
            this.gridList[i].itemicon.scaleY = 1;
            // //随机命运奖励(普通奖励全部替换成随机命运奖励)
            // if( randomId ){
            // 	this.gridList[i].data = {rewardId:Millionaire.ins().randomGridByRewardId,index:randomId};
            // }
            // else{
            // 	//普通奖励(固定圈数奖励在MillionaireItem控件里边有处理 这里直接传普通奖励)
            // 	this.gridList[i].data = {rewardId:Millionaire.ins().rewardIdByGrids[i],index:i};
            // }
        }
    }

    private sortGrid(): void {
        this.mapGroup.$children.sort(this.sortF);
    }

    private sortF(d1: MillionaireItem, d2: MillionaireItem): number {
        if (d1.y > d2.y) {
            return 1;
        } else if (d1.y < d2.y) {
            return -1;
        } else {
            return 0;
        }
    }

    //更新大富翁
    public updateMillionaire() {
        //摇骰子时间倒计时
        if (this.countDown) {
            this.count += this.dictime / 100;
            if (this.count >= 1) {
                this.countDown -= 0.1;
                this.count = 0;
            }
            if (this.countDown <= 0) {
                this.countDown = 0;
                this.count = 0;
                this.diceimg = false;//摇骰结束(包括展示)
            }
            return;
        }


        //满一圈和随机命运更新特效
        if (this.effing) {
            //特效是否全部播放完毕
            let isSuccess: boolean = true;
            for (let i = 1; i <= this.arrEff.length - 1; i++) {
                if (!this.arrEff[i]) {
                    isSuccess = false;
                    break;
                }
            }

            if (isSuccess) {
                if (this.callfunc && typeof (this.callfunc) == "function")
                    this.callfunc();
                this.effing = false;
                this.callfunc = null;
                // this.roleModel.roleType = MillionaireRole.ACTION;//checkRoleType做判断 此时仍然是STOP状态
                //经过起点后还要走多少步
                if (this.stepNum > 0) {
                    this.nextPos += this.stepNum;
                    this.stepNum = 0;
                }
                //刚好踩在起点
                if (this.curGridId == this.nextPos) {
                    // this.updateStop = true;//checkRoleType做判断 此时仍然是STOP状态
                    this.btnUp = false;//重置按钮弹起
                }
            }
            return;
        }

        //静止不做处理(静止可能是经过起点静止 但没到目标点)
        if (this.updateStop)
            return;

        if (this.roleModel) {
            this.checkRoleType();
            if (this.roleModel.roleType == MillionaireRole.ACTION) {
                this.Action();//此处会检测让行动变成静止的过程
            } else {
                this.Stop();
            }
        }
    }

    //检测当前状态
    private checkRoleType() {
        if (this.curGridId != this.nextPos) {
            this.roleModel.roleType = MillionaireRole.ACTION;
        }
        // else{
        //  即便id相同 可能还在行走目标途中
        // 	this.roleModel.roleType = MillionaireRole.STOP;
        // }
    }

    //获取当前要移动到的目标格子
    private getMoveGridId() {
        if (this.curGridId != this.nextPos) {
            let p: egret.Point = this.gridList[this.curGridId].localToGlobal();
            this.globalToLocal(p.x, p.y, p);
            //检查是否到达将要到达的格子(路途经过的格子)
            if (p.x + this.roleModel.width / 2 == this.roleModel.x && p.y + this.roleModel.height / 2 == this.roleModel.y) {
                this.curGridId += 1;
                if (this.curGridId > this.gridList.length - 1)
                    this.curGridId = 1;
                //改变人物方向
                let cfg: RichManGridConfig = GlobalConfig.RichManGridConfig[this.curGridId - 1];
                if (cfg) {
                    this.roleModel.state = cfg.dir;
                }
            }
        }
        this.roleModel.updateModel();
        return this.curGridId;
    }

    //静止
    private Stop() {
        this.updateStop = true;
        this.roleModel.updateModel();
    }

    //行动
    private Action() {
        this.updateStop = false;
        let newGridId = this.getMoveGridId();
        let p: egret.Point = this.gridList[newGridId].localToGlobal();
        this.globalToLocal(p.x, p.y, p);
        let difX: number = 0;//x差
        let difY: number = 0;//y差
        //检查这1步像素是否>将要到达目标格子的相应xy坐标
        //先求出离下一个到达格子的距离差
        switch (this.roleModel.state) {
            case MillionaireView.DIR_LEFT:
            case MillionaireView.DIR_RIGHT:
                if (this.roleModel.x != p.x + this.roleModel.width / 2) {
                    difX = p.x - this.roleModel.x + this.roleModel.width / 2;
                }
                break;
            case MillionaireView.DIR_UP:
            case MillionaireView.DIR_DOWN:
                if (this.roleModel.y != p.y + this.roleModel.height / 2) {
                    difY = p.y - this.roleModel.y + this.roleModel.height / 2;
                }
                break;
        }
        //剩余距离差值大于1步像素 直接获取1步像素格子
        if (Math.abs(difX) > this.step) {
            difX = this.getStepPixel(this.roleModel.state);//x差
        }
        if (Math.abs(difY) > this.step) {
            difY = this.getStepPixel(this.roleModel.state);//y差
        }

        //*******************************临界点检测(移动距离跨屏幕中央)****************************************//
        //求出人物移动的差值是否超出屏幕中央
        let moveObj: MillionaireRole | eui.Group;
        /**X*/
        let isRoleX: boolean;

        let dir: number = this.getDirection();
        // if (dir == DIRECTION.LEFT_TOP || dir == DIRECTION.LEFT_MID || dir == DIRECTION.LEFT_DOWN ||
        //     dir == DIRECTION.RIGHT_TOP || dir == DIRECTION.RIGHT_MID || dir == DIRECTION.RIGHT_DOWN ||
        //     dir == DIRECTION.TOP_MID || dir == DIRECTION.DOWN_MID
        // ) {
        //     //边界走向中心判定
        //     if ((dir == DIRECTION.LEFT_TOP || dir == DIRECTION.LEFT_MID || dir == DIRECTION.LEFT_DOWN) &&//左上/左中/左下 左右
        //         (this.roleModel.state == MillionaireView.DIR_RIGHT || this.roleModel.state == MillionaireView.DIR_LEFT) &&
        //         (this.mapGroup.x >= 0) ||
        //         (dir == DIRECTION.RIGHT_TOP || dir == DIRECTION.RIGHT_MID || dir == DIRECTION.RIGHT_DOWN) &&//右上/右中/右下 左右
        //         (this.roleModel.state == MillionaireView.DIR_LEFT || this.roleModel.state == MillionaireView.DIR_RIGHT) &&
        //         (this.mapGroup.x <= -this.mapGroup.width + this.cameraWidth) ||
        //         (dir == DIRECTION.TOP_MID || dir == DIRECTION.DOWN_MID) && this.roleModel.state == MillionaireView.DIR_RIGHT &&//上中/下中 往右
        //         (this.roleModel.x + this.roleModel.width / 2 < this.cameraWidth / 2) ||
        //         (dir == DIRECTION.TOP_MID || dir == DIRECTION.DOWN_MID) && this.roleModel.state == MillionaireView.DIR_LEFT &&//上中/下中 往左
        //         (this.roleModel.x + this.roleModel.width / 2 > this.cameraWidth / 2)
        //     ) {
        //         moveObj = this.roleModel;
        //         isRoleX = true;
        //     }
        //     //中心走向边界判定
        //     else {
        //         moveObj = this.mapGroup;
        //         difX = -difX;
        //         isRoleX = false;
        //     }
        //
        // }
        // else {
        //     moveObj = this.mapGroup;
        //     difX = -difX;
        //     isRoleX = false;
        // }

        moveObj = this.roleModel;
        isRoleX = true;

        let nextPosX = moveObj.x + difX;

        // /**Y*/
        let isRoleY: boolean;

        // if (dir == DIRECTION.LEFT_TOP || dir == DIRECTION.TOP_MID || dir == DIRECTION.RIGHT_TOP ||
        // 	dir == DIRECTION.LEFT_DOWN || dir == DIRECTION.DOWN_MID || dir == DIRECTION.RIGHT_DOWN ||
        // 	dir == DIRECTION.LEFT_MID || dir == DIRECTION.RIGHT_MID
        // ) {
        // 	//边界走向中心判定
        // 	if ((dir == DIRECTION.LEFT_TOP || dir == DIRECTION.TOP_MID || dir == DIRECTION.RIGHT_TOP) &&//左上/中上/右上 上下
        // 		(this.roleModel.state == MillionaireView.DIR_DOWN || this.roleModel.state == MillionaireView.DIR_UP) &&
        // 		(this.mapGroup.y >= 0) ||
        // 		(dir == DIRECTION.LEFT_DOWN || dir == DIRECTION.DOWN_MID || dir == DIRECTION.RIGHT_DOWN) &&//左下/中下/右下 上下
        // 		(this.roleModel.state == MillionaireView.DIR_UP || this.roleModel.state == MillionaireView.DIR_DOWN) &&
        // 		(this.mapGroup.y <= -this.mapGroup.height + this.cameraHeight) ||
        // 		(dir == DIRECTION.LEFT_MID || dir == DIRECTION.RIGHT_MID) && this.roleModel.state == MillionaireView.DIR_DOWN &&//左中/右中 往下
        // 		(this.roleModel.y + this.roleModel.height / 2 < this.cameraHeight / 2) ||
        // 		(dir == DIRECTION.LEFT_MID || dir == DIRECTION.RIGHT_MID) && this.roleModel.state == MillionaireView.DIR_UP &&//左中/右中 往上
        // 		(this.roleModel.y + this.roleModel.height / 2 > this.cameraHeight / 2)
        // 	) {
        // 		moveObj = this.roleModel;
        // 		isRoleY = true;
        // 	}
        // 	//中心走向边界判定
        // 	else {
        // 		moveObj = this.mapGroup;
        // 		difY = -difY;
        // 		isRoleY = false;
        // 	}
        // }
        // else {
        // 	moveObj = this.mapGroup;
        // 	difY = -difY;
        // 	isRoleY = false;
        // }
        moveObj = this.roleModel;
        isRoleY = true;
        let nextPosY = moveObj.y + difY;

        //到达目标格子
        if (!difX && !difY) {
            // egret.log(`到达目标格子:${this.curGridId}`);
            //因为下面不断置换成行动  直至与目标格子之间差距为0 此时才真正置换静止
            this.roleModel.roleType = MillionaireRole.STOP;
            this.doSometing();
            this.roleModel.updateModel();
            return;
        } else {
            /**
             * 即便当前格子与下一个格子相同 也有可能在行走的途中 真正到达需要从格子之间的的差距
             * 即difX和difY判定
             **/
            this.roleModel.roleType = MillionaireRole.ACTION;
        }
        //移动
        if (isRoleX) {
            //this.roleModel.x + this.roleModel.width/2 >= this.cameraWidth/2
            if (this.roleModel.x + this.roleModel.width / 2 < this.cameraWidth / 2 && nextPosX + this.roleModel.width / 2 > this.cameraWidth / 2 ||
                this.roleModel.x + this.roleModel.width / 2 > this.cameraWidth / 2 && nextPosX + this.roleModel.width / 2 < this.cameraWidth / 2
            )
                this.roleModel.x = this.cameraWidth / 2 - this.roleModel.width / 2;
            else
                this.roleModel.x = nextPosX;
        } else {

           // this.mapGroup.x = nextPosX;
        }
        if (isRoleY) {
            //this.roleModel.y + this.roleModel.height/2 >= this.cameraHeight/2
            if (this.roleModel.y + this.roleModel.height / 2 < this.cameraHeight / 2 && nextPosY + this.roleModel.height / 2 > this.cameraHeight / 2 || this.roleModel.y + this.roleModel.height / 2 > this.cameraHeight / 2 && nextPosY + this.roleModel.height / 2 < this.cameraHeight / 2)
                this.roleModel.y = this.cameraHeight / 2 - this.roleModel.height / 2;
            else
                this.roleModel.y = nextPosY;
        } else {
           // this.mapGroup.y = nextPosY;
        }
    }

    /**到达目标后要做的事情**/
    private doSometing() {
        let config: RichManGridConfig = GlobalConfig.RichManGridConfig[this.curGridId];
        if (!config)
            return;

        //满一圈刷新显示的奖励 等一段时间再走
        if (this.curGridId == 1) {
            this.updateMapOnly();
            this.updateMapEx();
            //两种情况:
            //还没走完 不能重置按钮状态 当前仍然this.btnUp = true;
            //目标点其实刚好就是起点 重置按钮状态this.btnUp = false;满一圈和随机命运更新特效轮询重置
            return;
        }

        //普通奖励
        if (config.action == MillionaireItem.ACTION_1) {
            // egret.log(`踩中普通奖励:${this.curGridId}`);
            this.updateMapOnly();
        }

        //随机命运
        else if (config.action == MillionaireItem.ACTION_2) {
            //踩中随机命运会把自己也刷新
            // egret.log(`踩中随机命运:${this.curGridId}`);

            if (Millionaire.ins().randomGridById <= 0) {
                UserTips.ins().showCenterTips(`踩中随机命运异常 检查4号消息是否有返回过`);
                return;
            }
            /**
             * 注意:[*这里容易出错*]
             * 因为57-4是比57-2快到!
             * 所以57-2返回时候已经知道结果
             * 踩中时候需要区分
             * 1.第一次摇中的踩中 全盘刷奖励
             * 2.当圈不是第一次摇中随机命运的格子 表示之前这格子被前一个随机命运刷了(同一圈) 踩中只判定是否有拿过这个格子的奖励
             * 处理:57-4记录当圈第一次标识 用于区分上述情况 因为摇中一次随机命运后 无论再摇中几次 随机命运id即randomGridById
             * 永远都有值(当圈) 所以踩中时候是无法判定要刷新还是要做其他 所以57-4做标识
             **/
            if (this.isUpdateRandom) {
                this.isUpdateRandom = false;
                // egret.log(`当圈第一次摇中`);
                this.updateMapEx();
            }
            else {
                //由于传送门回传 这个格子之前已经被刷过并且拿过
                if (Millionaire.ins().rewardIdByGrids[this.curGridId] == -1) {
                    // egret.log(`已获取随机命运格子被刷后的奖励`);
                    this.btnUp = false;
                    return;
                }
                //像普通情况一样拿奖励
                this.updateMapOnly();
                // egret.log(`获取随机命运格子被刷后的奖励`);
            }
        }
        //传送门(刷新到最新格子位置)
        else if (config.action == MillionaireItem.ACTION_3) {
            // egret.log(`踩中传送门:${this.curGridId}`);
            this.nextPos = Millionaire.ins().gridId;
            this.curGridId = this.nextPos;
            this.initPos();//重新刷新位置
        }
        //奖励骰子
        else if (config.action == MillionaireItem.ACTION_4) {
            // egret.log(`踩中奖励骰子:${this.curGridId}`);
            this.updateMapOnly();
        }
        this.btnUp = false;//仅仅只是经过起点没到目标点也算是行走中
    }

    //方向步伐
    private getStepPixel(state: number) {
        switch (state) {
            case MillionaireView.DIR_UP:
                return -this.step;
            case MillionaireView.DIR_DOWN:
                return this.step;
            case MillionaireView.DIR_RIGHT:
                return this.step;
            case MillionaireView.DIR_LEFT:
                return -this.step;
        }
    }

    //检查镜头是否移动
    private checkCamera(state: number, dir: number) {
        //在移动区域则不作边界判断
        if (dir == DIRECTION.MOVING)
            return true;
        //判断镜头静止人物走 还是镜头走人物静止
        switch (state) {
            case MillionaireView.DIR_UP:
                if (this.roleModel.y + this.roleModel.height / 2 > this.cameraHeight / 2)
                    return false;
                break;
            case MillionaireView.DIR_DOWN:
                if (this.roleModel.y + this.roleModel.height / 2 < this.cameraHeight / 2)
                    return false;
                break;
            case MillionaireView.DIR_RIGHT:
                if (this.roleModel.x + this.roleModel.width / 2 < this.cameraWidth / 2)
                    return false;
                break;
            case MillionaireView.DIR_LEFT:
                if (this.roleModel.x + this.roleModel.width / 2 > this.cameraWidth / 2)
                    return false;
                break;
        }
        return true;
    }

    public destoryView(): void {
        super.destoryView();
        this.close();
    }
}

// ViewManager.ins().reg(MillionaireView, LayerManager.UI_Main);