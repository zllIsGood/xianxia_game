/**
 * 公告数据
 */
class Notice extends BaseSystem {

	private data: ChatInfoData;

	public constructor() {
		super();

		this.sysId = PackageID.Notice;
		this.regNetMsg(1, this.doNotice);
		this.regNetMsg(2, this.doNoticeOpen);
	}

	public static ins(): Notice {
		return super.ins() as Notice;
	}

	private doNotice(bytes: GameByteArray): void {
		let type: number = bytes.readShort();
		let str: string = bytes.readString();
		//是否是新消息 0--是的   1--不是
		let isNew: number = bytes.readUnsignedByte();
		if (type == 1) {
			if (isNew == 0) {
				(<NoticeView>ViewManager.ins().open(NoticeView)).showNotice(str);
			}
		} else if (type == 2) {
			if (!this.data) {
				this.data = new ChatInfoData(null);
			}
			this.data.str = str;
			this.data.type = 7;
		}
		if (type == 3) {
			(<NoticeView>ViewManager.ins().open(NoticeView)).showNotice(str);
			// Chat.ins().insertChatMsg(new ChatSystemData(3, str));
		}
		// 类型4是后台公告独立显示
		if (type == 4) {
			(<BackStageNoticeView>ViewManager.ins().open(BackStageNoticeView)).showNotice(str);
		}
		Chat.ins().postSysChatMsg(new ChatSystemData(type, str));
	}

	private doNoticeOpen(bytes: GameByteArray): void {
		UserFuLi.ins().isOpenNotice = bytes.readBoolean();
		Notice.ins().postGameNotice();
	}

	public setNoticeOPen(): void {
		this.sendBaseProto(2);
	}

	public postGameNotice(): void {

	}
}

namespace GameSystem {
	export let  notice = Notice.ins.bind(Notice);
}