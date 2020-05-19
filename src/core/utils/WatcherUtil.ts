/**
 * Created by hrz on 2017/7/3.
 */

class WatcherUtil {

    public static removeFromArrayCollection(dataPro:eui.ArrayCollection){
        if (dataPro && dataPro.source && dataPro.source.length) {
            WatcherUtil.removeFromArray(dataPro.source);
        }
    }

    public static removeFromArray (dataPro:any[]) {
        if (!dataPro) return;
        for (let source of dataPro) {
            WatcherUtil.removeFromObject(source);
        }
    }

    public static removeFromObject(obj:any){
        if(obj instanceof egret.EventDispatcher){
            let event = obj.$getEventMap();
            let list:any[] = event[eui.PropertyEvent.PROPERTY_CHANGE];
            if (list) {
                for (let index = list.length-1; index >= 0; index--) {
                    let obj = list[index];
                    if (obj.thisObject instanceof eui.Watcher) {
                        obj.thisObject.unwatch();
                        list.splice(index,1);
                    }
                }
            }
        } else {
            let listeners:any[] = obj['__listeners__'];
            if (listeners && listeners.length) {
                for (let i = 0; i < listeners.length; i+=2) {
                    // let listener:Function = listeners[i];
                    let target:any = listeners[i+1];
                    if (target instanceof eui.Watcher) {
                        target.unwatch();
                        // listeners.splice(i,2);  //在 eui.Watcher 中的 unwatch 已经移除
                        i -= 2;
                    }
                }
            }
        }
    }
}