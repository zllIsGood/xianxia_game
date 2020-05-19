class ZhanLingConfig {
	public openzhuanshenglv: number;//开启转生等级
	public openserverday: number;//开启天数
	public showzhanlinglv: number;//天仙外显等级
	public showzhanlingcd: number;//天仙外显cd(毫秒)
	public stageitemid: number;//天仙/幻形进阶丹id
	public stageitemexp: number;//进阶丹经验
	/**
	 * 提升丹属性
	 * {
	 *   [200110] = {
	 *              attr = {
	 *                      {type=17,value=5000},
	 *                      {type=2,value=1000}
	 *                      ...
	 *              },
	 *              precent = 100,//这个字段不一定每个道具都有 万分比
	 *              sort = 0//主界面控件排序字段
	 *   },
	 *
	 *   [200001] = {  ... }
	 *
	 * }
	 * */
	public upgradeInfo: any;
	public equipPosCount: number;//装备部位个数
	public plusLevel: number;//开启称霸等级
	public unitPrice: number;//不足材料所需单次消耗的元宝数
	public zlEquipName: string[];//部位名称
	public unitTime: number;//一键升星毫秒数
	public disappearTime: number;
	public hintNum: number;//天仙一键升星红点提示
	public anchorOffset: number[][];
	public delayTime: number;//延迟显示的时间（毫秒）
	public fbIndex: number;//天仙副本ID
}