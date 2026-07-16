import { SectEnum } from "../../types";
import {
  CONTENT_ITEM_IDS,
  CONTENT_VERIFIED_AT,
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
      SECT_PROFILES.length + GUIDE_ENTRIES.length
    );
  });
});
