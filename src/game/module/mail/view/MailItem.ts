/**
 *
 * @author
 *
 */
class MailItem extends BaseItemRender {

	private nameLabel: eui.Label;
	private dateLabel: eui.Label;
	private treasure: eui.Image;

	constructor() {
		super();
		this.skinName = "MailItemSkin";
	}

	protected createChildren(): void {
		super.createChildren();
	}

	protected dataChanged(): void {
		let mailData: MailData = this.data as MailData;

		if (mailData instanceof MailData) {
			let str: string = "|C:0xA89C88&T:" + mailData.title + "|";
			str = str + "|C:" + (mailData.type ? "0X5b5b5b" : "0X00cc33") + "&T:" + (mailData.type ? "(已读)" : "(未读)") + "|";
			this.nameLabel.textFlow = TextFlowMaker.generateTextFlow(str);

			this.dateLabel.text = DateUtils.getFormatBySecond(mailData.times, 2);

			this.treasure.visible = (mailData.receive == 0);
		}

	}
}
