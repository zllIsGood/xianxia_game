/**
 *
 * @author
 *
 */
class WaveDropData {

	// public index: number;

	/**
	 * 掉落物
	 */
	public drops: RewardData[] = [];

	public parser(bytes: GameByteArray) {
		let count: number = 1;
		for (let i = 0; i < count; i++) {
			this.drops[i] = this.drops[i] || new RewardData();
			this.drops[i].parser(bytes);
		}
		this.drops.length = count;
	}
}
