enum JobConst {
	/** 无 */
	None = 0,
	/** 战士 */
	ZhanShi = 1,
	/** 法师 */
	FaShi = 2,
	/** 术士 */
	DaoShi = 3
}

var JobTitleImg = [];
JobTitleImg[JobConst.ZhanShi] = "partner_word_wanyanzheng"; //战士
JobTitleImg[JobConst.FaShi] = "partner_word_wenjing";//法师
JobTitleImg[JobConst.DaoShi] = "partner_word_sikongqi";//术士