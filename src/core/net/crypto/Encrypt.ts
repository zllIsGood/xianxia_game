/**
 * 数据加密解密处理类
 * @author WynnLam
 *
 */
class Encrypt {
	private static sSelfSalt: number = Encrypt.makeSalt();
	private static sTargetSalt: number;
	private static sKey: number;
	private static sKeyBuff: any[] = new Array(4);

	public constructor() {

	}

	public static encode(inBuff: egret.ByteArray, offset: number = 0, length: number = 0): number {
		if (offset >= inBuff.length) return 0;

		let end: number = length ? offset + length : inBuff.length;
		if (end > inBuff.length) end = inBuff.length;

		inBuff.position = offset;
		for (let i: number = offset; i < end; ++i) {
			let byte: number = inBuff.readByte();
			byte ^= Encrypt.sKeyBuff[i % 4];
			inBuff.position--;
			inBuff.writeByte(byte);
		}

		return end - offset;
	}

	public static decode(inBuff: egret.ByteArray, offset: number = 0, length: number = 0): number {
		// 当前的加密算法和解密算法是一样的，反向操作
		return Encrypt.encode(inBuff, offset, length);
	}

	public static getCRC16(bytes: egret.ByteArray, length: number = 0): number {
		return CRC16.update(bytes, 0, length);
	}

	public static getCRC16ByPos(bytes: egret.ByteArray, offset: number = 0, length: number = 0): number {
		return CRC16.update(bytes, offset, length);
	}

	public static getCheckKey(): number {
		let bytes: egret.ByteArray = new egret.ByteArray();
		bytes.endian = egret.Endian.LITTLE_ENDIAN;
		bytes.writeUnsignedInt(Encrypt.sKey);

		let ck: number = CRC16.update(bytes);
		return ck;
	}

	public static getSelfSalt(): number {
		return Encrypt.sSelfSalt;
	}

	public static getTargetSalt(): number {
		return Encrypt.sTargetSalt;
	}

	public static setTargetSalt(value: number): void {
		Encrypt.sTargetSalt = value;
		Encrypt.makeKey();
	}

	private static makeSalt(): number {
		let d: Date = new Date();
		return Math.random() * d.getTime();
	}

	private static makeKey(): void {
		Encrypt.sKey = (Encrypt.sSelfSalt ^ Encrypt.sTargetSalt) + 8254;

		for (let i: number = 0; i < 4; ++i) {
			Encrypt.sKeyBuff[i] = (Encrypt.sKey & (0xFF << (i << 3))) >> (i << 3);
		}
	}
}
