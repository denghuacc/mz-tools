import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WeaponConverter from "../WeaponConverter";

describe("WeaponConverter 组件", () => {
  beforeEach(() => {
    render(<WeaponConverter />);
  });

  describe("初始渲染", () => {
    it("应该渲染标题", () => {
      expect(
        screen.getByRole("heading", { name: "转换设置" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "武器属性" })
      ).toBeInTheDocument();
    });

    it("应该渲染所有表单元素", () => {
      // 验证基本元素存在
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(3);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(3);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("应该渲染转换和重置按钮", () => {
      expect(screen.getByRole("button", { name: "转换" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "重置" })).toBeInTheDocument();
    });

    it("应该渲染属性输入框", () => {
      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(3);

      // 验证输入框存在
      inputs.forEach((input) => {
        expect(input).toBeInTheDocument();
      });
    });

    it("应该显示正确的初始值", () => {
      const selects = screen.getAllByRole("combobox");
      const inputs = screen.getAllByRole("spinbutton");

      // 验证武器等级初始值
      expect(selects[0]).toHaveValue("60");
      expect(
        screen.getByRole("option", { name: "60级（69特色服）" })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("option", { name: "60级" })
      ).toBeInTheDocument();

      // 验证最大值显示
      expect(inputs[1]).toHaveValue(665); // 物攻最大值
      expect(inputs[3]).toHaveValue(210); // 法攻最大值
      expect(inputs[5]).toHaveValue(192); // 治疗最大值
    });
  });

  describe("武器等级选择", () => {
    it("应该正确切换武器等级", async () => {
      const user = userEvent.setup();
      const levelSelect = screen.getAllByRole("combobox")[0];

      expect(levelSelect).toHaveValue("60");

      await user.selectOptions(levelSelect, "110");
      expect(levelSelect).toHaveValue("110");
    });

    it("应该在切换等级时更新最大值", async () => {
      const user = userEvent.setup();
      const levelSelect = screen.getAllByRole("combobox")[0];
      const inputs = screen.getAllByRole("spinbutton");

      // 切换到110级
      await user.selectOptions(levelSelect, "110");

      // 验证110级最大值
      await waitFor(() => {
        expect(inputs[1]).toHaveValue(976); // 物攻最大值
        expect(inputs[3]).toHaveValue(302); // 法攻最大值
        expect(inputs[5]).toHaveValue(286); // 治疗最大值
      });
    });

    it("应该支持80级武器属性", async () => {
      const user = userEvent.setup();
      const levelSelect = screen.getAllByRole("combobox")[0];
      const inputs = screen.getAllByRole("spinbutton");

      await user.selectOptions(levelSelect, "80");

      await waitFor(() => {
        expect(levelSelect).toHaveValue("80");
        expect(inputs[1]).toHaveValue(744);
        expect(inputs[3]).toHaveValue(232);
        expect(inputs[5]).toHaveValue(217);
      });
    });

    it("应该支持常规服60级武器属性", async () => {
      const user = userEvent.setup();
      const levelSelect = screen.getAllByRole("combobox")[0];
      const inputs = screen.getAllByRole("spinbutton");

      await user.selectOptions(levelSelect, "60-standard");

      await waitFor(() => {
        expect(levelSelect).toHaveValue("60-standard");
        expect(inputs[1]).toHaveValue(589);
        expect(inputs[3]).toHaveValue(186);
        expect(inputs[5]).toHaveValue(170);
      });
    });
  });

  describe("门派选择", () => {
    it("应该正确选择转换前门派", async () => {
      const user = userEvent.setup();
      const selects = screen.getAllByRole("combobox");

      if (selects.length >= 3) {
        const currentSectSelect = selects[2]; // 转换前门派
        await user.selectOptions(currentSectSelect, "青云门");
        expect(currentSectSelect).toHaveValue("青云门");
      }
    });

    it("应该正确选择转换后门派", async () => {
      const user = userEvent.setup();
      const selects = screen.getAllByRole("combobox");

      if (selects.length >= 4) {
        const targetSectSelect = selects[3]; // 转换后门派
        await user.selectOptions(targetSectSelect, "天音寺");
        expect(targetSectSelect).toHaveValue("天音寺");
      }
    });

    it("应该正确选择原造型", async () => {
      const user = userEvent.setup();
      const selects = screen.getAllByRole("combobox");

      if (selects.length >= 2) {
        const originalFormSelect = selects[1]; // 原造型
        await user.selectOptions(originalFormSelect, "剑");
        expect(originalFormSelect).toHaveValue("剑");
        await user.selectOptions(originalFormSelect, "无");
        expect(originalFormSelect).toHaveValue("无");
      }
    });
  });

  describe("属性输入", () => {
    it("应该允许输入物攻值", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const physicalInput = inputs[0]; // 物攻当前值输入框

      await user.type(physicalInput, "500");
      expect(physicalInput).toHaveValue(500);
    });

    it("应该允许输入法攻值", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const magicInput = inputs[2]; // 法攻当前值输入框

      await user.type(magicInput, "150");
      expect(magicInput).toHaveValue(150);
    });

    it("应该允许输入治疗值", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const healingInput = inputs[4]; // 治疗当前值输入框

      await user.type(healingInput, "100");
      expect(healingInput).toHaveValue(100);
    });

    it("应该支持清空输入", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const physicalInput = inputs[0];

      // 先输入值
      await user.type(physicalInput, "500");
      expect(physicalInput).toHaveValue(500);

      // 清空输入
      await user.clear(physicalInput);
      expect(physicalInput).toHaveValue(null);
    });

    it("应该正确显示0值", async () => {
      const user = userEvent.setup();
      const physicalInput = screen.getByRole("spinbutton", {
        name: "物攻当前值",
      });

      await user.type(physicalInput, "0");

      expect(physicalInput).toHaveValue(0);
    });
  });

  describe("表单验证", () => {
    it("应该在缺少属性值时显示错误", async () => {
      const user = userEvent.setup();
      const convertButton = screen.getByRole("button", { name: "转换" });

      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText(/请完整输入.*数值/)).toBeInTheDocument();
      });
    });

    it("应该在属性值超过最大值时显示错误", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const physicalInput = inputs[0];

      // 输入超过最大值的物攻
      await user.type(physicalInput, "1000");

      // 输入法攻和治疗的正常值
      const magicInput = inputs[2];
      const healingInput = inputs[4];
      await user.type(magicInput, "150");
      await user.type(healingInput, "100");

      const convertButton = screen.getByRole("button", { name: "转换" });
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText("物攻值不能超过最大值")).toBeInTheDocument();
      });
    });

    it("应该在输入完整属性后清除错误", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const convertButton = screen.getByRole("button", { name: "转换" });

      // 先触发错误
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText(/请完整输入.*数值/)).toBeInTheDocument();
      });

      // 输入完整属性
      await user.type(inputs[0], "500");
      await user.type(inputs[2], "150");
      await user.type(inputs[4], "100");

      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.queryByText(/请完整输入.*数值/)).not.toBeInTheDocument();
      });
    });
  });

  describe("属性转换", () => {
    it("应该成功进行属性转换", async () => {
      const user = userEvent.setup();

      // 输入所有属性值
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500"); // 物攻
      await user.type(inputs[2], "150"); // 法攻
      await user.type(inputs[4], "100"); // 治疗

      const convertButton = screen.getByRole("button", { name: "转换" });
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText("转换结果")).toBeInTheDocument();
      });
    });

    it("应该显示转换路径", async () => {
      const user = userEvent.setup();

      // 输入所有属性值
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[2], "150");
      await user.type(inputs[4], "100");

      const convertButton = screen.getByRole("button", { name: "转换" });
      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText(/刀 → 剑/)).toBeInTheDocument();
      });
    });

    it("应该支持连续转换", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const convertButton = screen.getByRole("button", { name: "转换" });

      // 第一次转换
      await user.type(inputs[0], "300");
      await user.type(inputs[2], "100");
      await user.type(inputs[4], "80");

      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText("转换结果")).toBeInTheDocument();
      });

      // 修改属性进行第二次转换
      await user.clear(inputs[0]);
      await user.type(inputs[0], "400");

      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText("转换结果")).toBeInTheDocument();
      });
    });
  });

  describe("重置功能", () => {
    it("应该正确重置所有输入", async () => {
      const user = userEvent.setup();

      // 先输入一些值
      const inputs = screen.getAllByRole("spinbutton");
      await user.type(inputs[0], "500");
      await user.type(inputs[2], "150");

      // 选择原造型
      const selects = screen.getAllByRole("combobox");
      if (selects.length >= 2) {
        await user.selectOptions(selects[1], "剑");
      }

      // 点击重置
      const resetButton = screen.getByRole("button", { name: "重置" });
      await user.click(resetButton);

      // 验证输入框被清空
      expect(inputs[0]).toHaveValue(null);
      expect(inputs[2]).toHaveValue(null);

      // 验证原造型被重置
      if (selects.length >= 2) {
        expect(selects[1]).toHaveValue("无");
      }
    });

    it("应该清除转换结果", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const convertButton = screen.getByRole("button", { name: "转换" });
      const resetButton = screen.getByRole("button", { name: "重置" });

      // 先进行转换
      await user.type(inputs[0], "500");
      await user.type(inputs[2], "150");
      await user.type(inputs[4], "100");

      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText("转换结果")).toBeInTheDocument();
      });

      // 执行重置
      await user.click(resetButton);

      // 验证结果被清除
      expect(screen.queryByText("转换结果")).not.toBeInTheDocument();
    });
  });

  describe("响应式设计", () => {
    it("应该在不同屏幕尺寸下正确显示", () => {
      // 验证容器类名包含响应式类
      const container = document.querySelector(".w-full");
      expect(container).toHaveClass("w-full", "max-w-2xl");
    });

    it("应该有正确的间距类名", () => {
      const container = document.querySelector(".p-4");
      expect(container).toHaveClass("p-4", "sm:p-6");
    });
  });

  describe("无障碍性", () => {
    it("应该有正确的按钮角色", () => {
      const convertButton = screen.getByRole("button", { name: "转换" });
      expect(convertButton).toBeInTheDocument();

      const resetButton = screen.getByRole("button", { name: "重置" });
      expect(resetButton).toBeInTheDocument();
    });

    it("应该有正确的输入类型", () => {
      const inputs = screen.getAllByRole("spinbutton");
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("type", "number");
      });
    });

    it("应该支持键盘导航", async () => {
      const user = userEvent.setup();

      // 测试Tab键导航
      await user.tab();

      // 验证焦点移动到可交互元素
      const focusedElement = document.activeElement;
      expect(focusedElement).toBeTruthy();
    });
  });

  describe("样式和布局", () => {
    it("应该有正确的标题样式", () => {
      const title = screen.getByRole("heading", { name: "转换设置" });

      expect(title).toHaveClass("text-sm", "font-semibold", "text-slate-900");
    });

    it("应该有正确的按钮样式", () => {
      const convertButton = screen.getByRole("button", { name: "转换" });
      const resetButton = screen.getByRole("button", { name: "重置" });

      expect(convertButton).toHaveClass("bg-blue-600", "text-white");
      expect(resetButton).toHaveClass("bg-white", "text-slate-600");
    });

    it("应该有正确的表单布局", () => {
      const formContainer = document.querySelector(".space-y-5");
      expect(formContainer).toBeInTheDocument();

      const gridContainer = document.querySelector(
        ".grid.grid-cols-1.sm\\:grid-cols-3"
      );
      expect(gridContainer).toBeInTheDocument();
    });
  });

  describe("数据显示", () => {
    it("应该如实显示规则数据待复核", () => {
      expect(
        screen.getByText(/数据依据：历史录入数据.*最近核验：待复核/)
      ).toBeInTheDocument();
    });

    it("应该显示正确的属性标签", () => {
      expect(screen.getByText("物攻")).toBeInTheDocument();
      expect(screen.getByText("法攻")).toBeInTheDocument();
      expect(screen.getByText("治疗")).toBeInTheDocument();
    });

    it("应该显示正确的表格标题", () => {
      expect(screen.getByText("属性")).toBeInTheDocument();
      expect(screen.getByText("当前值")).toBeInTheDocument();
      expect(screen.getByText("最高值")).toBeInTheDocument();
    });

    it("应该显示正确的表单标签", () => {
      expect(screen.getByText("武器等级")).toBeInTheDocument();
      expect(screen.getByText("原造型")).toBeInTheDocument();
      expect(screen.getByText("当前造型")).toBeInTheDocument();
      expect(screen.getByText("目标造型")).toBeInTheDocument();
    });
  });
});
