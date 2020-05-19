/**
 * 跨服竞技场匹配
 */
class KfArenaMacthPanel extends BaseEuiView {
	public roleGroup: eui.Group;
	public member1: KfArenaRoleItemRender;
	public member2: KfArenaRoleItemRender;
	public leader: KfArenaRoleItemRender;
	public memberArr: KfArenaRoleItemRender[];
	public duanLabel: eui.Label;
	public scoreLabel: eui.Label;
	public curMonthLabel: eui.Label;
	public historyLabel: eui.Label;
	public winRateLbl: eui.Label;
	public countLabel: eui.Label;
	public dailyTime: eui.Label;
	public maxTime: eui.Label;
	public disBtn: eui.Button;
	public macthBtn: eui.Button;
	public macthingLabel: eui.Label;
	private waitGroup: eui.Group;
	private matchGroup: eui.Group;
	public actTime: eui.Label;


	//段位信息组件
	public duanTxt: eui.Label;
	public progressImg: eui.Image;
	public scoreProgressTxt: eui.Label;
	public duanImg: eui.Image;
	public nextDuanTxt: eui.Label;
	public duanGroup: eui.Group;
	private cirleMask: egret.Shape;
	private cirleGroup: eui.Group;
	// private pointer: eui.Image;

	private radius: number = 0;

	constructor() {
		super();
		this.name = `匹配`;
	}

	protected childrenCreated() {
		this.initUI();
	}

	public initUI(): void {
		super.initUI();
		this.memberArr = [this.leader, this.member1, this.member2];
		this.dailyTime.text = `${GlobalConfig.CrossArenaBase.joinCount}`;
		this.maxTime.text = `${GlobalConfig.CrossArenaBase.maxJoinCount}`;
		this.cirleMask = new egret.Shape();
		this.radius = this.cirleGroup.width >> 1;

		this.cirleMask.x = this.cirleMask.y = this.radius;
		this.cirleMask.rotation = 120;
		this.cirleGroup.addChild(this.cirleMask);

		this.progressImg.mask = this.cirleMask;
	}

	public open(): void {
		this.addTouchEvent(this.disBtn, this.onTouch);
		this.addTouchEvent(this.macthBtn, this.onTouch);
		this.observe(KfArenaSys.ins().postPlayerInfo, this.updateInfo);
		this.observe(KfArenaSys.ins().postTeamInfo, this.update);
		this.observe(KfArenaSys.ins().postMacthState, this.update);
		this.update();
	}


	private update(): void {
		this.updateMember();
		this.updateInfo();
		this.updateBtnState();
	}

	/** 更新成员信息*/
	private updateMember(): void {
		this.roleGroup.visible = KfArenaSys.ins().getIsJoinTeam();
		for (let member of this.memberArr) {
			member.data = null;
		}

		let tfMembers = KfArenaSys.ins().tfMembers;
		let index: number = 1;
		if (tfMembers && tfMembers.length) {
			for (let i = 0; i < tfMembers.length; i++) {
				let data: KfArenaRoleVo = tfMembers[i];
				let isLeader = data.isLeader();
				if (isLeader) {
					this.leader.data = data;
				}
				else {
					this.memberArr[index].data = data;
					index++;
				}
			}
		}
	}

	/** 更新竞技场信息*/
	private updateInfo(): void {
		let ins: KfArenaSys = KfArenaSys.ins();
		this.duanLabel.textFlow = TextFlowMaker.generateTextFlow(`当前段位：|C:${0xF8b141}&T:${ins.getDuanName()}|`);
		this.scoreLabel.textFlow = TextFlowMaker.generateTextFlow(`当前积分：|C:${0x9F946D}&T:${ins.score}|`);
		this.curMonthLabel.textFlow = TextFlowMaker.generateTextFlow(`当前战绩：|C:${0x9F946D}&T:${ins.curMouth.win}胜${ins.curMouth.ping}平${ins.curMouth.fail}败|`);
		this.historyLabel.textFlow = TextFlowMaker.generateTextFlow(`历史战绩：|C:${0x9F946D}&T:${ins.history.win}胜${ins.history.ping}平${ins.history.fail}败|`);
		this.winRateLbl.textFlow = TextFlowMaker.generateTextFlow(`当前胜率：|C:${0xF8b141}&T:${ins.getWinRate()}|`);
		this.countLabel.text = `${ins.times}`;
		this.macthingLabel.visible = ins.macthState == 1;


		this.duanTxt.text = ins.getDuanName();
		this.duanImg.source = `kfarena_rank_img_${(ins.duanLevel - 1) / 3 >> 0}`;
		let totalScore = GlobalConfig.CrossArenaBase.scoreMetal[ins.duanLevel];
		if (totalScore) {
			this.scoreProgressTxt.text = `${ins.score}/${totalScore}`;
			this.nextDuanTxt.text = `再获得${totalScore - ins.score}积分晋升到${ins.getDuanName(ins.duanLevel + 1)}`;
		}
		else {
			//拿最后一级别
			totalScore = GlobalConfig.CrossArenaBase.scoreMetal[ins.duanLevel - 1];
			this.scoreProgressTxt.text = `${ins.score}/${GlobalConfig.CrossArenaBase.scoreMetal[ins.duanLevel - 1]}`;
			this.nextDuanTxt.text = `当前已达最高阶`;
		}

		//以300度为主
		this.setScorePro(ins.score / totalScore * 300 >> 0);
	}

	public setScorePro(value: number) {
		//设置最大值
		value = value > 300 ? 300 : value;
		DisplayUtils.drawCir(this.cirleMask, this.radius, value);
		// this.pointer.rotation = value;
	}

	/**更新按钮的状态 */
	private updateBtnState(): void {
		let isJoinTeam: boolean = KfArenaSys.ins().getIsJoinTeam();
		this.waitGroup.visible = !isJoinTeam;
		this.matchGroup.visible = isJoinTeam;
		if (!isJoinTeam) {
			this.disBtn.label = `创建战队`;
			this.macthBtn.label = `单人匹配`;
		}
		else {
			if (KfArenaSys.ins().isTFCaptain)
				this.disBtn.label = `解散战队`;
			else
				this.disBtn.label = `离开战队`;
			if (KfArenaSys.ins().macthState == 1)
				this.macthBtn.label = `取消匹配`;
			else
				this.macthBtn.label = `开始匹配`;
		}
	}

	protected onTouch(e: egret.Event): void {
		switch (e.target) {
			case this.disBtn:
				if (KfArenaSys.ins().isStartIng == 0) {
					UserTips.ins().showCenterTips(GlobalConfig.CrossArenaBase.hintTxt);
					return;
				}
				//创建队伍
				if (!KfArenaSys.ins().getIsJoinTeam()) {
					KfArenaSys.ins().sendCreateTeam();
					return;
				}
				//解散队伍
				KfArenaSys.ins().sendLeaveTeam();
				break;
			case this.macthBtn:
				let ins: KfArenaSys = KfArenaSys.ins();
				//取消匹配
				if (ins.macthState == 1) {
					if (!ins.isTFCaptain) {
						UserTips.ins().showCenterTips(`只有队长才可以取消匹配`);
						return;
					}
					ins.sendCancelMacth();
					return;
				}
				if (KfArenaSys.ins().isStartIng == 0) {
					UserTips.ins().showCenterTips(GlobalConfig.CrossArenaBase.hintTxt);
					return;
				}
				//单人匹配
				if (!ins.getIsJoinTeam()) {
					ins.sendPersonalMatch();
					return;
				}
				//开始匹配
				if (!ins.isTFCaptain) {
					UserTips.ins().showCenterTips(`只有队长才可以开始匹配`);
					return;
				}
				let str: string = ins.getIsNoOnline();
				if (str != "") {
					UserTips.ins().showCenterTips(`${str}离线了，请稍后匹配`);
					return;
				}
				ins.sendStartMacth();
				break;
		}
	}
}
