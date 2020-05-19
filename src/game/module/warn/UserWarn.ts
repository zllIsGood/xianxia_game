class UserWarn extends BaseSystem{
	public constructor() {
		super();
	}

	public static ins():UserWarn
	{
		return super.ins() as UserWarn;
	}


	public setWarnLabel(str: string, callBackFun: { func: Function, thisObj: any }, callBackFun2: { func2: Function, thisObj2: any }, statu:string = "normal",align = "left"): WarnWin {
		let rtn: WarnWin = ViewManager.ins().open(WarnWin)as WarnWin;
		rtn.setWarnLabel(str, callBackFun, callBackFun2, statu,align);
		return rtn;
	}

	public setBuyGoodsWarn(id: number, num: number = 1): ShopGoodsWarn {
		let rtn: ShopGoodsWarn = ViewManager.ins().open(ShopGoodsWarn)as ShopGoodsWarn;
		rtn.setData(id, num);
		return rtn;
	}
}

namespace GameSystem {
	export let  userWarn = UserWarn.ins.bind(UserWarn);
}
