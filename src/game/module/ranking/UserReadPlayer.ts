/**其它玩家数据管理 */
class UserReadPlayer extends BaseSystem {

	/**其它玩家数据 */
	public otherPlayerData: OtherPlayerData;

	public constructor() {
		super();

		this.sysId = PackageID.Default;
		this.regNetMsg(16, this.postPlayerResult);
	}

	public static ins(): UserReadPlayer {
		return super.ins() as UserReadPlayer;
	}

	/**
	 * 查找玩家
	 * 0-16
	 */
	public sendFindPlayer(id, name = '') {
		let bytes: GameByteArray = this.getBytes(16);
		bytes.writeInt(id);
		bytes.writeString(name);
		this.sendToServer(bytes);
	}

	/**
	 * 查找结果
	 * 0-16
	 */
	public postPlayerResult(bytes: GameByteArray) {
		let data: OtherPlayerData = UserReadPlayer.ins().otherPlayerData;
		if (!data) data = new OtherPlayerData();
		data.parser(bytes);
		return data;
	}
}

/**
 * 其他玩家数据
 */


class OtherPlayerData {
	public id: number;
	public serverId: number;
	public name: string;
	public level: number;
	public vipLevel: number;
	public zhuan: number;
	public ce: number;
	public guildId: number;
	public guildName: string;
	public roleData: Role[] = [];
	public lilianLv: number = 0;
	public zhanlingID: number = 0;
	public zhanlingLevel: number = 0;

	/**
	 * 详细数据处理
	 * @param bytes
	 */
	public parser(bytes: GameByteArray): void {
		this.id = bytes.readInt();
		this.serverId = bytes.readInt();
		this.name = bytes.readString();
		this.level = bytes.readShort();
		this.vipLevel = bytes.readShort();
		this.zhuan = bytes.readShort();
		this.lilianLv = bytes.readInt();
		this.ce = bytes.readDouble();
		this.guildId = bytes.readInt();
		this.guildName = bytes.readString();
		this.zhanlingID = bytes.readInt();
		this.zhanlingLevel = bytes.readInt();
		let num = bytes.readShort();
		for (let i = 0; i < num; i++) {
			this.roleData[i] = new Role;
			this.roleData[i].parser(bytes);
		}
	}
}

namespace GameSystem {
	export let  userreadplayer = UserReadPlayer.ins.bind(UserReadPlayer);
}