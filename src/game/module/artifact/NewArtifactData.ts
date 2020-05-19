class NewArtifactData {
	public id: number = 0;
	public record: number = 0;
	public open: boolean = false;
	public exitRecord: number = 0;

	public isChipExit(index: number): boolean {
		return ((this.exitRecord >> index) & 1) == 1;
	}

	public isChipOpen(index: number): boolean {
		return ((this.record >> index) & 1) == 1;
	}

	public getChipLength() {
		return GlobalConfig.ImbaConf[this.id].jigsawId.length;
	}

	public getNextChipId() {
		let conf = GlobalConfig.ImbaConf[this.id];
		for (let i = 0; i < conf.jigsawId.length; i++) {
			if (!this.isChipExit(i)) {
				return conf.jigsawId[i];
			}
		}
		return null;
	}

	public remindNumToOpen(): number {
		let conf = this.getConf();
		let num: number = 0;
		for (let i = 0; i < conf.jigsawId.length; i++) {
			if (!this.isChipExit(i)) {
				num++;
			}
		}
		return num;
	}

	public getConf(): ImbaConf {
		for (let k in GlobalConfig.ImbaConf) {
			if (GlobalConfig.ImbaConf[k].id == this.id) {
				return GlobalConfig.ImbaConf[k];
			}
		}
	}
}