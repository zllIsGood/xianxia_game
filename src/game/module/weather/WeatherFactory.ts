class WeatherFactory {
	public static enabled: Boolean = false;

	public static weatherFBList = [];

	public static weatherSceneList = [];

	/**
	 * 刷新频率
	 */
	public static frequency: number;
	public static weatherRunlist: Object = new Object();

	private static _weatherFlower: WeatherFlower;
	private static _weatherSnow: WeatherSnow;
	private static _weatherFire: WeatherFire;
	private static _weatherFirefly: WeatherFirefly;
	private static _weatherRain: WeatherRain;
	private static _weatherSand: WeatherSand;

	/**当前天气 */
	private static _currWeather: WeatherBase;

	public static stopWeather(): void {
		if (this._currWeather) {
			this._currWeather.stopWeather();
		}
	}

	/**获取一个天气对象 并会赋值成当前天气对象
	 * 0: 没效果
	 * 1：樱花雨
	 * 2: 雪花
	 * 3: 火花飞舞
	 * 4: 萤火虫
	 * 5: 小雨
	 */
	public static getWeather(type: number): WeatherBase {
		if (type == 1) {
			this._currWeather = this.getFlower();
		} else if (type == 2) {
			this._currWeather = this.getSnow();
		} else if (type == 3) {
			this._currWeather = this.getFire();
		} else if (type == 4) {
			this._currWeather = this.getFirefly();
		} else if (type == 5) {
			this._currWeather = this.getRain();
		} else if (type == 6) {
			this._currWeather = this.getSand();
		}
		return this._currWeather;
	}

	/**
	 * 漫天樱花
	 * @return 
	 * 
	 */
	private static getFlower(): WeatherFlower {
		this._weatherFlower = this._weatherFlower || new WeatherFlower();
		return this._weatherFlower;
	}

	/**
	 * 细雪飞舞
	 * @return 
	 * 
	 */
	private static getSnow(): WeatherSnow {
		this._weatherSnow = this._weatherSnow || new WeatherSnow();
		return this._weatherSnow;
	}

	/**
	 * 战火纷飞
	 * @return 
	 * 
	 */
	private static getFire(): WeatherFire {
		this._weatherFire = this._weatherFire || new WeatherFire();
		return this._weatherFire;
	}

	/**
	 * 萤火虫
	 * @return 
	 * 
	 */
	private static getFirefly(): WeatherFirefly {
		this._weatherFirefly = this._weatherFirefly || new WeatherFirefly();
		return this._weatherFirefly;
	}

	/**
	 * 雨天
	 * @return 
	 * 
	 */
	private static getRain(): WeatherRain {
		this._weatherRain = this._weatherRain || new WeatherRain();
		return this._weatherRain;
	}

	/**
	 * 风沙
	 * @return 
	 * 
	 */
	private static getSand(): WeatherSand {
		this._weatherSand = this._weatherSand || new WeatherSand();
		return this._weatherSand;
	}


}