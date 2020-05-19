/**
 * 符文配置
 */
class RuneBaseConfig {
	/**ID */
	public id: number = 0;
	/**类型 */
	public type: number = 0; 
	/**升级消耗数量 */
	public expend: number = 0;
	/**分解产出数量 */
	public gain: number = 0;
	/**分解产出碎片数量 */
	public chip: number = 0;
	/**普通属性集 */
	public attr: AttributeData[] = [];
	/*加成装备基础属性*/
	public equipAttr: AttributeData[] = [];
	/*扩展属性*/
	public exAttr: AttributeData[] = [];
	/*金币经验加成*/
	public specialAttr: AttributeData[] = [];

	/**特殊-属性集 */
	// public specialAttr: ExAttributeData[] = null; 
	/**特殊-描述 */
	public specialDesc:string = null; 
	/**战力 */
	public power: number = 0; 

	public constructor() {
	}
}