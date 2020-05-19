class PunchExtShowWin extends BaseEuiView {
	public initUI(): void {
		super.initUI();
		this.isTopLevel = true;
		this.skinName = "PunchExtShowSkin";
	}

	private baseAttr: eui.Label;
	private bgClose: eui.Rect;

	private colorWhite: string = "#f8b141";
	private colorGray: string = "#444134";
	// private 
	public open(...param: any[]): void {
		this.addTouchEvent(this.bgClose, this.onTap);
		this.setView();
	}

	public close(...param: any[]): void {
		this.removeTouchEvent(this.bgClose, this.onTap);
		this.removeObserve();
	}

	private setView(): void {
		let str: string = "";
		let config: TogetherHitEquipQmConfig[][][] = GlobalConfig.TogetherHitEquipQmConfig;
		let currentAtt = UserSkill.ins().qimingAttrDic;
		let obj: Object = new Object();
		let objAttLevel: number = 0;
		for (let i in currentAtt) {
			obj = currentAtt[i];
			objAttLevel = Number(i);
		}

		let len: number = obj ? CommonUtils.getObjectLength(obj) : 0;
		let color: string = this.colorWhite;
		let isGray:boolean = false;
		for (let k in config) {
			for (let l in config[k]) {
				let obj = config[k][l];
				if (Number(k) != 0) {
					str += `<font color=${this.colorWhite}>${k}转套装属性(三角色时):</font>\n`;
				} else {
					str += `<font color=${this.colorWhite}>${l}级套装属性(三角色时):</font>\n`;
				}
				let i: number = 0;
				let level: number = Number(k) * 10000 + Number(l);

				for (let m in obj) {
					let totalAtt = obj[m].exAttr;
					if (level > objAttLevel) {
						color = this.colorGray;
						isGray = true;
					} else if (level == objAttLevel) {
						if (i + 1 > len) {
							color = this.colorGray;
							isGray = true;
						}
					}

					str += `<font color=${color}>${obj[m].num}件套：${this.getDescTextFlow(obj[m].desc, !isGray)}</font>\n`
					i++;
					if (i == 3) {
						str += "\n";
					}
				}
			}
		}
		// this.baseAttr.text = str;
		this.baseAttr.textFlow = (new egret.HtmlTextParser()).parser(str);
	}

	private getDescTextFlow(desc,color){
		let tf = TextFlowMaker.generateTextFlow1(desc);
		let str = '';
		for (let f of tf) {
			if (color && f.style && f.style.textColor != undefined) {
				str += `<font color=${f.style.textColor}>${f.text}</font>`;
			} else {
				str += f.text;
			}
		}
		return str;
	}


	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bgClose:
				ViewManager.ins().close(this);
				break;
		}
	}
}

ViewManager.ins().reg(PunchExtShowWin, LayerManager.UI_Main);

