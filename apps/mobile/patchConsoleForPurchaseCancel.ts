/**
 * RevenueCat "Purchase was cancelled" 시 console.error로 인한
 * LogBox 빨간 화면 대신 시스템 Alert를 띄우기 위해 console.error 패치.
 * 반드시 앱 최상단에서 가장 먼저 import 되어야 함.
 */
import { Alert } from "react-native";

const _originalConsoleError = console.error;
const CANCELLED_PATTERNS = [
  /\[RevenueCat\].*[Pp]urchase was cancell?ed/i,
  /purchase was cancell?ed/i,
  /결제.*취소/i,
];

function stringifyArg(a: unknown): string {
  if (typeof a === "string") return a;
  if (a instanceof Error) return a.message + (a.stack ?? "");
  return String(a);
}

let lastCancelAlertAt = 0;
const CANCEL_ALERT_COOLDOWN_MS = 2000;

console.error = function (...args: unknown[]) {
  const message = args.map(stringifyArg).join(" ");
  if (CANCELLED_PATTERNS.some((re) => re.test(message))) {
    const now = Date.now();
    if (now - lastCancelAlertAt >= CANCEL_ALERT_COOLDOWN_MS) {
      lastCancelAlertAt = now;
      Alert.alert("알림", "결제가 취소 되었습니다.");
    }
    return;
  }
  _originalConsoleError.apply(console, args);
};
