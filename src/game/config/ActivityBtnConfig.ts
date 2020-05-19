interface ActivityBtnConfig {
	type: number;
	sort: number;
	acTime: string;
	id: number;
	acDesc: string;
	icon: string;
	title: string;
	light: number;
	timeType: number;
	startTime: string;
	endTime: string;
	showType: number;
	activityType: number;
	showReward: { type: number, id: number, count: number }[];
	hfTimes: number;//第几次合服生效
	relyOn:number[];
	pageSkin:string;
	jump:any;//[窗口名,分页]
	listItem:string;
}