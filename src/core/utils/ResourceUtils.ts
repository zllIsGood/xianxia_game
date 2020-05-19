/**
 * Created by yangsong on 15-2-11.
 * 资源加载工具类，
 * 支持多个resource.json文件加载
 * 封装Group的加载
 * 增加静默加载机制
 */
class ResourceUtils extends BaseClass implements RES.PromiseTaskReporter  {
	private _configs: Array<any>;

	private _groups: any;
	private _groupIndex: number = 0;

	private _urlResorce: any;

	/**
	 * 构造函数
	 */
	public constructor() {
		super();

		this._configs = new Array<any>();
		this._groups = {};
		this._urlResorce = {};

		RES.addEventListener(RES.ResourceEvent.GROUP_PROGRESS, this.onResourceLoadProgress, this);
	}


	public static ins(): ResourceUtils {
		return super.ins() as ResourceUtils;
	}
	/**
	 * 添加一个配置文件
	 * @param jsonPath resource.json路径
	 * @param filePath 访问资源路径
	 */
	public addConfig(jsonPath: string, filePath: string): void {
		this._configs.push([jsonPath, filePath]);
	}

	/**
	 * 开始加载配置文件
	 */
	public loadConfig(): Promise<void> {
		return this.loadNextConfig();
	}

	/**
	 * 加载
	 */
	private loadNextConfig(): Promise<void> {
		//加载完成
		if (this._configs.length == 0) {
			return Promise.resolve();
		}

		let arr: any = this._configs.shift();
		return RES.loadConfig(arr[0], arr[1]);
	}

	/**
	 * 加载完成
	 * @param event
	 */
	private onConfigCompleteHandle(event: RES.ResourceEvent): void {
		RES.removeEventListener(RES.ResourceEvent.CONFIG_COMPLETE, this.onConfigCompleteHandle, this);
		this.loadNextConfig();
	}

	/**
	 * 加载资源组
	 * @param $groupName 资源组名称
	 * @param $onResourceLoadComplete 资源加载完成执行函数
	 * @param $onResourceLoadProgress 资源加载进度监听函数
	 * @param $onResourceLoadTarget 资源加载监听函数所属对象
	 */
	public loadGroup($groupName: string, $onResourceLoadComplete: Function, $onResourceLoadProgress: Function, $onResourceLoadTarget: any) {

		this._groups[$groupName] = [$onResourceLoadComplete, $onResourceLoadProgress, $onResourceLoadTarget];

		RES.loadGroup($groupName, 0, this)
		.then((result) => {
			this.onResourceLoadComplete($groupName);
		})
		.catch((err) => {
			this.onResourceLoadError($groupName);
		});
	}

	/**
	 * 同时加载多个组
	 * @param $groupName 自定义的组名称
	 * @param $subGroups 所包含的组名称或者key名称数组
	 * @param $onResourceLoadComplete 资源加载完成执行函数
	 * @param $onResourceLoadProgress 资源加载进度监听函数
	 * @param $onResourceLoadTarget 资源加载监听函数所属对象
	 */
	public loadGroups($groupName: string, $subGroups: Array<any>, $onResourceLoadComplete: Function, $onResourceLoadProgress: Function, $onResourceLoadTarget: any): void {
		RES.createGroup($groupName, $subGroups, true);
		this.loadGroup($groupName, $onResourceLoadComplete, $onResourceLoadProgress, $onResourceLoadTarget)
	}

	/**
	 * 静默加载
	 * @param $groupName 资源组名称
	 * @param $groupName 所包含的组名称或者key名称数组
	 */
	public pilfererLoadGroup($groupName: string, $subGroups: Array<any> = null): void {
		//添加前缀，防止与正常加载组名重复
		let useGroupName = "pilferer_" + $groupName;
		if (!$subGroups) {
			$subGroups = [$groupName];
		}
		RES.createGroup(useGroupName, $subGroups, true);
		RES.loadGroup(useGroupName, -1);
	}

	/**
	 * 资源组加载完成
	 */
	private onResourceLoadComplete($groupName: string): void {
		let groupName: string = $groupName;
		if (this._groups[groupName]) {
			let loadComplete: Function = this._groups[groupName][0];
			let loadCompleteTarget: any = this._groups[groupName][2];
			if (loadComplete != null) {
				loadComplete.call(loadCompleteTarget);
			}

			this._groups[groupName] = null;
			delete this._groups[groupName];
		}
	}

	/**
	 * 资源组加载进度
	 */
	public onProgress(current: number, total: number, resItem: RES.ResourceInfo | undefined): void {
  //       let groupName: string = resItem.name;
		// if (this._groups[groupName]) {
		// 	let loadProgress: Function = this._groups[groupName][1];
		// 	let loadProgressTarget: any = this._groups[groupName][2];
		// 	if (loadProgress != null) {
		// 		loadProgress.call(loadProgressTarget, current, total);
		// 	}
		// }
    }
 	private onResourceLoadProgress(event: RES.ResourceEvent): void {
		let groupName: string = event.groupName;
		if (this._groups[groupName]) {
			let loadProgress: Function = this._groups[groupName][1];
			let loadProgressTarget: any = this._groups[groupName][2];
			if (loadProgress != null) {
				loadProgress.call(loadProgressTarget, event.itemsLoaded, event.itemsTotal);
			}
		}
	}
	

	/**
	 * 资源组加载失败
	 * @param event
	 */
	private onResourceLoadError($groupName: string): void {
		Log.trace($groupName + "资源组有资源加载失败");

		//配置加载失败重新加载
		if ($groupName == `preload`) {
			let gameApp = GameApp.ins();
			gameApp.preload_load_count += 1;
			//只向后台发送一次失败
			if (gameApp.preload_load_count == 1) {
				Assert(false, `${$groupName} 资源加载失败!!失败次数：${gameApp.preload_load_count}`);
			}

			if (gameApp.preload_load_count < 3) {
				RES.loadGroup($groupName);
			} else {
				debug.log(`资源加载失败，请检查网络重新登录`);
				// this.onResourceLoadComplete(event);
			}
			return;
		}
		this.onResourceLoadComplete($groupName);
	}

	/**
	 * 混合加载资源组
	 * @param $resources 资源数组
	 * @param $groups 资源组数组
	 * @param $onResourceLoadComplete 资源加载完成执行函数
	 * @param $onResourceLoadProgress 资源加载进度监听函数
	 * @param $onResourceLoadTarget 资源加载监听函数所属对象
	 */
	public loadResource($resources = [], $groups = [], $onResourceLoadComplete: Function = null, $onResourceLoadProgress: Function = null, $onResourceLoadTarget: any = null): void {
		let needLoadArr = $resources.concat($groups);
		let groupName = "loadGroup" + this._groupIndex++;
		RES.createGroup(groupName, needLoadArr, true);
		this._groups[groupName] = [$onResourceLoadComplete, $onResourceLoadProgress, $onResourceLoadTarget];
		RES.loadGroup(groupName, 0, this)
		.then((result) => {
			this.onResourceLoadComplete(groupName);
		})
		.catch((err) => {
			this.onResourceLoadError(groupName);
		});
	}

	/**
	 * 动态加载资源
	 * @param url
	 */
	public loadUrlResource(url: string, type: string, compFun: any, thisObj: any): void {
		if (this._urlResorce[url] == null) {
			this._urlResorce[url] = {
				"data": null,
				"compFun": compFun,
				"thisObj": thisObj
			};
			RES.getResByUrl(url, (data: any) => {
				this._urlResorce[url]["data"] = data;
				if (compFun != null)
					compFun.apply(this._urlResorce[url]["thisObj"]);
			}, this, type);
		}
		else if (compFun != null)
			compFun.apply(thisObj);
	}

	public getUrlResource(url: string): any {
		if (this._urlResorce[url] == null) {
			debug.log("资源未加载");
			return null;
		}
		return this._urlResorce[url]["data"];
	}
}
