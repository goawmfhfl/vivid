import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Text,
} from "react-native";
import { WebView } from "react-native-webview";
import * as SplashScreen from "expo-splash-screen";
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);
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

  // WebView에서 메시지 수신 (웹 앱과 통신)
  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      console.log("Message from web:", data);
      // 여기서 웹 앱과의 통신 처리
    } catch (error) {
      console.error("Failed to parse message:", error);
    }
  };

  // Supabase 세션 확인 및 WebView에 전달
  React.useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
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
    } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
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
