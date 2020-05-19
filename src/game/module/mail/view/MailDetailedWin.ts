/**
 *
 * @author
 *
 */
class MailDetailedWin extends BaseEuiView {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private receiveBtn: eui.Button;
	private textLabel: eui.Label;
	private itemList: eui.List;
	private background: eui.Image;
	private colorCanvas: eui.Image;
	public desc: eui.Label;
	public rect: eui.Rect;
	constructor() {
		super();
	}

	public initUI(): void {
		super.initUI();

		this.skinName = "MailContentSkin";

		this.itemList.itemRenderer = ItemBase;
	}

	public open(...param: any[]): void {
		// this.addTouchEndEvent(this.colorCanvas, this.otherClose);
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.rect, this.onTap);
		this.textLabel.addEventListener(egret.TextEvent.LINK,this.linkClick,this);
		// this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.receiveBtn, this.onTap);
		this.observe(UserMail.ins().postGetItemFromMail, this.setMailData);
		this.setMailData();

		//测试
		// this.textLabel.textFlow = new Array<egret.ITextElement>(
		// 	{ text:"这段文字有链接", style: { "href" : "event:VipWin,9" } }
		// 	,{ text:"\n这段文字没链接", style: {} }
		// );
		// let mailtext:string = "可提前解锁第三个角色，|战力|倍增，助你推关升级\n  5.充值vip可极速飞升战力|U:&C:0x00ff00&E:VipWin,9&T:前往充值";
		// this.textLabel.textFlow = TextFlowMaker.generateTextFlow1(mailtext);
	}

	public close(...param: any[]): void {
	}
	private linkClick(evt:egret.TextEvent){
		// egret.log("evt.text = "+evt.text);
		let lst:string[] = evt.text.split(",");
		let pa:string[] = lst.slice(1);

		if( lst[0] ){
			ViewManager.ins().open(lst[0],pa[0]?pa:null);
			ViewManager.ins().close(this);
			ViewManager.ins().close(FriendBgWin);
		}

	}
	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.receiveBtn:
				let list: number[] = [];
				list.push(UserMail.ins().currentMailHandle);
				UserMail.ins().sendGetItem(list);
			case this.closeBtn:
			case this.closeBtn0:
			case this.rect:
				ViewManager.ins().close(this);
				break;
		}

	}

	private otherClose(evt: egret.TouchEvent) {
		let bg = this.background;
		if (evt.localX >= bg.x && evt.localX <= bg.x + bg.width && evt.localY >= bg.y && evt.localY <= bg.y + bg.height) {

		}
		else {
			ViewManager.ins().close(this);
		}
	}

	private setMailData(): void {
		let mailData: MailData = UserMail.ins().getCurrentMail();

		// this.textLabel.text = mailData.text;
		this.textLabel.textFlow = TextFlowMaker.generateTextFlow1(mailData.text);

		this.setReceiveBtn(mailData.receive, mailData.item.length > 0);

		this.itemList.dataProvider = new eui.ArrayCollection(mailData.item);
	}

	/**
	 * 设置领取按钮
	 * @param receive
	 */
	private setReceiveBtn(receive: number, isShow: boolean = false): void {
		let str: string = "";

		this.receiveBtn.visible = receive >= 0;

		if (receive)
			str = "已领取";
		else
			str = "领取附件";

		this.receiveBtn.label = str;
		this.receiveBtn.enabled = !Boolean(receive);
		this.receiveBtn.visible = isShow;
		this.desc.visible = !isShow;
	}
}
ViewManager.ins().reg(MailDetailedWin, LayerManager.UI_Popup);
