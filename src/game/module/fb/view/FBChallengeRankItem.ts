/**
 * 通天塔排名控件
 *
 */
class FBChallengeRankItem extends BaseItemRender {
	private rankImg:eui.Image;
	private rank:eui.Label;
	private vip:eui.Image;
	private nameLabel:eui.Label;
	private cengNum:eui.Label;

	constructor() {
		super();
		this.skinName = "ChuangtianguanRankItem";
	}
	protected childrenCreated(): void {
		super.childrenCreated();

	}

	protected dataChanged(): void {
		if( !this.data )return;

		if( this.data.pos > 3 ){
			this.rankImg.visible = false;
			this.rank.visible = !this.rankImg.visible;
			this.rank.text = this.data.pos + "";
		}else{
			this.rankImg.visible = true;
			this.rank.visible = !this.rankImg.visible;
			this.rankImg.source = `common1_no${this.data.pos}`;
		}

		this.vip.visible = this.data.vip;
		this.nameLabel.text = this.data.player;

		if( !this.data.count ){
			return;
		}
		let info: FbChallengeConfig = GlobalConfig.FbChallengeConfig[this.data.count];
		let nameCfg: FbChNameConfig = GlobalConfig.FbChNameConfig[info.group];
		this.cengNum.text =`${nameCfg.name}${info.layer}层`;

	}
	public destruct(): void {

	}

}