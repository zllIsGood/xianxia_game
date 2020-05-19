class ShieldStageConfig {

	public stage: number = 0; 			//阶数
	public icon: string = ""; 			//图标
	public normalCost: number = 0; 		//单次培养消耗
	public attr: AttributeData[] = [];  //属性
	public normalCostTip: number = 0; 	//红点提示值

	public constructor() {
	}
}