/*战火天气*/
class WeatherFire extends WeatherFlower {
	public MAX_COUNT: number = 16;
	protected r_Max: number = 12;
	public imageList: Array<string> = ["fire0.png"];

	public constructor() {
		super();
	}

	protected getStartY(): number {
		let stage = egret.MainContext.instance.stage;
		let map = ViewManager.gamescene.map;
		return MathUtils.limitInteger(-map.y + stage.stageHeight * 0.5, -map.y + stage.stageHeight * 0.75);
	}

	protected getTargetY(): number {
		let stage = egret.MainContext.instance.stage;
		let halfHeight = stage.stageHeight / 2;
		let map = ViewManager.gamescene.map;
		return MathUtils.limitInteger(-map.y, -map.y + halfHeight / 2);
	}

	protected onWeatherStart(): void {
		this._lastTime = egret.getTimer();

		if (this.r_P_List.length == 0 && this.r_R_List.length == 0) {//粒子未初始化，则初始化粒子数量max
			var line: RainLine;
			for (var i: number = 0; i < this.MAX_COUNT; i++) {
				line = new RainLine;
				line.down = false;
				line.blendMode = egret.BlendMode.ADD;
				line.autoRotation = false;
				this.r_P_List.push(line);
			}
		}
	}

	protected onWeatherUpdate(): void {
		let line: RainLine;
		if (this.imageList == null || this.imageList.length == 0) {//如果粒子没有设置材质，测不渲染
			return;
		}

		var curtime: number = egret.getTimer();

		if (this.r_Max != this.MAX_COUNT && curtime - this._lastTime >= 1000) {
			this.r_Max += 1;

			if (this.r_Max > this.MAX_COUNT) {
				this.r_Max = this.MAX_COUNT;
			}

			this._lastTime = curtime;
		}

		if (this.r_R_List.length < this.r_Max && this.r_P_List.length > 0 && curtime - this.r_L_Last_Time > this.r_L_Delay) {//如果有静止的粒子对象，且时间间隔到了
			//初始化一个粒子特效
			this.r_L_Last_Time = curtime;

			line = this.r_P_List.shift();

			line.visible = true;

			//				line.blendMode = BlendModeDX.ADD;

			line.type = 0;

			line.source = RES_DIR_WEATHER + this.imageList[((Math.random() * 10) % this.imageList.length) << 0];//设置材质
			let stage = egret.MainContext.instance.stage;
			let map = ViewManager.gamescene.map;
			line.x = MathUtils.limitInteger(-map.x + stage.width * 0.05, -map.x + stage.stageWidth + 50);//随机x坐标

			line.y = this.getStartY();
			line.sy = line.y;

			//落下目标y，随机屏幕下半屏
			line.targety = this.getTargetY();;

			line.scaleX = 0;
			line.scaleY = 0;


			line.sScale = MathUtils.limit(0.6, 1.2);
			line.alpha = 0;//Math.random() * 0.4 + 0.8;//0.8 - 0.9
			line.rotationPlus = MathUtils.limitInteger(3, 12);// * 6;

			line.sptx = Math.random() / 20 + 0.01;

			//随机x轴速度
			line.speedx = MathUtils.limit(4, -4);

			//随机y轴速度
			line.speedy = MathUtils.limit(-4, -7);

			if (line.parent == null) {//如果没有添加，则添加到舞台渲染
				 ViewManager.gamescene.map["_effTopLayer"].addChild(line);
			}

			//加入更新列表
			this.r_R_List.push(line);
		}

		//更新活跃列表
		for (let i: number = 0; i < this.r_R_List.length; i++) {
			line = this.r_R_List[i];

			//粒子自身更新
			line.update();
			line.rotation += line.rotationPlus;

			if (line.isDeath) {//如果粒子生命周期结束，则回收入静止列表
				this.r_R_List.splice(i--, 1);

				this.r_P_List.push(line);

				line.visible = false;

				// DisplayUtils.removeFromParent(line);
			}
			else {
				let percent: number = (line.y - line.sy) / (line.targety - line.sy);

				if (percent <= 0.2) {
					line.alpha = percent / 0.2;
					line.scaleX = line.scaleY = line.sScale * line.alpha;
				}
				else if (percent >= 0.8) {
					line.alpha = (1 - percent) / 0.2;
					line.scaleX = line.scaleY = line.sScale * line.alpha;
				}
			}
		}
	}
}