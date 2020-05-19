//////////////////////////////////////////////////////////////////////////////////////
//
//  Copyright (c) 2014-2015, Egret Technology Inc.
//  All rights reserved.
//  Redistribution and use in source and binary forms, with or without
//  modification, are permitted provided that the following conditions are met:
//
//	 * Redistributions of source code must retain the above copyright
//	   notice, this list of conditions and the following disclaimer.
//	 * Redistributions in binary form must reproduce the above copyright
//	   notice, this list of conditions and the following disclaimer in the
//	   documentation and/or other materials provided with the distribution.
//	 * Neither the name of the Egret nor the
//	   names of its contributors may be used to endorse or promote products
//	   derived from this software without specific prior written permission.
//
//  THIS SOFTWARE IS PROVIDED BY EGRET AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
//  OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES
//  OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
//  IN NO EVENT SHALL EGRET AND CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT,
//  INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
//  LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;LOSS OF USE, DATA,
//  OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
//  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
//  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE,
//  EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
//////////////////////////////////////////////////////////////////////////////////////


// import load = EXML.load;
class ThemeAdapter implements eui.IThemeAdapter {

	/**
	 * 解析主题
	 * @param url 待解析的主题url
	 * @param onSuccess 解析完成回调函数，示例：compFunc(e:egret.Event):void;
	 * @param onError 解析失败回调函数，示例：errorFunc():void;
	 * @param thisObject 回调的this引用
	 */
	public getTheme(url: string, onSuccess: Function, onError: Function, thisObject: any): void {
		// console.log("load url:" + url);
		// 正式服通过加载皮肤压缩文件加载
		let isZip = LocationProperty.isZipLoad;
		isZip = LocationProperty.isWeChatMode?false:isZip; // 小程序版本暂不加载zip
		url += isZip?'.cfg':""; 
		let load_count:number = 0;
		let self = this;

		function onResGet(e: string):void {
			if (isZip) {
				JSZip.loadAsync(e).then((zip) => {
	                return zip.file('default.thm.json').async("text");
	            }).then((data) => {
					onSuccess.call(thisObject, data);
					if(RES.hasRes(`${RES_RESOURCE}default.thm.json`)) 
						RES.destroyRes(`${RES_RESOURCE}default.thm.json`);
	            });
			}
			else {
				//console.log('load thm:' + `${RES_RESOURCE}default.thm.json`);
				onSuccess.call(thisObject, e);
				if(RES.hasRes(`${RES_RESOURCE}default.thm.json`)) 
					RES.destroyRes(`${RES_RESOURCE}default.thm.json`);
			}
		}
		function onResError(e:RES.ResourceEvent):void {
			if(e.resItem.url == url) {
				load_count += 1;
				Assert(false, `加载皮肤文件失败!! 失败次数：${load_count}.`);
				if(load_count < 3) {
					RES.getResByUrl(url, onResGet, self, isZip?RES.ResourceItem.TYPE_BIN:RES.ResourceItem.TYPE_TEXT);
					return;
				}

				RES.removeEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onResError, null);
				onError.call(thisObject);
			}
		}

		if (typeof generateEUI !== 'undefined') {
            egret.callLater(() => {
                onSuccess.call(thisObject, generateEUI);
            }, this);
		}
		else if (typeof generateEUI2 !== 'undefined') {
			if (isZip) {
				RES.getResByUrl(`${RES_RESOURCE}gameEui.json.cfg`, (e, url) => {
	                JSZip.loadAsync(e).then((zip) => {
		                return zip.file('gameEui.json').async("text");
		            }).then((data) => {
		            	window["JSONParseClass"]["setData"](JSON.parse(data));
		                egret.callLater(() => {
		                    onSuccess.call(thisObject, generateEUI2);
		                }, this);
		            });
	            }, this, RES.ResourceItem.TYPE_BIN);
			}
			else {
	            RES.getResByUrl(`${RES_RESOURCE}gameEui.json`, (data, url) => {
	                window["JSONParseClass"]["setData"](data);
	                egret.callLater(() => {
	                    onSuccess.call(thisObject, generateEUI2);
	                }, this);
	            }, this, RES.ResourceItem.TYPE_JSON);
			}
        }
        else if (typeof generateJSON !== 'undefined') {
            if (url.indexOf(".exml") > -1) {
                let dataPath = url.split("/");
                dataPath.pop();
                let dirPath = dataPath.join("/") + "_EUI.json";
                if (!generateJSON.paths[url]) {
                    RES.getResByUrl(dirPath, (data) => {
                        window["JSONParseClass"]["setData"](data);
                        egret.callLater(() => {
                            onSuccess.call(thisObject, generateJSON.paths[url]);
                        }, this);
                    }, this, RES.ResourceItem.TYPE_JSON);
                } else {
                    egret.callLater(() => {
                        onSuccess.call(thisObject, generateJSON.paths[url]);
                    }, this);
                }
            }
            else {
                egret.callLater(() => {
                    onSuccess.call(thisObject, generateJSON);
                }, this);
            }
        }
        else {
            RES.addEventListener(RES.ResourceEvent.ITEM_LOAD_ERROR, onResError, null);
			RES.getResByUrl(url, onResGet, this, isZip?RES.ResourceItem.TYPE_BIN:RES.ResourceItem.TYPE_TEXT);
        }
	}
}

declare var generateEUI: { paths: string[], skins: any }
declare var generateEUI2: { paths: string[], skins: any }
declare var generateJSON: { paths: string[], skins: any }