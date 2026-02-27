import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Text,
  Pressable,
  Alert,
  Platform,
} from "react-native";
import { WebView } from "react-native-webview";
import { useRouter } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import Purchases from "react-native-purchases";
import { supabase } from "../lib/supabase";

const WEB_APP_URL_BASE =
  process.env.EXPO_PUBLIC_WEB_APP_URL ||
  process.env.EXPO_PUBLIC_BASE_URL ||
  "";

// WebView에서 로드할 때 웹이 '앱 내'로 인식하도록 embed=1 추가 (로그인 버튼 조건: 앱에서는 iOS만 애플 로그인)
const WEB_APP_URL = WEB_APP_URL_BASE
  ? `${WEB_APP_URL_BASE.replace(/\/$/, "")}${WEB_APP_URL_BASE.includes("?") ? "&" : "?"}embed=1`
  : "";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
  const purchaseSyncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideNativeSplash = React.useCallback(async () => {
    try {
      await SplashScreen.hideAsync();
    } catch {
      // Ignore if splash is already hidden.
    }
  }, []);

  // URL이 없으면 바로 에러 표시 (하얀 화면 방지)
  React.useEffect(() => {
    if (!WEB_APP_URL || !WEB_APP_URL.startsWith("http")) {
      setError(
        "EXPO_PUBLIC_WEB_APP_URL이 설정되지 않았거나 올바르지 않습니다.\n\n" +
          "apps/mobile/.env.local에 다음을 추가하세요:\n" +
          "• 시뮬레이터: EXPO_PUBLIC_WEB_APP_URL=http://localhost:3000\n" +
          "• 실제 기기: EXPO_PUBLIC_WEB_APP_URL=http://<내 컴퓨터 IP>:3000\n\n" +
          "웹 서버를 먼저 실행한 뒤 앱을 실행하세요."
      );
      setLoading(false);
      void hideNativeSplash();
    }
  }, [hideNativeSplash]);

  // WebView가 로드 완료되면 호출
  const handleLoadEnd = () => {
    setLoading(false);
    void hideNativeSplash();
  };

  // WebView에서 에러 발생 시 호출
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("❌ WebView error:", nativeEvent);
    console.error("🔗 Attempted URL:", WEB_APP_URL);

    let errorMessage = "웹 페이지를 불러오는 중 오류가 발생했습니다.";

    if (nativeEvent.code === -1001) {
      errorMessage =
        `타임아웃: ${WEB_APP_URL}\n\n` +
        "• 웹 서버가 실행 중인지 확인하세요 (apps/web에서 npm run dev).\n" +
        "• 실제 기기: 폰과 컴퓨터가 같은 Wi‑Fi인지, .env의 IP가 맞는지 확인하세요.\n" +
        "• 시뮬레이터: EXPO_PUBLIC_WEB_APP_URL=http://localhost:3000 로 바꿔보세요.";
    } else if (nativeEvent.code === -1004) {
      const isLocalhost = WEB_APP_URL.includes("localhost");
      errorMessage =
        `연결 실패: ${WEB_APP_URL}\n\n` +
        (isLocalhost
          ? "⚠️ 실제 기기(핸드폰)에서는 localhost를 쓸 수 없습니다. localhost는 '이 기기'를 가리키므로, PC 웹 서버에 연결되지 않습니다.\n\n"
          : "") +
        "다음을 확인하세요:\n\n" +
        "1. 웹 서버 실행: apps/web에서 npm run dev:host (실기기 접속용)\n" +
        "2. 실제 기기: EXPO_PUBLIC_WEB_APP_URL=http://<PC IP>:3000 형태로 설정 (예: http://172.30.1.59:3000). PC IP는 터미널에서 ipconfig getifaddr en0 로 확인\n" +
        "3. 폰과 PC가 같은 Wi‑Fi에 연결되어 있는지\n" +
        "4. 시뮬레이터만: EXPO_PUBLIC_WEB_APP_URL=http://localhost:3000 사용 가능";
    }

    setError(errorMessage);
    setLoading(false);
    void hideNativeSplash();
  };

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as {
        type?: string;
        plan?: string;
        userId?: string;
      };
      if (data.type === "SUPABASE_SESSION_READY" && data.userId && Platform.OS === "ios") {
        Purchases.logIn(data.userId).catch((e) =>
          console.warn("[RevenueCat] logIn from SUPABASE_SESSION_READY failed:", e)
        );
      } else if (data.type === "MEMBERSHIP_LOADED") {
        console.log("[Membership] MEMBERSHIP_LOADED 수신 → 가격 전송 시작");
        void sendOfferingsToWeb();
      } else if (
        data.type === "PURCHASE" &&
        (data.plan === "annual" || data.plan === "monthly")
      ) {
        console.log("[Membership] 지금 시작하기 → PURCHASE 수신, plan:", data.plan);
        void handlePurchaseFromWeb(data.plan);
      } else if (data.type === "PURCHASE_SYNC_DONE") {
        console.log("[Membership] 구독 sync 완료 수신 → 홈으로 이동");
        if (purchaseSyncTimeoutRef.current) {
          clearTimeout(purchaseSyncTimeoutRef.current);
          purchaseSyncTimeoutRef.current = null;
        }
        router.replace("/");
      }
    } catch {
      // ignore parse errors
    }
  };

  const sendOfferingsToWeb = async () => {
    if (!webViewRef.current) return;
    try {
      const offerings = await Purchases.getOfferings();
      const current = offerings.current ?? offerings.all["Default"];
      if (current) {
        const payload = {
          type: "OFFERINGS",
          annual: current.annual
            ? { priceString: current.annual.product.priceString }
            : null,
          monthly: current.monthly
            ? { priceString: current.monthly.product.priceString }
            : null,
        };
        console.log("[Membership] OFFERINGS 전송:", payload);
        webViewRef.current.postMessage(JSON.stringify(payload));
      }
    } catch (e) {
      console.warn("[Membership] OFFERINGS 조회/전송 실패:", e);
    }
  };

  const handlePurchaseFromWeb = async (plan: "annual" | "monthly") => {
    console.log("[Membership] handlePurchaseFromWeb 시작, plan:", plan);
    try {
      // RevenueCat app_user_id = Supabase user id 보장 (웹훅 404 방지)
      if (Platform.OS === "ios") {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          await Purchases.logIn(session.user.id).catch((e) =>
            console.warn("[RevenueCat] logIn before purchase failed:", e)
          );
        }
      }
      const offerings = await Purchases.getOfferings();
      const current = offerings.current ?? offerings.all["Default"];
      if (!current) {
        console.warn("[Membership] 상품 정보 없음");
        Alert.alert("오류", "상품 정보를 불러올 수 없습니다.");
        return;
      }
      const pkg = plan === "annual" ? current.annual : current.monthly;
      if (!pkg) {
        console.warn("[Membership] 선택한 상품 없음, plan:", plan);
        Alert.alert("오류", "선택한 상품을 찾을 수 없습니다.");
        return;
      }
      console.log("[Membership] purchasePackage 호출 중...");
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      const isPro = customerInfo.entitlements.active["pro"] != null;
      console.log("[Membership] 결제 완료, isPro:", isPro);
      if (isPro) {
        // 1) 네이티브에 세션이 있으면 API 직접 호출 (fallback)
        const apiBase = (WEB_APP_URL_BASE || "").replace(/\/$/, "").split("?")[0];
        const tryNativeSync = async () => {
          try {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.access_token && apiBase) {
              const res = await fetch(
                `${apiBase}/api/subscriptions/complete-purchase`,
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${session.access_token}`,
                  },
                  body: JSON.stringify({ planType: plan }),
                }
              );
              if (res.ok) {
                console.log("[Membership] 네이티브에서 구독 sync 완료");
                router.replace("/");
                return true;
              }
            }
          } catch (_e) {
            // 무시
          }
          return false;
        };

        const nativeDone = await tryNativeSync();
        if (nativeDone) return;

        // 2) 웹(WebView)에서 sync - localStorage에 세션이 있음
        try {
          const escapedPlan = plan.replace(/"/g, '\\"');
          const script = `(function(){
            var p="${escapedPlan}";
            var postDone=function(){try{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:"PURCHASE_SYNC_DONE"}));}catch(e){}};
            if(window.__completePurchaseSync){
              window.__completePurchaseSync(p).then(postDone).catch(postDone);
            }else{
              console.warn("[Membership] __completePurchaseSync 없음");
              postDone();
            }
            true;
          })();`;
          webViewRef.current?.injectJavaScript(script);
        } catch (injErr) {
          console.warn("[Membership] injectJavaScript 오류:", injErr);
        }

        // 3) 3초 이내 PURCHASE_SYNC_DONE 미수신 시에도 홈으로 이동
        purchaseSyncTimeoutRef.current = setTimeout(() => {
          purchaseSyncTimeoutRef.current = null;
          router.replace("/");
        }, 3000);
      }
    } catch (e) {
      const err = e as {
        userCancelled?: boolean;
        code?: number;
        message?: string;
      };
      const cancelled =
        err.userCancelled === true ||
        err.code === 1 ||
        /cancelled|canceled/i.test((err?.message as string) ?? "");
      console.log("[Membership] 결제 에러:", {
        cancelled,
        code: err.code,
        message: err?.message,
      });
      if (!cancelled) {
        Alert.alert(
          "결제 실패",
          (err?.message as string) ?? "결제 중 오류가 발생했습니다."
        );
      }
      // 취소 시 Alert는 patchConsoleForPurchaseCancel에서 1회만 표시
    }
  };

  // Supabase 세션 확인 및 WebView에 전달
  React.useEffect(() => {
    const auth = supabase.auth as {
      getSession: () => Promise<{ data: { session: unknown } }>;
      onAuthStateChange: (
        cb: (e: unknown, s: unknown) => void
      ) => { data: { subscription: { unsubscribe: () => void } } };
    };

    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await auth.getSession();
        if (session && webViewRef.current) {
          // 세션 정보를 WebView로 전달할 수 있습니다
          webViewRef.current.postMessage(
            JSON.stringify({
              type: "SUPABASE_SESSION",
              session: session,
            })
          );
        }
      } catch (error) {
        console.error("Session check error:", error);
      }
    };

    checkSession();

    // Supabase 인증 상태 변화 감지
    const {
      data: { subscription },
    } = auth.onAuthStateChange((_event: unknown, session: unknown) => {
      if (webViewRef.current) {
        webViewRef.current.postMessage(
          JSON.stringify({
            type: "SUPABASE_AUTH_CHANGE",
            session: session,
          })
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6B7A6F" />
        </View>
      )}
      {error && (
        <View style={styles.errorContainer}>
          <View style={styles.errorBox}>
            <Text style={styles.errorTitle}>⚠️ 연결 오류</Text>
            <Text style={styles.errorText}>{error}</Text>
            {WEB_APP_URL ? (
              <Text style={styles.errorUrl}>URL: {WEB_APP_URL}</Text>
            ) : null}
            <Pressable
              style={({ pressed }) => [
                styles.retryButton,
                pressed && styles.retryButtonPressed,
              ]}
              onPress={() => {
                setError(null);
                setLoading(true);
              }}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </Pressable>
          </View>
        </View>
      )}
      {WEB_APP_URL && !error ? (
        <WebView
          ref={webViewRef}
          source={{ uri: WEB_APP_URL }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
          onError={handleError}
        onMessage={handleMessage}
        injectedJavaScriptBeforeContentLoaded={`
          window.ReactNativeWebView = {
            postMessage: function(data) {
              var msg = typeof data === 'string' ? data : JSON.stringify(data);
              if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.ReactNativeWebView) {
                window.webkit.messageHandlers.ReactNativeWebView.postMessage(msg);
              }
            }
          };
        `}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        sharedCookiesEnabled={true}
        startInLoadingState={true}
        // iOS에서 네비게이션 허용
        allowsBackForwardNavigationGestures={true}
        // Android에서 파일 업로드 허용
        allowFileAccess={true}
        // 쿠키 공유 활성화
        thirdPartyCookiesEnabled={true}
        // iOS 자동 줌 방지
        scalesPageToFit={false}
        // 줌 비활성화
        bounces={false}
        // iOS에서 줌 제스처 비활성화
        scrollEnabled={true}
      />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF8",
    zIndex: 1,
  },
  errorContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAF8",
    zIndex: 2,
    padding: 20,
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: "#6B7A6F",
    borderRadius: 8,
  },
  retryButtonPressed: {
    opacity: 0.8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  errorBox: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    maxWidth: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#DC2626",
    marginBottom: 12,
    textAlign: "center",
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
    lineHeight: 20,
    textAlign: "center",
  },
  errorUrl: {
    fontSize: 12,
    color: "#9CA3AF",
    fontFamily: "monospace",
    marginTop: 8,
    textAlign: "center",
  },
});
