/**
 * 红包显示类(发出红包，点击主界面红包图标，打开的界面)
 */
class HongBaoOpenItem extends BaseItemRender {
	private myFace:eui.Image;
	private hbbtn:eui.Button;
	private playerName:eui.Label;
	private speaktxt:eui.Label;
	private speakbg:eui.Label;
	private topImg:eui.Image;
	private downImg:eui.Image;
	private list:eui.List;
	private hhbtnlabel:eui.Image;
	private title:eui.Image;
	private closeBtn:eui.Button;
	constructor() {
		super();
		this.skinName = 'hongbaoOpenSkin';
	}
	protected childrenCreated(): void {
		super.childrenCreated();
		this.init();
	}
	/**触摸事件 */
	protected init(): void {
		this.hbbtn.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
		this.addEventListener(egret.TouchEvent.TOUCH_END, this.onTouch, this);
		this.list.itemRenderer = HongBaoRewardsItem;
		this.closeBtn.visible = false;
	}

	public onClick(e:egret.TouchEvent) {
		switch (e.currentTarget){
			case this.hbbtn:
				if( !this.data || !this.data.actId || !this.data.eId )return;
				let activityData: ActivityType25Data = Activity.ins().getActivityDataById(this.data.actId) as ActivityType25Data;
				if( !activityData.isOpenActivity() ){
					UserTips.ins().showTips(`活动已结束`);
					return;
				}
				Activity.ins().sendReward(this.data.actId,this.data.eId,EnvelopeType.GET);
				break;
		}
	}
	private onTouch(){
		this.close();
	}
	private close(){
		if( this.callFun && this.bt1 && this.bt2 && this.bt3 ){
			TimerManager.ins().remove(this.close,this);
			if( this.parent ){
				this.parent.removeChildren();
				this.callFun();
			}
		}
	}

	protected dataChanged(): void {
		if( !this.data )return;
		let job = this.data.job;
		let sex = this.data.sex;
		let roleName = this.data.name;
		let text = this.data.text;
		let index = this.data.index;
		this.myFace.source = `head_${job}${sex}`;
		this.playerName.text = roleName;
		this.speaktxt.textFlow = TextFlowMaker.generateTextFlow1(text);
		let config:ActivityType25Config = GlobalConfig.ActivityType25Config[this.data.actId][index];
		this.title.source = `hongbao_title${config.skinType}`;
	}

	public destruct(): void {
		this.hbbtn.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	private callFun:Function;
	private bt1:boolean;
	private bt2:boolean;
	private bt3:boolean;
	public playAni(arr:{job:number,sex:number,name:string,yb:number,gold:number}[],callFun:Function,obj:any){
		this.removeChild(this.hbbtn);
		this.removeChild(this.hhbtnlabel);
		this.removeChild(this.speaktxt);
		this.removeChild(this.speakbg);
		if( !this.topImg.scrollRect )
			this.topImg.scrollRect = new egret.Rectangle(0,0,this.topImg.width,this.topImg.height);
		if( !this.downImg.scrollRect )
			this.downImg.scrollRect = new egret.Rectangle(0,0,this.downImg.width,this.downImg.height);
		let self = this;
		this.callFun = ()=>{
			if( callFun )
				callFun.call(obj);
		};
		let upSr = this.topImg.scrollRect;
		let downSr = this.downImg.scrollRect;
		let twTime = 400;
		this.list.dataProvider = new eui.ArrayCollection(arr);
		let tw1:egret.Tween = egret.Tween.get(upSr,{onChange:()=>{
			this.topImg.scrollRect = upSr;
		}}).to({y:200},twTime).call(()=>{
			egret.Tween.removeTweens(tw1);
			self.bt1 = true;
			self.closeBtn.visible = true;
		});
		let tw2:egret.Tween = egret.Tween.get(downSr,{onChange:()=>{
			this.downImg.scrollRect = downSr;
		}}).to({height:0},twTime).call(()=>{
			egret.Tween.removeTweens(tw2);
			self.bt2 = true;
		});
		let tw3:egret.Tween = egret.Tween.get(this.downImg).to({y:this.downImg.y+this.downImg.height},twTime).call(()=>{
			egret.Tween.removeTweens(tw3);
			self.bt3 = true;
		});
		if( !TimerManager.ins().isExists(this.close,this) )
			TimerManager.ins().doTimer(10000,0,this.close,this);
	}

}