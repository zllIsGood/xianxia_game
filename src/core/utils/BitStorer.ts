/**
 * 位存储器
 * @author WynnLam
 *
 */
class BitStorer
{
	/** 位存储列表 **/
	private _storer:number[];
	/** 位数量 **/
	private _length:number;

	/**
	 * 构造函数
	 * @param length 位数量
	 * @param fixed 是否固定位数，即是否不可以修改length属性
	 *
	 */
	public constructor(length:number = 0, fixed:Boolean = true)
	{
		this._length = length;
		this._storer = [];
	}

	/**
	 * 存储的位数量
	 * @return
	 *
	 */
	public get length():number
	{
		return this._length;
	}

	public set length(value:number)
	{
		this._storer.length = value >> 5;
	}


	/**
	 * 位值为1的数量
	 * 每次获取该值都是重新计算的
	 * @return
	 *
	 */
	public  get numDirtyBits():number
	{
		var c:number, i:number, b:number = this._length;
		for (i = 0; i < b; i++)
		{
			if (this._storer[i >> 5] & (1 << i % 32))
			{
				c++;
			}
		}
		return c;
	}

	/**
	 * 置1的位索引列表
	 * 并且这个列表是按降序排列的
	 * @return
	 *
	 */
	public  get dirtyBits():number[]
	{
		var v:number[] = [];
		var i:number;
		for (i = this._length - 1; i > -1; i--)
		{
			if (this._storer[i >> 5] & (1 << i % 32))
			{
				v[v.length] = i;
			}
		}
		return v;
	}

	/**
	 * 存储位数据
	 * 如果参数的长度大于存储器的长度，则会截断
	 * @param bytes
	 *
	 */
	public  store(bytes:GameByteArray):void
	{
		var i:number, n:number, b:number;
		b = this._length >> 3;
		if (b > bytes.bytesAvailable)
			b = bytes.bytesAvailable;
		for (i = 0; i < b; i++)
		{
			if (i && i % 4 == 0)
			{
				this._storer[(i >> 2) - 1] = n;
				n = 0;
			}
			n |= (bytes.readByte() & 0xFF) << ((i % 4) << 3);
		}
		if (b % 4)
			this._storer[b >> 2] = n;
	}

	/**
	 * 将数据转化为字节数组，可以用store方法读取的字节数组
	 * @param bytes 目标字节数组，如果不传递该参数，则会创建新的字节数组
	 * @param offset 目标字节数组的偏移
	 * @return
	 *
	 */
	public  toByteArray(bytes:egret.ByteArray = null, offset:number = 0):egret.ByteArray
	{
		if (!bytes)
			bytes = new egret.ByteArray();
		bytes.position = offset;
		var b:number = this._storer.length;
		var n:number;
		for (var i:number = 0; i < b; i++)
		{
			n = this._storer[i];
			for (var j:number = 0; j < 32; j += 8)
			{
				bytes.writeByte((n >> j) & 0xFF);
			}
		}
		return bytes;
	}

	/**
	 * 设置位
	 * @param bit 位索引，从0开始
	 * @param value 位值，只能为0或1，如果传入其他值，则会取该值的第1位的值
	 *
	 */
	public  setBit(bit:number, value:number):void
	{
		if (value & 1)
			this._storer[bit >> 5] |= 1 << bit % 32;
		else
			this._storer[bit >> 5] &= ~(1 << bit % 32);
	}

	/**
	 * 获取指定位
	 * @param bit 位索引，从0开始
	 * @return 位上的值，0或1
	 *
	 */
	public  getBit(bit:number):number
	{
		return (this._storer[bit % this._length >> 5] >> (bit % 32)) & 1;
	}
}

