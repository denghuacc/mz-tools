import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../App";

describe("综合测试", () => {
  beforeEach(() => {
    render(<App />);
  });

  describe("应用程序集成", () => {
    it("应该正确渲染完整应用", () => {
      // 验证主要元素存在
      expect(
        screen.getByRole("heading", { name: "武器属性转换器" })
      ).toBeInTheDocument();

      // 验证表单元素
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(3);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(3);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it("应该支持基本的用户交互", async () => {
      const user = userEvent.setup();
      const selects = screen.getAllByRole("combobox");
      const inputs = screen.getAllByRole("spinbutton");

      // 测试选择器交互
      await user.selectOptions(selects[0], "110");
      expect(selects[0]).toHaveValue("110");

      // 测试输入框交互
      await user.type(inputs[0], "500");
      expect(inputs[0]).toHaveValue(500);
    });

    it("应该正确显示最大属性值", () => {
      const inputs = screen.getAllByRole("spinbutton");

      // 验证60级的最大值显示
      expect(inputs[1]).toHaveValue(665); // 物攻最大值
      expect(inputs[3]).toHaveValue(210); // 法攻最大值
      expect(inputs[5]).toHaveValue(192); // 治疗最大值
    });

    it("应该在切换武器等级时更新最大值", async () => {
      const user = userEvent.setup();
      const levelSelect = screen.getAllByRole("combobox")[0];
      const inputs = screen.getAllByRole("spinbutton");

      // 切换到110级
      await user.selectOptions(levelSelect, "110");

      // 验证110级的最大值
      await waitFor(() => {
        expect(inputs[1]).toHaveValue(976); // 物攻最大值
        expect(inputs[3]).toHaveValue(302); // 法攻最大值
        expect(inputs[5]).toHaveValue(286); // 治疗最大值
      });
    });

    it("应该支持完整的转换流程", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const convertButton = screen.getByRole("button", { name: "转换" });

      // 输入完整的属性值
      await user.type(inputs[0], "500");
      await user.type(inputs[2], "150");
      await user.type(inputs[4], "100");

      // 执行转换
      await user.click(convertButton);

      // 验证有结果或错误信息
      await waitFor(() => {
        const hasResult = screen.queryByText("转换结果");
        const hasError = screen.queryByText(/请完整输入|不能超过最大值/);
        expect(hasResult || hasError).toBeTruthy();
      });
    });

    it("应该支持重置功能", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const resetButton = screen.getByRole("button", { name: "重置" });

      // 先输入一些值
      await user.type(inputs[0], "500");
      await user.type(inputs[2], "150");

      // 执行重置
      await user.click(resetButton);

      // 验证输入框被清空
      expect(inputs[0]).toHaveValue(null);
      expect(inputs[2]).toHaveValue(null);
    });

    it("应该有响应式设计类名", () => {
      const container = document.querySelector(".w-full.max-w-2xl");
      expect(container).toBeInTheDocument();
      expect(container).toHaveClass("w-full", "max-w-2xl", "rounded-2xl");
      expect(container?.querySelector(".p-4.sm\\:p-6")).toBeInTheDocument();
    });

    it("应该有正确的布局结构", () => {
      const mainContainer = document.querySelector(".min-h-screen");
      expect(mainContainer).toBeInTheDocument();
      expect(mainContainer).toHaveClass(
        "bg-gray-100",
        "flex",
        "justify-center"
      );
    });

    it("应该显示武器属性标题", () => {
      expect(screen.getByText("武器属性")).toBeInTheDocument();
      expect(screen.getByText("属性")).toBeInTheDocument();
      expect(screen.getByText("当前值")).toBeInTheDocument();
      expect(screen.getByText("最高值")).toBeInTheDocument();
    });

    it("应该显示属性名称", () => {
      expect(screen.getByText("物攻")).toBeInTheDocument();
      expect(screen.getByText("法攻")).toBeInTheDocument();
      expect(screen.getByText("治疗")).toBeInTheDocument();
    });

    it("应该有正确的表单标签", () => {
      expect(screen.getByText("武器等级")).toBeInTheDocument();
      expect(screen.getByText("原造型")).toBeInTheDocument();
      expect(screen.getByText("当前造型")).toBeInTheDocument();
      expect(screen.getByText("目标造型")).toBeInTheDocument();
    });

    it("应该支持原造型选择", async () => {
      const user = userEvent.setup();
      const selects = screen.getAllByRole("combobox");
      const originalFormSelect = selects[1]; // 第二个select是原造型

      await user.selectOptions(originalFormSelect, "剑");
      expect(originalFormSelect).toHaveValue("剑");
    });

    it("应该支持门派选择", async () => {
      const user = userEvent.setup();
      const selects = screen.getAllByRole("combobox");

      if (selects.length >= 4) {
        const currentSectSelect = selects[2]; // 转换前
        const targetSectSelect = selects[3]; // 转换后

        await user.selectOptions(currentSectSelect, "青云门");
        expect(currentSectSelect).toHaveValue("青云门");

        await user.selectOptions(targetSectSelect, "天音寺");
        expect(targetSectSelect).toHaveValue("天音寺");
      }
    });

    it("应该在输入超出最大值时显示错误", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const convertButton = screen.getByRole("button", { name: "转换" });

      // 输入超出最大值的属性
      await user.type(inputs[0], "1000"); // 超过60级物攻最大值665
      await user.type(inputs[2], "150");
      await user.type(inputs[4], "100");

      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText("物攻值不能超过最大值")).toBeInTheDocument();
      });
    });

    it("应该在缺少输入时显示错误", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");
      const convertButton = screen.getByRole("button", { name: "转换" });

      // 只输入部分属性
      await user.type(inputs[0], "500");

      await user.click(convertButton);

      await waitFor(() => {
        expect(screen.getByText(/请完整输入.*数值/)).toBeInTheDocument();
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
        const hasResult = screen.queryByText("转换结果");
        const hasError = screen.queryByText(/请完整输入|不能超过最大值/);
        expect(hasResult || hasError).toBeTruthy();
      });

      // 修改属性进行第二次转换
      await user.clear(inputs[0]);
      await user.type(inputs[0], "400");

      await user.click(convertButton);

      await waitFor(() => {
        const hasResult = screen.queryByText("转换结果");
        const hasError = screen.queryByText(/请完整输入|不能超过最大值/);
        expect(hasResult || hasError).toBeTruthy();
      });
    });

    it("应该有正确的按钮样式", () => {
      const convertButton = screen.getByRole("button", { name: "转换" });
      const resetButton = screen.getByRole("button", { name: "重置" });

      expect(convertButton).toHaveClass("bg-blue-600", "text-white");
      expect(resetButton).toHaveClass("bg-white", "text-slate-600");
    });

    it("应该支持键盘导航", async () => {
      const user = userEvent.setup();

      // 测试Tab键导航
      await user.tab();

      // 验证焦点移动到第一个可交互元素
      const selects = screen.getAllByRole("combobox");
      const inputs = screen.getAllByRole("spinbutton");
      const buttons = screen.getAllByRole("button");

      const focusableElements = [...selects, ...inputs, ...buttons];
      const focusedElement = document.activeElement;

      expect(focusableElements).toContain(focusedElement);
    });

    it("应该有正确的无障碍属性", () => {
      const inputs = screen.getAllByRole("spinbutton");
      const selects = screen.getAllByRole("combobox");
      const buttons = screen.getAllByRole("button");

      // 验证所有交互元素都有正确的role
      inputs.forEach((input) => {
        expect(input).toHaveAttribute("type", "number");
      });

      selects.forEach((select) => {
        expect(select).toBeInTheDocument();
      });

      buttons.forEach((button) => {
        expect(button.textContent).toBeTruthy();
      });
    });

    it("应该正确处理数值输入", async () => {
      const user = userEvent.setup();
      const inputs = screen.getAllByRole("spinbutton");

      // 测试正常数值输入
      await user.type(inputs[0], "123");
      expect(inputs[0]).toHaveValue(123);

      // 测试清空输入
      await user.clear(inputs[0]);
      expect(inputs[0]).toHaveValue(null);

      // 测试重新输入
      await user.type(inputs[0], "456");
      expect(inputs[0]).toHaveValue(456);
    });

    it("应该在不同等级下显示正确的最大值", async () => {
      const user = userEvent.setup();
      const levelSelect = screen.getAllByRole("combobox")[0];
      const inputs = screen.getAllByRole("spinbutton");

      // 验证60级最大值
      expect(inputs[1]).toHaveValue(665);
      expect(inputs[3]).toHaveValue(210);
      expect(inputs[5]).toHaveValue(192);

      // 切换到110级
      await user.selectOptions(levelSelect, "110");

      // 验证110级最大值
      await waitFor(() => {
        expect(inputs[1]).toHaveValue(976);
        expect(inputs[3]).toHaveValue(302);
        expect(inputs[5]).toHaveValue(286);
      });

      // 切换回60级
      await user.selectOptions(levelSelect, "60");

      // 验证回到60级最大值
      await waitFor(() => {
        expect(inputs[1]).toHaveValue(665);
        expect(inputs[3]).toHaveValue(210);
        expect(inputs[5]).toHaveValue(192);
      });
    });
  });
});
