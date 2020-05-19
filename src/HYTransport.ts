
//---------------------------
// desc: sdk相关,用于和oc或android层进行通信
// author: oyxz
// since: 2018-09-30
// copyright: haoyu
//---------------------------

enum HYTransportCode {
    HY_TP_LOADED = 1,   // 通知OC层加载完毕
    HY_TP_INIT = 2, // sdk初始化完毕
    HY_TP_SRVLIST = 3, // 获取服务器列表
    HY_TP_SDKLOGIN = 4, // sdk登录
    HY_TP_SRVCHOOSE = 5, // 通知OC层选服
    HY_TP_SDKLOUTOUT = 6, // 登出SDK
    HY_TP_PAY = 7, // 支付
    HY_TP_PAYSUCCESS = 8, // 支付成功
    HY_TP_PAYFAIL = 9, // 支付失败
    HY_TP_ENTERGAME = 10, // 通知OC进入游戏
}

class HYTransport {
    private static eventDispatcher: egret.EventDispatcher;

    public static init() {
        // egret.log("call native init ");
        // egret.ExternalInterface.call("callNative", "message from js");
        
        HYTransport.eventDispatcher = new egret.EventDispatcher();

        egret.ExternalInterface.addCallback("callJS", function (message) {
            // egret.log("message form native : " + message);
            // TODO 根据tpcode,分发native层的消息
            let jsonData = JSON.parse(message);
            if (jsonData) {
                if (jsonData.tpcode) {
                    let isDespatch: boolean = false;
                    for (let key in HYTransportCode) {
                        // console.log(`key:${key}, code:${HYTransportCode[key]}`);
                        if (jsonData.tpcode == HYTransportCode[key]) {
                            HYTransport.eventDispatcher.dispatchEventWith(key.toString(),false,jsonData);
                            isDespatch = true;
                            break;
                        }
                    }
                    if (!isDespatch) {
                        // egret.log(`没有对应的tpcode枚举类型，tpcode：${jsonData.tpcode}`);
                    }
                }
                else {
                    // egret.log(`native message没有tpcode参数，message：${message}`);
                }
            }
            else {
                // egret.log(`解析native数据失败，message：${message}`);
            }
        });
    } 

    public static dispatchEvent(key: string, jsonData: JSON) {
        HYTransport.eventDispatcher.dispatchEventWith(key,false,jsonData);
    }
    
    public static send2Native(code: HYTransportCode, jsonObj: any = null) {
        // egret.log("call native : " + code);
        if (jsonObj == null) {
            jsonObj = {};
        }
        jsonObj["tpcode"] = code;
        let str: string = JSON.stringify(jsonObj);
        egret.ExternalInterface.call("callNative", str);
    }

    public static showStatusBar(isShow: boolean) {
        let jsonObj = {};
        jsonObj["isShow"] = isShow;
        let str: string = JSON.stringify(jsonObj);
        egret.ExternalInterface.call("showStatusBar", str);
    }  
    
    public static showWebview() {
        let jsonObj = {};
        let str: string = JSON.stringify(jsonObj);
        egret.ExternalInterface.call("showWebview", str);
    }  

    public static addNativeEventListener(type: string, callback: Function, callbackObj: any) {
        HYTransport.eventDispatcher.addEventListener(type,callback,callbackObj);
    }

    public static addNativeEventOnce(type: string, callback: Function, callbackObj: any) {
        HYTransport.eventDispatcher.once(type,callback,callbackObj);
    }

    public static removeNativeEventListener(type: string, callback: Function, callbackObj: any) {
        HYTransport.eventDispatcher.removeEventListener(type,callback,callbackObj);
    }
}