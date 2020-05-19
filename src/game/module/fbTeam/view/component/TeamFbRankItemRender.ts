/**
 * 组队副本通关排名
 * @author wanghengshuai
 * 
 */
class TeamFbRankItemRender extends BaseItemRender{
	
	public member:eui.Group;
	public img0:eui.Image;
	public nameTxt0:eui.Label;
	public img1:eui.Image;
	public nameTxt1:eui.Label;
	public img2:eui.Image;
	public nameTxt2:eui.Label;
	public fubenName:eui.Label;
	public noteam:eui.Label;

	public constructor() {
		super();
		this.skinName = "teamFbRankItem";
	}

	public dataChanged():void
	{
		//{configID:number, members:{position:number, roleName:string}[]}
		if (this.data)
		{
			this.member.visible = true;
			this.noteam.visible = false;
			this.fubenName.text = GlobalConfig.TeamFuBenConfig[this.data.configID].name;
			let img:eui.Image;
			let lbl:eui.Label;
			let len:number = this.data.members.length;
			for (let i:number = 0; i < 3; i++)
			{
				img = this["img" + i];
				lbl = this["nameTxt" + i];
				if (i + 1 <= len)
				{
					img.source = this.data.members[i].position == 1 ? "tfb_leader" : (this.data.members[0].position == 2 ? "tfb_assistant" : "");
					lbl.text = this.data.members[i].roleName;
				}
				else
				{
					img.source = "";
					lbl.text = "";
				}
			}
		}
		else
		{
			this.member.visible = false;
			this.noteam.visible = true;
		}
	}
}