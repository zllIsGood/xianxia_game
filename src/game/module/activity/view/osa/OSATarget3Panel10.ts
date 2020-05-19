class OSATarget3Panel10 extends BaseView {
    public activityID:number;
    private actTime:eui.Label;
    private actDesc:eui.Label;
    private rechargeitem:eui.List;
    private rechargeitemData:eui.ArrayCollection;
    private redPoint:eui.Image;
    private actIds:number[];//三个页签各自活动id
    private actIndex:number;
    private selectRes:string[] = ["act_board_p1_json.act_btn_tab_unselected","act_board_p1_json.act_btn_tab_selected"];//未选中 选中
    private pageRedPoint:boolean[] = [false,false,false];//三页签红点
    private rechargeCoumt:eui.Label;
    private title:eui.Image;
    constructor() {
        super();
        // this.initSkin();
    }

    private initSkin() {
        let config = GlobalConfig.ActivityConfig[this.activityID];
        if( config.pageSkin )
            this.skinName = config.pageSkin;
        else
            this.skinName = "KMHRechargeSkin";
    }
    close() {
        TimerManager.ins().removeAll(this);
    }
    open() {
        this.initSkin();
        this.observe(Activity.ins().postRewardResult, this.updateDataCall);
        this.observe(Activity.ins().postChangePage, this.updateDataCall);
        for( let i = 0; i < 3; i++ ){
            this[`projectbg${i}`].name = i.toString();
            this.addTouchEvent(this[`projectbg${i}`], this.onTap);
        }
        this.rechargeitem.itemRenderer = KaiMenItem;
        this.rechargeitemData = new eui.ArrayCollection();
        this.rechargeitem.dataProvider = this.rechargeitemData;
        this.initData();
        TimerManager.ins().doTimer(1000, 0, this.updateTime, this);

    }

    private updateTime(){
        let act = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
        if( act ){
            let sec = act.getLeftTime();
            this.actTime.text = DateUtils.getFormatBySecond(sec, DateUtils.TIME_FORMAT_5, 3);
        }
    }
    /**根据页签数据判定页签红点*/
    private updatePageRedPoint(arr:KaiMenData[]){
        for( let i = 0;i < arr.length;i++ ){
            if( arr[i].redPoint )
                return true;
        }
        return false;
    }
    /**
     * 对应子活动的列表刷新
     * @param 活动id
     * */
    private updateList(id:number):KaiMenData[]{
        let config:ActivityType3Config[] = GlobalConfig.ActivityType3Config[id];
        let act = Activity.ins().getActivityDataById(id) as ActivityType3Data;
        // let curday = act.curOpenDay();//距离活动开启第几天 0是第一天
        let arr:KaiMenData[] = [];
        for( let j in config ){
            let kmd:KaiMenData = new KaiMenData();
            kmd.id = config[j].Id;
            kmd.index = config[j].index;
            kmd.type = config[j].type;
            kmd.day = config[j].day;
            kmd.reward = config[j].rewards;
            kmd.already = (act.recrod>>config[j].index & 1)?true:false;//是否已领取
            if( kmd.type == 3 ){//每日冲
                kmd.unready = act.isOverTimer(config[j].index);
                if( act.curOpenDay()+1 == config[j].day ){//当天并且充值足够
                    kmd.redPoint = act.chongzhiNum >= config[j].val?true:false;
                }else{
                    kmd.redPoint = false;
                }
            }else if( kmd.type == 1 ){//连冲
                kmd.unready = act.dabiao[config[j].index-1] < config[j].day;//true的时候不显示领取按钮和红点
                kmd.redPoint = !kmd.already && !kmd.unready;
            }
            //修正数据具体情况
            if( kmd.unready ){//已过时
                kmd.already = kmd.redPoint = false;
            }else{
                kmd.redPoint = kmd.already?false:kmd.redPoint;
            }
            arr.push(kmd);
        }
        return arr;
    }
    private onTap(e:egret.TouchEvent) {
        for( let i = 0;i < 3;i++ ){
            this[`projectbg${i}`].source = this.selectRes[0];
            if( e.currentTarget == this[`projectbg${i}`] ){
                this.actIndex = i;
                this[`projectbg${i}`].source = this.selectRes[1];
                let id = this.actIds[this.actIndex];
                let arr = this.updateList(id);

                this.rechargeitemData.replaceAll(arr);
            }
        }
    }
    private initData() {
        let config:ActivityType3Config[] = GlobalConfig.ActivityType3Config[this.activityID];
        this.actDesc.text = GlobalConfig.ActivityConfig[this.activityID].desc;
        this.actIds = [];
        this.actIds.push(this.activityID);
        for( let i = 1;i <= config[1].activityID.length;i++ ){
            this.actIds.push(config[1].activityID[i-1]);
        }
        this.actIndex = this.getRuleIndex();
        this.updateTime();
        this.updateData1();
        let btnconfig = GlobalConfig.ActivityBtnConfig[this.activityID];
        if( btnconfig ){
            this.title.source = btnconfig.title;
        }
    }
    private getRuleIndex(){
        let index = 0;
        return index;
    }
    private updateDataCall(activityID:number){
        if( this.actIds.indexOf(activityID) == -1 )return;
        this.updateData1();
    }
    private updateData1(){
        for( let i = 0; i < 3; i++ ){
            this[`projectbg${i}`].source = this.selectRes[0];
        }
        this[`projectbg${this.actIndex}`].source = this.selectRes[1];
        for( let i = 0;i < this.actIds.length;i++ ){
            let tmpId = this.actIds[i];
            let arr = this.updateList(tmpId);
            this[`redpoint${i}`].visible = this.updatePageRedPoint(arr);
            if( i == this.actIndex ){
                this.rechargeitemData.replaceAll(arr);
            }
        }
        let act = Activity.ins().getActivityDataById(this.actIds[this.actIndex]) as ActivityType3Data;
        this.rechargeCoumt.text = `今日已充值${Math.floor(act.chongzhiNum/10)}元`;
    }

    private updateData(){

    }

}