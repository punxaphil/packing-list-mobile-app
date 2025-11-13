import { NamedEntity } from "~/types/NamedEntity.ts";
import { PackingListSummary } from "./types.ts";

const PASTEL_BASE = 206;
const PASTEL_RANGE = 44;

type RankedEntity = { id: string; rank?: number | null };

export const buildListColors = (lists: PackingListSummary[]) => {
    return assignColors(lists);
};

export const buildCategoryColors = (categories: NamedEntity[]) => {
    return assignColors(categories);
};

const assignColors = (entities: RankedEntity[]) => {
    const colors: Record<string, string> = {};
    entities.forEach((entity, index) => {
        const seed = buildSeed(entity, index);
        colors[entity.id] = createPastel(seed);
    });
    return colors;
};

const buildSeed = (entity: RankedEntity, index: number) => (hashId(entity.id) << 5) ^ ((Math.abs(entity.rank ?? index) << 2) ^ index);

const hashId = (id: string) => {
    let total = 0;
    for (let pointer = 0; pointer < id.length; pointer += 1) total = (total * 33 + id.charCodeAt(pointer)) & 0xffff;
    return total;
};

const createPastel = (seed: number) => {
    const red = pastelChannel(seed);
    const green = pastelChannel(seed >> 3);
    const blue = pastelChannel(seed >> 6);
    return `#${toHex(red)}${toHex(green)}${toHex(blue)}`;
};

const pastelChannel = (seed: number) => PASTEL_BASE + (seed % PASTEL_RANGE);

const toHex = (value: number) => value.toString(16).padStart(2, "0");
