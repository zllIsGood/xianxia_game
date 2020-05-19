/**
 * Created by hrz on 2017/7/8.
 */

class Bezier {
	private _fromPoint: { x: number, y: number };
	private _toPoint: { x: number, y: number };
	private _centerPoint: { x: number, y: number };
	private _ease: Function;
	private _display: egret.DisplayObject;

	private static _pool: Bezier[] = [];

	static pop(fp?, ep?): Bezier {
		let bezier = null;
		if (this._pool.length) {
			bezier = this._pool.pop();
			bezier.fromPoint = fp;
			bezier.toPoint = ep;
		} else {
			bezier = new Bezier(fp, ep);
		}
		return bezier;
	}

	static push(bezier: Bezier) {
		if (bezier) {
			bezier.display = null;
			bezier.ease = null;
			bezier.fromPoint = null;
			bezier.toPoint = null
			bezier.centerPoint = null;
			this._pool.push(bezier);
		}
	}

	constructor(fp, ep) {
		this._fromPoint = fp;
		this._toPoint = ep;
	}

	set fromPoint(value) {
		this._fromPoint = value;
	}

	set toPoint(value) {
		this._toPoint = value;
	}

	set display(value) {
		this._display = value;
	}

	set ease(value) {
		this._ease = value;
	}

	set centerPoint(value) {
		this._centerPoint = value;
	}

	start(time, callback?: Function, callObj?, delay: number = 0) {
		egret.Tween.get(this).wait(delay).to({factor: 1}, time, this._ease).call(
			() => {
				egret.Tween.removeTweens(this);
				if (callback) {
					callback.call(callObj);
				}
			}
		);
	}

	get factor(): number {
		return 0;
	}

	set factor(value: number) {
		this._display.x = (1 - value) * (1 - value) * this._fromPoint.x + 2 * value * (1 - value) * this._centerPoint.x + value * value * this._toPoint.x;
		this._display.y = (1 - value) * (1 - value) * this._fromPoint.y + 2 * value * (1 - value) * this._centerPoint.y + value * value * this._toPoint.y;
	}
}