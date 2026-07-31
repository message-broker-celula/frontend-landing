export const siteConfig = {
  cellName: process.env.NEXT_PUBLIC_CELL_NAME ?? "msb",
  domain: "andrescortes.dev",
  apkUrl: process.env.NEXT_PUBLIC_APK_URL ?? "",
};

export const cellUrl = `https://${siteConfig.cellName}.${siteConfig.domain}`;
export const apiUrl = `https://api.${siteConfig.cellName}.${siteConfig.domain}`;
