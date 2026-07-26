import { SectEnum } from "../../types";
import {
  COMPANION_ENTRIES,
  CONTENT_ITEM_IDS,
  CONTENT_VERIFIED_AT,
  EQUIPMENT_ENTRIES,
  GUIDE_ENTRIES,
  SECT_PROFILES,
} from "../content";

describe("官网内容快照", () => {
  it("应该覆盖全部现有门派且不重复", () => {
    const ids = SECT_PROFILES.map(({ id }) => id);

    expect(new Set(ids).size).toBe(Object.values(SectEnum).length);
    expect(new Set(ids)).toEqual(new Set(Object.values(SectEnum)));
  });

  it("每条内容都应该有可追溯的 HTTPS 来源和日期", () => {
    const sources = [
      ...SECT_PROFILES.map(({ source }) => source),
      ...EQUIPMENT_ENTRIES.map(({ source }) => source),
      ...COMPANION_ENTRIES.map(({ source }) => source),
      ...GUIDE_ENTRIES.map(({ source }) => source),
    ];

    for (const source of sources) {
      expect(source.title.length).toBeGreaterThan(0);
      expect(source.url).toMatch(/^https:\/\//);
      expect(source.publishedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
    expect(CONTENT_VERIFIED_AT).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("应该为所有可收藏内容生成唯一 ID", () => {
    expect(CONTENT_ITEM_IDS.size).toBe(
      SECT_PROFILES.length +
        EQUIPMENT_ENTRIES.length +
        COMPANION_ENTRIES.length +
        GUIDE_ENTRIES.length,
    );
  });

  it("装备、灵兽和坐骑资料应该具有唯一 ID 与必要说明", () => {
    const ids = [
      ...EQUIPMENT_ENTRIES.map(({ id }) => id),
      ...COMPANION_ENTRIES.map(({ id }) => id),
    ];

    expect(new Set(ids).size).toBe(ids.length);
    expect(EQUIPMENT_ENTRIES.length).toBeGreaterThan(0);
    expect(COMPANION_ENTRIES.some(({ kind }) => kind === "灵兽")).toBe(true);
    expect(COMPANION_ENTRIES.some(({ kind }) => kind === "坐骑")).toBe(true);

    for (const entry of [...EQUIPMENT_ENTRIES, ...COMPANION_ENTRIES]) {
      expect(entry.title.length).toBeGreaterThan(0);
      expect(entry.availability.length).toBeGreaterThan(0);
      expect(entry.summary.length).toBeGreaterThan(0);
    }
  });
});
