/**
 *
 * @author 
 *
 */
class GainGoodsItem extends BaseItemRender{
	private desc: eui.Label;
	private graycolor:number;
	private greencolor:number;
	private norcolor:number;
	// public openId:number;
	// public openPage:number;
	private newData:GainWay;
	private dir:eui.Image;
	private desc2:eui.Label;
	private stars:eui.Group;
	constructor() {
		   super();
		this.skinName = "GainGoodsItemSkin";
		this.graycolor = 0x6E756E;
	}
	
	protected dataChanged(): void {
		this.greencolor = this.desc.textColor;//0x20AD2A;
		this.norcolor = this.desc2.textColor;//0xD1C28F;
		// this.desc.textColor = this.graycolor;
		// this.desc2.textColor = this.graycolor;

		// let newData: BreakDownListItemData = this.data;
		this.desc.text = this.data[0];

		// if( this.data[3] ){
		// 	egret.log(this.data[0] +" = "+this.data[3]);
		// }

		// if(arr instanceof Array) {
		// 	this.desc.text = arr[0];
		// 	this.openId = arr[1][0];
		// 	if(arr[1].length > 1)
		// 		this.openPage = arr[1][1];
		// }
	}
	public gainData(isOpen:boolean,stars:number,condition:{needLv:number,needZs:number,guanka:number}){
		this.stars.visible = true;
		if( !isOpen ){
			this.desc.textColor = this.graycolor;
			this.desc2.textColor = this.graycolor;
			if( condition ){
				let str:string = "";
				if( condition.needZs )
					str +=  `${condition.needZs}转生开启`;
				if( condition.needLv )
					str +=  `${condition.needLv}级开启`;
				if( condition.guanka )
					str +=  `${condition.guanka}关卡开启`;
				this.desc2.text = str;
			}
			this.dir.visible = false;
			for( let i = 1;i <= 5;i++ ){
				this["star"+i].visible = false;
			}
		}else{
			for( let i = 1;i <= 5;i++ ){
				this["star"+i].visible = (i <= stars);
			}
		}

	}

	public get userData():GainWay
	{
		return this.data as GainWay;
	}
}
