class PunchEquipAttrWin extends BaseEuiView {
	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "PunchEquipAttrSkin";
	}

	private baseAttr: eui.Label;
	private extAttr: eui.Label;
	private bgClose: eui.Rect;

	private tipsGroup: eui.Group;
	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.setView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}

	private setView(): void {
		let attData: number[] = [];
		let extAttData: number[] = []
		for (let i: number = 0; i < 8; i++) {
			let item: ItemData = UserSkill.ins().equipListData[i];
			for (let k in item.att) {
				if (item.att[k].type != 0 && item.att[k].value != 0) {
					let obj = item.att[k];
					if (!attData[obj.type]) {
						attData[obj.type] = obj.value;
					} else {
						attData[obj.type] += obj.value;
					}
				}
			}

			if (item.configID) {
				let data = GlobalConfig.EquipConfig[item.configID];
				for (let m in AttributeData.translate) {
					if (!data[m] || data[m] <= 0) {
						continue;
					} else {
						let type = Role.getAttrTypeByName(m);
						if (!attData[type]) {
							attData[type] = data[m];
						} else {
							attData[type] += data[m];
						}
					}
				}
				if (data.baseAttr) {
					if (!attData[data.baseAttr.type]) {
						attData[data.baseAttr.type] = data.baseAttr.value;
					} else {
						attData[data.baseAttr.type] += data.baseAttr.value;
					}
				}
				if (data.exAttr1) {
					if (!extAttData[data.exAttr1.type]) {
						extAttData[data.exAttr1.type] = data.exAttr1.value;
					} else {
						extAttData[data.exAttr1.type] += data.exAttr1.value;
					}
				}
				if (data['exAttr2']) {
					if (!extAttData[data['exAttr2'].type]) {
						extAttData[data['exAttr2'].type] = data['exAttr2'].value;
					} else {
						extAttData[data['exAttr2'].type] += data['exAttr2'].value;
					}
				}
			}
		}

		let str: string = "";
		let attName: string = "";
		let value: number = 0;
		let type: number = 0;
		for (let l in attData) {
			type = Number(l);
			value = attData[l];
			attName = AttributeData.getAttrStrByType(type);
			if (attName.length < 3)
				attName = AttributeData.inserteBlank(attName, 4);
			if (type > 1 && type < 9) {
				if (type == 7 || type == 8) {
					str += attName + "：" + value / 100 + "%";
				} else {
					str += attName + "：" + value;
				}
			} else if (type > 12 && type < 15 || type > 15) {
				if (type == AttributeType.atCritEnhance)
					str += attName + "：" + (value / 100 + 150) + "%";
				else
					str += attName + "：" + value / 100 + "%";
			}
			else
				continue;
			str += "\n";
		}

		for (let l in extAttData) {
			type = Number(l);
			value = extAttData[l];
			attName = AttributeData.getExtAttrStrByType(type);
			str += attName + "：" + value / 100 + "%";
			str += "\n";
		}
		if (str == "") str = "无"
		this.baseAttr.text = str;

		this.anigroup.height = this.baseAttr.height + 150;
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(PunchEquipAttrWin, LayerManager.UI_Popup);

