/**
 * 抓取模块的战斗力
 * Created by Peach.T on 2017/11/14.
 */
class PlayerAttrManager extends BaseClass {

	public moduleAry: { tips: string, cls: any, roleIndex?: number, param?: any }[] = [];

	private count: number = 0;

	private roleIndex: number = 0;

	public data;

	private descAry: string[] = [];

	public attrData: PlayerAttrModel[] = [];

	private dressPower: number = 0;

	private dressCount = 9;

	private score: number = 0;

	private power: number = 0;

	private specialPower: number = 0;

	public constructor() {
		super();
		this.descAry.push("总装备");
		this.descAry.push("装备分");
		this.descAry.push("诛仙");
		this.descAry.push("龙印");
		this.descAry.push("符文");
		this.descAry.push("装扮");
		this.descAry.push("称号");
		this.descAry.push("必杀");
		this.descAry.push("转生");
		this.descAry.push("羽毛");
		this.descAry.push("两个戒指");
		this.descAry.push("烈焰戒指");
		this.descAry.push("烈焰戒指技能");
		this.descAry.push("玄玉");
		this.descAry.push("内功");
		this.descAry.push("经脉");
		this.descAry.push("秘术");
		this.descAry.push("天阶");
		this.descAry.push("神器");
		this.descAry.push("徽章");
		this.descAry.push("图鉴");
		this.descAry.push("强化");
		this.descAry.push("聚灵");
		this.descAry.push("魔晶");
		this.descAry.push("剑魂");
		this.descAry.push("仙盟技能");
		this.descAry.push("VIP");
		this.descAry.push("等级");
	}

	public doSave(value, type, name) {
		let blob;
		if (typeof window.Blob == "function") {
			blob = new Blob([value], { type: type });
		} else {
			let BlobBuilder = window["BlobBuilder"] || window["MozBlobBuilder"] || window["WebKitBlobBuilder"] || window["MSBlobBuilder"];
			let bb = new BlobBuilder();
			bb.append(value);
			blob = bb.getBlob(type);
		}
		let URL = window.URL || window["webkitURL"];
		let bloburl = URL.createObjectURL(blob);
		let anchor = document.createElement("a");
		if ('download' in anchor) {
			anchor.style.visibility = "hidden";
			anchor.href = bloburl;
			anchor.download = name;
			document.body.appendChild(anchor);
			let evt = document.createEvent("MouseEvents");
			evt.initEvent("click", true, true);
			anchor.dispatchEvent(evt);
			document.body.removeChild(anchor);
		} else if (navigator.msSaveBlob) {
			navigator.msSaveBlob(blob, name);
		} else {
			location.href = bloburl;
		}
	}

	public save(content, fileName) {
		this.doSave(content, "text/latex", fileName + ".txt");
	}

	private getAttrStr(): string {
		let attr: string = "";
		let count = this.attrData.length;
		for (let i = 0; i < count; i++) {
			let model = this.attrData[i];
			attr += this.descAry[model.module] + "	" + model.soldierPower + "	" + model.magePower + "	" + model.immortalPower + "\n";
		}
		return attr;
	}

	private getModuleIndex(moduleName: string): number {
		let count = this.descAry.length;
		for (let i = 0; i < count; i++) {
			if (this.descAry[i] == moduleName) {
				return i;
			}
		}
		return 0;
	}

	private updateData(moduleName: string, power: number, roleIndex?: number): void {
		let index = this.getModuleIndex(moduleName);
		if (roleIndex == undefined) {
			roleIndex = 0;
		}
		let dataIndex = SubRoles.ins().getSubRoleByIndex(roleIndex).job;
		let data = this.attrData[index];
		if (data == undefined) {
			data = new PlayerAttrModel();
		}
		switch (dataIndex) {
			case JobConst.ZhanShi:
				data.soldierPower = power;
				break;
			case JobConst.FaShi:
				data.magePower = power;
				break;
			case JobConst.DaoShi:
				data.immortalPower = power;
				break;
		}
		data.module = index;
		this.attrData[index] = data;
	}

	private isHaveRole(roleIndex: number): boolean {
		return roleIndex < SubRoles.ins().subRolesLen;
	}

	public getAttr() {
		ViewManager.ins().open(LiLianWin, 3);
		TimerManager.ins().doTimerDelay(850, 0, 1, () => {
			this.updateData("图鉴", Book.ins().getBookPowerNumEx());
			ViewManager.ins().close(LiLianWin);
		}, this);

		TimerManager.ins().doTimerDelay(850, 0, 1, () => {
			ViewManager.ins().open(LiLianWin, 2);
			TimerManager.ins().doTimerDelay(860, 0, 1, () => {
				let win: LiLianWin = ViewManager.ins().getView(LiLianWin) as LiLianWin;
				this.updateData("徽章", win['xunzhangPanel'].getPower());
				ViewManager.ins().close(LiLianWin);
			}, this);
		}, this);

		TimerManager.ins().doTimerDelay(1000, 0, 1, () => {
			ViewManager.ins().open(LiLianWin, 1);
		}, this);

		TimerManager.ins().doTimerDelay(1150, 0, 1, () => {
			let count: number = parseInt(Artifact.ins().getMaxIndex() + "");
			let artifactPower: number = 0;
			for (let i = 0; i < count; i++) {
				if (Artifact.ins().getNewArtifactBy(i + 1).open || Artifact.ins().getNewArtifactPower(i + 1) != 0) {
					artifactPower += Artifact.ins().getNewArtifactPower(i + 1)
				} else {
					break;
				}
			}
			this.updateData("神器", artifactPower);
		}, this);

		TimerManager.ins().doTimerDelay(1500, 0, 1, () => {
			ViewManager.ins().close(LiLianWin);
			ViewManager.ins().open(LiLianWin);
		}, this);

		TimerManager.ins().doTimerDelay(1600, 0, 1, () => {
			this.updateData("天阶", LiLian.ins().getPower());
			ViewManager.ins().close(LiLianWin);
		}, this);


		TimerManager.ins().doTimerDelay(1700, 0, 1, () => {
			ViewManager.ins().open(DressWin, 0, 3);
			TimerManager.ins().doTimerDelay(10, 0, 1, () => {
				this.updateData("称号", Title.ins().getTotalPower(), 0);
				ViewManager.ins().close(DressWin);
			}, this);

		}, this);

		TimerManager.ins().doTimerDelay(1800, 0, 1, () => {
			ViewManager.ins().open(DressWin, 1, 3);
			TimerManager.ins().doTimerDelay(20, 0, 1, () => {
				this.updateData("称号", Title.ins().getTotalPower(), 1);
				ViewManager.ins().close(DressWin);
			}, this);

		}, this);

		TimerManager.ins().doTimerDelay(1900, 0, 1, () => {
			ViewManager.ins().open(DressWin, 2, 3);
			TimerManager.ins().doTimerDelay(20, 0, 1, () => {
				this.updateData("称号", Title.ins().getTotalPower(), 2);
				ViewManager.ins().close(DressWin);
			}, this);

		}, this);

		TimerManager.ins().doTimerDelay(2000, 0, 1, () => {
			ViewManager.ins().open(GuildSkillWin, 0);
			TimerManager.ins().doTimerDelay(20, 0, 1, () => {
				let win: GuildSkillWin = ViewManager.ins().getView(GuildSkillWin) as GuildSkillWin;
				this.updateData("仙盟技能", win.guildskill.getTotalPower(), 0);
				ViewManager.ins().close(GuildSkillWin);
			}, this);

		}, this);

		TimerManager.ins().doTimerDelay(2100, 0, 1, () => {
			ViewManager.ins().open(GuildSkillWin, 1);
			TimerManager.ins().doTimerDelay(20, 0, 1, () => {
				let win: GuildSkillWin = ViewManager.ins().getView(GuildSkillWin) as GuildSkillWin;
				this.updateData("仙盟技能", win.guildskill.getTotalPower(), 1);
				ViewManager.ins().close(GuildSkillWin);
			}, this);

		}, this);

		TimerManager.ins().doTimerDelay(2200, 0, 1, () => {
			ViewManager.ins().open(GuildSkillWin, 2);
			TimerManager.ins().doTimerDelay(20, 0, 1, () => {
				let win: GuildSkillWin = ViewManager.ins().getView(GuildSkillWin) as GuildSkillWin;
				this.updateData("仙盟技能", win.guildskill.getTotalPower(), 2);
				ViewManager.ins().close(GuildSkillWin);
				ViewManager.ins().close(GuildMap);
				ViewManager.ins().open(RoleWin, 0);
				this.getRoleInfo();
			}, this);
		}, this);
		this.updateData("VIP", this.getVipPower());

		let length = SubRoles.ins().subRolesLen;
		for (let i = 0; i < length; i++) {
			let job = SubRoles.ins().getSubRoleByIndex(i).job;
			let power = this.getRolePower(Actor.level, job);
			this.updateData("等级", power, i);
		}
	}

	private getVipPower(): number {
		let power: number = 0;
		if (UserVip.ins().lv > 0) {
			let cfg = GlobalConfig.VipConfig[UserVip.ins().lv];
			power = UserBag.getAttrPower(cfg.attrAddition);
		}
		return power;
	}

	private getRolePower(lv: number, job: number): number {
		let power: number = 0;
		let cfg;
		for (let i in GlobalConfig.RoleConfig) {
			if (i == lv.toString()) {
				for (let j in GlobalConfig.RoleConfig[i]) {
					if (j == job.toString()) {
						cfg = GlobalConfig.RoleConfig[i][j];
						power = this.getAttrPower(cfg);
					}
				}
			}
		}
		return power;
	}

	private getAttrPower(data: RoleConfig): number {
		let attr: AttributeData[] = [];
		attr.push(new AttributeData(AttributeType.atHp, data.hp));
		attr.push(new AttributeData(AttributeType.atMp, data.mp));
		attr.push(new AttributeData(AttributeType.atAttack, data.atk));
		attr.push(new AttributeData(AttributeType.atDef, data.def));
		attr.push(new AttributeData(AttributeType.atRes, data.res));
		attr.push(new AttributeData(AttributeType.atCrit, data.crit));
		attr.push(new AttributeData(AttributeType.atTough, data.tough));
		attr.push(new AttributeData(AttributeType.atAttackSpeed, data.as));
		attr.push(new AttributeData(AttributeType.atMoveSpeed, data.ms));
		let power: number = 0;
		power = UserBag.getAttrPower(attr);
		return power;
	}

	private getRoleInfo() {
		TimerManager.ins().doTimerDelay(20, 0, 1, () => {
			let win: RoleWin = ViewManager.ins().getView(RoleWin) as RoleWin;
			let rolePanel: RoleInfoPanel = win.roleInfoPanel;
			TimerManager.ins().doTimerDelay(10, 0, 1, () => {
				(rolePanel['item' + this.count] as RoleItem).showPower();
				TimerManager.ins().doTimerDelay(20, 0, 1, () => {
					let tips: EquipDetailedWin = ViewManager.ins().getView(EquipDetailedWin) as EquipDetailedWin;
					if (tips != undefined) {
						if (tips.getType() == "玄玉") {
							this.updateData("玄玉", tips.getPower(), this.roleIndex);
						}
						else {
							this.score += tips.getScore();
							this.power += tips.getPower();
						}
						ViewManager.ins().close(EquipDetailedWin);
					}

					this.count++;
					if (this.count < 9) {
						this.getRoleInfo();
					}
					else {
						this.updateData("总装备", this.power, this.roleIndex);
						this.updateData("装备分", this.score, this.roleIndex);
						this.count = 0;
						this.power = 0;
						this.score = 0;
						this.roleIndex++;
						ViewManager.ins().close(RoleWin);

						TimerManager.ins().doTimerDelay(20, 0, 1, () => {
							if (this.roleIndex < 3) {
								ViewManager.ins().open(RoleWin, 0, this.roleIndex);
								this.getRoleInfo();
							}
							else {
								this.count = 0;
								this.roleIndex = 0;
								this.getSpecialRingPower();
							}
						}, this);
					}
				}, this);
			}, this);
		}, this);
	}

	private getSpecialRingPower(): void {
		ViewManager.ins().open(SpecialRingWin, this.count, this.roleIndex);
		TimerManager.ins().doTimerDelay(20, 0, 1, () => {
			let win: SpecialRingWin = ViewManager.ins().getView(SpecialRingWin) as SpecialRingWin;
			TimerManager.ins().doTimerDelay(10, 0, 1, () => {
				this.specialPower += win.getPower();
				ViewManager.ins().close(SpecialRingWin);
				this.count++;
				if (this.count < 2) {
					this.getSpecialRingPower();
				}
				else {
					this.updateData("两个戒指", this.specialPower, this.roleIndex);
					this.specialPower = 0;
					this.count = 0;
					this.roleIndex++;
					TimerManager.ins().doTimerDelay(20, 0, 1, () => {
						if (this.roleIndex < 3) {
							ViewManager.ins().open(SpecialRingWin, this.count, this.roleIndex);
							this.getSpecialRingPower();
						}
						else {
							this.count = 0;
							this.roleIndex = 0;
							this.delayRun();
						}
					}, this);
				}
			}, this)
		}, this);
	}

	private delayRun() {
		this.moduleAry.push({ tips: "烈焰戒指", cls: FireRingWin });
		this.moduleAry.push({ tips: "烈焰戒指技能", cls: FireRingWin, param: 1 });
		this.addRoleAttr({ tips: "龙印", cls: TreasureWin });
		this.addRoleNextAttr({ tips: "内功", cls: SkillWin, param: 1 });
		this.addRoleNextAttr({ tips: "经脉", cls: SkillWin, param: 2 });
		this.addRoleNextAttr({ tips: "秘术", cls: SkillWin, param: 3 });
		this.addRoleNextAttr({ tips: "强化", cls: ForgeWin, param: 0 });
		this.addRoleNextAttr({ tips: "聚灵", cls: ForgeWin, param: 1 });
		this.addRoleNextAttr({ tips: "魔晶", cls: ForgeWin, param: 2 });
		this.addRoleNextAttr({ tips: "剑魂", cls: ForgeWin, param: 3 });
		this.moduleAry.push({ tips: "必杀", cls: RoleWin, param: 1 });
		this.moduleAry.push({ tips: "转生", cls: RoleWin, param: 2 });
		this.addRoleNextAttr({ tips: "羽毛", cls: RoleWin, param: 3 });
		this.addRoleAttr({ tips: "诛仙", cls: HeirloomWin });
		this.addRoleAttr({ tips: "符文", cls: RuneWin });
		this.addRoleNextAttr({ tips: "装扮", cls: DressWin, param: 0 });
		this.addRoleNextAttr({ tips: "装扮", cls: DressWin, param: 1 });
		this.addRoleNextAttr({ tips: "装扮", cls: DressWin, param: 2 });
		this.onGetAttr();
	}

	private addRoleAttr(data): void {
		let length = SubRoles.ins().subRolesLen;
		for (let i = 0; i < length; i++) {
			this.moduleAry.push({ tips: data.tips, cls: data.cls, roleIndex: i, param: i });
		}
	}

	private addRoleNextAttr(data): void {
		let length = SubRoles.ins().subRolesLen;
		for (let i = 0; i < length; i++) {
			this.moduleAry.push({ tips: data.tips, cls: data.cls, roleIndex: i, param: [data.param, i] });
		}
	}

	private onGetAttr(): void {
		if (this.moduleAry.length) {
			this.data = this.moduleAry.shift();
			if (this.data.param != undefined) {
				if (this.data.param instanceof Array) {
					ViewManager.ins().open(this.data.cls, this.data.param[0], this.data.param[1]);
				}
				else {
					ViewManager.ins().open(this.data.cls, this.data.param);
				}
			}
			else {
				ViewManager.ins().open(this.data.cls);
			}
			TimerManager.ins().doTimerDelay(100, 0, 1, () => {
				this.getPlayerAttr();
			}, this);
		}
	}

	private getPlayerAttr(): void {
		let win = ViewManager.ins().getView(this.data.cls);
		this.getValue(win, this.data, this.data.cls);
		this.onGetAttr();
	}

	private getValue(container: egret.DisplayObjectContainer, data: any, win: any): void {
		for (let i = 0; i < container.numChildren; i++) {
			let dis = container.getChildAt(i);
			if (dis instanceof PowerPanel) {
				if (dis.visible) {
					let roleIndex = 0;
					if (this.data.roleIndex) {
						roleIndex = this.data.roleIndex;
					}
					if (this.data.tips == "装扮") {
						this.dressCount--;
						this.dressPower += (dis as PowerPanel).power;
						if (this.dressCount == 0) {
							this.updateData(this.data.tips, this.dressPower, roleIndex);
							this.dressPower = 0;
							this.dressCount = 9;
							this.save(this.getAttrStr(), `${Actor.myName}的战斗力`);
						}
					}
					else {
						let power = 0;
						if ((dis as PowerPanel).power) {
							power = (dis as PowerPanel).power;
						}
						this.updateData(this.data.tips, power, roleIndex);
					}
				}
				ViewManager.ins().close(win);
				return;
			} else if (dis instanceof egret.DisplayObjectContainer) {
				if (dis instanceof eui.ViewStack) {
					let child = (dis as eui.ViewStack).selectedChild;
					if (child) {
						this.getValue(child as egret.DisplayObjectContainer, data, win);
					}
				} else {
					this.getValue(dis as egret.DisplayObjectContainer, data, win);
				}
			}
		}
		ViewManager.ins().close(win);
	}

	public static ins(): PlayerAttrManager {
		return super.ins() as PlayerAttrManager;
	}
}

