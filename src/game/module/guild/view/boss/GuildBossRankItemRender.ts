class GuildBossRankItemRender extends BaseItemRender {
    public rank: eui.Label;
    public playerName: eui.Label;
    public guildOwn: eui.Label;
    public harm: eui.Label;
    public reward: eui.Label;
    constructor() {
        super();
        this.skinName = "GuildBossHarmItem";
    }

    public dataChanged(): void {
        this.rank.text = this.data.rank;
        this.playerName.text = this.data.name;
        this.harm.text = this.data.damage;

        let isGet:boolean = false;
        let config:GuildBossRankConfig[] = GlobalConfig.GuildBossRankConfig;
        let conf:GuildBossRankConfig;
        for (let id in config) {
            if (config[id].srank <= this.data.rank && config[id].erank >= this.data.rank) {
                isGet = true;
                this.reward.text = config[id].awards[0].count+"";
                break;
            }
            if (config[id].srank == 0 && config[id].erank == 0) conf = config[id];
        }

        if(!isGet) {
            this.reward.text = conf.awards[0].count+"";
        }
    }
}