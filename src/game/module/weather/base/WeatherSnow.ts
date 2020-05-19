/*雪天气*/
class WeatherSnow extends WeatherFlower {
	public MAX_COUNT: number = 16;
	protected r_Max: number = 16;
	public imageList: Array<string> = ["snow0.png"];

	public constructor() {
		super();
	}

	protected getTargetY(): number {
		let stage = egret.MainContext.instance.stage;
		let map = ViewManager.gamescene.map;
		return MathUtils.limitInteger(-map.y + stage.stageHeight * 0.8, -map.y + stage.stageHeight + 150);
	}

}