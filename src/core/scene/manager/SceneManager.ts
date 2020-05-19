/**
 * Created by yangsong on 2014/11/28.
 * 场景管理类
 */
class SceneManager extends BaseClass {
	static CREATE_ROLE:string = "CreateRoleScene";
	static MAIN:string = "MainScene";

	private _currScene: BaseScene;

	/**
	 * 构造函数
	 */
	public constructor() {
		super();
	}

	public static ins(): SceneManager {
		return super.ins() as SceneManager;
	}

	/**
	 * 清空处理
	 */
	public clear(): void {
		let nowScene: BaseScene = this._currScene;
		if (nowScene) {
			nowScene.onExit();
			this._currScene = undefined;
		}
	}

	/**
	 * 切换场景
	 * @param key 场景唯一标识
	 */
	public runScene(SceneClass: any): void {
		if (SceneClass == null) {
			Log.trace("runScene:scene is null");
			return;
		}

		let oldScene: BaseScene = this._currScene;
		if (oldScene) {
			oldScene.onExit();
			oldScene = undefined;
		}
		let s: BaseScene = new SceneClass();
		s.onEnter();
		this._currScene = s;
	}

	/**
	 * 获取当前Scene
	 * @returns {number}
	 */
	public getCurrScene(): BaseScene {
		return this._currScene;
	}

	public getSceneName():string{
		if(this._currScene) {
			return egret.getQualifiedClassName(this._currScene);
		}
		return '';
	}
}
