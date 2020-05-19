
class DailyInviteInfoRecordModel {

    /** 所有的邀请记录 */
    public infoModels: DailyInviteInfoModel[] = [];

    /**
     * 解析邀请成功列表
     * @param bytes 
     */
    public parserData(bytes: GameByteArray): void {
        
        this.infoModels = [];

        let count: number = bytes.readShort();
        
        for (let i: number = 0; i < count; i++) {
            let data = new DailyInviteInfoModel();
            data.parserData(bytes);
            this.infoModels.push(data);
        }
    }

    /**
     * 更新邀请成功记录
     * @param bytes 
     */
    public updateInfo(bytes: GameByteArray): void { 

        let data = new DailyInviteInfoModel();
        data.parserData(bytes);
        this.infoModels.push(data);
    }
}