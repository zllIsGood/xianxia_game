class ExRingAttrConfig {
	/** 等级 */
	public level: number = 0;
	/** 升级需要碎片道具ID */
	public costItem: number = 0;
	/** 升级需要碎片 */
	public cost: number = 0;
	/** 属性 */
	public attrAward: AttributeData[] = [];
	/** 扩展效果属性 */
	public extAttrAward: AttributeData[] = [];
	/** 升级所需能量 */
	public upPower: number = 0;
	/** 每次点击增加能量 */
	public addPower: number = 0;

	public judgeup: number = 0;

	/** 技能名字 **/
	public SpecialRingSkin:string = "";
}