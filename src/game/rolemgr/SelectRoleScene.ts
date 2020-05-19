/**
 * Created by hrz on 2017/11/27.
 */

class SelectRoleScene extends BaseScene {
    constructor(){
        super();
    }

    /**
     * 进入Scene调用
     */
    public onEnter(): void {
        super.onEnter();

        this.addLayer(LayerManager.UI_Main);
        this.addLayer(LayerManager.UI_Tips);

        // // 播放背景音乐
        SoundManager.ins().playBg("login_mp3");
    }

    /**
     * 退出Scene调用
     */
    public onExit(): void {
        super.onExit();
    }
}