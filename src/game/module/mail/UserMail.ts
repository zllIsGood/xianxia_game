/**
 * 邮件数据
 */
class UserMail extends BaseSystem {

	public currentMailHandle: number = 0;

	public mailData: MailData[] = [];
	private _mailListData: eui.ArrayCollection = new eui.ArrayCollection();
	public isAllReceive:boolean;
	public constructor() {
		super();

		this.sysId = PackageID.Mail;
		this.regNetMsg(1, this.doMailData);
		this.regNetMsg(2, this.doMailDetailedData);
		this.regNetMsg(3, this.doDeleteMail);
		this.regNetMsg(4, this.doGetItemMail);
		this.regNetMsg(5, this.doAddMail);
	}

	public static ins(): UserMail {
		return super.ins() as UserMail;
	}

	public get mailListData(): eui.ArrayCollection {
		this.mailData.sort(this.mailSort2);
		this._mailListData.source = this.mailData;
		return this._mailListData;
	}

	//服务器数据下发处理
	//============================================================================================
	/**
	 * 邮件详细数据请求
	 * 8-2
	 * @param mailHandle    道具唯一标识
	 */
	public sendMailContentData(mailHandle: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(mailHandle);
		this.sendToServer(bytes);
	}

	/**
	 * 邮件领取附件请求（领取奖励）
	 * 8-4
	 * @param mailHandle    道具唯一标识
	 */
	public sendGetItem(list: number[]): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeInt(list.length);
		for (let i: number = 0; i < list.length; i++) {
			bytes.writeInt(list[i]);
		}
		this.sendToServer(bytes);
	}

	/**
	 * 处理邮件数据
	 * 8-1
	 * @param bytes
	 */
	private doMailData(bytes: GameByteArray): void {
		this.parser(bytes, 1);
		this.postMailData();
	}

	/**派发处理邮件数据 */
	public postMailData(): void {

	}

	/**
	 * 处理邮件详细数据
	 * 8-2
	 * @param bytes
	 */
	private doMailDetailedData(bytes: GameByteArray): void {
		let mailData: MailData = new MailData();
		mailData.parser(bytes);

		for (let i: number = 0; i < this.mailData.length; i++) {
			if (this.mailData[i].handle == mailData.handle) {
				this.mailData.splice(i, 1, mailData);
				break;
			}
		}
		this.currentMailHandle = mailData.handle;
		if( !UserMail.ins().isAllReceive )
			ViewManager.ins().open(MailDetailedWin);
		this.postMailDetail(mailData);
	}

	/**派发处理邮件详细数据 */
	public postMailDetail(data: MailData): MailData {
		return data;
	}

	/**
	 * 处理删除邮件
	 * 5-3
	 * @param bytes
	 */
	private doDeleteMail(bytes: GameByteArray): void {
		this.deleteMailDataByHandle(bytes.readInt());
		this.postMailData();
	}

	/**
	 * 处理领取邮件回包
	 * 5-4
	 * @param bytes
	 */
	private doGetItemMail(bytes: GameByteArray): void {
		this.setMailListData(bytes);
	}

	/**派发处理领取邮件回包 */
	public postGetItemFromMail(): void {

	}

	/**
	 * 添加邮件
	 * 8-5
	 * @param bytes
	 */
	private doAddMail(bytes: GameByteArray): void {
		this.parser(bytes, 0);
		this.postMailData();
	}


	//业务数据处理
	//============================================================================================

	public parser(bytes: GameByteArray, type: number): void {
		if (type) {
			this.mailData = [];

			let len: number = bytes.readInt();

			for (let i: number = 0; i < len; i++) {

				let mailData: MailData = new MailData();

				mailData.disposeData(bytes);

				this.mailData.push(mailData);
			}
			this.mailSort(1);
		} else {
			let mailData: MailData = new MailData();
			mailData.disposeData(bytes);
			this.mailData.unshift(mailData);
		}
	}


	/**
	 * 通过唯一id获取邮件数据
	 * @param handle
	 */
	public getMailDataByHandle(handle: number): MailData {
		for (let mail of this.mailData) {
			if (mail.handle == handle)
				return mail;
		}
		return null;
	}

	/**
	 * 通过唯一id删除邮件数据
	 * @param handle
	 */
	public deleteMailDataByHandle(handle: number): void {
		for (let i: number = 0; i < this.mailData.length; i++) {
			if (this.mailData[i].handle == handle) {
				this.mailData.splice(i, 1);
				return;
			}
		}
	}

	/**
	 * 通过领取状态获取邮件
	 * @param receive  默认0未领  1已领
	 */
	public getMailByReceive(receive: number = 0): MailData[] {
		let list: MailData[] = [];
		for (let i: number = this.mailData.length - 1; i >= 0; i--) {
			if (this.mailData[i].receive == receive)
				list.push(this.mailData[i]);
		}
		return list;
	}

	public getUnreadMail(): number {
		let sum: number = 0;
		for (let i: number = this.mailData.length - 1; i >= 0; i--) {
			let mail = this.mailData[i];
			if (mail.type == 0 || mail.receive == 0)
				sum += 1;
		}
		return sum;
	}

	/**
	 * 获取当前邮件
	 */
	public getCurrentMail(): MailData {
		return this.getMailDataByHandle(this.currentMailHandle);
	}

	/**
	 * 设置领取附件回包数据更变
	 * @param list
	 */
	public setMailListData(bytes: GameByteArray): void {
		let len: number = bytes.readInt();
		for (let i: number = 0; i < len; i++) {
			let handle: number = bytes.readInt();
			for (let mail of this.mailData) {
				if (mail.handle == handle) {
					mail.type = bytes.readInt();
					mail.receive = bytes.readInt();
					this.postMailDetail(mail);
					break;
				}
			}
		}
		this.postGetItemFromMail();
	}

	private sortDesc(a: MailData, b: MailData): number {
		let s1: number = a.times;
		let s2: number = b.times;
		return Algorithm.sortDesc(s1, s2);
	}

	private sortAsc(a: MailData, b: MailData): number {
		let s1: number = a.times;
		let s2: number = b.times;
		return Algorithm.sortAsc(s1, s2);
	}

	/**
	 * 邮件排列
	 * @param isSort 0:从小到大 1:从大到小
	 */
	private mailSort(isSort: number): MailData[] {
		let mailList: MailData[] = this.mailData;
		if (isSort)
			mailList.sort(this.sortDesc);
		else
			mailList.sort(this.sortAsc);
		return mailList;
	}

	/**
	 * 邮件排列
	 */
	public mailSort2(a: MailData, b: MailData): number {
		let num: number = 0;
		//未读
		num = Algorithm.sortAsc(a.type, b.type);
		if (num != 0) return num;
		//附件
		if (a.receive == 0 && b.receive != 0)
			return -1;
		if (a.receive != 0 && b.receive == 0)
			return 1;
		//时间
		num = Algorithm.sortDesc(a.times, b.times);
		if (num != 0) return num;

		return num;
	}

}

namespace GameSystem {
	export let  usermail = UserMail.ins.bind(UserMail);
}