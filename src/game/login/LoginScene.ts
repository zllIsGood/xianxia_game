/*
    file: src/game/login/LoginScene.ts
    date: 2018-9-10
    author: solace
    descript: 登录场景
*/
class LoginScene extends BaseScene {
	/**
	 * 构造函数
	 */
	public constructor() {
		super();
	}

	/**
	 * 进入Scene调用
	 */
	public onEnter(): void {
		super.onEnter();
        this.addLayer(LayerManager.UI_Main);
		ViewManager.ins().open(LoginView);
	}

	/**
	 * 退出Scene调用
	 */
	public onExit(): void {
		super.onExit();
	}
}
