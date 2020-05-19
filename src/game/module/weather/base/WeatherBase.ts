class WeatherBase {
	protected _runing: boolean = false;
	protected _first: boolean = false;
	public timerFrame: number = 1000;
	private index:number = 0;
	public constructor(index:number) {
		this.index = index;
	}

	public playWeather(): void {
		if (this._runing == false) {
			this._runing = true;
			this._first = true;
			this.onWeatherStart();
			if (this.timerFrame > 0) {
				TimerManager.ins().doTimer(this.timerFrame,0,this.weatherUpdateHandler,this);
			}
			else {
				TimerManager.ins().doTimer(60,0,this.weatherUpdateHandler,this);
			}
			WeatherFactory.weatherRunlist[this.index] = this;
		}
	}

	public playWeather1(): void {
		if (this._runing == false) {
			this._runing = true;
			this._first = true;
			this.onWeatherStart();
			if (this.timerFrame > 0) {
				TimerManager.ins().doTimer(30,300,this.weatherUpdateHandler,this);
			}
			else {
				TimerManager.ins().doTimer(30,300,this.weatherUpdateHandler,this);
			}
			WeatherFactory.weatherRunlist[this.index] = this;
		}
	}

	public stopWeather(): void {
		if (this._runing == true) {
			this._runing = false;
			if (this.timerFrame > 0) {
				TimerManager.ins().remove(this.weatherUpdateHandler,this);
			}
			else {
				TimerManager.ins().remove(this.weatherUpdateHandler,this);
			}
			this.onWeatherStop();
			delete WeatherFactory.weatherRunlist[this.index];
		}
	}

	private weatherUpdateHandler(): void {
		if (this._first == true) {
			this._first = false;
			return;
		}
		this.onWeatherUpdate();
	}

	protected onWeatherInit(): void {

	}

	protected onWeatherStart(): void {

	}

	protected onWeatherUpdate(): void {

	}

	protected onWeatherStop(): void {

	}

}