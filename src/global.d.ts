// types/global.d.ts
export { }

declare global {
  interface Window {
    fbq: any;
    gtag: any;
    dataLayer?: Record<string, unknown>[];
  }
}