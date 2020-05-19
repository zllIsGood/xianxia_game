/**
 * 神羽红点
 */
class GodWingRedPoint extends BaseSystem {

    redPoint:boolean;

    roleTabs:Map<Map<boolean>> = {};

    tabs:{[tab:number]: boolean};


    constructor(){
        super();
        this.tabs = {};
        this.roleTabs = {};
        this.redPoint = false;

        this.associated(this.postGodWingRedPoint,
            this.postGodWingItem,
            // this.postGodWingCompose
            // this.postGodWingTransfer,
        );

        this.associated(this.postGodWingItem,
            Wing.ins().postWingWear,
            Wing.ins().postGodWingData,

            Wing.ins().postWingUpgrade,
            Wing.ins().postActivate,

            UserBag.ins().postItemChange,
            UserBag.ins().postItemAdd
        );
        this.associated(this.postGodWingCompose,
            UserBag.ins().postItemChange,
            UserBag.ins().postItemAdd
        );
        // this.associated(this.postGodWingTransfer,
        //     Wing.ins().postGodWingData,
        //     UserBag.ins().postItemChange,
        //     UserBag.ins().postItemAdd
        // );

    }
    //神羽入口红点
    public postGodWingRedPoint(){
        let oldv = this.redPoint;
        this.redPoint = this.tabs[0] || this.tabs[1];//|| this.tabs[2];
        return oldv != this.redPoint;
    }
    //神羽装备
    public postGodWingItem(){
        let tab = 0;//装备页签
        if( !this.roleTabs[tab] )
            this.roleTabs[tab] = {};
        let len:number = 3;
        for (let roleIndex: number = 0; roleIndex < len; roleIndex++) {
            if( !this.roleTabs[tab] )
                this.roleTabs[tab] = {};
            this.roleTabs[tab][roleIndex] = Wing.ins().isWearGodWing(roleIndex);
        }
        this.tabs[tab] = false;
        for ( let i in this.roleTabs[tab] ){
            if( this.roleTabs[tab][i] )
                this.tabs[tab] = true;
        }
        return true;

    }
    //神羽合成
    public postGodWingCompose(){
        let tab = 1;//合成页签
        this.tabs[tab] = Wing.ins().isComposeGodWingAll();
        if( !this.roleTabs[tab] )
            this.roleTabs[tab] = {};
        return true;
    }
    //神羽转换
    public postGodWingTransfer(){
        let tab = 2;//转换页签
        if( !this.roleTabs[tab] )
            this.roleTabs[tab] = {};
        this.tabs[tab] = Boolean(UserBag.ins().getItemByType(ItemType.TYPE_16));
        //Boolean(UserBag.ins().getBagItemById(ItemConst.GODWING_ITEM))
    }
    //判定神羽最大红点
    public getGodWingRedPoint(){
        if( GameServer.serverOpenDay+1 < GlobalConfig.WingCommonConfig.openDay ){//开服第五天
            return false;
        }
        //只要其中一个角色开启了翅膀就有红点判定
        for( let i = 0;i < SubRoles.ins().subRolesLen;i++ ){
            let wingsData:WingsData = SubRoles.ins().getSubRoleByIndex(i).wingsData;
            if (wingsData.openStatus) {
                return this.redPoint;
            }
        }

        return false;
    }
}

namespace GameSystem {
    export let  godwingredpoint = GodWingRedPoint.ins.bind(GodWingRedPoint);
}
