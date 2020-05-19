/**
 * CRC 16校检验类
 * @author WynnLam
 *
 */
class CRC16 {
	public static POLYNOMIAL: number = 0x1021; // CRC16校验方式的多项式
	private static CRCTable: any[] = CRC16.makeCRCTable();

	public constructor() {
	}

	public static update(bytes: egret.ByteArray, offset: number = 0, length: number = 0): number {
		let c: number = 0;
		let index: number = 0;

		if (length == 0) {
			length = bytes.length;
		}

		bytes.position = offset;
		for (let i: number = offset; i < length; ++i) {
			index = (CRC16.CRCBitReflect(bytes.readByte(), 8) & 0xFF) ^ ((c >> 8) & 0xFFFFFF);
			index &= 0xFF;
			c = CRC16.CRCTable[index] ^ ((c << 8) & 0xFFFFFF00);
		}

		return (CRC16.CRCBitReflect(c, 16) ^ 0) & 0xFFFF;
	}

	private static makeCRCTable(): any[] {
		let c: number = 0;
		let crcTable: any[] = new Array(256);

		for (let i: number = 0; i < 256; ++i) {
			c = (i << 8) & 0xFFFFFF00;
			for (let j: number = 0; j < 8; ++j) {
				c = (c & 0x8000) ? ((c << 1) & 0xFFFFFFFE) ^ CRC16.POLYNOMIAL : ((c << 1) & 0xFFFFFFFE);
			}
			crcTable[i] = c;
		}

		return crcTable;
	}

	// 反转数据的比特位, 反转后MSB为1.
	// 反转前: 1110100011101110 0010100111100000
	// 反转后: 1111001010001110 1110001011100000
	private static DropBits: any[] =
		[
			0xFFFFFFFF, 0xFFFFFFFE, 0xFFFFFFFC, 0xFFFFFFF8,
			0xFFFFFFF0, 0xFFFFFFE0, 0xFFFFFFC0, 0xFFFFFF80,
			0xFFFFFF00, 0xFFFFFE00, 0xFFFFFC00, 0xFFFFF800,
			0xFFFFF000, 0xFFFFE000, 0xFFFFC000, 0xFFFF8000
		];

	private static CRCBitReflect(input: number, bitCount: number): number {
		let out: number = 0;
		let x: number = 0;

		bitCount--;
		for (let i: number = 0; i <= bitCount; ++i) {
			x = bitCount - i;
			if (input & 1) {
				out |= (1 << x) & CRC16.DropBits[x];
			}
			input = (input >> 1) & 0x7FFFFFFF;
		}

		return out;
	}
}
