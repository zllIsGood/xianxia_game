/**
 * 邮件窗口
 */
class MailWin extends BaseComponent {

	private closeBtn: eui.Button;
	private closeBtn0: eui.Button;
	private allReceiveBtn: eui.Button;
	private mailScroller: eui.Scroller;
	private mailList: eui.List;
	private noMailTip: eui.Label;
	private tab: eui.TabBar;

	private _mails: MailData[];


	constructor() {
		super();
		this.name = `邮件`;
		// this.skinName = "MailSkin";
	}

	protected childrenCreated() {
		this.init();
	}

	public init() {
		this._mails = [];
		this.mailList.itemRenderer = MailItem;
		this.mailScroller.viewport = this.mailList;
	}

	public open(...param: any[]): void {
		this.addTouchEvent(this.closeBtn, this.onTap);
		this.addTouchEvent(this.closeBtn0, this.onTap);
		this.addTouchEvent(this.allReceiveBtn, this.onTap);
		this.addChangeEvent(this.tab, this.onTap);
		this.addTouchEvent(this.mailList, this.onSendMail);
		//this.observe(UserMail.ins().postMailData, this.onSendMail);
		this.observe(UserMail.ins().postMailDetail, this.setOpenMail);
		this.observe(UserMail.ins().postGetItemFromMail,this.mailCall);
		this.setMailData();
	}

	private mailCall(){
		if( UserMail.ins().isAllReceive ){
			for( let i = 0;i < this._mails.length;i++ ){
				UserMail.ins().sendMailContentData(this._mails[i].handle);
			}
		}
	}

	private onTap(e: egret.TouchEvent): void {
		switch (e.currentTarget) {
			case this.allReceiveBtn:
				UserMail.ins().isAllReceive = true;
				let list: number[] = [];
				let mailList: MailData[] = UserMail.ins().getMailByReceive();
				for (let i: number = 0; i < mailList.length; i++) {
					list.push(mailList[i].handle)
				}
				UserMail.ins().sendGetItem(list);
				break;
			case this.tab:
				break;
		}

	}

	private onSendMail(e: egret.TouchEvent): void {
		if (!e) return;
		UserMail.ins().isAllReceive = false;
		let item: MailItem = e.target.parent as MailItem;
		if (item) {
			let mailData: MailData = item.data as MailData;
			if (mailData) {
				UserMail.ins().sendMailContentData(mailData.handle);
			}
		}
	}

	private setMailData(): void {
		this._mails = UserMail.ins().mailData;
		this.mailList.dataProvider = new eui.ArrayCollection(this._mails);
		this.allReceiveBtn.visible = Boolean(UserMail.ins().getMailByReceive().length);
		if (UserMail.ins().mailData.length > 0)
			this.noMailTip.visible = false;
	}

	private setOpenMail(mailData: MailData): void {
		for (let i: number = 0; i < this.mailList.numChildren; i++) {
			let item: MailItem = this.mailList.getChildAt(i) as MailItem;
			if ((item.data as MailData).handle == mailData.handle) {
				item.data = mailData;
				return;
			}
		}
	}
}
