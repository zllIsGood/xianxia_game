/**
 * 角色面板装备框
 */
class RoleItem extends ItemBase {
	private boostLv: eui.Label;
	private zhulingLv: eui.Label;
	private tupoLv: eui.Label;

	private mc: MovieClip;
	private _curRole: number = -1;
	private _index: number = -1;
	public bless: eui.Image;

	private _model: Role;
	private _wings: Boolean;

	private _lastData: any;
	private _lastModel: any;

	private showTip: boolean = true;
	constructor() {
		super();
	}

	protected init(): void {
		super.init();
		this.boostLv = new eui.Label;
		this.boostLv.x = 35;
		this.boostLv.y = 55;
		this.boostLv.textColor = 0xF9A305;

		this.zhulingLv = new eui.Label;
		this.zhulingLv.x = 12;
		this.zhulingLv.y = 55;
		this.zhulingLv.textColor = 0x3DBDFF;

		this.tupoLv = new eui.Label;
		this.tupoLv.x = 20;
		this.tupoLv.y = 5;
		this.tupoLv.textColor = 0xE9FA09;

		this.boostLv.size = this.zhulingLv.size = this.tupoLv.size = 16;
		this.boostLv.width = this.zhulingLv.width = this.tupoLv.width = 41;
		// this.boostLv.fontFamily = this.zhulingLv.fontFamily = this.tupoLv.fontFamily = "黑体";
		this.boostLv.stroke = this.zhulingLv.stroke = this.tupoLv.stroke = 1;
		this.boostLv.strokeColor = this.zhulingLv.strokeColor = this.tupoLv.strokeColor = 0x000000;
		this.boostLv.textAlign = this.tupoLv.textAlign = "right";

		this.addChild(this.boostLv);
		this.addChild(this.zhulingLv);
		this.addChild(this.tupoLv);

		this.mc = new MovieClip;
		this.mc.x = 46;
		this.mc.y = 43;
	}

	protected dataChanged(): void {
		//		if(this._lastData == this.data){
		//			return;
		//		}
		this.playEff();
		super.dataChanged();
		let itemConfig: ItemConfig = (this.data as ItemData).itemConfig;
		this.bless.visible = false;
		if (itemConfig) {
			let equipsDatas: EquipsData[] = this._wings ? this._model.wingsData.equipdata : this._model.equipsData;
			let equipsData: EquipsData;
			for (let i: number = 0; i < equipsDatas.length; i++) {
				if ((this.data as ItemData).handle == equipsDatas[i].item.handle) {
					equipsData = equipsDatas[i];
					break;
				}
			}
			if (!this._wings) {
				this.boostLv.text = (equipsData.strengthen > 0) ? "+" + equipsData.strengthen : "";
				this.zhulingLv.text = (equipsData.zhuling > 0) ? equipsData.zhuling + "" : "";
				this.tupoLv.text = (equipsData.tupo > 0) ? equipsData.tupo + "星" : "";
				this.bless.visible = equipsData.bless > 0;
				if (ItemConfig.getSubType(itemConfig) == ForgeConst.EQUIP_POS_TO_SUB[EquipPos.DZI]) {
					this.nameTxt.text = UserBag.ins().getGuanyinLevel(itemConfig);
				}
			}
		}
		this._lastData = this.data;
		this._lastModel = this._model;
	}

	public clear(): void {
		super.clear();
		this.boostLv.text = this.zhulingLv.text = this.tupoLv.text = "";
		this.playEff();
	}

	public isShowTips(value: boolean): void {
		this.showTip = value;
	}

	private awakenLv;
	protected openEquipsTips(): void {
		if (!this.showTip) return;
		if (this._index > EquipPos.DZI) {
			ViewManager.ins().open(SamsaraEquipTips, this._curRole, this._lastModel,this._index);
		} else {
			ViewManager.ins().open(EquipDetailedWin, 1, this.data.handle, this.itemConfig.id, this.data, this._model, this._curRole, this._index, this.awakenLv);
		}
	}

	/**
	 * 用于战斗力统计
	 */
	public showPower(): void {
		this.openEquipsTips();
	}

	public setModel(value: Role) {
		this._model = value;
	}

	public getModel(): Role {
		return this._model;
	}

	public setCurRole(value: number): void {
		this._curRole = value;
	}

	public getCurRole(): number {
		return this._curRole;
	}

	public setIndex(value: number): void {
		this._index = value;
	}

	public setAwakenLevel(value: number) {
		this.awakenLv = value;
	}

	public getIndex(): number {
		return this._index;
	}

	public setWings(value: Boolean) {
		this._wings = value;
	}

	public getWings(): Boolean {
		return this._wings;
	}

	private playEff(): void {
		if (this._lastData) {
			if (this._lastData != this.data && this._model == this._lastModel) {
				this.mc.playFile(RES_DIR_EFF + "forgeSuccess", 1);
				this.addChild(this.mc);
			}
		}
	}

}
