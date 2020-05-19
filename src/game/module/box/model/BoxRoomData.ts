/**
 * Created by LF on 2017/3/10.
 */
class BoxRoomData {
	public state: string;
	public itemId: number;
	public canUsed: boolean;
	public openChapter: number;
	public name: string;
	public index: number;
	constructor() {
		this.itemId = 0;
		this.canUsed = true;
	}
	public updateData(bytes: GameByteArray) {
		this.itemId = bytes.readShort();
		if (this.itemId)
			this.name = GlobalConfig.TreasureBoxConfig[this.itemId].name;
	}
}