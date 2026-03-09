import { useEffect } from "react";
import { AppState, type AppStateStatus, LogBox, Platform } from "react-native";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Purchases from "react-native-purchases";
import { supabase } from "../lib/supabase";

// RevenueCat API 키 (.env.local의 EXPO_PUBLIC_REVENUECAT_SDK_API_KEY 사용)
const REVENUECAT_API_KEYS = {
  apple:
    process.env.EXPO_PUBLIC_REVENUECAT_SDK_API_KEY || "",
};

const WEB_APP_URL_BASE =
  process.env.EXPO_PUBLIC_WEB_APP_URL ||
  process.env.EXPO_PUBLIC_BASE_URL ||
  "";

SplashScreen.preventAutoHideAsync().catch(() => {
  // Keep startup resilient if splash was already prevented.
});

// RevenueCat 결제 취소 로그가 LogBox 빨간 화면으로 표시되지 않도록 무시
LogBox.ignoreLogs([/\[RevenueCat\].*[Pp]urchase was cancell?ed/]);

export default function RootLayout() {
  // RevenueCat 초기화 (iOS 전용) + app_user_id = Supabase user id (웹훅 연동용)
  // configure 완료 후 logIn 호출 (configure 전 logIn은 SDK에서 무시됨)
  useEffect(() => {
    if (Platform.OS !== "ios") return;

    Purchases.configure({ apiKey: REVENUECAT_API_KEYS.apple });

    const syncRevenueCatUserId = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await Purchases.logIn(session.user.id);
        }
      } catch (e) {
        console.warn("[RevenueCat] logIn sync failed:", e);
      }
    };
    void syncRevenueCatUserId();

    const syncSubscriptionMirror = async () => {
      const apiBase = (WEB_APP_URL_BASE || "").replace(/\/$/, "").split("?")[0];
      if (!apiBase) return;

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        await fetch(`${apiBase}/api/subscriptions/sync`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({}),
        });
      } catch (error) {
        console.warn("[RevenueCat] foreground subscription sync failed:", error);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user?.id) {
          Purchases.logIn(session.user.id).catch((e) =>
            console.warn("[RevenueCat] logIn on auth change failed:", e)
          );
          void syncSubscriptionMirror();
        }
      }
    );

    let previousState: AppStateStatus = AppState.currentState;
    const appStateSubscription = AppState.addEventListener(
      "change",
      (nextState) => {
        const isReturningToForeground =
          previousState.match(/inactive|background/) != null &&
          nextState === "active";

        previousState = nextState;

        if (isReturningToForeground) {
          void syncSubscriptionMirror();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
      appStateSubscription.remove();
    };
  }, []);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
}
