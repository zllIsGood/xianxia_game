/**
 * 红包展示类(红包显示在主界面的底图特效)
 */
class HongBaoShowItem extends BaseItemRender {
	private hongbaoeff:eui.Group;
	private eff:MovieClip;
	private hbimg:eui.Image;
	constructor() {
		super();
		this.skinName = 'hongbaoShowItem';
		this.init();
	}
	protected childrenCreated(): void {
		super.childrenCreated();
		this.touchEnabled = false;
	}
	/**触摸事件 */
	protected init(): void {
		this.hbimg.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
		this.hongbaoeff.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	public onClick() {
		if( !this.data || !this.data.actId || !this.data.eId )return;
		let activityData: ActivityType25Data = Activity.ins().getActivityDataById(this.data.actId) as ActivityType25Data;
		if( !activityData.isOpenActivity() ){
			UserTips.ins().showTips(`活动已结束`);
			return;
		}
		for( let i = activityData.envelopeData.length-1;i >= 0 ;i-- ){
			if( !activityData.envelopeData[i] || activityData.envelopeData[i].id == this.data.eId ){
				if( activityData.envelopeData[i].isOverTimer() ){
					UserTips.ins().showTips(`|C:0xff0000&T:红包已过期`);
					Activity.ins().postEnvelopeDataCall(null);
					return;
				}
				break;
			}
		}

		Activity.ins().sendEnvelopeData(this.data.actId,this.data.eId);
	}

	protected dataChanged(): void {
		if( !this.data )return;
		if( !this.eff )
			this.eff = new MovieClip();
		if( !this.eff.parent ){
			this.hbimg.visible = true;
			this.hongbaoeff.addChild(this.eff);
			// let self = this;
			this.eff.playFile( RES_DIR_EFF + "hongbaoeff",1,()=>{
				// if( self.hbimg ){
				// 	self.hbimg.visible = true;
				// }
			});
		}
	}



	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}


}