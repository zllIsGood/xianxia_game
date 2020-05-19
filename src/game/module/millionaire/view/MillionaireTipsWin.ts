/**
 *
 * 藏宝阁专用tips
 *
 */
class MillionaireTipsWin extends BaseEuiView {
	private bgClose:eui.Rect;
	private partname:eui.Label;
	private itemIcon:ItemBase;
	private getreward:eui.Image;
	private counttext:eui.Label;
	private count:eui.Label;
	private getlabel:eui.Label;
	private pos:number;
	constructor() {
		super();
		this.skinName = "richmanRewardSkin";
	}


	public initUI(): void {
		super.initUI();

	}

	public open(...param: any[]): void {
		this.observe(Millionaire.ins().postRoundReward, this.callbackRoundReward);//返回领取圈数奖励
		this.addTouchEndEvent(this.bgClose, this.onClick);
		this.addTouchEndEvent(this.getreward, this.onClick);
		this.pos = param[0];
		this.getlabel.touchEnabled = false;
		this.init();
	}

	public close(...param: any[]): void {
		// this.removeEventListener(egret.TouchEvent.TOUCH_END, this.otherClose, this.bgClose);
		//this.removeTouchEvent(this.btn_toolbar, this.onTap);
		this.removeTouchEvent(this.bgClose, this.onClick)
		this.removeObserve();
	}
	private callbackRoundReward(){
		this.init();
	}
	public init(){
		let cfg:RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[this.pos];
		if(cfg){
			if ( Millionaire.ins().roundReward >> this.pos & 1 ){
				// UserTips.ins().showTips(`|C:0xff0000&T:已领取`);
				this.counttext.visible = false;
				this.getreward.visible = false;
				this.getreward.touchEnabled = false;
				this.getlabel.visible = true;
				this.getlabel.text = "已领取";
			}else{
				this.getreward.touchEnabled = true;
				this.getlabel.text = "领取";
				if( Millionaire.ins().round >= cfg.round ){
					this.counttext.visible = false;
					this.getreward.visible = !this.counttext.visible;
					this.getlabel.visible = this.getreward.visible;
					// Millionaire.ins().sendRoundReward(this.pos);
				}else{
					// UserTips.ins().showTips(`|C:0xff0000&T:所需圈数:${cfg.round}`);
					this.counttext.visible = true;
					this.getreward.visible = !this.counttext.visible;
					this.getlabel.visible = this.getreward.visible;
				}
			}
			this.count.text = `${cfg.round - Millionaire.ins().round}`;//剩余圈数
			this.partname.text = `第${cfg.round}圈奖励`;
			this.itemIcon.data = {type:cfg.award[0].type,id:cfg.award[0].id,count:cfg.award[0].count};
		}

	}
	private onClick(e:egret.TouchEvent){
		switch (e.currentTarget){
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
			case this.getreward:
				let cfg:RichManRoundAwardConfig = GlobalConfig.RichManRoundAwardConfig[this.pos];
				if(cfg){
					if ( Millionaire.ins().roundReward >> this.pos & 1 ){
						UserTips.ins().showTips(`|C:0xff0000&T:已领取`);
					}else{
						if( Millionaire.ins().round >= cfg.round ){
							Millionaire.ins().sendRoundReward(this.pos);
						}else{
							UserTips.ins().showTips(`|C:0xff0000&T:所需圈数:${cfg.round}`);
						}
					}
				}
				break;
		}

	}




}
ViewManager.ins().reg(MillionaireTipsWin, LayerManager.UI_Popup);