

class BaseAnalyer extends egret.HashObject {

    public resourceConfig:RES.ResourceConfig = null;

    /**
     * 字节流数据缓存字典
     */
    public fileDic:any = {};

    public constructor() {
		super();
        this.resourceConfig = <RES.ResourceConfig>(RES["config"]);
    }

    public analyzeData(name:string, data: any) {

        if (this.fileDic[name]) return;

        this.fileDic[name] = data;
	}
	
	public getRes(name:string):any {
		return this.fileDic[name];
    }

    public destroyRes(name:string):boolean {
        if (this.fileDic[name]) {
            // this.onResourceDestroy(this.fileDic[name]);
            delete this.fileDic[name];
            return true;
        }
        return false;
    }

    protected onResourceDestroy(texture:any) {
        texture.dispose();
    }
    
}