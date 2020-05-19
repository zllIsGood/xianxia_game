/**
 * 心法列表
 */
class HeartMethodConfig {
	public id: number = 0;//心法id
	public name:string;//名称
	public inside:string;//内观
	public pic:string;//界面图片
	public skillButton:string;//技能按钮图标
	public posList:number[];//关联部位
	public icon:string;//触发效果图标
	public blankIcon:string[];//心法五部位未开启资源名
	public splitItem:number;//分解获得对应道具id
	public skillShowPic:string;//心法技能展示图
	public openTips:string;//开启提示语
	public openCondition:{day:number,zs:number};//额外开启条件
	public upGradeCondition:number;//额外修炼条件
	public posGainGuide:number;//心法部位获得指引
	public sort:number;//心法排序
}
