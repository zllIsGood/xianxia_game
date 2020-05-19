class OSATarget27Panel extends ActivityPanel {
    public cruPanel: any;

    public constructor() {
        super();
    }

    public open(...param: any[]): void {
        this.observe(Activity.ins().postActivityIsGetAwards, this.updateData);
        this.observe(Activity.ins().postRewardResult, this.updateData);



        let config: ActivityType27Config[] = GlobalConfig.ActivityType27Config[this.activityID];
        // if (!this.cruPanel || this.cruPanel.activityID != this.activityID) {
            if (this.cruPanel) {
                this.cruPanel.close();
                DisplayUtils.removeFromParent(this.cruPanel);
            }

            let showType = config[0].showType || 1;
            this.cruPanel = ObjectPool.pop(`OSATarget27Panel${showType}`, [this.activityID]);
            this.cruPanel.top = 0;
            this.cruPanel.bottom = 0;
            this.cruPanel.left = 0;
            this.cruPanel.right = 0;
            this.cruPanel.activityID = this.activityID;

            this.addChild(this.cruPanel);
            this.cruPanel.open();
        // }

    }

    public close(...param: any[]): void {
        if (this.cruPanel) this.cruPanel.close();
    }

    public updateData() {
        this.cruPanel && this.cruPanel.updateData();
    }

}