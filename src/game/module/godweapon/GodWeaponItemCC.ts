/**
 * 圣物合成融合
 * Created by Peach.T on 2017/11/20.
 */
class GodWeaponItemCC extends BaseSystem {
	public constructor() {
		super();
		this.sysId = PackageID.GodWeaponItem;
		this.regNetMsg(1, this.postCompound);
		this.regNetMsg(2, this.postFuse);

		GodweaponItemModel.ins().init();
	}

	public requestCompound(itemId1: number, itemId2: number, itemId3: number, ): void{
		let bytes: GameByteArray = this.getBytes(1);
		bytes.writeInt(itemId1);
		bytes.writeInt(itemId2);
		bytes.writeInt(itemId3);
		this.sendToServer(bytes);
	}

	public postCompound(bytes: GameByteArray):any
	{
		let isSuccess = bytes.readBoolean();
		let num = bytes.readShort();
		let itemId = bytes.readInt();
		return {id: itemId, isSuccess: isSuccess};
	}

	public requestFuse(itemId1: number, itemId2: number): void{
		let bytes: GameByteArray = this.getBytes(2);
		bytes.writeInt(itemId1);
		bytes.writeInt(itemId2);
		this.sendToServer(bytes);
	}

	public postFuse(bytes: GameByteArray):any{
		let isSuccess = bytes.readBoolean();
		let itemId = 0;
		if(isSuccess)
		{
			let num = bytes.readShort();
			itemId = bytes.readInt();
		}
		return {id: itemId, isSuccess: isSuccess};
	}

	public static ins(): GodWeaponItemCC {
		return super.ins() as GodWeaponItemCC;
	}
}

namespace GameSystem {
	export let  godWeaponItemCC = GodWeaponItemCC.ins.bind(GodWeaponItemCC);
}
