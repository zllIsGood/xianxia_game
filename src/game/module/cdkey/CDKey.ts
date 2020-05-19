class CDKey extends BaseSystem {


	public constructor() {
		super();

		this.sysId = PackageID.CDKey;

		this.regNetMsg(1, this.doChangeResult);
	}

	public static ins(): CDKey {
		return super.ins() as CDKey;
	}

	public sendCdkey(str: string): void {
		if (str.length <= 0) {
			UserTips.ins().showTips("|C:0xf3311e&T:请输入激活码|");
			return;
		}
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeString(str);
		this.sendToServer(bytes);
	}

	private doChangeResult(bytes: GameByteArray): void {
		// 0成功 1已被使用 2不存在 3已使用过同类型 4其他(长度不符合)
		let result: number = bytes.readByte();
		let str: string;
		switch (result) {
			case 0:
				str = "|C:0x35e62d&T:兑换成功,请在邮件中领取奖励|";
				break;
			case 1:
				str = "|C:0xf3311e&T:激活码已被使用|";
				break;
			case 2:
				str = "|C:0xf3311e&T:激活码不存在|";
				break;
			case 3:
				str = "|C:0xf3311e&T:已使用过同类型|";
				break;
			case 4:
				str = "|C:0xf3311e&T:兑换失败|";
				break;
		}
		UserTips.ins().showTips(str);
	}
}

namespace GameSystem {
	export let  cdkey = CDKey.ins.bind(CDKey);
}