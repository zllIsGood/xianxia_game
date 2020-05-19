class FranchiseWin extends BaseView {
	public monthGroup: eui.Group;
	private powerPanel:PowerPanel;
	private btn1:eui.Button;
	private leftTime:eui.Label;
	private feng:eui.Label;
	private first:eui.Label;
	private mc:MovieClip;
	private titleImg:eui.Image;
	private titleMcGroup:eui.Group;
	private depictLabel:eui.Label;
	constructor() {
		super();
		this.skinName = "SpecialCardSkin";
	}

	public open(...param: any[]): void {
		this.observe(Recharge.ins().postFranchiseInfo, this.setView);
		this.addTouchEvent(this.btn1, this.onTap);
		if( this.feng.visible ){
			this.btn1.visible = false;
			if( this.first )
				this.first.visible = false;
		}else{
			if (Recharge.ins().franchise > 0) {
				TimerManager.ins().doTimer(1000, 0, this.setTimeLbel, this);
				this.setTimeLbel();
				this.btn1.visible = true;
				this.setView();
			} else {
				this.btn1.visible = true;
				TimerManager.ins().remove(this.setTimeLbel, this);
				if( this.first )
					this.first.visible = Recharge.ins().firstBuy?true:false;
			}
			this.leftTime.visible = Recharge.ins().franchise > 0?true:false;
			// this.setView();
		}
		this.setIconEff();

		this.depictLabel.textFlow = TextFlowMaker.generateTextFlow1(GlobalConfig.PrivilegeData.rightDesc);

	}

	private setView(): void {
		if( !Recharge.ins().franchiseget ){
			this.btn1.label = "已领取";
			this.btn1.currentState = "disabled";
			this.btn1.touchEnabled = false;
		}
		else{
			this.btn1.currentState = "up";
			this.btn1.touchEnabled = true;
			this.btn1.label = "领取奖励";
		}
		if( this.first )
			this.first.visible = false;
	}

	private setTimeLbel(): void {
		let endedTime: number = Recharge.ins().franchise;//Math.ceil((Recharge.ins().monthDay - egret.getTimer()) / 1000);
		let str: string = DateUtils.getFormatBySecond(endedTime, DateUtils.TIME_FORMAT_5, 1);
		str = `<font color='#35e62d'>剩余时间:${str}</font>`;
		this.leftTime.textFlow = new egret.HtmlTextParser().parser(str);

	}

	public close(...param: any[]): void {
		this.removeObserve();
		this.removeTouchEvent(this.btn1, this.onTap);
		TimerManager.ins().remove(this.setTimeLbel, this);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.btn1:
				if( this.btn1.label != "领取奖励" ) {
					let rechargeid = Recharge.ins().getFranciseRechargeId();
					if (rechargeid) {
						Recharge.ins().showReCharge(rechargeid);
					}
				}
				else
					Recharge.ins().sendGetFranchise();
				break;
		}
	}

	private setIconEff(){
		let config:TitleConf = GlobalConfig.TitleConf[15];
		if( !config )return;
		if( config.eff ){
			if( !this.mc )
				this.mc = new MovieClip;
			if( !this.mc.parent )
				this.titleMcGroup.addChild(this.mc);
			this.mc.playFile(RES_DIR_EFF + "chenghaozztq_big", -1);
		}else{
			if( !this.titleImg )
				this.titleImg = new eui.Image(config.img);
			if( !this.titleImg.parent )
				this.titleMcGroup.addChild(this.titleImg);
			// this.titleImg.source =
		}

		let power:number = 0;
		power = UserBag.getAttrPower(config.attrs)*3;
		this.powerPanel.setPower(power);
	}
}
