class BossTargetInfo extends BaseView {

	public bloodBar: eui.ProgressBar;
	public head: eui.Image;
	public nameLabel: eui.Label;
	private model: Role;

	public constructor() {
		super();
		this.skinName = "BossTargetSkin";
	}

	public refushTargetInfo(target: CharRole): void {
		this.model = <Role>(target.infoModel);
		this.bloodBar.maximum = this.model.getAtt(AttributeType.atMaxHp);
		this.bloodBar.value = target.getHP();
		if (this.model.team == Team.My) {
			this.nameLabel.text = Actor.myName;
		} else {

			this.nameLabel.text = this.model.name + "";
		}
		// this.head.source = `yuanhead${this.model.job}${this.model.sex}`;
		this.head.source = `main_role_head${this.model.job}`
	}
}