class CircBar extends eui.Component{
	private barMC: MovieClip;

	private barMsk: egret.Shape;

	private _curAngle: number = 0;
	private _radius: number = 250;//半径
	public constructor(effName:string,radius: number) {
		super();
		this.barMsk = new egret.Shape();
		this.addChild(this.barMsk);
		this.mask = this.barMsk;
		this.barMC = new MovieClip();
		this.addChild(this.barMC);
		this.barMC.playFile(RES_DIR_EFF + effName, -1);

		this._radius = radius;
	}

	public get curAngle(): number {
		return this._curAngle;
	}

	public set curAngle(value: number) {
		this._curAngle = value;
		DisplayUtils.drawCir(this.barMsk, this._radius, value - 90, false, -90);
	}
}