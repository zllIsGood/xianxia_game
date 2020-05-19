class HuanShouEquipConf {
	public stage: number;
	public pos: number;
	public equipId: number;
	public attrs: AttributeData[];
	/**百分比属性*/
	public percent_attrs: { type: number, percent: number }[];
	public expower: number;
	public mat: { id: number, count: number };

	constructor() {
	}
}