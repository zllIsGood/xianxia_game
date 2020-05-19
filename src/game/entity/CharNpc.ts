/**
 * Created by hrz on 2017/8/9.
 */

class CharNpc extends CharEffect {
	protected npcHead: MineNpcHead;
	protected _infoModel: NpcModel;

	constructor() {
		super();
		this.npcHead = new MineNpcHead();
		this.npcHead.anchorOffsetY = 90;
		this.npcHead.anchorOffsetX = 100;
		this.npcHead.currentState = this.npcHead.states[0];
		this.titleCantainer.addChild(this.npcHead);
		this.touchEnabled = true;
		this.touchChildren = false;
	}

	set infoModel(model: NpcModel) {
		this._infoModel = model;
	}

	get infoModel(): NpcModel {
		return this._infoModel;
	}

	protected playCount(): number {
		return (this._state == EntityAction.RUN || this._state == EntityAction.STAND) ? -1 : 1
	}

	updateModel() {
		let config = this.infoModel.npcConfig;
		this.npcHead.nameTxt.text = config.name;
		this.npcHead.updateModel(this.infoModel);
		this.x = this.infoModel.x;
		this.y = this.infoModel.y;
		this.setConfig(this.infoModel.avatarString);

		this.dir = this.infoModel.dir;
		this.playAction(config.action || EntityAction.STAND);

		this.addMc(CharMcOrder.BODY, this.infoModel.avatarFileName);
		if (this.infoModel.weaponFileName) {
			this.addMc(CharMcOrder.WEAPON, this.infoModel.weaponFileName);
		}

		// this.showTaskMc();
	}

	private taskMc: MovieClip
	public showTaskMc() {
		if (!this.taskMc) {
			this.taskMc = new MovieClip();
			this.taskMc.playFile(RES_DIR_EFF + "task", -1)
			this.addChild(this.taskMc);
			this.taskMc.y = -160
		}
	}

	public hideTaskMc() {
		DisplayUtils.removeFromParent(this.taskMc);
		this.taskMc = null;
	}
}