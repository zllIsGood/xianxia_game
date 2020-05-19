module ForgeConst {
	/** 可锻造的装备索引 */
	export const CAN_FORGE_EQUIP: number[] =
		[
			EquipPos.WEAPON,
			EquipPos.HEAD,
			EquipPos.CLOTHES,
			EquipPos.NECKLACE,
			EquipPos.Wrist,
			EquipPos.BRACELET,
			EquipPos.RING,
			EquipPos.SHOE,
			//玄玉装备不可锻造
		];

	/** 装备索引对应的子类型 */
	export const EQUIP_POS_TO_SUB: number[] = [];
	EQUIP_POS_TO_SUB[EquipPos.WEAPON] = 0;
	EQUIP_POS_TO_SUB[EquipPos.HEAD] = 1;
	EQUIP_POS_TO_SUB[EquipPos.CLOTHES] = 2;
	EQUIP_POS_TO_SUB[EquipPos.NECKLACE] = 3;
	EQUIP_POS_TO_SUB[EquipPos.Wrist] = 4;
	EQUIP_POS_TO_SUB[EquipPos.BRACELET] = 5;
	EQUIP_POS_TO_SUB[EquipPos.RING] = 6;
	EQUIP_POS_TO_SUB[EquipPos.SHOE] = 7;
	EQUIP_POS_TO_SUB[EquipPos.DZI] = 8;
	EQUIP_POS_TO_SUB[EquipPos.HAT] = 9;
	EQUIP_POS_TO_SUB[EquipPos.VIZARD] = 10;
	EQUIP_POS_TO_SUB[EquipPos.CLOAK] = 11;
	EQUIP_POS_TO_SUB[EquipPos.SHIELD] = 12;
}