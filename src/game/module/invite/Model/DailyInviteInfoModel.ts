
class DailyInviteInfoModel {

    public playerNick: string;

    public award: number;

    public index: number;

    public parserData(bytes: GameByteArray): void {
        this.playerNick = bytes.readString();
        this.award = bytes.readByte();
        this.index = bytes.readShort();
    }

}