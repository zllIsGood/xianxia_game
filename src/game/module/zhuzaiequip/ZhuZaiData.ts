/**
 * Created by Administrator on 2016/7/28.
 */
class ZhuZaiData {

	public id: number;

	public rank: number;

	public growupID: number;

	// 最终于成长id = (rank * 10000) + growUpId

	public parser(bytes: GameByteArray): void {

		this.id = bytes.readInt();

		this.rank = bytes.readShort();

		this.growupID = bytes.readInt();
	}

}