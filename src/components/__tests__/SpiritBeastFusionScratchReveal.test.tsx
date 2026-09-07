import { act, fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vite-plus/test";
import SpiritBeastFusionScratchReveal from "../SpiritBeastFusionScratchReveal";

const createBounds = (width: number, height: number) =>
  new DOMRect(0, 0, width, height);

describe("SpiritBeastFusionScratchReveal", () => {
  let bounds = createBounds(200, 100);
  let imageLoadListener: EventListenerOrEventListenerObject | null = null;
  let triggerResize: () => void = () => undefined;
  const drawImage = vi.fn();
  const clearRect = vi.fn();
  const beginPath = vi.fn();
  const moveTo = vi.fn();
  const lineTo = vi.fn();
  const stroke = vi.fn();
  const getImageData = vi.fn();
  const setPointerCapture = vi.fn();
  const context = {
    globalCompositeOperation: "source-over",
    lineCap: "butt",
    lineJoin: "miter",
    lineWidth: 1,
    drawImage,
    clearRect,
    beginPath,
    moveTo,
    lineTo,
    stroke,
    getImageData,
  } as unknown as CanvasRenderingContext2D;

  beforeEach(() => {
    bounds = createBounds(200, 100);
    imageLoadListener = null;
    triggerResize = () => undefined;
    drawImage.mockReset();
    clearRect.mockReset();
    beginPath.mockReset();
    moveTo.mockReset();
    lineTo.mockReset();
    stroke.mockReset();
    getImageData.mockReset();
    setPointerCapture.mockReset();
    getImageData.mockReturnValue({
      data: new Uint8ClampedArray(960).fill(255),
    } as ImageData);

    class ImageMock {
      complete = true;
      naturalWidth = 128;
      src = "";

      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) {
        if (type === "load") imageLoadListener = listener;
      }

      removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) {
        if (type === "load" && imageLoadListener === listener) {
          imageLoadListener = null;
        }
      }
    }

    class ResizeObserverMock {
      observe = vi.fn();
      unobserve = vi.fn();
      disconnect = vi.fn();

      constructor(callback: ResizeObserverCallback) {
        triggerResize = () => callback([], this as unknown as ResizeObserver);
      }
    }

    vi.stubGlobal("Image", ImageMock);
    vi.stubGlobal("ResizeObserver", ResizeObserverMock);
    vi.spyOn(
      HTMLCanvasElement.prototype,
      "getBoundingClientRect",
    ).mockImplementation(() => bounds);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(
      () => context,
    );
    Object.defineProperty(HTMLCanvasElement.prototype, "setPointerCapture", {
      configurable: true,
      value: setPointerCapture,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    Reflect.deleteProperty(HTMLCanvasElement.prototype, "setPointerCapture");
  });

  const renderScratchReveal = (onReveal = vi.fn()) => {
    const view = render(
      <SpiritBeastFusionScratchReveal
        label="技能"
        revealAll={false}
        onReveal={onReveal}
      >
        <span>揭秘内容</span>
      </SpiritBeastFusionScratchReveal>,
    );

    return { ...view, onReveal };
  };

  it.each(["Enter", " "])("支持使用 %s 键揭秘", (key) => {
    const { onReveal } = renderScratchReveal();
    const canvas = screen.getByRole("button", { name: "刮开技能" });

    act(() => {
      canvas.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
      );
      canvas.dispatchEvent(
        new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
      );
    });

    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "刮开技能" })).toBeNull();
    expect(screen.getByText("揭秘内容")).toBeVisible();
  });

  it("指针刮除达到阈值后完成揭秘", () => {
    getImageData.mockReturnValue({
      data: new Uint8ClampedArray(960),
    } as ImageData);
    const { onReveal } = renderScratchReveal();
    const canvas = screen.getByRole("button", { name: "刮开技能" });

    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerMove(canvas, { clientX: 80, clientY: 50, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    expect(setPointerCapture).toHaveBeenCalledWith(1);
    expect(stroke).toHaveBeenCalled();
    expect(onReveal).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "刮开技能" })).toBeNull();
  });

  it("尺寸变化后缩放已有画布而不是重新覆盖刮膜", () => {
    renderScratchReveal();
    const canvas = screen.getByRole("button", {
      name: "刮开技能",
    }) as HTMLCanvasElement;
    const loadEvent = new Event("load");

    act(() => {
      if (typeof imageLoadListener === "function") {
        imageLoadListener(loadEvent);
      } else {
        imageLoadListener?.handleEvent(loadEvent);
      }
    });
    drawImage.mockClear();
    act(() => triggerResize());
    expect(drawImage).not.toHaveBeenCalled();

    bounds = createBounds(320, 140);

    act(() => triggerResize());

    expect(canvas).toHaveAttribute("width", "320");
    expect(canvas).toHaveAttribute("height", "140");
    expect(drawImage).toHaveBeenCalledWith(canvas, 0, 0);
    expect(
      drawImage.mock.calls.some(
        ([source, x, y, width, height]) =>
          source instanceof HTMLCanvasElement &&
          source !== canvas &&
          x === 0 &&
          y === 0 &&
          width === 320 &&
          height === 140,
      ),
    ).toBe(true);
  });

  it("一键揭秘只上报一次，并使用最新的回调", () => {
    const firstOnReveal = vi.fn();
    const nextOnReveal = vi.fn();
    const { rerender } = render(
      <SpiritBeastFusionScratchReveal
        label="技能"
        revealAll={false}
        onReveal={firstOnReveal}
      >
        <span>揭秘内容</span>
      </SpiritBeastFusionScratchReveal>,
    );

    rerender(
      <SpiritBeastFusionScratchReveal
        label="技能"
        revealAll
        onReveal={nextOnReveal}
      >
        <span>揭秘内容</span>
      </SpiritBeastFusionScratchReveal>,
    );
    rerender(
      <SpiritBeastFusionScratchReveal
        label="技能"
        revealAll
        onReveal={nextOnReveal}
      >
        <span>揭秘内容</span>
      </SpiritBeastFusionScratchReveal>,
    );

    expect(firstOnReveal).not.toHaveBeenCalled();
    expect(nextOnReveal).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("button", { name: "刮开技能" })).toBeNull();
  });

  it("未开始刮除时忽略移动、结束和无关键盘操作", () => {
    const { onReveal } = renderScratchReveal();
    const canvas = screen.getByRole("button", { name: "刮开技能" });

    fireEvent.pointerMove(canvas, { clientX: 50, clientY: 20, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    fireEvent.pointerCancel(canvas, { pointerId: 1 });
    fireEvent.keyDown(canvas, { key: "Escape" });

    expect(stroke).not.toHaveBeenCalled();
    expect(onReveal).not.toHaveBeenCalled();
    expect(canvas).toBeInTheDocument();
  });

  it("画布尺寸或上下文不可用时安全跳过绘制", () => {
    bounds = createBounds(0, 0);
    const { onReveal, unmount } = renderScratchReveal();
    const canvas = screen.getByRole("button", { name: "刮开技能" });

    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    fireEvent.pointerUp(canvas, { pointerId: 1 });
    expect(onReveal).not.toHaveBeenCalled();
    unmount();

    bounds = createBounds(200, 100);
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    expect(() => renderScratchReveal()).not.toThrow();
  });

  it("覆盖层未加载、尺寸未变化或透明样本不足时保持刮膜", () => {
    class PendingImageMock {
      complete = false;
      naturalWidth = 0;
      src = "";

      addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject,
      ) {
        if (type === "load") imageLoadListener = listener;
      }

      removeEventListener() {}
    }

    vi.stubGlobal("Image", PendingImageMock);
    getImageData.mockReturnValue({
      data: new Uint8ClampedArray(0),
    } as ImageData);
    renderScratchReveal();
    const canvas = screen.getByRole("button", { name: "刮开技能" });
    const loadEvent = new Event("load");

    act(() => {
      if (typeof imageLoadListener === "function") {
        imageLoadListener(loadEvent);
      }
      triggerResize();
    });
    fireEvent.pointerDown(canvas, { clientX: 20, clientY: 20, pointerId: 1 });
    for (let index = 0; index < 9; index += 1) {
      fireEvent.pointerMove(canvas, {
        clientX: 30 + index,
        clientY: 20,
        pointerId: 1,
      });
    }
    fireEvent.pointerUp(canvas, { pointerId: 1 });

    expect(drawImage).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "刮开技能" }),
    ).toBeInTheDocument();
  });

  it("没有 ResizeObserver 时仍响应窗口 resize", () => {
    vi.stubGlobal("ResizeObserver", undefined);
    renderScratchReveal();

    expect(() => fireEvent(window, new Event("resize"))).not.toThrow();
  });

  it("设备像素比和绘图上下文不可用时使用安全回退", () => {
    vi.stubGlobal("devicePixelRatio", 0);
    const firstView = renderScratchReveal();
    const loadEvent = new Event("load");

    act(() => {
      if (typeof imageLoadListener === "function") {
        imageLoadListener(loadEvent);
      }
    });
    expect(screen.getByRole("button", { name: "刮开技能" })).toHaveAttribute(
      "width",
      "200",
    );
    firstView.unmount();

    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
    renderScratchReveal();
    expect(() => {
      act(() => {
        if (typeof imageLoadListener === "function") {
          imageLoadListener(loadEvent);
        }
      });
    }).not.toThrow();
  });
});
