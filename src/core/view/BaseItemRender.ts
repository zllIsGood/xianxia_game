class BaseItemRender extends eui.ItemRenderer {
	public constructor() {
		super();
	}

	public observe(func: Function, myfunc: Function) {
		MessageCenter.addListener(func, myfunc, this);
	}

}