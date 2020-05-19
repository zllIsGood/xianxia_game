/**
 * Created by hrz on 2017/8/25.
 */


class FixUtil {
	private static exmlsDic: Map<any>;
	private static imageLoadList: any = {};

	/**
	 * 解析器字典
	 */
	public static analyzerDic:any = {};
	

	static getAnalyerByType(type: string): BaseAnalyer {
		let analyzer: BaseAnalyer = this.analyzerDic[type];
		if (!analyzer) {
			let newAnalyzer = new BaseAnalyer();
			this.analyzerDic[type]= newAnalyzer;
			return newAnalyzer;
		}
		return analyzer;
	}

	static setAnalyerByType(type: string, name:string, data: any) {
		let analyzer: BaseAnalyer = FixUtil.getAnalyerByType(type);
		analyzer.analyzeData(name, data);
		this.analyzerDic[type] = analyzer;
	}

	
	static fixAll() {

		// 创建自定义处理器
		FixUtil.recordLoadingImage();
		FixUtil.configProcessor();
	}

	private static recordLoadingImage() {
		let func = RES.getResByUrl;
		RES.getResByUrl = function (url: string, compFunc: Function, thisObject: any, type: string = "") {
			if (type == RES.ResourceItem.TYPE_IMAGE) {
				ResourceMgr.ins().pushLoadingImage(url);
				let _url = url;
				return func(url, (d, r)=>{
					compFunc.call(thisObject, d, r);
					ResourceMgr.ins().loadedImage(_url);
				}, thisObject, type);
			}
			return func(url, compFunc, thisObject, type);
		}
	}

	/**
	 * 自己写一个 promisify 方法, 用来处理图片下载好的逻辑
	 * */
	private static promisify(loader: egret.ImageLoader | egret.HttpRequest | egret.Sound, resource: RES.ResourceInfo): Promise<any> {

        return new Promise((resolve, reject) => {
            let onSuccess = () => {
                let texture = loader['data'] ? loader['data'] : loader['response'];
                resolve(texture);
            }

            let onError = () => {
                let e = new RES.ResourceManagerError(1001, resource.url);
                reject(e);
            }
            loader.addEventListener(egret.Event.COMPLETE, onSuccess, this);
            loader.addEventListener(egret.IOErrorEvent.IO_ERROR, onError, this);
        })
    }

	private static configProcessor()	{
		 var customImageProcessor: RES.processor.Processor = {
			onLoadStart(host, resource) {

				// 记录资源加载
				if(FixUtil.imageLoadList[resource.url] == undefined) {
					FixUtil.imageLoadList[resource.url] = Actor.level || 0;
				}

				var loader = new egret.ImageLoader();
				var resUrl = RES.getVirtualUrl(resource.root + resource.url)
				if (!resUrl) { return; }

				loader.load(resUrl);
				return FixUtil.promisify(loader, resource)
                .then((bitmapData) => {
					let texture = new egret.Texture();
				
					let name = resource.root + resource.url;
					FixUtil.setAnalyerByType(RES.ResourceItem.TYPE_IMAGE, name, texture);

                    texture._setBitmapData(bitmapData);
                    let r = host.resourceConfig.getResource(resource.name);
                    if (r && r.scale9grid) {
                        var list: Array<string> = r.scale9grid.split(",");
                        texture["scale9Grid"] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
                    }
                    return texture;
                })		
			},
		
			onRemoveStart(host, resource) {
				let texture = host.get(resource);
				texture.dispose();
			}
		 }
		 RES.processor.map("image", customImageProcessor);

		var customSheetProcessor: RES.processor.Processor = {

			onLoadStart(host, resource): Promise<any> {
				return host.load(resource, "json").then((data) => {
					let r = host.resourceConfig.getResource(RES.nameSelector(data.file));
					if (!r) {

						// 记录资源加载
						if (FixUtil.imageLoadList[resource.url] == undefined) {
							FixUtil.imageLoadList[resource.url] = Actor.level || 0;
						}
		
						let imageName = RES.processor.getRelativePath(resource.url, data.file);
						r = { name: imageName, url: imageName, type: 'image', root: resource.root };
					}
					return host.load(r)
						.then((bitmapData) => {
							var frames: any = data.frames;
							var spriteSheet = new egret.SpriteSheet(bitmapData);
							spriteSheet["$resourceInfo"] = r;
							for (var subkey in frames) {
								var config: any = frames[subkey];
								var texture = spriteSheet.createTexture(subkey, config.x, config.y, config.w, config.h, config.offX, config.offY, config.sourceW, config.sourceH);
								let name = resource.root + resource.url;
								FixUtil.setAnalyerByType(RES.ResourceItem.TYPE_IMAGE, name, texture);
								if (config["scale9grid"]) {
									var str: string = config["scale9grid"];
									var list: Array<string> = str.split(",");
									texture["scale9Grid"] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
								}
							}
							host.save(r as RES.ResourceInfo, bitmapData);
							return spriteSheet;
						})
				})
			},
	
			getData(host, resource, key, subkey) {
				let data: egret.SpriteSheet = host.get(resource);
				if (data) {
					return data.getTexture(subkey);
				}
				else {
					return null;
				}
			},
	
	
			onRemoveStart(host, resource) {
				const sheet: egret.SpriteSheet = host.get(resource);
				const r = sheet["$resourceInfo"];
				sheet.dispose();
				host.unload(r);
			}
		}
		RES.processor.map("sheet", customSheetProcessor);


		var customBinaryProcessor: RES.processor.Processor = {

			onLoadStart(host, resource) {

				// 记录资源加载
				if(FixUtil.imageLoadList[resource.url] == undefined) {
					FixUtil.imageLoadList[resource.url] = Actor.level || 0;
				}

				var request: egret.HttpRequest = new egret.HttpRequest();
				request.responseType = egret.HttpResponseType.ARRAY_BUFFER;
				request.open(RES.getVirtualUrl(resource.root + resource.url), "get");
				request.send();
				return FixUtil.promisify(request, resource)
			},
	
			onRemoveStart(host, resource) {
			}
		 }

		 RES.processor.map("bin", customBinaryProcessor);

		 var customJsonProcessor: RES.processor.Processor = {

			onLoadStart(host, resource) {
				return host.load(resource, 'text').then(text => {
					let data = JSON.parse(text);
					let name = resource.root + resource.url;
					FixUtil.setAnalyerByType(RES.ResourceItem.TYPE_JSON, name, data);
					return data;
				})
	
			},
	
			onRemoveStart(host, request) {
			}
		 }

		 RES.processor.map("json", customJsonProcessor);
	}

	// 下载文件
	public static imageLoadSave() {
		let imageLoadList = FixUtil.imageLoadList;
		// console.log(imageLoadList);
		let blob;
		let fileName: string = 'imageLoaded';
		let str: string = '';//JSON.stringify(imageLoadList);
		for (let i in imageLoadList) {
			// str += `${i} ${imageLoadList[i]}\r\n`;
			str += `${i}\n`;
		}
		// console.log(str);
		if (typeof window.Blob == "function") {
			blob = new Blob([str], { type: "text/plain;charset=utf-8" });
		} else {
			let BlobBuilder = window["BlobBuilder"] || window["MozBlobBuilder"] || window["WebKitBlobBuilder"] || window["MSBlobBuilder"];
			let bb = new BlobBuilder();
			bb.append(str);
			blob = bb.getBlob("text/plain;charset=utf-8");
		}
		let URL = window.URL || window["webkitURL"];
		let bloburl = URL.createObjectURL(blob);
		let anchor = document.createElement("a");
		anchor.style.visibility = "hidden";
		anchor.href = bloburl;
		anchor.download = fileName;
		document.body.appendChild(anchor);
		let evt = document.createEvent("MouseEvents");
		evt.initEvent("click", true, true);
		anchor.dispatchEvent(evt);
		document.body.removeChild(anchor);
	}
	
}
