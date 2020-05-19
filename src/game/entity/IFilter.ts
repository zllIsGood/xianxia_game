/**
 * Created by hrz on 2017/7/11.
 * 实体滤镜接口
 */

interface IFilter {
    hasFilter(filter:EntityFilter):boolean;

    addFilter(filter:EntityFilter):void;
    removeFilter(filter:EntityFilter):void;

    //设置滤镜显示
    setFilter(filter:EntityFilter):void;

    getFilters():EntityFilter[];

    removeAllFilters():void;
}