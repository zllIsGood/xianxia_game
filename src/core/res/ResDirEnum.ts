/**
 * Created by Administrator on 2017/1/14.
 */
// const RES_DIR = `resource/res/`;
// const MAP_DIR = `resource/map/`;
// const RES_DIR_BLOOD = `${RES_DIR}blood/`;
// const RES_DIR_BODY = `${RES_DIR}body/`;
// const RES_DIR_EFF = `${RES_DIR}eff/`;
// const RES_DIR_ITEM = `${RES_DIR}item/`;
// const RES_DIR_MONSTER = `${RES_DIR}monster/`;
// const RES_DIR_SKILL = `${RES_DIR}skill/`;
// const RES_DIR_SKILLEFF = `${RES_DIR}skilleff/`;
// const RES_DIR_WARSPIRIT = `${RES_DIR}warspirit/`;
// const RES_DIR_WEAPON = `${RES_DIR}weapon/`;
// const RES_DIR_WING = `${RES_DIR}wing/`;
// const RES_DIR_CITY = `${RES_DIR}city/`;

declare let RES_RESOURCE;
declare let RES_DIR;
declare let MAP_DIR;
declare let RES_DIR_BLOOD;
declare let RES_DIR_BODY;
declare let RES_DIR_EFF;
declare let RES_DIR_ITEM;
declare let RES_DIR_MONSTER;
declare let RES_DIR_SKILL;
declare let RES_DIR_SKILLEFF;
declare let RES_DIR_WARSPIRIT;
declare let RES_DIR_WEAPON;
declare let RES_DIR_WING;
declare let RES_DIR_CITY;
declare let RES_DIR_WEATHER;
declare let RES_DIR_FOOTSTEP;
declare let RES_DIR_FLYSWORD;
declare let RES_DIR_PARTICLE;
declare let RES_DIR_FLOWER;

Object.defineProperty(this, "RES_RESOURCE", {
    get: function () {
        if (LocationProperty.ver_res == 1) {
            return `resource1/`
        }
        return `resource/`;
    }
});
Object.defineProperty(this, "RES_DIR", {
    get: function () {
        if (LocationProperty.ver_res == 1) {
            return `${RES_RESOURCE}res1/`
        }
        return `${RES_RESOURCE}res/`;
    }
});
Object.defineProperty(this, "MAP_DIR", {
    get: function () {
        if (LocationProperty.ver_res == 1) {
            return `${RES_RESOURCE}map1/`
        }
        return `${RES_RESOURCE}map/`;
    }
});
Object.defineProperty(this, "RES_DIR_BLOOD", {
    get: function () {
        return `${RES_DIR}blood/`;
    }
});
Object.defineProperty(this, "RES_DIR_BODY", {
    get: function () {
        return `${RES_DIR}body/`;
    }
});
Object.defineProperty(this, "RES_DIR_EFF", {
    get: function () {
        return `${RES_DIR}eff/`;
    }
});
Object.defineProperty(this, "RES_DIR_ITEM", {
    get: function () {
        return `${RES_DIR}item/`;
    }
});
Object.defineProperty(this, "RES_DIR_MONSTER", {
    get: function () {
        return `${RES_DIR}monster/`;
    }
});
Object.defineProperty(this, "RES_DIR_SKILL", {
    get: function () {
        return `${RES_DIR}skill/`;
    }
});
Object.defineProperty(this, "RES_DIR_SKILLEFF", {
    get: function () {
        return `${RES_DIR}skilleff/`;
    }
});
Object.defineProperty(this, "RES_DIR_WARSPIRIT", {
    get: function () {
        return `${RES_DIR}warspirit/`;
    }
});
Object.defineProperty(this, "RES_DIR_WEAPON", {
    get: function () {
        return `${RES_DIR}weapon/`;
    }
});
Object.defineProperty(this, "RES_DIR_WING", {
    get: function () {
        return `${RES_DIR}wing/`;
    }
});
Object.defineProperty(this, "RES_DIR_FOOTSTEP", {
    get: function () {
        return `${RES_DIR}footstep/`;
    }
});
Object.defineProperty(this, "RES_DIR_CITY", {
    get: function () {
        return `${RES_DIR}city/`;
    }
});
Object.defineProperty(this, "RES_DIR_WEATHER", {
    get: function () {
        return `${RES_DIR}weather/`;
    }
});
Object.defineProperty(this, "RES_DIR_FLYSWORD", {
    get: function () {
        return `${RES_DIR}flysword/`;
    }
});
Object.defineProperty(this, "RES_DIR_PARTICLE", {
    get: function () {
        return `${RES_DIR}particle/`;
    }
});
Object.defineProperty(this, "RES_DIR_FLOWER", {
    get: function () {
        return `${RES_DIR}flower/`;
    }
});