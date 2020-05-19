class PaoDianIconItemRender extends BaseItemRender{
	
	public icon:eui.Image;
	public count:eui.Label;

	public constructor() {
		super();
		this.skinName = "PointResultAwardSkin";
	}

	public dataChanged():void
	{
		this.icon.source = this.data[0];
		
		let num:number = this.data[1];
		//神兵经验以万为单位，保留小数点后一位  如3.5万 、10万
		num = Math.floor(num / 1000) / 10;
		this.count.text = num == 0 ? "0" : num + "万";
	}
}