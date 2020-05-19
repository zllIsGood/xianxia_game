class SceneTipsItem extends TipsItem {
    public set labelText(value: string) {
        this._labelText = value;
        this.lab.textFlow = TextFlowMaker.generateTextFlow(this._labelText);
        this.bg.width = this.lab.width;

        this.bg.visible = false;
        this.lab.alpha = 1;

        this.bg.y = 0;
        this.lab.verticalCenter = -1;

        TimerManager.ins().doTimer(2000, 1, ()=>{
            DisplayUtils.removeFromParent(this);
        },this);
    }
}