import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";

// 自定义渲染函数，可以在这里添加全局的 providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => render(ui, { ...options });

// 重新导出所有测试工具
export * from "@testing-library/react";
export { customRender as render };

// 测试工具函数
export const createMockAttributes = (overrides = {}) => ({
  physical: { current: 500, max: 665 },
  magic: { current: 150, max: 210 },
  healing: { current: 100, max: 192 },
  ...overrides,
});

export const createMockWeaponData = (level: 60 | 110 = 60) => ({
  level,
  maxValues:
    level === 60
      ? { physical: 665, magic: 210, healing: 192 }
      : { physical: 976, magic: 302, healing: 286 },
});

// 测试数据生成器
export const generateTestCases = () => {
  const sects = ["鬼王宗", "青云门", "天音寺", "合欢门"] as const;
  const levels = [60, 110] as const;

  const testCases = [];

  for (const fromSect of sects) {
    for (const toSect of sects) {
      for (const level of levels) {
        testCases.push({
          from: fromSect,
          to: toSect,
          level,
          description: `${fromSect} → ${toSect} (${level}级)`,
        });
      }
    }
  }

  return testCases;
};

// 性能测试工具
export const measurePerformance = async (fn: () => void | Promise<void>) => {
  const start = performance.now();
  await fn();
  const end = performance.now();
  return end - start;
};

// 内存使用测试工具
export const getMemoryUsage = () => {
  if ("memory" in performance) {
    return (performance as any).memory.usedJSHeapSize;
  }
  return 0;
};

// 模拟用户输入的工具函数
export const fillAttributeInputs = async (
  user: any,
  values: { physical?: number; magic?: number; healing?: number }
) => {
  const inputs = document.querySelectorAll('input[type="number"]');

  if (values.physical !== undefined) {
    await user.clear(inputs[0]);
    await user.type(inputs[0], values.physical.toString());
  }

  if (values.magic !== undefined) {
    await user.clear(inputs[2]);
    await user.type(inputs[2], values.magic.toString());
  }

  if (values.healing !== undefined) {
    await user.clear(inputs[4]);
    await user.type(inputs[4], values.healing.toString());
  }
};

// 等待异步操作完成的工具
export const waitForConversion = async () => {
  const { waitFor, screen } = await import("@testing-library/react");
  return waitFor(() => {
    expect(screen.getByText("转换结果")).toBeInTheDocument();
  });
};
