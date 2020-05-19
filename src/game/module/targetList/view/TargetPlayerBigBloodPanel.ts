class TargetPlayerBigBloodPanel extends BaseEuiView {

	public playerBloodGroup: eui.Group;
	public head: eui.Image;

	public grayImg: eui.Image;
	private grayImgMask: egret.Rectangle;
	private static GRAYIMG_WIDTH: number = 0;

	public bloodBar: eui.ProgressBar;
	public neiGong: eui.Group;
	public hudunbloodBar0: eui.ProgressBar;
	public player: eui.Group;
	public nameTxt: eui.Label;

	private currAttackHandle: number;

	public constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();
		this.skinName = "TargetPlayerSmallBloodSkin";
		this.bloodBar.slideDuration = 0;

		this.grayImg.source = "bosshp2";
		// this.grayImg.alpha = 0.5;
		this.grayImgMask = new egret.Rectangle(0, 0, this.grayImg.width, this.grayImg.height);
		this.grayImg.mask = this.grayImgMask;
		//TargetPlayerBigBloodPanel.GRAYIMG_WIDTH = this.grayImg.width;
		//灰色血条最大宽度取boss血条宽度
		TargetPlayerBigBloodPanel.GRAYIMG_WIDTH = this.bloodBar.width;
		this.bloodBar.labelDisplay.visible = false;
		this.playerBloodGroup.top = BattleCC.ins().isBattle() || PaoDianCC.ins().isPaoDian ? this.playerBloodGroup.top : 60;
	}

	public open(...param: any[]): void {
		this.observe(GameLogic.ins().postEntityHpChange, this.updateHP);
		this.observe(GameLogic.ins().postChangeTarget, this.updateTarget);
		this.observe(GameLogic.ins().postOtherAttChange, this.updateAtt);
		this.updateTarget();

	}

	public close(...param: any[]): void {
		if (this.grayImgMask) egret.Tween.removeTweens(this.grayImgMask);
		this.currAttackHandle = 0;
	}

	private changeHp() {
		let roleList: CharRole[] = EntityManager.ins().getEntitysBymasterhHandle(this.currAttackHandle, EntityType.Role);
		if (roleList && roleList.length > 0) {
			let len = roleList.length
			let hpValue: number = 0;
			let hpTotal: number = 0;
			let neigongValue: number = 0;
			let neigongTotal: number = 0;
			let mainRoleInfo: Role;
			for (let i = 0; i < len; i++) {
				let role = roleList[i]
				if (role) {
					let curHp = role.infoModel.getAtt(AttributeType.atHp) || 0;
					let maxHp = role.infoModel.getAtt(AttributeType.atMaxHp) || 0;
					hpValue += curHp;
					hpTotal += maxHp;

					let curNeigong = role.infoModel.getAtt(AttributeType.cruNeiGong) || 0;
					let maxNeigong = role.infoModel.getAtt(AttributeType.maxNeiGong) || 0;
					neigongValue += curNeigong;
					neigongTotal += maxNeigong;
				}
			}

			if (BattleCC.ins().isBattle()) {
				hpValue = hpValue / hpTotal * 100;
				hpTotal = 100;
			}

			this.hudunbloodBar0.maximum = neigongTotal;
			this.hudunbloodBar0.value = neigongValue;
			this.bloodBar.maximum = hpTotal;
			this.bloodBar.value = hpValue;
			this.curValue = Math.floor(hpValue / hpTotal * 100);
			this.tweenBlood();

		}
		else //怪物
		{
			let monster: CharMonster = EntityManager.ins().getEntityByHandle(this.currAttackHandle) as CharMonster;
			if (monster && monster.infoModel && monster.infoModel.type == EntityType.Monster) //怪物
			{
				this.hudunbloodBar0.maximum = monster.infoModel.getAtt(AttributeType.maxNeiGong) || 0;
				this.hudunbloodBar0.value = monster.infoModel.getAtt(AttributeType.cruNeiGong) || 0;
				this.bloodBar.maximum = monster.infoModel.getAtt(AttributeType.atMaxHp) || 0;
				this.bloodBar.value = monster.infoModel.getAtt(AttributeType.atHp) || 0;
				this.curValue = Math.floor(this.bloodBar.value / this.bloodBar.maximum * 100);
				this.tweenBlood();
			}
		}
	}

	private updateTarget() {
		if (GameLogic.ins().currAttackHandle == 0) {
			ViewManager.ins().close(this);
		}
		if (this.currAttackHandle != 0 && this.currAttackHandle != GameLogic.ins().currAttackHandle) {
			this.currAttackHandle = GameLogic.ins().currAttackHandle;
			if (this.currAttackHandle != 0) {
				let mainRoleInfo: Role;
				let roleList: CharRole[] = EntityManager.ins().getEntitysBymasterhHandle(this.currAttackHandle, EntityType.Role);
				if (roleList && roleList.length > 0) {
					mainRoleInfo = <Role>roleList[0].infoModel;
					let tname: string = mainRoleInfo.name;
					let strlist = tname.split("\n");
					if (strlist[1])
						tname = strlist[1];
					else
						tname = strlist[0];
					this.nameTxt.textFlow = TextFlowMaker.generateTextFlow(tname);
					// this.head.source = `yuanhead${mainRoleInfo.job}${mainRoleInfo.sex}`
					this.head.source = `main_role_head${mainRoleInfo.job}`
					this.changeHp();
				}
				else //怪物
				{
					let monster: CharMonster = EntityManager.ins().getEntityByHandle(this.currAttackHandle) as CharMonster;
					if (monster && monster.infoModel && monster.infoModel.type == EntityType.Monster) //怪物
					{
						let config = GlobalConfig.MonstersConfig[monster.infoModel.configID];
						this.nameTxt.textFlow = new egret.HtmlTextParser().parser(config.name);
						this.head.source = `monhead${config.head}_png`;
						this.changeHp();
					}

				}
			}
		}
	}

	private updateHP(param: Array<any>) {
		if (!CityCC.ins().isCity && !BattleCC.ins().isBattle() && !PaoDianCC.ins().isPaoDian
			&& !GwBoss.ins().isGwBoss && !GwBoss.ins().isGwTopBoss
		)
			return;
		let targetRole: CharRole = param[0];
		let sourceRole: CharRole = param[1];
		let type = param[2];
		let value = param[3];
		if (targetRole && (targetRole.infoModel.masterHandle == this.currAttackHandle || targetRole.infoModel.handle == this.currAttackHandle))
			this.changeHp();
	}

	/** 属性变更 */
	private updateAtt(char: CharMonster): void {
		if (!char || !char.infoModel)
			return;

		if (!CityCC.ins().isCity && !BattleCC.ins().isBattle() && !PaoDianCC.ins().isPaoDian)
			return;

		if (char.infoModel.masterHandle == this.currAttackHandle || char.infoModel.handle == this.currAttackHandle)
			this.changeHp();
	}

	private curValue: number = 1;

	private tweenBlood(): void {
		//缓动灰色血条
		let bloodPer = (this.curValue * TargetPlayerBigBloodPanel.GRAYIMG_WIDTH) / 100;
		 //boss血条宽度减少12以上，灰色血条才开始缓动
		let bloodDif = TargetPlayerBigBloodPanel.GRAYIMG_WIDTH - bloodPer;
		if (bloodDif <= 12) return;
		let self = this;
		egret.Tween.removeTweens(this.grayImgMask);
		if (bloodPer < 3) return;
		let t = egret.Tween.get(this.grayImgMask, {
			onChange: () => {
				if (self.grayImg) self.grayImg.mask = this.grayImgMask;
			}
		}, self);
		t.to({"width": bloodPer}, 1000).call(function (): void {
			if (bloodPer <= 0) {
				self.grayImgMask.width = 0;
				egret.Tween.removeTweens(this.grayImgMask);
				ViewManager.ins().close(this);
			}
		}, self);
	}
}

namespace GameSystem {
	export let  targetPlayerBigBloodPanel = () => {
		ViewManager.ins().reg(TargetPlayerBigBloodPanel, LayerManager.Main_View);
	}
}