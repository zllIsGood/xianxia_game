/**
 * 培养外形配置
 */
interface ICultivateTypeConfig {
	/** id */
	appearanceId: number;
	/** 排序 */
	id: number;
	/** 名字 */
	name: string;
	/** 品质 */
	quality: number;
	/** 加成属性 */
	attrs: AttributeData[];
	/** 条件描述 */
	desc: string;
	/** 激活道具 */
	costItems: RewardData;
	/** 资源id */
	resourceId: string;
	/** 是否限时 */
	isLimit: number;
	/** 持续时间 */
	limitTime: number;
	/** 名字图标资源 */
	nameIcon: string;
	/** 等级图标资源 */
	levelIcon: string;
	/** 头像图标资源 */
	headIcon: string;
	/** 界面资源显示 */
	uishow: string;
}