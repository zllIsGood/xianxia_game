/**
 * HeirloomInfo
 * 各个部位单数据
 */
class HeirloomInfo {
	public slot: number;//部位
	public lv: number;//lv
	public expend: { id: number, count: number };//升级消耗
	public attr: AttributeData[];//属性 type->AttributeType
	public icon: number;//图标
	public name: string;//装备名称
	public image: string;//边框
	public model: string;//模型展示
	public skillicon: string;//技能图标
	public skillname: string;//技能名字
	public skilldesc: string;//技能描述
	public attr_add: number;//装备基础属性加强

	constructor() {
		this.slot = 0;
		this.lv = 0;
		this.expend = { id: 0, count: 0 };
		this.attr = [];
		this.icon = 0;
		this.name = "";
		this.image = "";
		this.model = "";
		this.skillicon = "";
		this.skillname = "";
		this.skilldesc = "";
		this.attr_add = 0;
	}

	public setInfo(slot: number, lv: number) {
		if (slot > 0 && lv > 0) {
			let cfgs: HeirloomEquipConfig[] = GlobalConfig.HeirloomEquipConfig[slot];
			if (Assert(cfgs, `cant find HeirloomEquipConfig arry by slot:${slot}`)) return;
			let hleConfig: HeirloomEquipConfig = cfgs[lv];
			if (Assert(hleConfig, `cant find HeirloomEquipConfig by slot:${slot} lv:${lv}`)) return;
			this.slot = hleConfig.slot;
			this.lv = hleConfig.lv;
			this.expend = hleConfig.expend;
			this.attr = hleConfig.attr;
			this.icon = hleConfig.icon;
			this.name = hleConfig.name;
			this.image = hleConfig.image;
			this.model = hleConfig.model;
			this.skillicon = hleConfig.skillicon;
			this.skillname = hleConfig.skillname;
			this.skilldesc = hleConfig.skilldesc;
			this.attr_add = hleConfig.attr_add;
		}
	}

}