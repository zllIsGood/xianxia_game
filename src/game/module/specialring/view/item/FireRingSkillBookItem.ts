/**
 * Created by Peach.T on 2017/11/1.
 */

class FireRingSkillBookItem extends ItemBase {

    constructor() {
        super();        
        this.isOpenSelectImg = true;
        this.addEventListener(egret.Event.REMOVED_FROM_STAGE, this.onRemove, this);
    }

    protected init(): void {

    }

     public dataChangeHandler(): void {
         let count = this.data.count;
         if(count > 0){
             this.itemIcon.imgIcon.filters = null;
             this.itemIcon.imgBg.filters = null;
         }else
         {
             this.itemIcon.imgIcon.filters = FilterUtil.ARRAY_GRAY_FILTER;
             this.itemIcon.imgBg.filters = FilterUtil.ARRAY_GRAY_FILTER;
         }
    }

    //避免内存泄漏
    private onRemove() {
        if(this.itemIcon) {
            this.itemIcon.imgIcon.filters = null;
            this.itemIcon.imgBg.filters = null;
        }
    }
}
