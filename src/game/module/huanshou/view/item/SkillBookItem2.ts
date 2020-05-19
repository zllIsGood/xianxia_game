class SkillBookItem2 extends HuanShouSkillItem {
	public constructor() {
		super();
		this.lock.visible =false;
		this.bg1.visible = false;
		this.bg2.visible = false;
        this.redPoint0.visible = false;
		this.validateNow();
	}

	protected dataChanged(): void {
		super.dataChanged();
	}
}