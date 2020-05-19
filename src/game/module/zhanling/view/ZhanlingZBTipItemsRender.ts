/**
 * 天仙皮肤道具tips技能控件
 */
class ZhanlingZBTipItemsRender extends BaseItemRender {
	private skillIcon1: eui.Image;
	private desc: eui.Label;

	constructor() {
		super();
		this.skinName = 'ZhanlingZBTipItemsSkin';
		this.init();
	}

	/**触摸事件 */
	protected init(): void {
		// this.addEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	protected dataChanged(): void {
		if (!this.data)return;
		let zlId = this.data.zlId;
		let skillid = this.data.id;//ZhanLingSkill的技能编号 不是技能id
		let zlskill = GlobalConfig.ZhanLingSkill[skillid];//天仙技能库
		if (zlskill.desc && zlskill.desc.icon)
			this.skillIcon1.source = zlskill.desc.icon;
		else
			this.skillIcon1.source = Math.floor(zlskill.passive / 1000) * 1000 + "_png";
		let zlBase: ZhanLingBase = GlobalConfig.ZhanLingBase[zlId];
		let openLv = 0;
		for (let i = 0; i < zlBase.skill.length; i++) {
			if (zlBase.skill[i].id == skillid) {
				openLv = zlBase.skill[i].open;
				break;
			}
		}
		//技能描述
		let skillconfig: SkillsConfig = GlobalConfig.SkillsConfig[zlskill.passive];
		let descId = skillconfig ? skillconfig.desc : 0;//技能库如果不配 出问题
		let sdconfig: SkillsDescConfig = GlobalConfig.SkillsDescConfig[descId];
		let tips: { name: string, desc: string } = {name: "", desc: ""};
		if (sdconfig) {
			tips.name = sdconfig.name;
			tips.desc = sdconfig.desc;
		}
		if (skillconfig && sdconfig && tips.desc) {
			tips.desc = StringUtils.replace(tips.desc, `${skillconfig.desc_ex[0]}`);
		}
		//名字配了指定覆盖
		if (zlskill.desc && zlskill.desc.name)
			tips.name = zlskill.desc.name;
		//描述
		if (zlskill.desc && zlskill.desc.desc) {
			tips.desc = zlskill.desc.desc;
		}
		//技能属性
		if (zlskill.attrs) {
			if (tips.desc)
				tips.desc += "\n";
			tips.desc += `|C:0xff00ff&T:${AttributeData.getAttStr(zlskill.attrs, 0, 1, "：")}|`;
		}
		//计算开启等阶
		let stageLv = ZhanLingModel.ins().getStageLv(openLv);
		this.desc.textFlow = TextFlowMaker.generateTextFlow1(`${stageLv[0]}阶习得技能|C:0xff00ff&T:【${tips.name}】\n${tips.desc}`);
	}

	public destruct(): void {
		this.removeEventListener(egret.TouchEvent.TOUCH_END, this.onClick, this);
	}

	public onClick() {

	}


}