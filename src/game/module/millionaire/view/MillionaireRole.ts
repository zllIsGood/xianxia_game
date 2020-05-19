/***
 * 大富翁人物
 */
class MillionaireRole extends egret.DisplayObjectContainer {
	public static STOP = 0;
	public static ACTION = 1;
	public roleType: number;//行动:1 停止:0
	public state: number;//上下左右
	private sex: number;

	private shadow: eui.Image;//richman_shadow

	private model: MovieClip;//人物模型
	private prefix: string;//模型前缀

	private model1: MovieClip;//武器
	private prefix1: string;//武器模型前缀

	private model2: MovieClip;//翅膀
	private prefix2: string;//翅膀模型前缀

	private model3: MovieClip;//诛仙
	private prefix3: string;//诛仙模型前缀

	// private model4:MovieClip;//剑灵
	// private prefix4:string;//剑灵模型前缀

	private weightLayers: number[][];

	constructor(sex: number) {
		super();
		this.shadow = new eui.Image("richman_shadow");
		this.shadow.x = this.x - 18;
		this.shadow.y = this.y - 5;
		this.addChild(this.shadow);


		this.state = MillionaireView.DIR_UP;
		this.roleType = MillionaireRole.STOP;
		this.sex = sex ? sex : 0;

		this.initModel();
	}
	private initModel() {
		this.model = new MovieClip;
		this.addChild(this.model);
		this.prefix = "body100";

		this.model1 = new MovieClip;
		this.addChild(this.model1);
		this.prefix1 = "";

		this.model2 = new MovieClip;
		this.addChild(this.model2);
		this.prefix2 = "";

		this.model3 = new MovieClip;
		this.addChild(this.model3);
		this.prefix3 = "";

		// this.model4 = new MovieClip;
		// this.addChild(this.model4);
		// this.prefix4 = "";

		//层级关系
		this.weightLayers = [];
		this.weightLayers[MillionaireView.DIR_UP] = CharEffect.FRAME_ODER[1];//上
		this.weightLayers[MillionaireView.DIR_RIGHT] = CharEffect.FRAME_ODER[3];//右
		this.weightLayers[MillionaireView.DIR_LEFT] = CharEffect.FRAME_ODER[5];//左
		this.weightLayers[MillionaireView.DIR_DOWN] = CharEffect.FRAME_ODER[5];//下
		this.setMovieFromWeight();

		//人物模型
		let role: CharRole = EntityManager.ins().getMainRole(0);
		if (role) {
			let model: Role = <Role>role.infoModel;
			//身体
			let id = model.equipsData[2].item.configID;
			if (model.zhuangbei[0] > 0) {
				let fileName: string = DisplayUtils.getAppearanceByJob(GlobalConfig.ZhuangBanId[model.zhuangbei[0]].res, model.job);
				this.prefix = fileName;
			}
			else if (id > 0) {
				if (GlobalConfig.EquipConfig[id]) {
					let fileName: string = DisplayUtils.getAppearanceByJob(GlobalConfig.EquipConfig[id].appearance, model.job);
					this.prefix = fileName;
				}
			}
			else
				this.prefix = `body${model.job}00`;

			//武器
			id = model.getEquipByIndex(0).item.configID;
			if (model.zhuangbei[1] > 0) {
				let fileName: string = DisplayUtils.getAppearanceByJob(GlobalConfig.ZhuangBanId[model.zhuangbei[1]].res, model.job);
				this.prefix1 = fileName;
			}
			else if (id > 0) {
				if (GlobalConfig.EquipConfig[id]) {
					let fileName: string = DisplayUtils.getAppearanceByJob(GlobalConfig.EquipConfig[id].appearance, model.job);
					this.prefix1 = fileName;
				}
			}

			// 翅膀
			if (model.zhuangbei[2] > 0) {
				let fileName: string = GlobalConfig.ZhuangBanId[model.zhuangbei[2]].res;
				this.prefix2 = fileName + "_" + model.job;
			}
			else if (model.wingsData.openStatus) {
				if (GlobalConfig.WingLevelConfig[model.wingsData.lv])
					this.prefix2 = GlobalConfig.WingLevelConfig[model.wingsData.lv].appearance + "_" + model.job;;
			}

			//诛仙齐鸣特效
			if (model.heirloom) {
				let suitConfig: HeirloomEquipSetConfig = model.heirloom.getSuitConfig(model);
				if (suitConfig && suitConfig.weff) {
					this.prefix3 = suitConfig.weff;
				}
			}
			// //剑灵
			// if( model.weapons && model.weapons.weaponsId > 0 ){
			// 	let fileName: string = GlobalConfig.WeaponSoulConfig[model.weapons.weaponsId].outside[model.job-1];
			// 	this.prefix4 = fileName;
			// }
		}
	}
	//设置每个模型层级
	private setMovieFromWeight() {
		this.setWeight(this.state);
	}
	private setWeight(dir: number) {
		let layers: number[] = this.weightLayers[dir];
		for (let i = 0; i < layers.length; i++) {
			let mc: MovieClip = this.getMoviceByWeight(layers[i]);
			if (mc) {
				this.setChildIndex(mc, i);
			}
		}
	}
	//根据层级获取对应模型
	private getMoviceByWeight(weight: number) {
		let mc: MovieClip;
		switch (weight) {
			case CharMcOrder.BODY:
				mc = this.model;
				break;
			case CharMcOrder.WEAPON:
				mc = this.model1;
				break;
			case CharMcOrder.WING:
				mc = this.model2;
				break;
			// case CharMcOrder.SOUL:
			// 	mc = this.model4;
			// 	break;
		}
		return mc;
	}

	public destory() {
		DisplayUtils.removeFromParent(this.model);
		DisplayUtils.removeFromParent(this.model1);
		DisplayUtils.removeFromParent(this.model2);
		DisplayUtils.removeFromParent(this.model3);
		// DisplayUtils.removeFromParent(this.model4);
	}
	private get stateName() {
		this.model.scaleX = 1;
		let strType = "";
		switch (this.state) {
			case MillionaireView.DIR_UP:
				if (this.roleType)
					strType = "1r";
				else
					strType = "1s";
				break;
			case MillionaireView.DIR_RIGHT:
				if (this.roleType)
					strType = "3r";
				else
					strType = "3s";
				break;
			case MillionaireView.DIR_DOWN:
				if (this.roleType)
					strType = "3r";
				else
					strType = "3s";
				break;
			case MillionaireView.DIR_LEFT:
				this.model.scaleX = -1;
				if (this.roleType)
					strType = "3r";
				else
					strType = "3s";
				break;
		}
		//和模型缩放方向相同
		this.model1.scaleX = this.model.scaleX;
		this.model2.scaleX = this.model.scaleX;
		// this.model4.scaleX = this.model.scaleX;

		return strType;
	}
	private preName: string = "";
	public updateModel() {
		if (this.preName != this.stateName) {
			this.preName = this.stateName;
			if (this.prefix)
				this.model.playFile(RES_DIR_BODY + this.prefix + "_" + this.sex + "_" + this.stateName, -1);//身体
			if (this.prefix1)
				this.model1.playFile(RES_DIR_WEAPON + this.prefix1 + "_" + this.sex + "_" + this.stateName, -1);//武器
			if (this.prefix2)
				this.model2.playFile(RES_DIR_WING + this.prefix2 + "_" + this.stateName, -1);//翅膀
			if (this.prefix3)
				this.model3.playFile(RES_DIR_EFF + this.prefix3, -1);//诛仙
			// if( this.prefix4 )
			// 	this.model4.playFile(RES_DIR_WEAPON + this.prefix4 + "_" + this.stateName,-1);//剑灵
			this.setMovieFromWeight();
		}
	}


}