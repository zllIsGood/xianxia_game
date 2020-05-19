class GuildBossWin extends BaseEuiView {
	private closeBtn: eui.Button;
	private challengeBtn: eui.Button;
	private enemyname: eui.Label;
	private selfname: eui.Label;

	//对手仙盟BOSS血条
	private ebhpbar: eui.ProgressBar;
	//自己仙盟BOSS血条
	private sbhpbar: eui.ProgressBar;

	private imgRight: eui.Image;
	private imgleft: eui.Image;
	private itemArr: any[];
	private bossLen: number = 0;
	private bossArr: number[][];
	private itemLen: number = 6;
	private arrCount: number = 0;//页数
	private currentArr: number[] = [];
	private currentIndex: number = 0;
	private fightboss: eui.Image;
	private state:eui.Group;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "guildBossSkin";
		this.itemArr = [];
		for (let i: number = 0; i < 6; i++) {
			this.itemArr.push(this[`bossItem${i}`]);
		}
		this.bossLen = CommonUtils.getObjectLength(GlobalConfig.GuildBossInfoConfig);
		this.arrCount = 0;
		this.bossArr = [];
		for (let j: number = 0; j < this.bossLen; j++) {
			if (!this.bossArr[this.arrCount]) this.bossArr[this.arrCount] = [];
			if (j < (this.arrCount + 1) * this.itemLen) {
				this.bossArr[this.arrCount].push(j);
			} else if (j == (this.arrCount + 1) * this.itemLen) {
				this.arrCount++;
				this.bossArr[this.arrCount] = [];
				this.bossArr[this.arrCount].push(j);
			}
		}
	}

	public static openCheck(...param: any[]): boolean {
		return true;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.challengeBtn, this.onTap);
		this.addTouchEvent(this.imgleft, this.onTap);
		this.addTouchEvent(this.imgRight, this.onTap);
		for (let i: number = 0; i < this.itemLen; i++) {
			this.addTouchEvent(this.itemArr[i], this.onItemTap);
		}
		this.observe(GuildBoss.ins().postGuildBossDetailChange, this.setView);
		this.observe(GuildBoss.ins().postGuildBossInfoChange, this.setView);
		this.observe(GuildBoss.ins().postChallengeSuccess, this.challengeSuccess);

		this.currentIndex = this.getRuleIndex();

		GuildBoss.ins().sendGetBossInfo();

	}
	private getRuleIndex(){
		let maxLen = Object.keys(GlobalConfig.GuildBossInfoConfig).length;
		if( GuildBoss.ins().passId >= maxLen ){
			return maxLen;
		}
		return Math.floor(GuildBoss.ins().passId /this.itemLen);
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.closeBtn, this.onTap);
		this.removeTouchEvent(this.challengeBtn, this.onTap);
		this.removeTouchEvent(this.imgleft, this.onTap);
		this.removeTouchEvent(this.imgRight, this.onTap);
		for (let i: number = 0; i < this.itemLen; i++) {
			this.removeTouchEvent(this.itemArr[i], this.onItemTap);
		}
	}

	private setView(): void {
		this.currentArr = this.bossArr[this.currentIndex];
		let cfg:GuildBossInfoConfig = GlobalConfig.GuildBossInfoConfig[this.currentIndex + 1];
		this.fightboss.source = cfg.ShowImg;//`gb_b${this.currentIndex + 1}`;
		for (let i: number = 0; i < this.itemLen; i++) {
			if (this.currentArr[i] != null) {
				this.itemArr[i].data = this.currentArr[i];
				this.itemArr[i].visible = true;
			} else {
				this.itemArr[i].visible = false;
			}
		}

		this.selfname.text = Guild.ins().guildName;
		this.enemyname.text = GuildBoss.ins().otherGuildName;

		let maxBoss: number = CommonUtils.getObjectLength(GlobalConfig.GuildBossInfoConfig);
		let id: number = GuildBoss.ins().passId + 1 > maxBoss ? maxBoss : GuildBoss.ins().passId + 1;
		let config: GuildBossInfoConfig = GlobalConfig.GuildBossInfoConfig[id];
		let bossConfig: MonstersConfig = GlobalConfig.MonstersConfig[config.boss["monId"]];

		let selfValue: number = 0;
		let emityValue: number = 0;

		selfValue = Math.ceil(((bossConfig.hp - GuildBoss.ins().bossHP) / bossConfig.hp) * 10000) / 100;
		this.sbhpbar.value = selfValue;
		this.sbhpbar.maximum = 100;

		this.ebhpbar.value = emityValue;
		this.ebhpbar.maximum = 100;

		this.state.visible = !GuildBoss.ins().isOpen();

		if( !this.currentIndex ) {
			this.imgleft.visible = false;
			this.imgRight.visible = true;
		}else if( this.currentIndex == this.arrCount ){
			this.imgleft.visible = true;
			this.imgRight.visible = false;
		}else{
			this.imgleft.visible = true;
			this.imgRight.visible = true;
		}

	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.closeBtn:
				ViewManager.ins().close(GuildBossWin);
				break;
			case this.challengeBtn:
				if (GuildBoss.ins().challengeTime > GameServer.serverTime) {
					UserTips.ins().showTips("|C:0x35e62d&T:正在挑战中，请稍后|");
					return;
				}
				GuildBoss.ins().sendChallengeBoss();
				break;
			case this.imgleft:
				this.currentIndex--;
				// if (this.currentIndex < 0) this.currentIndex = this.arrCount;
				if( this.currentIndex <= 0 ){
					this.imgleft.visible = false;
				}
				this.setView();
				this.imgRight.visible = true;
				break;
			case this.imgRight:
				this.currentIndex++;
				// if (this.currentIndex > this.arrCount) this.currentIndex = 0;
				if( this.currentIndex >= this.arrCount ){
					this.imgRight.visible = false;
				}
				this.setView();
				this.imgleft.visible = true;
				break;
		}
	}

	private onItemTap(e: egret.TouchEvent): void {
		ViewManager.ins().open(GuildBossDetailWin, e.currentTarget.data);
	}

	private challengeSuccess(): void {
		ViewManager.ins().close(GuildBossWin);
		ViewManager.ins().close(GuildMap);
	}
}

ViewManager.ins().reg(GuildBossWin, LayerManager.UI_Popup);
