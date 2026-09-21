export interface VisitorClientInfo {
  ua: string;
  device: string;
  os: string;
  browser: string;
  language?: string;
  timezone?: string;
  screen?: string;
  touch?: boolean;
  connection?: string;
}

function detectBrowser(ua: string): string {
  if (/Edg\//i.test(ua)) return "Microsoft Edge";
  if (/OPR\//i.test(ua)) return "Opera";
  if (/YaBrowser\//i.test(ua)) return "Яндекс Браузер";
  if (/Firefox\//i.test(ua)) return "Firefox";
  if (/CriOS|Chrome\//i.test(ua)) return "Google Chrome";
  if (/Safari\//i.test(ua) && !/Chrome|Chromium/i.test(ua)) return "Safari";
  if (/bot|crawler|spider|slurp/i.test(ua)) return "Робот";
  return "Другой";
}

function detectOS(ua: string): string {
  if (/Windows NT 10\.0/i.test(ua)) return "Windows 10/11";
  if (/Windows/i.test(ua)) return "Windows";
  if (/Android/i.test(ua)) return "Android";
  if (/iPhone|iPad|iPod/i.test(ua)) return "iOS/iPadOS";
  if (/Mac OS X/i.test(ua)) return "macOS";
  if (/CrOS/i.test(ua)) return "ChromeOS";
  if (/Linux/i.test(ua)) return "Linux";
  if (/bot|crawler|spider|slurp/i.test(ua)) return "Робот";
  return "Другая";
}

function detectDevice(ua: string): string {
  if (/bot|crawler|spider|slurp/i.test(ua)) return "Робот";
  if (/iPad|Tablet|PlayBook|Silk/i.test(ua) || (/Android/i.test(ua) && !/Mobile/i.test(ua))) return "Планшет";
  if (/Mobile|iPhone|iPod|Android/i.test(ua)) return "Смартфон";
  return "Компьютер";
}

export function buildVisitorInfo(ua: string, client?: Partial<VisitorClientInfo>): VisitorClientInfo {
  return {
    ua,
    device: detectDevice(ua),
    os: detectOS(ua),
    browser: detectBrowser(ua),
    language: client?.language?.slice(0, 24),
    timezone: client?.timezone?.slice(0, 64),
    screen: client?.screen?.slice(0, 24),
    touch: Boolean(client?.touch),
    connection: client?.connection?.slice(0, 24),
  };
}

export function decodeVisitorInfo(value?: string | null): VisitorClientInfo {
  const raw = value || "";
  if (raw.startsWith("{")) {
    try {
      const parsed = JSON.parse(raw) as Partial<VisitorClientInfo>;
      const ua = typeof parsed.ua === "string" ? parsed.ua : "";
      return { ...buildVisitorInfo(ua, parsed), ...parsed, ua } as VisitorClientInfo;
    } catch {
      // Older or malformed values fall back to ordinary user-agent parsing.
    }
  }
  return buildVisitorInfo(raw);
}
