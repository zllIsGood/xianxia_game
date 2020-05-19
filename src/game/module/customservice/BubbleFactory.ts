/**
 * Created by hujinheng on 2018/3/12.
 */

class BubbleFactory extends BaseClass {
	public constructor() {
		super();

	}
	/**
	 * 气泡特效播放
	 * 源于0-25
	 * */
	public playBubbleEffect(id:number){
		let bubble = "";
		let config = GlobalConfig.BubbleConfig[id];
		if( config ){
			switch ( config.type ){
				case BubbleType.B1://PaoPaoView内部处理
					bubble = config.news;
					break;
				case BubbleType.B2:
					if (config.news)
						UserSkill.ins().postShowSkillWord(config.news);
					break;
			}
		}
		return bubble;
	}

}
enum BubbleType{
	B1 = 1,//角色冒字
	B2 = 2,//冒艺术字 跟角色无关
}
