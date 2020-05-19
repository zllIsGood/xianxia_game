/**
 * 组队副本战斗界面玩家信息
 * @author wanghengshuai
 *
 */
class TeamFbMemberItemRender extends BaseItemRender {

    public namebg: eui.Image;
    public roleHead: eui.Image;
    public roleName: eui.Label;
    public fuhuoImg: eui.Image;

    public constructor() {
        super();
        this.skinName = "teamFbMemberSkin";
    }

    public dataChanged(): void {
        let roleList: CharRole[] = this.data;
        this.fuhuoImg.visible = false;

        let len: number = roleList.length;
        let hasRole: boolean;
        for (let i: number = 0; i < len; i++) {
            if (roleList[i].infoModel.getAtt(AttributeType.atHp) > 0) {
                hasRole = true;
                this.updateRole(roleList[i]);
                break;
            }
        }

        if (!hasRole) {
            this.updateRole(roleList[0]);
            this.fuhuoImg.visible = true;
        }

    }

    private updateRole(role: CharRole): void {
        let info: Role = <Role>role.infoModel;
        this.roleName.text = info.name;
        this.roleHead.source = `main_role_head${info.job}`
    }
}