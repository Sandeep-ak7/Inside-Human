import assert from "node:assert/strict";
import test from "node:test";
import { locales, localeCodes, defaultLocale, getLocale, isLocale } from "../app/i18n/config.ts";
import { organStructures } from "../app/lib/anatomy-data.ts";
import { buildOrgans, indexOrgans } from "../app/i18n/merge.ts";

test("Locale configuration defines all 12 supported languages", () => {
  assert.equal(locales.length, 12, "Should have 12 supported locales");
  assert.equal(defaultLocale, "en", "Default locale should be English");
  assert.deepEqual(localeCodes, [
    "en", "es", "hi", "zh", "ar", "pt", "fr", "de", "ja", "ru", "id", "ko"
  ]);

  for (const code of localeCodes) {
    assert.ok(isLocale(code), `isLocale("${code}") should return true`);
    const config = getLocale(code);
    assert.ok(config, `getLocale("${code}") should return a config`);
    assert.equal(config.code, code);
    assert.ok(config.nativeName.length > 0);
    assert.ok(["ltr", "rtl"].includes(config.dir));
  }

  assert.equal(getLocale("ar").dir, "rtl", "Arabic should be RTL");
  assert.equal(getLocale("en").dir, "ltr", "English should be LTR");
  assert.equal(isLocale("invalid-code"), false, "Invalid code should return false");
});

test("UI dictionaries load and contain all required sections for every locale", async () => {
  const expectedSections = [
    "meta", "brand", "nav", "search", "profile", "language",
    "library", "tools", "viewer", "info", "compare", "cards", "quiz", "modal"
  ];

  for (const code of localeCodes) {
    const { ui } = await import(`../app/i18n/ui/${code}.ts`);
    assert.ok(ui, `UI dictionary for ${code} should load`);

    for (const section of expectedSections) {
      assert.ok(ui[section], `UI dictionary for ${code} should have section "${section}"`);
    }

    assert.ok(ui.meta.title.includes("Inside Human"), `Title for ${code} should reference Inside Human`);
    assert.ok(ui.brand.home.includes("Inside Human"), `Brand home for ${code} should reference Inside Human`);
  }
});

test("Organ structures have valid 3D models, icons, and hotspots", () => {
  assert.equal(organStructures.length, 9, "Should define 9 organ specimens");

  for (const organ of organStructures) {
    assert.ok(organ.id, "Organ must have an id");
    assert.ok(organ.model.startsWith("/models/"), `Model path for ${organ.id} should be in /models/`);
    assert.ok(organ.model.endsWith(".glb"), `Model for ${organ.id} should be a .glb file`);
    assert.ok(organ.icon?.length > 0, `Organ ${organ.id} should have an icon`);
    assert.ok(organ.accent?.startsWith("#"), `Organ ${organ.id} should have a hex accent color`);
    assert.ok(organ.scientificName?.length > 0, `Organ ${organ.id} should have a scientific Latin name`);
    assert.ok(organ.hotspots.length > 0, `Organ ${organ.id} should define hotspots`);

    for (const hotspot of organ.hotspots) {
      assert.ok(hotspot.id, `Hotspot in ${organ.id} must have an id`);
      assert.ok(Array.isArray(hotspot.position) && hotspot.position.length === 3, `Hotspot position must be [x, y, z]`);
      assert.ok(hotspot.ta, `Hotspot ${hotspot.id} in ${organ.id} must have Latin TA term`);
    }
  }
});

test("Organ translations and hotspot details are complete across all 12 locales", async () => {
  for (const code of localeCodes) {
    const { organs } = await import(`../app/i18n/organs/${code}.ts`);
    assert.ok(organs, `Organ dictionary for ${code} should load`);

    for (const organ of organStructures) {
      const content = organs[organ.id];
      assert.ok(content, `Organ ${organ.id} translation should exist in ${code}`);
      assert.ok(content.name?.length > 0, `Organ ${organ.id} name must not be empty in ${code}`);
      assert.ok(content.system?.length > 0, `Organ ${organ.id} system must not be empty in ${code}`);
      assert.ok(content.function?.length > 0, `Organ ${organ.id} function must not be empty in ${code}`);
      assert.ok(content.description?.length > 0, `Organ ${organ.id} description must not be empty in ${code}`);
      assert.ok(Array.isArray(content.conditions) && content.conditions.length > 0, `Organ ${organ.id} conditions must exist in ${code}`);

      for (const hotspot of organ.hotspots) {
        const hotspotText = content.hotspots[hotspot.id];
        assert.ok(hotspotText, `Hotspot ${hotspot.id} for organ ${organ.id} must exist in ${code}`);
        assert.ok(hotspotText.label?.length > 0, `Hotspot ${hotspot.id} label in ${organ.id} must not be empty in ${code}`);
        assert.ok(hotspotText.detail?.length > 0, `Hotspot ${hotspot.id} detail in ${organ.id} must not be empty in ${code}`);
      }
    }
  }
});

test("buildOrgans and indexOrgans correctly assemble and index specimens", async () => {
  const { organs: enOrgans } = await import("../app/i18n/organs/en.ts");
  const assembled = buildOrgans(enOrgans);

  assert.equal(assembled.length, 9, "Should assemble all 9 organs");
  const heart = assembled.find((o) => o.id === "heart");
  assert.ok(heart, "Heart specimen should be assembled");
  assert.equal(heart.name, "Heart");
  assert.equal(heart.hotspots.length, 6, "Heart should have 6 hotspots");

  const indexed = indexOrgans(assembled);
  assert.equal(Object.keys(indexed).length, 9, "Indexed organs should contain all 9 keys");
  assert.equal(indexed["brain"].name, "Brain");
  assert.equal(indexed["lungs"].name, "Lungs");
});
