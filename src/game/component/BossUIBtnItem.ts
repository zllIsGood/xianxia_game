class BossUIBtnItem extends BaseComponent {

	private bg:eui.Button;
	private bg0:eui.Button;
	private select:eui.Image;

	public constructor() {
		super();
		this.skinName = 'worldBossAtbtn';
	}

	protected dataChanged(): void {
		this.bg.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.bg0.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.addEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.currentState = this.data;
		this.validateNow();
	}

	public destruct(): void {
		this.bg.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.bg0.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
		this.removeEventListener(egret.TouchEvent.TOUCH_TAP, this.onTap, this);
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.bg:

				break;
			case this.bg0:

				break;
		}
	}
}