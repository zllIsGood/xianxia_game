class FlySwordData {
	public level: number;
	public exp: number;
	public isOpen: boolean;
	public id: number;

	public constructor() {
	}

	public parser(bytes: GameByteArray): void {
		this.level = bytes.readInt();
		this.exp = bytes.readInt();
		this.isOpen = bytes.readInt() == 1;
		this.id = bytes.readInt();
	}
}