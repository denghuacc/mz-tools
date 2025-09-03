import { render, screen } from "@testing-library/react";
import App from "../../App";

describe("武器转换器端到端测试", () => {
  beforeEach(() => {
    render(<App />);
  });

  describe("基本渲染", () => {
    it("应该渲染主要组件", () => {
      // 验证标题
      expect(screen.getByText("梦幻新诛仙")).toBeInTheDocument();
      expect(screen.getByText("武器属性转换器")).toBeInTheDocument();

      // 验证基本元素存在
      const selects = screen.getAllByRole("combobox");
      expect(selects.length).toBeGreaterThanOrEqual(3);

      const inputs = screen.getAllByRole("spinbutton");
      expect(inputs.length).toBeGreaterThanOrEqual(3);

      const buttons = screen.getAllByRole("button");
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });
  });
});
