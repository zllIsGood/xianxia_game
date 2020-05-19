class GwResultView extends BaseEuiView {
	private closeBtn: eui.Button;
	private rank: eui.Image;
	private listCoin: eui.List;
	private time: eui.Label;
	private _ary: eui.ArrayCollection;
	private _fubenId: number;
	private _pFNum: number = 4;
	private secNum: number = 5;
	private gaptime:eui.Label;
	private get:eui.Button;//领取奖励
	private closenoget:eui.Button;//退出
	private noget:eui.Label;//不领取不扣次数文本
	private _isB:boolean;
	public constructor() {
		super();
	}
	public initUI(): void {
		super.initUI();
		this.skinName = "GwResultSkin";
		this.addTouchEvent(this.closeBtn, this.touchHandler);
		this.addTouchEvent(this.get, this.touchHandler);
		this.addTouchEvent(this.closenoget, this.touchHandler);
		this._ary = new eui.ArrayCollection();
		this.listCoin.dataProvider = this._ary;
		this.listCoin.itemRenderer = MijingItemBase2;
	}
	/**
	 * @param param 参数
	 */
	public open(...param: any[]): void {
		this._fubenId = param[0]
		this._pFNum = param[1];
		let useTime: number = param[2] == null ? -1 : param[2];
		let conf: GodWeaponFubenConfig;
		let floor: number;
		for (let key in GlobalConfig.GodWeaponFubenConfig) {
			if (GlobalConfig.GodWeaponFubenConfig[key].fbId == this._fubenId) {
				conf = GlobalConfig.GodWeaponFubenConfig[key];
				floor = parseInt(key);
				break;
			}
		}
		// let num:number;
		// switch(this._pFNum){
		// 	case 1:
		// 		num = 4;
		// 		break;
		// 	case 2:
		// 		num = 3;
		// 		break;
		// 	case 3:
		// 		num = 2;
		// 		break;
		// 	case 4:
		// 		num = 1;
		// 		break;
		// }
		let b:boolean;
		if (useTime == -1) {
			this.time.text = "未击杀BOSS";
			this.gaptime.visible = false;
			this.get.visible = true;
			this.closenoget.visible = true;
			this.closeBtn.visible = false;
			this.noget.visible = true;
			b = false;
		} else {
			this.time.text = DateUtils.getFormatBySecond(useTime, DateUtils.TIME_FORMAT_3);
			if(this._pFNum != 1){
				this.gaptime.visible = true;
				this.get.visible = true;
				this.closenoget.visible = true;
				this.closeBtn.visible = false;
				let numTime:number = Math.abs(useTime - GlobalConfig.GodWeaponBaseConfig.fbGrade[0]);
				this.gaptime.text = `（距离S只差${numTime}秒）`;
				this.noget.visible = true;
				b = false;
			}else{
				this.gaptime.visible = false;
				this.get.visible = false;
				this.closenoget.visible = false;
				this.closeBtn.visible = true;
				this.noget.visible = false;
				b = true;
			}
		}
		this._isB = b;
		let ary: RewardData[] = conf.award[this._pFNum].concat();
		let num: number = UserFb.ins().oldMijingPoint;
		if (UserFb.ins().oldMijingPoint != 1 && this._pFNum == 1) {
			let firstAry: RewardData[] = conf.firstAward.concat();
			ary = ary.concat(firstAry);
		}
		let newAry: MijinglistData[] = [];
		for (let i: number = 0; i < ary.length; i++) {
			let data: MijinglistData = new MijinglistData();
			data.data = ary[i];
			data.index = i + 1;//第几个
			data.start = conf.award[1].length;//开始
			data.floorNum = floor;
			newAry.push(data);
		}
		this._ary.replaceAll(newAry);
		this.rank.source = "godweapon_rank" + this._pFNum;
		if(b){
			this.updateCloseBtnLabel();
			let temp: number = this.secNum;
			TimerManager.ins().doTimer(1000, temp, this.updateCloseBtnLabel, this);
		}
	}
	private updateCloseBtnLabel(): void {
		this.secNum--;
		if (this.secNum <= 0){
			ViewManager.ins().close(this);
			GodWeaponCC.ins().requestGetAward();
		}
		this.closeBtn.label = `退出(${this.secNum}s)`;
	}
	/**
	 * @param param 参数
	 */
	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.touchHandler);
		this.removeTouchEvent(this.get, this.touchHandler);
		this.removeTouchEvent(this.closenoget, this.touchHandler);
		this.listCoin.dataProvider = null;
		TimerManager.ins().remove(this.updateCloseBtnLabel, this);
		if (GameMap.fubenID > 0) {
			UserFb.ins().sendExitFb();
		}
		if (GameMap.fbType == UserFb.FB_TYPE_MIJING) {//如果是试炼
			ViewManager.ins().open(GodWeaponWin, 1);
		}
	}
	//点击事件
	private touchHandler(e: egret.TouchEvent): void {
		if(e.currentTarget == this.closeBtn){
			GodWeaponCC.ins().requestGetAward();
			ViewManager.ins().close(this);
		}else if(e.currentTarget == this.get){
			GodWeaponCC.ins().requestGetAward();
			ViewManager.ins().close(this);
		}else if(e.currentTarget == this.closenoget){
			ViewManager.ins().close(this);
		}
	}
}
ViewManager.ins().reg(GwResultView, LayerManager.UI_Popup);
class MijingItemBase2 extends MijingItemBase {
	constructor() {
		super();
	}
	protected dataChanged(): void {
		super.dataChanged();
		this.getImg.visible = false;
	}
}