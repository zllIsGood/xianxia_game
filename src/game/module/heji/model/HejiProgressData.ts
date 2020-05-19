/**
 * 限时任务数据
 */
class HejiProgressData {
	public id: number = 0;
	public progress:number = 0;

	public parser(bytes: GameByteArray): void {
		this.id = bytes.readByte();
		this.progress = bytes.readUnsignedInt();
	}	
}