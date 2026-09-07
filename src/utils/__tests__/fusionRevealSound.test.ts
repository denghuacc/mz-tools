import { vi } from "vite-plus/test";
import { playFusionRevealSound } from "../fusionRevealSound";

describe("融合揭秘提示音", () => {
  afterEach(() => vi.unstubAllGlobals());

  it("浏览器支持 Web Audio 时应该播放四个音符并在结束后关闭上下文", () => {
    const close = vi.fn();
    const oscillatorStarts: number[] = [];
    const oscillatorStops: number[] = [];
    let handleEnded: (() => void) | undefined;

    class AudioContextMock {
      currentTime = 1;
      destination = {};

      createGain() {
        return {
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn(),
          },
          connect: vi.fn(),
        };
      }

      createOscillator() {
        return {
          type: "sine",
          frequency: { setValueAtTime: vi.fn() },
          connect: vi.fn(),
          start: (time: number) => oscillatorStarts.push(time),
          stop: (time: number) => oscillatorStops.push(time),
          addEventListener: (_event: string, callback: () => void) => {
            handleEnded = callback;
          },
        };
      }

      close = close;
    }

    vi.stubGlobal("AudioContext", AudioContextMock);

    playFusionRevealSound();

    expect(oscillatorStarts).toEqual([1, 1.08, 1.16, 1.24]);
    [1.46, 1.54, 1.62, 1.7].forEach((expectedTime, index) => {
      expect(oscillatorStops[index]).toBeCloseTo(expectedTime);
    });
    expect(typeof handleEnded).toBe("function");
    handleEnded?.();
    expect(close).toHaveBeenCalledTimes(1);
  });
});
