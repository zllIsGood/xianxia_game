/**
 * GuideView
 */
class GuideViewBase extends egret.DisplayObjectContainer {
	protected target: egret.DisplayObject;
	protected infoGroup: eui.Group;
	/**遮罩 */
	protected shapeMasks: egret.Shape[];
	protected rect: egret.Rectangle;
	public clickCD: boolean = true;
	public constructor() {
		super();

		this.rect = new egret.Rectangle(1, 1, 1, 1);

		this.infoGroup = new eui.Group;
		this.infoGroup.touchEnabled = false;
		this.infoGroup.touchChildren = false;
		this.addChild(this.infoGroup);
	}


	protected drawMask(): void {
		if (!this.shapeMasks) {
			this.shapeMasks = [];
			for (let i: number = 0; i < 8; i++) {
				this.shapeMasks[i] = new egret.Shape();
				this.shapeMasks[i].touchEnabled = true;
			}
		}
		let rect = this.rect;
		let w1 = rect.x;
		let w2 = rect.width;
		let w3 = StageUtils.ins().getWidth() - rect.right;
		let h1 = rect.y;
		let h2 = rect.height
		let h3 = StageUtils.ins().getHeight() - rect.bottom;

		this.drawShape(this.shapeMasks[0], new egret.Rectangle(0, 0, w1, h1));
		this.drawShape(this.shapeMasks[1], new egret.Rectangle(rect.x, 0, w2, h1));
		this.drawShape(this.shapeMasks[2], new egret.Rectangle(rect.right, 0, w3, h1));
		this.drawShape(this.shapeMasks[3], new egret.Rectangle(0, rect.topLeft.y, w1, h2));
		this.drawShape(this.shapeMasks[4], new egret.Rectangle(rect.bottomRight.x, rect.topLeft.y, w3, h2));
		this.drawShape(this.shapeMasks[5], new egret.Rectangle(0, rect.bottomRight.y, w1, h3));
		this.drawShape(this.shapeMasks[6], new egret.Rectangle(rect.x, rect.bottomRight.y, w2, h3));
		this.drawShape(this.shapeMasks[7], new egret.Rectangle(rect.right, rect.bottomRight.y, w3, h3));
	}

	protected drawShape(shape: egret.Shape, rect: egret.Rectangle) {
		shape.graphics.clear();
		shape.graphics.beginFill(0x000000, 0);
		shape.graphics.drawRect(rect.x, rect.y, rect.width, rect.height);
		shape.graphics.endFill();
		this.addChild(shape);
	}

	private onResize(): boolean {
		if (this.target) {
			let p = this.target.localToGlobal();
			if (this.rect.x != p.x || this.rect.y != p.y || this.rect.width != this.target.width || this.rect.height != this.target.height) {
				this.refurbish();
				this.drawMask();
			}
			return false;
		}
	}
	private otherMc:MovieClip[] = [];
	private clicking:boolean;
	protected onClick(e: egret.TouchEvent) {
		if (this.rect.contains(e.stageX, e.stageY)) {
			if (this.clickCD) {
				this.clickCD = false;
				TimerManager.ins().doNext(() => {
					this.dispatchEventWith(egret.Event.CHANGE);
				}, this);
			}

			for( let i = 0;i < this.otherMc.length;i++ ){
				egret.Tween.removeTweens(this.otherMc[i]);
				DisplayUtils.removeFromParent(this.otherMc[i]);
			}
			this.clicking = false;
		}
		else
		{
			GuideUtils.ins().clickOut();
			if( this.clicking )
				return;

			this.clicking = true;
			this.otherMc.length = 2;
			for( let i = 0;i < this.otherMc.length;i++ ){
				if( !this.otherMc[i] ){
					this.otherMc[i] = new MovieClip();
				}
				if( !this.otherMc[i].parent ){
					this.addChild(this.otherMc[i]);
				}
				this.otherMc[i].scaleX = 3.3;
				this.otherMc[i].scaleY = 3.3;
				this.otherMc[i].x = this.infoGroup.x;
				this.otherMc[i].y = this.infoGroup.y;

				let tw:egret.Tween = egret.Tween.get(this.otherMc[i]);
				let self = this;
				tw.wait(i*240).call(()=>{
					self.otherMc[i].playFile(RES_DIR_EFF + "forceguildeff",1,()=>{
						// egret.log("点击特效播放完 "+i);
						egret.Tween.removeTweens(self.otherMc[i]);
						DisplayUtils.removeFromParent(self.otherMc[i]);
						if( i == self.otherMc.length - 1 )
							self.clicking = false;
					});
				});
				// tw.wait(i*240).to({"scaleX":1,"scaleY":1},500,egret.Ease.sineIn).call(()=>{
				// 	// egret.log("点击动画播放完 "+i);
				// });

			}


		}
	}

	/**
	 * 刷新
	 */
	protected refurbish(): void {
		this.show(this.target);
	}

	/**
	 * 设置显示数据
	 * @param obj
	 * @param data
	 */
	public show(target: egret.DisplayObject): void {
		if (target == null) {
			return;
		}
		this.target = target;

		let p = target.localToGlobal();
		this.rect.x = p.x;
		this.rect.y = p.y;
		this.rect.width = target.width ? target.width : 60;
		this.rect.height = target.height ? target.height : 60;
		this.drawMask();
		this.addChild(this.infoGroup);

		this.infoGroup.x = p.x + (this.rect.width >> 1);
		this.infoGroup.y = p.y + (this.rect.height >> 1);

		let st = StageUtils.ins().getStage();
		st.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this, true, 0);
		egret.stopTick(this.onResize, this);
		egret.startTick(this.onResize, this);
	}

	public close(): void {
		this.target = null;
		this.rect.x = this.rect.y = this.rect.width = this.rect.height = 1;
		let st = StageUtils.ins().getStage();
		st.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onClick, this, true);
		egret.stopTick(this.onResize, this);
	}

}
