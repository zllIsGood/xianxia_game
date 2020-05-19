class GuildWarMemListRenderer extends BaseItemRender {

	public conLab: eui.Label;
	public attack: eui.Label;
	public nameLab: eui.Label;
	public nameLab0: eui.Label;
	public headBG: eui.Image;
	public face: eui.Image;
	public onLine: eui.Label;

	constructor() {
		super();
		this.skinName = "WarMemSkin";
	}

	public dataChanged(): void {
		this.face.source = `head_${this.data.job}${this.data.sex}`;
		this.nameLab.text = `[${GuildLanguage.guildOffice[this.data.office]}]`;
		this.nameLab0.text = this.data.myName;
		this.conLab.text = this.data.point + "";
		this.attack.text = this.data.attr + "";
		this.onLine.text = this.data.mapName == "" ? `不在仙盟` : this.data.mapName;
	}
}