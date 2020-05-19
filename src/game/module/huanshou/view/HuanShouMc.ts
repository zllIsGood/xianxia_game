class HuanShouMc extends egret.DisplayObjectContainer {
	/** 形象主体 */
	private _body: MovieClip;

	/** 文件名 */
	private _fileName: string;
	private _monsterId: string;

	public constructor() {
		super();

		this._body = new MovieClip();
		this.addChild(this._body);
	}

	public setData(avatar: string): void {
		if (this._monsterId != avatar) {
			this._monsterId = avatar;
			this.initBody(RES_DIR_MONSTER + `monster` + avatar);
		}
	}

	/**
	 * 设置主体动画
	 */
	private initBody(fileName?: string): void {
		if (this._fileName != fileName)
			this._fileName = fileName;
		this.loadBody();
	}

	private loadBody(): void {
		this._body.stop();
		this._body.addEventListener(egret.Event.CHANGE, this.playBody, this);
		this.loadFile(this._body);
	}

	private loadFile(mc: MovieClip): void {
		if (this._fileName) {
			mc.playFile(this._fileName, -1);
			mc.visible = true;
		}
	}

	private playBody(): void {
		this._body.removeEventListener(egret.Event.CHANGE, this.playBody, this);
		let firstFrame: number = 1;
		this._body.gotoAndPlay(firstFrame, -1);
	}
}