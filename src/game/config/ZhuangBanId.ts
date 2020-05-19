class ZhuangBanId {
	/**装扮id */
	public id: number;
	/**位置 */
	public pos: number;
	/**增加属性 */
	public attr: AttributeData[];
	/**有效时长(秒)*/
	public invalidtime: number;
	/**激活消耗*/
	public cost: any[];
	/**职业需求*/
	public roletype: number;
	/**装扮显示 */
	public res:string;
	/**装扮名字 */
	public name:string;
	public constructor() {
	}
}