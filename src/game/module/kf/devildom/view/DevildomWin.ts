/**
 * Created by MPeter on 2018/3/2.
 * 魔界入侵
 */
class DevildomWin extends BaseEuiView {
	////////////////皮肤组建部分//////////////
	private dinghong: eui.Group;
	private leftGroup: eui.Group;
	private leftBtn: eui.Button;
	private leftRed: eui.Image;
	private menuScroller: eui.Scroller;
	private menuList: eui.List;
	private rightGroup: eui.Group;
	private rightBtn: eui.Button;
	private rightRed: eui.Image;
	private challengeBtn: eui.Button;
	private partBtn: eui.Button;
	private belongBtn: eui.Button;
	private bossGroup: eui.Group;
	private roleSelect: RoleSelectPanel;
	private seeRule: eui.Button;
	private closeBtn: eui.Button;
	private bossName: eui.Image;
	private refreshTime: eui.Label;

	//////////////////////////////////
	private bossBody: MovieClip;
	private curData: DevilBossConfig;
	private dataSys: DevildomSys;
	private menuData: eui.ArrayCollection;
	private MAX_LEN: number = 4;//最大显示数量
	private TAB_W: number = 92;//选项卡间隔宽
	public constructor() {
		super();
		this.isTopLevel = true;
		this.skinName = `KFInvasionSkin`;
	}

	public initUI(): void {
		let tabLen = Object.keys(GlobalConfig.DevilBossConfig).length;

		this.leftGroup.visible = tabLen > this.MAX_LEN;
		this.rightGroup.visible = tabLen > this.MAX_LEN;

		this.refreshTime.text = `${GlobalConfig.DevilBossBase.startTime[0]}:${GlobalConfig.DevilBossBase.startTime[1]}`;

		this.bossBody = new MovieClip();
		this.bossBody.x = 0;
		this.bossBody.y = 0;
		this.bossGroup.addChild(this.bossBody);

		this.menuList.itemRenderer = DevildomBossTab;
		this.menuData = new eui.ArrayCollection();
		this.menuList.dataProvider = this.menuData;
	}


	public open(...param): void {
		this.addTouchEvent(this.closeBtn, this.onTouch);
		this.addTouchEvent(this.seeRule, this.onTouch);
		this.addTouchEvent(this.challengeBtn, this.onTouch);
		this.addTouchEvent(this.belongBtn, this.onTouch);
		this.addTouchEvent(this.partBtn, this.onTouch);
		this.addTouchEvent(this.leftBtn, this.onTouch);
		this.addTouchEvent(this.rightBtn, this.onTouch);
		this.addChangeEvent(this.menuList, this.onChoose);
		this.addEvent(eui.UIEvent.CHANGE_END, this.menuScroller, this.onChange);

		this.observe(DevildomSys.ins().postBossInfo, this.initData);

		this.dataSys = DevildomSys.ins();

		//没有传值，则随机一个选项
		let curIndex = !isNaN(param[0]) ? param[0] : 0;
		this.menuList.selectedIndex = curIndex;
		this.selectBoss(curIndex);
	}

	public close(...param): void {

	}

	public initData(): void {
		this.menuData.replaceAll(CommonUtils.objectToArray(GlobalConfig.DevilBossConfig));
	}

	private onChange(): void {
		if (this.menuList.scrollH < 20) {
			this.leftBtn.visible = false;
			this.rightBtn.visible = true;
		} else if (this.menuList.scrollH > (this.menuList.dataProvider.length - this.MAX_LEN) * 88 + 2) {
			this.leftBtn.visible = true;
			this.rightBtn.visible = false;
		} else {
			this.leftBtn.visible = true;
			this.rightBtn.visible = true;
		}
		if (this.menuList.dataProvider.length <= 5) {
			this.leftBtn.visible = false;
			this.rightBtn.visible = false;
		}
	}

	private onTouch(e: egret.TouchEvent): void {

		switch (e.target) {
			case this.seeRule:
				ViewManager.ins().open(CommonHelpWin, GlobalConfig.HelpInfoConfig[38].text);
				break;
			case this.challengeBtn:
				if (!KfArenaSys.ins().checkIsMatching()) {
					return;
				}	
				let cd = (this.dataSys.enterCD - egret.getTimer()) / 1000 >> 0;
				if (cd > 0) {
					UserTips.ins().showTips(`|C:0xf3311e&T:${cd}秒后可以进入！`);
					return;
				}

				let dp = GlobalConfig.DevilBossConfig[this.menuList.selectedItem.id];
				//转生等级条件判断
				let zsLv = dp.levelLimit / 1000 >> 0;
				if (zsLv > UserZs.ins().lv) {
					UserTips.ins().showTips(`|C:0xf3311e&T:转生等级到达${zsLv}级可进去！`);
					return;
				}
				//人物等级条件判断
				let lv = dp.levelLimit % 1000;
				if (lv > Actor.level) {
					UserTips.ins().showTips(`|C:0xf3311e&T:人物等级到达${lv}级可进去！`);
					return;
				}
				if (!DevildomSys.ins().historyId) {
					WarnWin.show(`魔君刷新后，只可进入其中一位魔君的地图且不可改变，是否进入？`, () => {
						this.dataSys.sendEnter(this.menuList.selectedItem.id);
					}, this);
				}
				else {
					if (DevildomSys.ins().historyId != this.menuList.selectedItem.id) {
						UserTips.ins().showTips(`|C:0xf3311e&T:您已进入${GlobalConfig.DevilBossConfig[DevildomSys.ins().historyId].bossName}地图，无法再进入此魔君地图！`);
						return;
					}
					DevildomSys.ins().sendEnter(this.menuList.selectedItem.id);
				}
				break;
			case this.closeBtn:
				ViewManager.ins().close(this);
				break;
			case this.belongBtn:
				ViewManager.ins().open(DevildomBelongAwardWin);
				break;
			case this.partBtn:
				ViewManager.ins().open(DevildomPartAwardWin);
				break;
			case this.leftBtn:
				let num: number = this.TAB_W * this.MAX_LEN;
				let scrollH: number = this.menuList.scrollH - num;
				scrollH = Math.round(scrollH / this.TAB_W) * this.TAB_W;
				if (scrollH < 0) {
					scrollH = 0;
				}
				this.menuList.scrollH = scrollH;
				break;
			case this.rightBtn:
				num = this.TAB_W * this.MAX_LEN;
				scrollH = this.menuList.scrollH + num;
				scrollH = Math.round(scrollH / this.TAB_W) * this.TAB_W;
				if (scrollH > this.menuList.contentWidth - this.menuScroller.width) {
					scrollH = this.menuList.contentWidth - this.menuScroller.width;
				}
				this.menuList.scrollH = scrollH;
				break;
		}
	}

	private onChoose(e: egret.TouchEvent): void {
		this.selectBoss(this.menuList.selectedIndex);
	}

	private selectBoss(index: number): void {
		let curId = this.menuList.selectedItem.id;
		let id = DevildomBossModel.ins().getCurBossIdByIndex(curId);
		let bossDp = GlobalConfig.MonstersConfig[id];

		let showBody: string = `monster${bossDp.avatar}_3s`;
		this.bossBody.playFile(RES_DIR_MONSTER + showBody, -1);

		this.bossName.source = `invasion_boss_name${index}`;

		this.challengeBtn.enabled = this.dataSys.killedState.length > 0 && !this.dataSys.killedState[curId];


	}

	public static openCheck(...param: any[]): boolean {
		let boo: boolean = DevildomSys.ins().isOpen();
		if (!GameServer.isOpenLF) {
			UserTips.ins().showTips(`|C:0xf3311e&T:开启跨服后可参与魔界入侵玩法`);
		}
		else if (!DevildomSys.ins().isHfTerm()) {
			UserTips.ins().showTips(`|C:0xf3311e&T:合服期间不可进入`);
		}
		else if (GameServer.serverOpenDay + 1 < GlobalConfig.DevilBossBase.openDay) {
			UserTips.ins().showTips(`|C:0xf3311e&T:开服${GlobalConfig.DevilBossBase.openDay}天后可参与魔界入侵玩法`);
		}

		return boo;
	}

}
ViewManager.ins().reg(DevildomWin, LayerManager.UI_Main);

