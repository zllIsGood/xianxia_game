class ZhanLingBase {
	public id:number;//皮肤编号
	public mat:number;//激活/升级天赋材料
	public talent:number;//天赋编号
	public skill:{id:number,open:number}[];//id:技能id open:天仙(皮肤)等级需要达到才开启
	public show:number;//展示(主要给非0皮肤用 因为某些些皮肤是动态添加 1:需要动态添加 0:静态显示)
	public sort:number;//排序
	public icon:string;//皮肤列表的icon
}