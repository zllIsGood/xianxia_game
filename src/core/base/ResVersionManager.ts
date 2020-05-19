/**
 * Created by yangsong on 15-4-21.
 * 单一资源通过版本号加载管理类
 */
class ResVersionManager extends BaseClass {
	private resVersionData: any;
	private complateFunc: Function;
	private complateFuncTarget: any;

	public static ins(): ResVersionManager {
		return super.ins() as ResVersionManager;
	}

	public has(url: string): boolean {
		return this.resVersionData?this.resVersionData.hasOwnProperty(url):false;
	}

	public getDir(url: string): number {
		return this.resVersionData[url];
	}

	public hasVer(): boolean {
		return !isNaN(LocationProperty.v) && !LocationProperty.isNativeCheckMode;
	}

	/**
	 * 构造函数
	 */
	public constructor() {
		super();
		this.res_loadByVersion();
		this.resVersionData = window[`verData`];
	}

	/**
	 * Res加载使用版本号的形式
	 */
	private res_loadByVersion(): void {

		/**
		 * TODO Modify
		 */
		RES.getVirtualUrl = function (url) {
			if (LocationProperty.isNativeCheckMode) {
				return url;
			}
			let manager = ResVersionManager.ins();
			if (manager.hasVer()) {
				if (manager.has(url)) {
					let dir: number = manager.getDir(url);
					url = `${LocationProperty.resAdd}${dir}/${url}`;
				}
				else
					url = `${LocationProperty.resAdd}0/${url}`;
			}
			else
				url = `${LocationProperty.resAdd}${url}`;
			return url;
		}
	}

	/**
	 * 加载资源版本号配置文件
	 * @param url 配置文件路径
	 */
	public loadConfig(): Promise<any> {

		const promise = new Promise((resolve, reject) => {

			if (this.resVersionData) { return resolve(); }

			if (this.hasVer() && !window.verData) {
				
				let request: egret.HttpRequest = new egret.HttpRequest();
				request.responseType = egret.HttpResponseType.TEXT;//1.egret.HttpResponseType.ARRAY_BUFFER TEXT
				let respHandler = function (evt: egret.Event): void {
					switch (evt.type) {
						case egret.Event.COMPLETE:
							window.verData = JSON.parse(evt.currentTarget.response);
							this.resVersionData = window.verData;
							resolve()
							break;
						case egret.IOErrorEvent.IO_ERROR:
							debug.log("respHandler io error");
							reject(egret.IOErrorEvent.IO_ERROR);
							break;
					}
				};
				request.once(egret.Event.COMPLETE, respHandler, this);
				request.once(egret.IOErrorEvent.IO_ERROR, respHandler, this);
				request.open(`${LocationProperty.resAdd}${LocationProperty.v}/${LocationProperty.v}.json`, egret.HttpMethod.GET);//ver  json
				request.send();
			}
			else {
				resolve();
			}
	
		});
		return promise;
	}

}

declare interface Window {
	verData: Object;
}