class MemberItem3Renderer extends BaseItemRender {

	public checkBoxs: eui.CheckBox;
	public job: eui.Label;
	public nameLable: eui.Label;
	public payNum: eui.Label;
	public attr: eui.Label;
	public face: eui.Image;

	public btn1: eui.Button;
	public btn2: eui.Button;
	public num1: eui.Label;
	public inputBg: eui.Image;

	public chooseNum: number = 1;
	public headBg: eui.Image;
	constructor() {
		super();
		this.skinName = "MemberItem3Skin";
	}

	public dataChanged(): void {
		if (this.data instanceof SelectInfoData) {
			var info: SelectInfoData = this.data;
			this.job.textFlow = new egret.HtmlTextParser().parser("[" + GuildLanguage.guildOffice[info.data.office] + "]");
			this.nameLable.text = info.data.name;
			this.payNum.text = "" + info.num;
			this.attr.text = "" + info.data.attack;
			this.face.source = `head_${info.data.job}${info.data.sex}`;
			// this.headBg.source = ChatListItemRenderer.HEAD_BG[info.data.sex];
			// if(info.data.vipLevel > 0)
			// {
			// 	this.nameLable.x = 155;
			// 	this.job.x = 251;
			// }else
			// {
			// 	this.nameLable.x = 95;
			// 	this.job.x = 198;
			// }
		}

		this.checkBoxs.selected = false;
		this.btn1.visible = this.btn2.visible = this.num1.visible = this.inputBg.visible = false;
	}

}