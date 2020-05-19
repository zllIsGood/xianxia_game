class CharModel extends EntityModel {
	public itemData:RewardData;

	parserItemData(bytes: GameByteArray): void {
		this.itemData = new RewardData();
		this.itemData.parser(bytes);
	}
}