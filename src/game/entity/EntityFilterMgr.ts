/**
 * Created by hrz on 2017/7/11.
 */

enum EntityFilter {
    no = 0, //无
    hard = 1, //石化
    poison = 2, //中毒
}

class EntityFilterMgr {
    // 滤镜优先级 数值越小优先级越高
    static buffFilter = {
        1: {
            filters: FilterUtil.ARRAY_GRAY_FILTER,
            priority: 1
        },
        2: {
            filters: FilterUtil.ARRAY_GREEN_FILTER,
            priority: 2
        }
    }

    static addFilter(target: IFilter, filter: EntityFilter) {
        if (egret.Capabilities.renderMode != "webgl") return;
        let filters = target.getFilters();
        if (!target.hasFilter(filter)) {
            filters.push(filter);
            filters.sort(EntityFilterMgr.sortFilter);
        }
        target.setFilter(filters[0]);
    }

    static removeFilter(target: IFilter, filter: EntityFilter) {
        if (egret.Capabilities.renderMode != "webgl") return;
        let filters = target.getFilters();
        if (target.hasFilter(filter)) {
            filters.splice(filters.indexOf(filter), 1);
        }
        if (filters.length) {
            target.setFilter(filters[0])
        } else {
            target.setFilter(EntityFilter.no);
        }
    }

    static sortFilter(a: EntityFilter, b: EntityFilter) {
        if (egret.Capabilities.renderMode != "webgl") return;
        if (EntityFilterMgr.buffFilter[a].priority < EntityFilterMgr.buffFilter[b].priority) {
            return -1;
        } else if (EntityFilterMgr.buffFilter[a].priority > EntityFilterMgr.buffFilter[b].priority) {
            return 1;
        }
        return 0;
    }
}