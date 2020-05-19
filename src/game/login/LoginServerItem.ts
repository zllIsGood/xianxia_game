/*
    file: src/game/login/LoginServerItem.ts
    date: 2018-9-10
    author: solace
    descript: 登录服务器选项
*/
class LoginServerItem extends BaseItemRender {

	private lbSerName: eui.Label;
	private state1: eui.Image;
	private state2: eui.Image;
	private state3: eui.Image;
    
	constructor() {
		super();
		this.skinName = "WxServerItemSkin";
	}

	public dataChanged(): void {
		// console.log(this.data);
		this.lbSerName.text = this.data.name;
		let state = Number(this.data.server_status);
		switch (state) {
			case 1:
				this.state1.visible = true;
				this.state2.visible = false;
				this.state3.visible = false;
				break;
			
			case 2:
				this.state1.visible = false;
				this.state2.visible = true;
				this.state3.visible = false;
				break;

			case 3:
				this.state1.visible = false;
				this.state2.visible = false;
				this.state3.visible = true;
				break;
		
			default:
				break;
		}
	}
}