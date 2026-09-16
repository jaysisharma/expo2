declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: {
      x?: number;
      y?: number;
    };
    colors?: string[];
    shapes?: string[];
    scalar?: number;
    zIndex?: number;
    disableForReducedMotion?: boolean;
  }

  function confetti(options?: ConfettiOptions): Promise<null> | null;
  export default confetti;
}

declare module 'qrcode' {
  export interface QRCodeToStringOptions {
    type?: 'svg' | 'utf8';
    margin?: number;
    color?: {
      dark?: string;
      light?: string;
    };
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    width?: number;
  }

  export function toString(
    text: string,
    options?: QRCodeToStringOptions
  ): Promise<string>;

  export function toDataURL(
    text: string,
    options?: any
  ): Promise<string>;

  export function create(
    text: string,
    options?: any
  ): {
    modules: {
      size: number;
      get(row: number, col: number): number | boolean;
    };
  };

  const qrcode: {
    toString: typeof toString;
    toDataURL: typeof toDataURL;
    create: typeof create;
  };
  export default qrcode;
}
