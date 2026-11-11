export type ShapeMotion = "static" | "spin" | "flow" | "drift" | "twist";

export type HeroLayout = "split" | "stacked";

export type ShapeResult = {
  positions: Float32Array;
  motion?: ShapeMotion;
  box?: [number, number, number];
  groups?: Float32Array;
};

export type ShapeBuilder = (count: number) => ShapeResult | Promise<ShapeResult>;

export type ParticleRole = "hero" | "overview" | "scan" | "ambient" | "close";

export type ParticleSet = {
  id: string;
  label: string;
  industries: string[];
  hero: ShapeBuilder;
  overview: ShapeBuilder;
  scan: ShapeBuilder;
  ambient: ShapeBuilder;
  close: ShapeBuilder;
  scanBox?: boolean;
  heroLayout?: HeroLayout;
  heroDensity?: number;
  heroFill?: number;
};
