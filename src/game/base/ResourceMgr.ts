/**
 * Created by hrz on 2018/1/25.
 * modify by solace on 2019/2/27.
 */

class ResourceMgr extends BaseSystem {
	private isFirstEnter: boolean = true;

	private loadingImage: any = {};

	constructor() {
		super();

		this.observe(GameLogic.ins().postEnterMap, this.destroy);
	}

	static ins(): ResourceMgr {
		return super.ins() as ResourceMgr;
	}

	private start() {
		TimerManager.ins().doTimer(5 * 1000, 0, () => {
			let sum = this.checkBitmapSize();
			// console.log("==============================================");
			// console.log(`BitmapSize:${(sum/1024/1024).toFixed(3)}Mb`);
			// RES.profile();
			// console.log("==============================================\n");
			if (sum / 1024 / 1024 >= 200)
				this.destroy();
		}, this);
	}

	private destroy() {
		if (!this.isFirstEnter) {
			this.destroyRes();
		} else {
			this.isFirstEnter = false;
			this.start();
		}
	}


	public destroyWin() {
		this.destroyUIRes();
	}

	public pushLoadingImage(url: string) {
		this.loadingImage[url] = 1;
	}
	public loadedImage(url: string) {
		delete this.loadingImage[url];
	}

	@callDelay(3000)
	private destroyRes() {
		let analyzer: BaseAnalyer = FixUtil.getAnalyerByType(RES.ResourceItem.TYPE_IMAGE);
		let fileDic = analyzer.fileDic;
		for (let key in fileDic) {
			if (key.indexOf(RES_DIR) < 0) continue;

			let texture = fileDic[key];
			if (this.checkCanDestroy(texture.bitmapData)
				&& !this.loadingImage[key]) {
				if (RES.hasRes(key)) {
					// console.log("destoryRes:"+key)
					analyzer.destroyRes(key);
					RES.destroyRes(key);	
				} 	
			}
		}
		FixUtil.analyzerDic[RES.ResourceItem.TYPE_IMAGE] = analyzer;
	}

	@callDelay(3000)
	private destroyUIRes() {
		let analyzer: BaseAnalyer = FixUtil.getAnalyerByType(RES.ResourceItem.TYPE_IMAGE);
		let fileDic = analyzer.fileDic;

		let baseJson = FixUtil.getAnalyerByType(RES.ResourceItem.TYPE_JSON);
		let resConfig: RES.ResourceConfig = baseJson["resourceConfig"];
		
		for (let key in fileDic) {
			
			let json = resConfig.getResource(key);
			if (json && json.url.indexOf("image/public/") >= 0) { continue; }	

			if (key.indexOf(MAP_DIR) >= 0 || (key.indexOf(RES_DIR) >= 0 && key.indexOf(RES_DIR_EFF) < 0)) continue;
			let texture: egret.Texture = fileDic[key];
			if (this.checkCanDestroy(texture.bitmapData) 
				&& !this.loadingImage[key]) {

				if (RES.hasRes(key)) {
					// console.log("destroyUIRes:"+key)
					analyzer.destroyRes(key);
					RES.destroyRes(key);	
				} 
			}
		}

		FixUtil.analyzerDic[RES.ResourceItem.TYPE_IMAGE] = analyzer;
	}

	public checkBitmapSize() {
		let analyzer = FixUtil.getAnalyerByType(RES.ResourceItem.TYPE_IMAGE);
		let fileDic = analyzer.fileDic;
		let bit: number = 0;
		
		for (let key in fileDic) {
			let texture: egret.Texture = fileDic[key];	
			bit += texture.$bitmapWidth * texture.$bitmapHeight * 4;
		}
		return bit;
	}

	private checkCanDestroy(bitmapData: egret.BitmapData) {
		if (!bitmapData) return false;
		let hashCode = bitmapData.hashCode;
		let isCanDestroy = false;
		let arrBitmapData = egret.BitmapData['_displayList'][hashCode];
		isCanDestroy = (!arrBitmapData || !arrBitmapData.length);
		if (isCanDestroy) {
			delete egret.BitmapData['_displayList'][hashCode];
		}
		else {
			return false;
		}
		let arrMC = MovieClip.displayList[hashCode];
		isCanDestroy = (!arrMC || !arrMC.length);
		if (isCanDestroy) {
			delete MovieClip.displayList[hashCode];
		}
		else {
			return false;
		}

		return true;
	}

	public reloadContainer(obj: egret.DisplayObjectContainer) {
		let num = obj.numChildren;
		for (let i = 0; i < num; i++) {
			let img = obj.getChildAt(i);
			if (img instanceof eui.Image) {
				this.reloadImg(img);
			} else if (img instanceof egret.DisplayObjectContainer) {
				this.reloadContainer(img);
			}
		}
	}

	public reloadImg(image: eui.Image) {
		let source = image.source;
		if (source) {
			if (image.$bitmapData || (image.texture && image.texture.bitmapData))
				return;

			image.source = null;
			image.source = source;
		}
	}
}

namespace GameSystem {
	export let  resourceMgr = ResourceMgr.ins.bind(ResourceMgr);
}
