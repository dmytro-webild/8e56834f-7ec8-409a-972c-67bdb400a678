declare module "*.css";
declare module "*.svg";
declare module "*.png";

declare global {
  interface Window {
    __getVisualEditScript?: () => string
    __webildEditorInitialized?: boolean
  }
}

export {}
