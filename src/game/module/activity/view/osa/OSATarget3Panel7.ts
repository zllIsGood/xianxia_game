/**
 * Created by hjh on 2017/11/2.
 */

class OSATarget3Panel7 extends BaseView {
    private actTime:eui.Label;
    private actDesc:eui.Label;
    private content0:eui.List;
    private listData: eui.ArrayCollection;

    public activityID:number;
    private _time:number;
    private title:eui.Image;
    constructor() {
        super();
        this.skinName = `hefuSeriesRechargeSkin2`;

    }

    open() {
        this.observe(Activity.ins().postRewardResult,this.GetCallBack);
        this.listData = new eui.ArrayCollection;
        this.content0.itemRenderer = OSATarget3ItemRender7;
        this.content0.dataProvider = this.listData;
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
        this.updateData();
    }
    private GetCallBack(activityID:number){
        if( this.activityID != activityID )return;
        if(!Activity.ins().isSuccee){
            if( !UserBag.ins().getSurplusCount() ){
                UserTips.ins().showTips("背包已满");
            }else{
                UserTips.ins().showTips("领取失败");
                let activityData: ActivityType3Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
                Activity.ins().sendChangePage(activityData.id);
            }
        }

        Activity.ins().isSuccee = false;
        this.updateData();
    }


    private updateTime(){
        let act = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
        let sec = act.getLeftTime();
        this._time = sec;

        this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);

        let config: ActivityConfig = GlobalConfig.ActivityConfig[this.activityID];
        this.actDesc.text = config.desc;

    }

    private setTime() {
        if(this._time > 0) {
            this._time -= 1;
            this.actTime.text = DateUtils.getFormatBySecond(this._time, DateUtils.TIME_FORMAT_5, 3);
        }
    }

    close(){
        TimerManager.ins().removeAll(this);
    }

    updateData(){
        this.updateTime();
        this.updateList();
    }
    private updateList(){
        let activityData: ActivityType3Data = Activity.ins().getActivityDataById(this.activityID) as ActivityType3Data;
        let tmplist: ActivityType3Config[] = GlobalConfig.ActivityType3Config[this.activityID];
        let listData: ActivityType3Config[] = [];
        for( let k in tmplist ){
            listData.push(tmplist[k]);
        }
        listData = listData.slice();
        let listDataSort: ActivityType3Config[] = [];
        let listDataSortTotal: ActivityType3Config[] = [];
        for( let i = 0;i<listData.length;i++ ){
            let state = activityData.getRewardStateById(listData[i].index);
            if( state == Activity.Geted ){//已领取放尾
                listDataSortTotal.push(listData[i]);
            }else{
                listDataSort.push(listData[i]);
            }
        }

        // if( listData[0].showType == Show3Type.TYPE7 ){
            listDataSort.sort(this.sortFunc);
            listDataSortTotal.sort(this.sortFunc);
            listData = listDataSort.concat(listDataSortTotal);
            this.listData.replaceAll(listData);
        // }
        let aBtn:ActivityBtnConfig = Activity.ins().getbtnInfo(this.activityID.toString());
        this.title.source = aBtn.title;

    }
    private sortFunc(aConfig: ActivityType3Config, bConfig: ActivityType3Config): number {
        if( aConfig.index < bConfig.index )
            return -1;
        else
            return 1;
    }
}