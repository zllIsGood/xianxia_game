/**
 * 方向工具
 */
class DirUtil {

	/**
	 * 通过2点，获取8方向值
	 * p1 起始点
	 * p2 结束点
	 */
	public static get8DirBy2Point(p1: any, p2: any): number {
		//计算方向
		let angle: number = MathUtils.getAngle(MathUtils.getRadian2(p1.x, p1.y, p2.x, p2.y));
		return this.angle2dir(angle);
	}

	/**
	 * 通过2点，获取4方向值
	 * p1 起始点
	 * p2 结束点
	 */
	public static get4DirBy2Point(p1: any, p2: any): number {
		return p1.x < p2.x ? (p1.y < p2.y ? 3 : 1) : (p1.y < p2.y ? 5 : 7);
	}

	/** 方向转角度 */
	public static dir2angle(dir: number): number {
		dir *= 45;
		dir -= 90;
		return dir;
	}

	/** 角度转方向 */
	public static angle2dir(angle: number): number {
		if (angle < -90)
			angle += 360;
		// 8朝向
		// return Math.round((angle + 90) / 45) % 8;
		// 5朝向 去掉右和下
		let dir = Math.round((angle + 90) / 45) % 8;
		return dir ? Math.round((angle + 45) / 90) % 4 * 2 + 1 : 0;
	}

	/** 反方向 */
	public static dirOpposit(dir: number): number {
		// 7 == 3
		// 6 == 2
		// 5 == 1
		// 4 == 0
		let rtn = dir < 4 ? dir + 4 : dir - 4
		return rtn == 4 ? 3 : rtn;
	}

	/** 8方向转5方向资源方向 */
	public static get5DirBy8Dir(dir8: number): number {
		return dir8 - this.isScaleX(dir8);
	}

	/** 当前方向是否需要翻转 */
	public static isScaleX(dir8: number): number {
		let td: number = 2 * (dir8 - 4);
		if (td < 0) td = 0;
		return td;
	}

	/** 获取方向格子坐标后几格的坐标 */
	public static getGridByDir(dir: number, pos: number = 1, p: { x: number, y: number } = {
		x: 0,
		y: 0
	}): { x: number, y: number } {
		let angle: number = this.dir2angle(this.dirOpposit(dir));
		return MathUtils.getDirMove(angle, pos * GameMap.CELL_SIZE, p.x, p.y);
	}

	public static getExtendPoint2(ax: number, ay: number, bx: number, by: number, distance: number, extend: boolean = true): egret.Point {
		let dx: number = ax - bx;
		let dy: number = ay - by;
		let dist: number = Math.sqrt(dx * dx + dy * dy);
		let out: egret.Point = new egret.Point();
		if (extend) {
			out.x = bx + (bx - ax) / dist * distance;
			out.y = by + (by - ay) / dist * distance;
		}
		else {

			if (distance > dist) {
				distance = dist;
			}
			out.x = bx - (bx - ax) / dist * distance;
			out.y = by - (by - ay) / dist * distance;
		}
		return out;
	}

	/**抛物线移动 */
	public static baserMove(source: CharMonster, target: XY, time: number) {
		let dis = MathUtils.getDistance(source.x, source.y, target.x, target.y);
		let p: { x: number, y: number }[] = [];
		let dir = DirUtil.get8DirBy2Point(source, target);
		let angle: number = Math.atan2(target.y - source.y, target.x - source.x);
		p[0] = { x: source.x, y: source.y };
		// p[2] = MathUtils.getDirMove(dir * 72, dis, p[0].x, p[0].y);

		p[2] = target;
		source.dir = dir;

		p[1] = { x: Math.min(p[0].x + (p[2].x - p[0].x) * 3 / 5), y: Math.min(p[2].y, p[0].y - dis) }
		let t = egret.Tween.get(source.dieTweenObj, {
			onChange: (arg) => {
				//死亡击飞
				let value = source.dieTweenObj.factor;
				source.x = Math.pow(1 - value, 2) * p[0].x + 2 * value * (1 - value) * p[1].x + Math.pow(value, 2) * p[2].x;
				source.y = Math.pow(1 - value, 2) * p[0].y + 2 * value * (1 - value) * p[1].y + Math.pow(value, 2) * p[2].y;
			}, onChangeObj: this
		});
		t.to({ factor: 1 }, time);
	}
}