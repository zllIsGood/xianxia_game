module euiextension {
	/**
	 * 选择服务器IP界面
	 */
	export class DropDownList extends BaseView {

		//服务器滚动的列表
		private scrollerIP: eui.Scroller;
		//服务器列表
		private listIP: eui.ListBase;

		//资源滚动的列表
		private scrollerRES: eui.Scroller;
		//资源器列表
		private listRES: eui.ListBase;

		//按钮背景
		private btnBg: egret.Shape;

		constructor() {
			super();

			//背景
			this.btnBg = new egret.Shape();
			this.btnBg.touchEnabled = true;
			this.btnBg.graphics.beginFill(0x0);
			this.btnBg.graphics.drawRect(0, 0, 480, 410);
			this.btnBg.alpha = 0.6;
			this.addChild(this.btnBg);

			//服务器 - 左边
			let labelIP: eui.Label = new eui.Label();
			labelIP.textColor = 0xFFFFFF;
			labelIP.size = 24;
			labelIP.y = 20;
			labelIP.text = "选择服务器地址";
			this.addChild(labelIP);

			//创建滚动区域和列表
			this.listIP = new eui.List();
			this.listIP.y = 50;
			this.listIP.itemRenderer = IPItemRenderer;

			this.scrollerIP = new eui.Scroller();
			this.scrollerIP.y = this.listIP.y;
			this.scrollerIP.height = 400;
			this.scrollerIP.viewport = this.listIP;
			this.scrollerIP.bounces = false;
			this.addChild(this.scrollerIP);

			//资源 - 右边
			let labelRes: eui.Label = new eui.Label();
			labelRes.textColor = 0xFFFFFF;
			labelRes.size = 24;
			labelRes.x = 250;
			labelRes.y = 20;
			labelRes.text = "选择游戏资源地址";
			this.addChild(labelRes);

			//创建滚动区域和列表
			this.listRES = new eui.List();
			this.listRES.x = labelRes.x;
			this.listRES.y = 50;
			this.listRES.itemRenderer = IPItemRenderer;

			this.scrollerRES = new eui.Scroller();
			this.scrollerRES.x = this.listRES.x;
			this.scrollerRES.y = this.listRES.y;
			this.scrollerRES.height = this.scrollerIP.height;
			this.scrollerRES.viewport = this.listRES;
			this.scrollerRES.bounces = false;
			this.addChild(this.scrollerRES);

			this.addChangeEvent(this.listIP, this.setSelectIP);
			this.addChangeEvent(this.listRES, this.setSelectRES);
		}

		/** 设置服务器IP列表数据 */
		public setDataIP(data: string[]): void {
			this.listIP.dataProvider = new eui.ArrayCollection(data);
			let index: number = parseInt(egret.localStorage.getItem("listIP")) || 0;
			this.listIP.selectedIndex = index > data.length ? 0 : index;
			this.setSelectIP();
		}

		/** 设置资源IP列表数据 */
		public setDataRES(data: string[]): void {
			this.listRES.dataProvider = new eui.ArrayCollection(data);
			let index: number = parseInt(egret.localStorage.getItem("listRES")) || 0;
			this.listRES.selectedIndex = index > data.length ? 0 : index;
			this.setSelectRES();
		}

		public destructor(): void {
			this.listIP.removeEventListener(egret.Event.CHANGE, this.setSelectIP, this);
			this.listRES.removeEventListener(egret.Event.CHANGE, this.setSelectRES, this);
		}

		/** 记录服务器IP */
		private setSelectIP(): void {
			let param: string[] = this.listIP.selectedItem.split("|");
			LocationProperty.srvid = parseInt(param[1]);
			let param1: string[] = param[2].split(":");
			LocationProperty.serverIP = param1[0];
			LocationProperty.serverPort = parseInt(param1[1]);

			egret.localStorage.setItem("listIP", this.listIP.selectedIndex.toString());
		}

		/** 记录资源IP */
		private setSelectRES(): void {
			LocationProperty.resAdd = this.listRES.selectedItem.split("=")[1];
			egret.localStorage.setItem("listRES", this.listRES.selectedIndex.toString());
		}

	}

	/**
	 * 服务器IP地址列表item
	 */
	class IPItemRenderer extends BaseItemRender {

		private label: eui.Label;

		constructor() {
			super();
			//设置空皮肤
			let exmlText = `<?xml version="1.0" encoding="utf-8" ?><e:Skin xmlns:e="http://ns.egret.com/eui"></e:Skin>`;
			this.skinName = exmlText;

			this.label = new eui.Label;
			this.label.textColor = 0x35e62d;
			this.label.size = 12;
			this.label.y = 10;
			this.addChild(this.label);
			this.height = 23;
		}

		public dataChanged(): void {
			this.label.text = this.data as string;
		}

		public set selected(value: boolean) {
			//实现父类逻辑
			//注：此方法只能写在调试代码中，因为下面的代码是引擎源码里面的，
			//   但是引擎源码是有更新的，所以不能用在正式项目里.
			if (this["_selected"] == value)
				return;
			this["_selected"] = value;
			this.invalidateState();

			//业务逻辑
			if (value)
				this.label.textColor = 0xf3311e;
			else
				this.label.textColor = 0x35e62d;
		}

	}

}
