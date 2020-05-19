/**
 * Created by Administrator on 2016/8/22.
 */
class MiJiSkillConfig {
	id: number;
	p1: number;
	p2: number;
	p3: number;
	item: number;
	job: number;
	power: number;

	static getSkillIDByItem(itemID: number): number {

		let arr: MiJiSkillConfig[] = GlobalConfig.MiJiSkillConfig;

		for (let i in arr) {
			if (arr[i].item == itemID)
				return arr[i].id;
		}
		return -1;
	}
}