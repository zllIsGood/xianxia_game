class HeirloomItemIcon extends BaseComponent {
	public config: ItemConfig;
	public imgBg: eui.Image;
	public imgIcon: eui.Image;
	public imgRect: eui.Image;
	public effect: MovieClip;
	public upEffect: MovieClip;

	public constructor() {
		super();
		this.skinName = "heirloomItemIcon";
		this.imgRect.visible = true;
	}
	public setSkillData(icon:string){
		this.imgRect.visible = false;
		this.imgIcon.source = icon;
	}
	public setData(info:HeirloomInfo | HeirloomEquipConfig,pos:number,icon?:string,uplevel:boolean = false) {
		this.imgRect.visible = true;
		if (info != null) {
			// this.imgBg.source   = info.image + "_png";//
			if( icon || info.icon )
				this.imgIcon.source = ((icon?icon:info.icon) + "_png");
			if( info.lv > 0 && !icon){//等级>0才有特效
				this.imgRect.visible = false;
				if (this.effect == null) {
					this.effect = new MovieClip;
					// this.effect.x = this.imgBg.x + this.imgBg.width/2 + 10;
					// this.effect.y = this.imgBg.y + this.imgBg.height/2;
					this.effect.x = this.width/2-1;
					this.effect.y = this.height/2-6;
					this.addChildAt(this.effect, this.getChildIndex(this.imgIcon)+1);
					// this.effect.addEventListener(egret.Event.ADDED_TO_STAGE, this.resumePlay, this);
				}
				this.effect.playFile(RES_DIR_EFF + 'quaeff6',-1);

				// if( uplevel )
				// 	this.setUpEff();
				return;
			}
		}
		//技能图标 有代表有技能
		if( !icon ){
			let config:HeirloomEquipConfig = GlobalConfig.HeirloomEquipConfig[pos+1][1];//读取表第一个部位
			// this.imgBg.source   = config.icon + "_png";//
			this.imgIcon.source = config.icon + "_png";//'dz_1'+pos;
			// this.imgBg.source = 'quality0';
		}else{
			if( info.lv > 0 )
				this.imgRect.visible = false;
			else
				this.imgRect.visible = true;
		}
	}
	public cleanEff(){
		DisplayUtils.removeFromParent(this.effect);
		this.effect = null;
	}
	public setUpEff(){
		if (this.upEffect == null) {
			this.upEffect = new MovieClip;
			this.upEffect.x = this.imgBg.x + this.imgBg.width/2;
			this.upEffect.y = this.imgBg.y + this.imgBg.height/2 - 10;
			// this.addChildAt(this.upEffect, this.getChildIndex(this.imgIcon)+10);
			this.addChild(this.upEffect);
		}
		this.upEffect.playFile(RES_DIR_EFF + 'promoteeff',1);
	}



	private resumePlay(e: Event): void {
		this.effect.play(-1);
	}

}