/**
 * Created by Peach.T on 2017/12/26.
 */
class GuardWeaponModel extends BaseClass {

	public leftTime: number;

	public challengeTimes: number;
	//是否显示扫荡按钮
	public isShowSweep: boolean = false;

	public guardCopyInfo: GuardCopyInfo = new GuardCopyInfo();

	public static ins(): GuardWeaponModel {
		return super.ins() as GuardWeaponModel;
	}

	public canChallenge(): boolean {
		return this.isOpen() && GlobalConfig.GuardGodWeaponConf.dailyCount > this.challengeTimes;
	}

	public isOpen(): boolean {
		let ary = GlobalConfig.GuardGodWeaponConf.opencondition;
		let zsLv = ary[0];
		let openDay = ary[1];
		return UserZs.ins().lv >= zsLv && (GameServer.serverOpenDay + 1) >= openDay;
	}

	//是否可见守护神剑
	public getCanSee(): boolean {
		let ary = GlobalConfig.GuardGodWeaponConf.opencondition;
		let openDay = ary[1];
		return (GameServer.serverOpenDay + 1) >= openDay;
	}

	public getDesc(): string {
		let ary = GlobalConfig.GuardGodWeaponConf.opencondition;
		let zsLv = ary[0];
		let openDay = ary[1];
		return `开服第${openDay}天并达到${zsLv}转开启`;
	}

	public getMaxWaves(): number {
		let list = GlobalConfig.GGWWaveConf[UserZs.ins().lv] || {};
		return Object.keys(list).length;
	}

	public getWaveTime(wave: number): number {
		if (wave == 0) return GlobalConfig.GuardGodWeaponConf.starDelayRsf;
		return GlobalConfig.GGWWaveConf[UserZs.ins().lv][wave].time;
	}

	public isCanCallBoss(): boolean {
		return this.getCallBossTimes() > 0;
	}

	public getCallBossTimes(): number {
		let wave = this.guardCopyInfo.wave;
		let times = 0;
		for (let i in GlobalConfig.GuardGodWeaponConf.sSummonLimit) {
			if (wave >= +i) {
				times += GlobalConfig.GuardGodWeaponConf.sSummonLimit[i] as number;
			}
		}
		return times - this.guardCopyInfo.callBossNum;
	}

	public callBossMoney(): number {
		let times = this.getCallBossTimes();
		return GlobalConfig.GuardGodWeaponConf.sSummonCost[times - 1];
	}

	public getKillWave(): number {
		return this.guardCopyInfo.wave;
	}

}
