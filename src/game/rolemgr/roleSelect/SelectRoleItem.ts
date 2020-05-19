class SelectRoleItem extends BaseItemRender {
	public constructor() {
		super();
		this.skinName = "SelectRoleItemSkin";
	}
	private labelName: eui.Label;
	private labelLevel: eui.Label;
	private labelPower: eui.Label;
	private groupVip: eui.Group;
	private imgRole: eui.Image;
	// private curVip: egret.DisplayObjectContainer;
	private startGameData;
	private select:eui.Image;
	private vipLabel:eui.BitmapLabel;

	public dataChanged(): void {
		let _data = this.data as SelectRoleData;
		this.labelName.text = _data.name;
		if (_data.zsLevel == 0) {
			this.labelLevel.text = "等级："+"" + _data.level;
		} else {
			this.labelLevel.text = "等级："+_data.zsLevel + "转" + _data.level + "级";
		}
		if(_data.power<=100000){
			this.labelPower.text = "战力："+_data.power + "";
		}else{
			let num:number = Math.floor(_data.power/1000);
			num = num/10;
			this.labelPower.text = "战力："+num + "万";
		}
		if(_data.vipLevel == 0){
			this.groupVip.visible = false;
		}else{
			// if(this.curVip) {
			// 	BitmapNumber.ins().changeNum(this.curVip, _data.vipLevel, "5");
			// } else {
			// 	this.curVip = BitmapNumber.ins().createNumPic(_data.vipLevel, "5");
			// 	this.curVip.x = 36;
			// 	this.groupVip.addChild(this.curVip);
			// }
			this.vipLabel.text = _data.vipLevel+"";
			this.groupVip.visible = true;
		}

		this.imgRole.source = "head_"+_data.roleClass + _data.sex;

		this.select.visible = this.selected;
	}
}