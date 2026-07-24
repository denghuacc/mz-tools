import { trapModalFocus } from "../modalFocus";

const createTabEvent = (shiftKey = false) =>
  new KeyboardEvent("keydown", {
    key: "Tab",
    shiftKey,
    cancelable: true,
  });

describe("trapModalFocus", () => {
  it("应该忽略 Tab 以外的按键", () => {
    const container = document.createElement("div");
    const event = new KeyboardEvent("keydown", { key: "Enter" });

    trapModalFocus(event, container);

    expect(event.defaultPrevented).toBe(false);
  });

  it("没有可聚焦子元素时应该聚焦弹窗容器", () => {
    const container = document.createElement("div");
    container.tabIndex = -1;
    document.body.append(container);
    const event = createTabEvent();

    trapModalFocus(event, container);

    expect(event.defaultPrevented).toBe(true);
    expect(container).toHaveFocus();
  });

  it("焦点意外移出弹窗时应该按方向回到边界元素", () => {
    const container = document.createElement("div");
    const first = document.createElement("button");
    const hidden = document.createElement("button");
    const last = document.createElement("button");
    const outside = document.createElement("button");
    hidden.hidden = true;
    container.append(first, hidden, last);
    document.body.append(container, outside);
    outside.focus();

    trapModalFocus(createTabEvent(), container);
    expect(first).toHaveFocus();

    outside.focus();
    trapModalFocus(createTabEvent(true), container);
    expect(last).toHaveFocus();
  });
});
