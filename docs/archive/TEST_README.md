# 历史报告：测试文档

> 本文档记录早期测试配置，不代表当前依赖版本或用例数量。

## 概述

本项目使用现代化的测试技术栈，确保代码质量和功能稳定性。

## 🛠️ 测试技术栈

- **Vitest 2.1.9** - 快速的现代测试框架
- **@testing-library/react 16.3.0** - React 组件测试
- **@testing-library/user-event 14.6.1** - 用户交互模拟
- **@testing-library/jest-dom 6.8.0** - DOM 断言扩展
- **jsdom 25.0.1** - DOM 环境模拟
- **TypeScript 5.8.3** - 类型安全

## 📁 测试文件结构

```
src/
├── __tests__/                    # 应用级测试
│   ├── App.test.tsx             # 主应用测试
│   ├── comprehensive.test.tsx   # 综合集成测试
│   ├── simple.test.tsx          # 基础功能测试
│   ├── e2e/                     # 端到端测试
│   │   └── weaponConverter.e2e.test.tsx
│   └── performance/             # 性能测试
│       └── weaponConverter.perf.test.ts
├── components/__tests__/         # 组件测试
│   └── WeaponConverter.test.tsx
├── hooks/__tests__/             # Hook测试
│   └── useWeaponConverter.test.ts
├── utils/__tests__/             # 工具函数测试
│   └── weaponUtils.test.ts
└── test/                        # 测试配置
    ├── setup.ts                 # 测试环境设置
    └── testUtils.tsx            # 测试工具函数
```

## 🚀 运行测试

### 基本命令

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch

# 运行测试UI界面
pnpm test:ui
```

### 高级命令

```bash
# 运行特定测试文件
pnpm test WeaponConverter

# 运行特定测试模式
pnpm test --run                  # 单次运行
pnpm test --reporter=verbose     # 详细输出
pnpm test --reporter=json        # JSON格式输出
```

## 📊 当前测试状态

- **总测试数**: 113 个
- **通过率**: 100% ✅
- **测试文件**: 8 个
- **平均执行时间**: 5.95 秒

## 🎯 测试类型

### 1. 单元测试

- **Hook 测试**: 验证自定义 Hook 的功能
- **工具函数测试**: 验证纯函数的逻辑
- **常量测试**: 验证数据结构的正确性

### 2. 组件测试

- **渲染测试**: 验证组件正确渲染
- **交互测试**: 验证用户交互功能
- **状态测试**: 验证组件状态管理

### 3. 集成测试

- **应用级测试**: 验证整体应用功能
- **组件协作测试**: 验证组件间交互
- **数据流测试**: 验证数据传递流程

### 4. 端到端测试

- **用户流程测试**: 模拟完整用户操作
- **功能验证测试**: 验证核心业务功能

### 5. 性能测试

- **渲染性能**: 验证组件渲染速度
- **计算性能**: 验证算法执行效率

## 🔧 测试配置

### Vitest 配置 (`vitest.config.ts`)

```typescript
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: ["node_modules/", "src/test/"],
    },
  },
});
```

### 测试环境设置 (`src/test/setup.ts`)

```typescript
import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(() => {
  cleanup();
});
```

## 📝 测试编写指南

### 1. 测试命名规范

```typescript
describe("组件/功能名称", () => {
  it("应该[期望的行为]", () => {
    // 测试实现
  });
});
```

### 2. 测试结构 (AAA 模式)

```typescript
it("应该正确渲染组件", () => {
  // Arrange - 准备
  const props = {
    /* 测试数据 */
  };

  // Act - 执行
  render(<Component {...props} />);

  // Assert - 断言
  expect(screen.getByText("预期文本")).toBeInTheDocument();
});
```

### 3. 异步测试

```typescript
it("应该处理异步操作", async () => {
  const user = userEvent.setup();
  render(<Component />);

  await user.click(screen.getByRole("button"));

  await waitFor(() => {
    expect(screen.getByText("结果")).toBeInTheDocument();
  });
});
```

### 4. Mock 使用

```typescript
// Mock外部依赖
vi.mock("./utils", () => ({
  calculateValue: vi.fn(() => 42),
}));
```

## 🎨 最佳实践

### ✅ 推荐做法

1. **测试行为而非实现** - 关注用户可见的行为
2. **使用语义化选择器** - 优先使用 role、label 等
3. **保持测试独立** - 每个测试应该独立运行
4. **清晰的测试描述** - 测试名称应该描述期望行为
5. **适当的测试粒度** - 平衡单元测试和集成测试

### ❌ 避免的做法

1. **测试实现细节** - 不要测试内部状态或私有方法
2. **脆弱的选择器** - 避免依赖 CSS 类名或 DOM 结构
3. **过度 Mock** - 只 Mock 必要的外部依赖
4. **测试间依赖** - 避免测试之间的相互依赖
5. **忽略异步操作** - 正确处理异步状态更新

## 🔍 调试测试

### 1. 调试失败的测试

```typescript
// 使用screen.debug()查看DOM结构
it("调试测试", () => {
  render(<Component />);
  screen.debug(); // 打印当前DOM
});
```

### 2. 查看测试覆盖率

```bash
pnpm test:coverage
# 打开 coverage/index.html 查看详细报告
```

### 3. 使用测试 UI

```bash
pnpm test:ui
# 在浏览器中查看测试结果和调试信息
```

## 📈 持续改进

### 当前优化成果

- ✅ 实现 100%测试通过率
- ✅ 建立稳定的测试套件
- ✅ 优化测试执行性能
- ✅ 完善类型定义支持

### 未来改进方向

- 🔄 增加视觉回归测试
- 🔄 集成 CI/CD 自动化测试
- 🔄 添加更多边界条件测试
- 🔄 优化测试报告和文档

## 🤝 贡献指南

1. **添加新测试** - 为新功能编写对应测试
2. **保持覆盖率** - 确保新代码有适当的测试覆盖
3. **遵循规范** - 按照项目的测试规范编写
4. **运行测试** - 提交前确保所有测试通过

---

📚 更多信息请参考：

- [Vitest 官方文档](https://vitest.dev/)
- [Testing Library 文档](https://testing-library.com/)
- [React 测试最佳实践](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
