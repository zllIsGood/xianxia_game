/**
 * 玩法显示数据
 */

enum PlayFunShow {
	topMain = 1,
	leftGroup = 2,
	rightGroup = 4,
	downGroup = 8,
	topGroup = 16,
	btnGuanQiaGroup = 32,
}

class PlayFun extends BaseSystem {

	static showAll: number = PlayFunShow.topMain 
							| PlayFunShow.leftGroup 
							| PlayFunShow.rightGroup 
							| PlayFunShow.downGroup 
							| PlayFunShow.topGroup 
							| PlayFunShow.btnGuanQiaGroup;
	public newBossRelive: boolean;//boss气泡显示情况
	public constructor() {
		super();
		//待改
		this.observe(UserBoss.ins().postBossData, this.publicBossRelive);
		this.observe(UserFb.ins().postAddEnergy, this.updateAutoPk);

		this.observe(GameLogic.ins().postEnterMap, () => {
			let fbID: number = GameMap.fubenID;
			if (!CityCC.ins().isCity) {
				if (!fbID || GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS || GameMap.fbType == UserFb.FB_TYPE_STORY) {
					ViewManager.ins().open(PlayFunView);

					//关卡boss只显示头顶
					if (GameMap.fbType == UserFb.FB_TYPE_GUANQIABOSS)
						this.postShowViews(PlayFunShow.topMain);
					else
						this.postShowViews(PlayFun.showAll);

					return;
				}
				ViewManager.ins().close(PlayFunView);
			}
		})
	}

	public static ins(): PlayFun {
		return super.ins() as PlayFun;
	}

	//关闭自动挑战关卡boss
	public closeAuto(): void {
		let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
		if (view)
			view.autoPkBoss.selected = false;
		this.updateAutoPk();
	}

	//关闭开启挑战关卡boss
	public openAuto(): void {
		let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
		if (view)
			view.autoPkBoss.selected = true;
		this.updateAutoPk();
	}

	public publicBossRelive(params: Array<any>): void {
		let isShow: boolean = params[0];
		let bossName: string = params[1];
		let viewIndex: number = params[2];
		let head: string = params[3];
		let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
		if (view)
			view.publicBossRelive(isShow, bossName, viewIndex, head);
	}

	public upDataWillBoss(id: number): void {
		let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
		if (view)
			view.upDataWillBoss(id);
	}

	public updateAutoPk(): void {
		if (UserFb.ins().bossIsChallenged) return;
		let m: number = UserFb.ins().energy;
		let v: number = UserFb.ins().currentEnergy;
		let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
		if (view && view.autoPkBoss.selected && v >= m) {
			if (UserBag.ins().getSurplusCount() < UserBag.BAG_ENOUGH) {
				view.autoPkBoss.selected = false;
				UserTips.ins().showTips("背包剩余空位不足，请先清理");
				this.removePkArrowTips();
			}
			else {
				this.addPkArrowTips();
			}
		} else {
			this.removePkArrowTips();
		}
	}

	//显示PlayFunWin组件， reverse取反
	public postShowViews(handle: number, reverse: boolean = false) {
		return [handle, reverse];
	}

	private showTipsObj: any = null;

	private addPkArrowTips() {
		let view: PlayFunView = (ViewManager.ins().getView(PlayFunView) as PlayFunView);
		if (view && !this.showTipsObj) {
			this.showTipsObj = {};
			view.showTaskTips(`能量已满，即将自动挑战关卡BOSS`);
			egret.Tween.get(this.showTipsObj).wait(1500).call(() => {
				if (view.autoPkBoss.selected) {
					GameLogic.ins().startPkBoss();
					this.removePkArrowTips();
				}
			});
		}
	}

	private removePkArrowTips() {
		if (this.showTipsObj) {
			egret.Tween.removeTweens(this.showTipsObj);
			this.showTipsObj = null;
		}
	}
}

namespace GameSystem {
	export let  playfun = PlayFun.ins.bind(PlayFun);
}