/**
 * Created by hjh on 2017/12/7.
 */

class OSATarget3Panel6 extends BaseView {
    private content:eui.List;
    private listData: eui.ArrayCollection;
    private actTime:eui.Label;
    private actDesc:eui.Label;
    public activityID:number;
    private _time:number;
    private _index:number;
    private bar:eui.ProgressBar;
    private title:eui.Image;
    constructor() {
        super();
        this.skinName = `hefuCostSkin`;

    }

    close(){
        TimerManager.ins().removeAll(this);
    }
    open() {
        this.listData = new eui.ArrayCollection;
        this.content.itemRenderer = OSATarget3ItemRender6;
        this.content.dataProvider = this.listData;
        TimerManager.ins().doTimer(1000,0,this.setTime,this);
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
        if( aConfig.val < bConfig.val )
            return -1;
        else
            return 1;
    }

}