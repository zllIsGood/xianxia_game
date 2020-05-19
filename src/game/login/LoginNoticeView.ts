/*
    file: src/game/login/LoginNoticeView.ts
    date: 2019-1-18
    author: solace
    descript: 选服公告界面
*/

class LoginNoticeView extends BaseEuiView {
	/** 控件 */
    private btnClose: eui.Button;

    private lbNoticeDes: eui.Label;

	constructor() {
		super();
		this.skinName = "WxNoticeSkin";
	}

	public initUI(): void {
        super.initUI();
        
	}

	public open(...param: any[]): void {
        this.addTouchEvent(this.btnClose,function () {
            this.closeWin();
        })

        if (LocationProperty.weiduanSrvList) {
            this.lbNoticeDes.textFlow = new egret.HtmlTextParser().parser(LocationProperty.weiduanSrvList.gamesNotice);
        }
	}

    public close(...param: any[]): void {

	}
}
ViewManager.ins().reg(LoginNoticeView, LayerManager.UI_Main);
