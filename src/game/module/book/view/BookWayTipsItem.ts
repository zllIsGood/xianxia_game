class BookWayTipsItem extends BaseItemRender {
	private jieduan:eui.Label;
	private num:eui.Label;//总套装数
	private suitNum:eui.Label;//(X/Y)
	//value0~3
	public constructor() {
		super();
		this.skinName = `TuJianSuitItem`;
		this.init();

	}
	protected init(): void {


	}
	public destruct(): void {

	}
	//{config:SuitConfig,curNum:number,maxNum:number}
	protected dataChanged() {
		let cfg:SuitConfig = this.data.config as SuitConfig;
		this.jieduan.text = cfg.level + "阶";
		this.num.text = cfg.count + "";
		this.suitNum.text = `${this.data.curNum}/${cfg.count}`;
		for(let i = 0;i < cfg.attrs.length;i++){
			let attrname:string = AttributeData.getAttrStrByType(cfg.attrs[i].type);
			this["value"+i].text = attrname + "+"+cfg.attrs[i].value;
			if( this.data.curNum >= cfg.count )
				this["value"+i].textColor = 0x20CB30;
		}
		if( this.data.curNum >= cfg.count )
			this.suitNum.textColor = 0x20CB30;
	}

}