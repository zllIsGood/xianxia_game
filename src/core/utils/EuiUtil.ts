class EuiUtil {
	/**
	 * 刷新eui 数据源，此方法用来应对想用replaceAll，但怕修改原始数据的情况
	 * @param ac 替换的目标数据源
	 * @param newSource 新的数据
	 */
	public static replaceAC(ac: eui.ArrayCollection = new ArrayCollection,
		newSource: any[] = []): eui.ArrayCollection {

		let newLength = newSource.length;
		let oldLength = ac.source.length;
		for (let i = newLength; i < oldLength; i++) {
			ac.removeItemAt(newLength);
		}
		for (let i = 0; i < newLength; i++) {
			if (i >= oldLength)
				ac.addItemAt(newSource[i], i);
			else if (newSource[i] != ac.source[i])
				ac.replaceItemAt(newSource[i], i);
		}

		return ac;
	}
}