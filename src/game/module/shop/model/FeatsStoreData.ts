// TypeScript file
class FeatsStoreData {
    public exchangeCount: number[];

    constructor(len: number, bytes: GameByteArray) {
        this.exchangeCount = [];
        var _index: number;
        var _exchangeCount: number;
        for (var i: number = 0; i < len; i++) {
            _index = bytes.readInt();
            _exchangeCount = bytes.readInt();
            this.exchangeCount[_index] = _exchangeCount;
        }
    }

    /**获取当前功勋商品是否可购*/
    public checkHonorBuy(id:number){
        let feats:FeatsStore = GlobalConfig.FeatsStore[id];
        if( Actor.feats < feats.feats )
            return false;
        switch (feats.type){
            case FEATS_TYPE.day:
                if( this.exchangeCount[feats.id-1] >= feats.daycount ){
                    return true;
                }
                break
            case FEATS_TYPE.infinite:
                return true;
            case FEATS_TYPE.forever:
                if( this.exchangeCount[feats.id-1] >= feats.daycount  ){
                    return true;
                }
                break
        }

        return false;
    }
    /**功勋商店是否有红点*/
    public checkHonorRedPoint(){
        for( let i in GlobalConfig.FeatsStore ){
            let b = this.checkHonorBuy(GlobalConfig.FeatsStore[i].id);
            if( b )
                return true;
        }
        return false;
    }
}
enum FEATS_TYPE{
    day = 1,//每日限购
    infinite,//不限次数
    forever,//永久购
}