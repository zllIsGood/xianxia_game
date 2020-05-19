class StatueView extends egret.DisplayObjectContainer {

	private title: MovieClip;

	private roleName: eui.Label;

	private model: eui.Image;

	constructor(title: string, name: string, body: string) {
		super();

		this.title = new MovieClip;
		this.title.playFile(RES_DIR_EFF + title, -1);
		this.addChild(this.title);

		this.roleName = new eui.Label();
		this.roleName.size = 14;
		this.roleName.strokeColor = 0;
		this.roleName.stroke = 1;
		this.roleName.text = `${name}`;
		this.roleName.x = -this.roleName.width >> 1;
		this.addChild(this.roleName);

		this.model = new eui.Image();
		this.model.source = `${RES_DIR_CITY}/${body}.png`;
		this.model.once(egret.Event.COMPLETE, () => {

			this.model.x = -this.model.width >> 1;
			this.model.y = -this.model.height;

			this.roleName.y = this.model.y - 20;
			this.title.y = this.roleName.y - 50;
		}, this);
		this.addChild(this.model);
	}

	get weight() {
		return this.y;
	}
}