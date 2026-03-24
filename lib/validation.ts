/**
 * 서버 전용 입력 검증 유틸리티
 * API 라우트에서만 사용
 */

// URL 허용 프로토콜 (javascript: 등 차단)
const ALLOWED_URL_PROTOCOLS = ["http:", "https:"];

/**
 * URL 유효성 검사 (javascript:/data: 등 위험 스키마 차단)
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== "string") return false;
  try {
    const parsed = new URL(url);
    return ALLOWED_URL_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * 문자열 길이 및 타입 검사
 */
export function isValidString(value: unknown, maxLength = 1000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= maxLength;
}

/**
 * 숫자 범위 검사
 */
export function isValidAmount(value: unknown): value is number {
  const n = Number(value);
  return !isNaN(n) && isFinite(n) && Math.abs(n) <= 1_000_000_000; // 10억 이하
}

/**
 * ID 파라미터 검사 (양의 정수)
 */
export function parseId(id: string): number | null {
  const n = parseInt(id, 10);
  return !isNaN(n) && n > 0 ? n : null;
}

/**
 * 날짜 검사
 */
export function isValidDate(value: unknown): boolean {
  if (typeof value !== "string") return false;
  const d = new Date(value);
  return !isNaN(d.getTime());
}

/**
 * 허용된 카테고리 값 검사
 */
export function isAllowedCategory(value: unknown, allowed: string[]): value is string {
  return typeof value === "string" && allowed.includes(value);
}
