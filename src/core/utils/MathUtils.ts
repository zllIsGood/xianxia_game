/**
 * Created by yangsong on 2014/11/22.
 * 数学计算工具类
 */
class MathUtils {

	/**
	 * 弧度制转换为角度值
	 * @param radian 弧度制
	 * @returns {number}
	 */
	public static getAngle(radian: number): number {
		return 180 * radian / Math.PI;

	}

	/**
	 * 角度值转换为弧度制
	 * @param angle
	 */
	public static getRadian(angle: number): number {
		return angle / 180 * Math.PI;
	}

	/**
	 * 获取两点间弧度
	 * @param p1X
	 * @param p1Y
	 * @param p2X
	 * @param p2Y
	 * @returns {number}
	 */
	public static getRadian2(p1X: number, p1Y: number, p2X: number, p2Y: number): number {
		let xdis: number = p2X - p1X;
		let ydis: number = p2Y - p1Y;
		return Math.atan2(ydis, xdis);
	}

	/**
	 * 获取两点间距离
	 * @param p1X
	 * @param p1Y
	 * @param p2X
	 * @param p2Y
	 * @returns {number}
	 */
	public static getDistance(p1X: number, p1Y: number, p2X: number, p2Y: number): number {
		let disX: number = p2X - p1X;
		let disY: number = p2Y - p1Y;
		let disQ: number = disX * disX + disY * disY;
		return Math.sqrt(disQ);
	}

	public static getDistanceByObject(s: { x: number, y: number }, t: { x: number, y: number }): number {
		return this.getDistance(s.x, s.y, t.x, t.y);
	}

	/**获取两个点的距离的平方 */
	public static getDistanceX2ByObject(s: { x: number, y: number }, t: { x: number, y: number }): number {
		let disX: number = s.x - t.x;
		let disY: number = s.y - t.y;
		return disX * disX + disY * disY;
	}

	/** 角度移动点 */
	public static getDirMove(angle: number, distance: number, offsetX: number = 0, offsetY: number = 0): { x: number, y: number } {
		let radian = this.getRadian(angle);
		let p = { x: 0, y: 0 };
		p.x = Math.cos(radian) * distance + offsetX;
		p.y = Math.sin(radian) * distance + offsetY;
		return p;
	}


	/**
	 * 获取一个区间的随机数
	 * @param $from 最小值
	 * @param $end 最大值
	 * @returns {number}
	 */
	public static limit($from: number, $end: number): number {
		var random = Math.random() * ($end - $from) + $from;
		return random;
	}

	/**
	 * 获取一个区间的随机数(帧数)
	 * @param $from 最小值
	 * @param $end 最大值
	 * @returns {number}
	 */
	public static limitInteger($from: number, $end: number): number {
		return Math.round(this.limit($from, $end));
	}

	/**
	 * 在一个数组中随机获取一个元素
	 * @param arr 数组
	 * @returns {any} 随机出来的结果
	 */
	public static randomArray(arr: Array<any>): any {
		let index: number = Math.floor(Math.random() * arr.length);
		return arr[index];
	}

	/**取整 */
	public static toInteger(value: number): number {
		return value >> 0;
	}

	/**
	 * 获取两个点延长线上某个距离的点
	 * @param p1:起始点
	 * @param p2:结束点
	 */
	public static getPByDistance(p1: XY, p2: XY, disance: number): XY {
		let angle: number = Math.atan2(p2.y - p1.y, p2.x - p1.x);
		let p = { x: 0, y: 0 };
		p.x = p2.x + disance * Math.cos(angle);
		p.y = p2.y + disance * Math.sin(angle);
		return p;
	}
}