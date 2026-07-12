import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeaponConverter from "../components/WeaponConverter";
import type { UserEvent } from "@testing-library/user-event";

describe("原造型属性值显示功能", () => {
  /**
   * 测试原造型属性值的显示功能
   *
   * 主要验证：
   * 1. 当选择了原造型时，转换后应该显示查看原造型数据的按钮
   * 2. 点击按钮后应该正确显示原造型的属性值
   * 3. 原造型的属性值应该是第一步转换的结果
   * 4. 使用3组不同的武器数据确保测试的严谨性
   */

  // 武器数据组1
  const weaponData1 = {
    physical: 500,
    magic: 150,
    healing: 120,
  };

  // 武器数据组2
  const weaponData2 = {
    physical: 400,
    magic: 180,
    healing: 150,
  };

  // 武器数据组3
  const weaponData3 = {
    physical: 600,
    magic: 120,
    healing: 100,
  };

  const setupConversion = async (
    user: UserEvent,
    weaponData: { physical: number; magic: number; healing: number }
  ) => {
    // 设置武器数据
    const inputs = screen.getAllByRole("spinbutton");
    await user.clear(inputs[0]);
    await user.type(inputs[0], weaponData.physical.toString());
    await user.clear(inputs[2]);
    await user.type(inputs[2], weaponData.magic.toString());
    await user.clear(inputs[4]);
    await user.type(inputs[4], weaponData.healing.toString());

    // 获取所有选择器
    const selects = screen.getAllByRole("combobox");
    // selects[0] = 武器等级
    // selects[1] = 原造型
    // selects[2] = 转换前
    // selects[3] = 转换后

    return selects;
  };

  const setupBasicConversion = async (user: UserEvent) => {
    return setupConversion(user, weaponData1);
  };

  it("应该能够显示和隐藏原造型属性区域", async () => {
    render(<WeaponConverter />);
    const user = userEvent.setup();

    const selects = await setupBasicConversion(user);

    // 选择门派：天音寺 → 鬼王宗，使用刀作为原造型
    await user.selectOptions(selects[2], "天音寺"); // 转换前：天音寺
    await user.selectOptions(selects[3], "青云门"); // 转换后：青云门
    await user.selectOptions(selects[1], "刀"); // 原造型：刀（鬼王宗）

    // 执行转换
    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    // 等待转换结果显示
    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 验证查看原造型数据按钮存在
    const showOriginalDataButton = screen.getByTitle("查看原造型数据");
    expect(showOriginalDataButton).toBeInTheDocument();

    // 点击查看原造型数据按钮
    await user.click(showOriginalDataButton);

    // 等待原造型数据显示
    await waitFor(() => {
      expect(screen.getByText("原造型属性 (刀)")).toBeInTheDocument();
    });

    // 验证原造型区域存在并包含属性值
    const originalSection = screen
      .getByText("原造型属性 (刀)")
      .closest('[data-testid="original-form-attributes"]');
    expect(originalSection).toBeInTheDocument();

    // 验证原造型区域内有属性标签
    const physicalLabel = within(originalSection as HTMLElement).getByText(
      "物攻"
    );
    const magicLabel = within(originalSection as HTMLElement).getByText("法攻");
    const healingLabel = within(originalSection as HTMLElement).getByText(
      "治疗"
    );

    expect(physicalLabel).toBeInTheDocument();
    expect(magicLabel).toBeInTheDocument();
    expect(healingLabel).toBeInTheDocument();

    // 点击关闭按钮
    const closeButton = within(originalSection as HTMLElement).getByRole(
      "button"
    );
    await user.click(closeButton);

    // 验证原造型区域被隐藏
    await waitFor(() => {
      expect(screen.queryByText("原造型属性 (刀)")).not.toBeInTheDocument();
    });
  });

  it("当没有选择原造型时，不应该显示查看原造型数据按钮", async () => {
    render(<WeaponConverter />);
    const user = userEvent.setup();

    const selects = await setupBasicConversion(user);

    // 只选择转换前和转换后，不选择原造型
    await user.selectOptions(selects[2], "天音寺"); // 转换前
    await user.selectOptions(selects[3], "青云门"); // 转换后
    // 不选择原造型，保持默认的"无"

    // 执行转换
    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    // 等待转换结果显示
    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 验证查看原造型数据按钮不存在
    expect(screen.queryByTitle("查看原造型数据")).not.toBeInTheDocument();
  });

  it("应该正确显示封印武器作为原造型的属性值", async () => {
    render(<WeaponConverter />);
    const user = userEvent.setup();

    const selects = await setupBasicConversion(user);

    // 选择转换：天音寺 → 合欢门 → 青云门（使用短刃作为原造型）
    await user.selectOptions(selects[2], "天音寺"); // 转换前：天音寺
    await user.selectOptions(selects[3], "青云门"); // 转换后：青云门
    await user.selectOptions(selects[1], "短刃"); // 原造型：短刃（合欢门）

    // 执行转换
    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    // 等待转换结果显示
    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 点击查看原造型数据按钮
    const showOriginalDataButton = screen.getByTitle("查看原造型数据");
    await user.click(showOriginalDataButton);

    // 等待原造型数据显示
    await waitFor(() => {
      expect(screen.getByText("原造型属性 (短刃)")).toBeInTheDocument();
    });

    // 验证封印武器作为原造型时的属性值
    const originalSection = screen
      .getByText("原造型属性 (短刃)")
      .closest('[data-testid="original-form-attributes"]');
    expect(originalSection).toBeInTheDocument();

    // 封印武器作为原造型时，属性值应该与输入的原始值相同
    // 游戏武器规则：辅助与封系互转时三项属性保持不变。
    const physicalValue = within(originalSection as HTMLElement).getByText(
      "500"
    );
    const magicValue = within(originalSection as HTMLElement).getByText("150");
    const healingValue = within(originalSection as HTMLElement).getByText(
      "120"
    );

    expect(physicalValue).toBeInTheDocument();
    expect(magicValue).toBeInTheDocument();
    expect(healingValue).toBeInTheDocument();
  });

  it("应该正确显示物理武器作为原造型的属性值", async () => {
    render(<WeaponConverter />);
    const user = userEvent.setup();

    const selects = await setupBasicConversion(user);

    // 选择转换：天音寺 → 鬼王宗 → 青云门（使用刀作为原造型）
    await user.selectOptions(selects[2], "天音寺"); // 转换前：天音寺
    await user.selectOptions(selects[3], "青云门"); // 转换后：青云门
    await user.selectOptions(selects[1], "刀"); // 原造型：刀（鬼王宗）

    // 执行转换
    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    // 等待转换结果显示
    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 点击查看原造型数据按钮
    const showOriginalDataButton = screen.getByTitle("查看原造型数据");
    await user.click(showOriginalDataButton);

    // 等待原造型数据显示
    await waitFor(() => {
      expect(screen.getByText("原造型属性 (刀)")).toBeInTheDocument();
    });

    // 验证物理武器作为原造型时的属性值
    const originalSection = screen
      .getByText("原造型属性 (刀)")
      .closest('[data-testid="original-form-attributes"]');
    expect(originalSection).toBeInTheDocument();

    // 从天音寺转换到鬼王宗：治疗比例(120/192=0.625) → 物攻(665*0.625=416)
    // 其他属性保持不变，治疗值转换为144
    const physicalValue = within(originalSection as HTMLElement).getByText(
      "416"
    );
    const magicValue = within(originalSection as HTMLElement).getByText("150");
    const healingValue = within(originalSection as HTMLElement).getByText(
      "144"
    );

    expect(physicalValue).toBeInTheDocument();
    expect(magicValue).toBeInTheDocument();
    expect(healingValue).toBeInTheDocument();
  });

  it("应该正确显示法师武器作为原造型的属性值", async () => {
    render(<WeaponConverter />);
    const user = userEvent.setup();

    const selects = await setupBasicConversion(user);

    // 选择转换：天音寺 → 青云门 → 鬼王宗（使用剑作为原造型）
    await user.selectOptions(selects[2], "天音寺"); // 转换前：天音寺
    await user.selectOptions(selects[3], "鬼王宗"); // 转换后：鬼王宗
    await user.selectOptions(selects[1], "剑"); // 原造型：剑（青云门）

    // 执行转换
    const convertButton = screen.getByRole("button", { name: "转换" });
    await user.click(convertButton);

    // 等待转换结果显示
    await waitFor(() => {
      expect(screen.getByText("转换结果")).toBeInTheDocument();
    });

    // 点击查看原造型数据按钮
    const showOriginalDataButton = screen.getByTitle("查看原造型数据");
    await user.click(showOriginalDataButton);

    // 等待原造型数据显示
    await waitFor(() => {
      expect(screen.getByText("原造型属性 (剑)")).toBeInTheDocument();
    });

    // 验证法师武器作为原造型时的属性值
    const originalSection = screen
      .getByText("原造型属性 (剑)")
      .closest('[data-testid="original-form-attributes"]');
    expect(originalSection).toBeInTheDocument();

    // 从天音寺转换到青云门：治疗比例(120/192=0.625) → 法攻(210*0.625=131)
    // 其他属性保持不变，治疗值转换为137
    const physicalValue = within(originalSection as HTMLElement).getByText(
      "500"
    );
    const magicValue = within(originalSection as HTMLElement).getByText("131");
    const healingValue = within(originalSection as HTMLElement).getByText(
      "137"
    );

    expect(physicalValue).toBeInTheDocument();
    expect(magicValue).toBeInTheDocument();
    expect(healingValue).toBeInTheDocument();
  });

  // 使用不同武器数据的详细测试
  describe("多组武器数据的原造型属性值验证", () => {
    const testCases = [
      {
        name: "武器数据组1",
        data: weaponData1,
        expected: {
          // 1. 治疗→物理（通过物理原造型）
          healingToPhysical: { physical: 416, magic: 150, healing: 144 },
          // 2. 治疗→法师（通过法师原造型）
          healingToMagic: { physical: 500, magic: 131, healing: 137 },
          // 3. 治疗→封印（通过封印原造型）
          healingToSeal: { physical: 500, magic: 150, healing: 120 },
          // 4. 物理→治疗（通过治疗原造型）
          physicalToHealing: { physical: 416, magic: 150, healing: 144 },
          // 5. 物理→法师（通过法师原造型）
          physicalToMagic: { physical: 475, magic: 158, healing: 120 },
          // 6. 物理→封印（通过封印原造型）
          physicalToSeal: { physical: 500, magic: 150, healing: 120 },
          // 7. 法师→治疗（通过治疗原造型）
          magicToHealing: { physical: 500, magic: 131, healing: 137 },
          // 8. 法师→物理（通过物理原造型）
          magicToPhysical: { physical: 475, magic: 158, healing: 120 },
          // 9. 法师→封印（通过封印原造型）
          magicToSeal: { physical: 500, magic: 150, healing: 120 },
          // 10. 封印→治疗（通过治疗原造型）
          sealToHealing: { physical: 500, magic: 150, healing: 120 },
          // 11. 封印→物理（通过物理原造型）
          sealToPhysical: { physical: 500, magic: 150, healing: 120 },
          // 12. 封印→法师（通过法师原造型）
          sealToMagic: { physical: 500, magic: 150, healing: 120 },
        },
      },
      {
        name: "武器数据组2",
        data: weaponData2,
        expected: {
          // 1. 治疗→物理（通过物理原造型）
          healingToPhysical: { physical: 520, magic: 180, healing: 115 },
          // 2. 治疗→法师（通过法师原造型）
          healingToMagic: { physical: 400, magic: 164, healing: 165 },
          // 3. 治疗→封印（通过封印原造型）
          healingToSeal: { physical: 400, magic: 180, healing: 150 },
          // 4. 物理→治疗（通过治疗原造型）
          physicalToHealing: { physical: 520, magic: 180, healing: 115 },
          // 5. 物理→法师（通过法师原造型）
          physicalToMagic: { physical: 570, magic: 126, healing: 150 },
          // 6. 物理→封印（通过封印原造型）
          physicalToSeal: { physical: 400, magic: 180, healing: 150 },
          // 7. 法师→治疗（通过治疗原造型）
          magicToHealing: { physical: 400, magic: 164, healing: 165 },
          // 8. 法师→物理（通过物理原造型）
          magicToPhysical: { physical: 570, magic: 126, healing: 150 },
          // 9. 法师→封印（通过封印原造型）
          magicToSeal: { physical: 400, magic: 180, healing: 150 },
          // 10. 封印→治疗（通过治疗原造型）
          sealToHealing: { physical: 400, magic: 180, healing: 150 },
          // 11. 封印→物理（通过物理原造型）
          sealToPhysical: { physical: 400, magic: 180, healing: 150 },
          // 12. 封印→法师（通过法师原造型）
          sealToMagic: { physical: 400, magic: 180, healing: 150 },
        },
      },
      {
        name: "武器数据组3",
        data: weaponData3,
        expected: {
          // 1. 治疗→物理（通过物理原造型）
          healingToPhysical: { physical: 346, magic: 120, healing: 173 },
          // 2. 治疗→法师（通过法师原造型）
          healingToMagic: { physical: 600, magic: 109, healing: 110 },
          // 3. 治疗→封印（通过封印原造型）
          healingToSeal: { physical: 600, magic: 120, healing: 100 },
          // 4. 物理→治疗（通过治疗原造型）
          physicalToHealing: { physical: 346, magic: 120, healing: 173 },
          // 5. 物理→法师（通过法师原造型）
          physicalToMagic: { physical: 380, magic: 189, healing: 100 },
          // 6. 物理→封印（通过封印原造型）
          physicalToSeal: { physical: 600, magic: 120, healing: 100 },
          // 7. 法师→治疗（通过治疗原造型）
          magicToHealing: { physical: 600, magic: 109, healing: 110 },
          // 8. 法师→物理（通过物理原造型）
          magicToPhysical: { physical: 380, magic: 189, healing: 100 },
          // 9. 法师→封印（通过封印原造型）
          magicToSeal: { physical: 600, magic: 120, healing: 100 },
          // 10. 封印→治疗（通过治疗原造型）
          sealToHealing: { physical: 600, magic: 120, healing: 100 },
          // 11. 封印→物理（通过物理原造型）
          sealToPhysical: { physical: 600, magic: 120, healing: 100 },
          // 12. 封印→法师（通过法师原造型）
          sealToMagic: { physical: 600, magic: 120, healing: 100 },
        },
      },
    ];

    const combinations = [
      // 1-3: 治疗作为起始
      {
        from: "天音寺",
        via: "刀",
        to: "青云门",
        key: "healingToPhysical",
        name: "治疗→物理",
      },
      {
        from: "天音寺",
        via: "剑",
        to: "鬼王宗",
        key: "healingToMagic",
        name: "治疗→法师",
      },
      {
        from: "天音寺",
        via: "短刃",
        to: "青云门",
        key: "healingToSeal",
        name: "治疗→封印",
      },
      // 4-6: 物理作为起始
      {
        from: "鬼王宗",
        via: "禅杖",
        to: "青云门",
        key: "physicalToHealing",
        name: "物理→治疗",
      },
      {
        from: "鬼王宗",
        via: "剑",
        to: "天音寺",
        key: "physicalToMagic",
        name: "物理→法师",
      },
      {
        from: "鬼王宗",
        via: "短刃",
        to: "天音寺",
        key: "physicalToSeal",
        name: "物理→封印",
      },
      // 7-9: 法师作为起始
      {
        from: "青云门",
        via: "禅杖",
        to: "鬼王宗",
        key: "magicToHealing",
        name: "法师→治疗",
      },
      {
        from: "青云门",
        via: "刀",
        to: "天音寺",
        key: "magicToPhysical",
        name: "法师→物理",
      },
      {
        from: "青云门",
        via: "短刃",
        to: "鬼王宗",
        key: "magicToSeal",
        name: "法师→封印",
      },
      // 10-12: 封印作为起始
      {
        from: "合欢门",
        via: "禅杖",
        to: "青云门",
        key: "sealToHealing",
        name: "封印→治疗",
      },
      {
        from: "合欢门",
        via: "刀",
        to: "青云门",
        key: "sealToPhysical",
        name: "封印→物理",
      },
      {
        from: "合欢门",
        via: "剑",
        to: "天音寺",
        key: "sealToMagic",
        name: "封印→法师",
      },
    ];

    testCases.forEach(({ name, data, expected }) => {
      describe(name, () => {
        combinations.forEach(
          ({ from, via, to, key, name: testName }, index) => {
            it(`${index + 1}/12: ${testName}`, async () => {
              render(<WeaponConverter />);
              const user = userEvent.setup();

              const selects = await setupConversion(user, data);

              // 选择转换配置
              await user.selectOptions(selects[2], from); // 转换前
              await user.selectOptions(selects[3], to); // 转换后
              await user.selectOptions(selects[1], via); // 原造型

              // 执行转换
              const convertButton = screen.getByRole("button", {
                name: "转换",
              });
              await user.click(convertButton);

              await waitFor(() => {
                expect(screen.getByText("转换结果")).toBeInTheDocument();
              });

              // 点击查看原造型数据按钮
              const showOriginalDataButton =
                screen.getByTitle("查看原造型数据");
              await user.click(showOriginalDataButton);

              await waitFor(() => {
                expect(
                  screen.getByText(`原造型属性 (${via})`)
                ).toBeInTheDocument();
              });

              // 验证属性值
              const originalSection = screen
                .getByText(`原造型属性 (${via})`)
                .closest('[data-testid="original-form-attributes"]');

              const expectedData = expected[key as keyof typeof expected];
              const physicalValue = within(
                originalSection as HTMLElement
              ).getByText(expectedData.physical.toString());
              const magicValue = within(
                originalSection as HTMLElement
              ).getByText(expectedData.magic.toString());
              const healingValue = within(
                originalSection as HTMLElement
              ).getByText(expectedData.healing.toString());

              expect(physicalValue).toBeInTheDocument();
              expect(magicValue).toBeInTheDocument();
              expect(healingValue).toBeInTheDocument();
            });
          }
        );
      });
    });
  });
});
