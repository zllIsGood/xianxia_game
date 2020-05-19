/**
 * 轮回
 * Created by Peach.T on 2017/11/27.
 */
class SamsaraCC extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.Samsara;

		this.regNetMsg(1, this.postSamsaraInfo);
		this.regNetMsg(4, this.postCompose);
	}

	public static ins(): SamsaraCC {
		return super.ins() as SamsaraCC;
	}

	public exchangeSamsaraExp(type: number): void {
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeByte(type);
		this.sendToServer(bytes);
	}

	public upgradeSamsaraLv(): void {
		let bytes: GameByteArray = this.getBytes(3);
		this.sendToServer(bytes);
	}

	public postSamsaraInfo(bytes: GameByteArray): void {
		SamsaraModel.ins().samsaraInfo = new SamsaraVO(bytes.readInt(), bytes.readInt(), bytes.readShort(), bytes.readShort(), bytes.readShort());
	}

	public requestCompose(itemId: number, roleIndex: number): void {
		let bytes: GameByteArray = this.getBytes(4);
		bytes.writeInt(itemId);
		bytes.writeShort(roleIndex);
		this.sendToServer(bytes);
	}

	public postCompose(bytes: GameByteArray): void {
		// let result = bytes.readBoolean();
	}
}

namespace GameSystem {
	export let  samsaraCC = SamsaraCC.ins.bind(SamsaraCC);
}

enum SamsaraUpgradeType{
	level = 1, //1 等级转换
	normal = 2, //2普通道具提升
	advanced = 3, //3高级道具提升
}