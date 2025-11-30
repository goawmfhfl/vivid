import React, { useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
} from "react-native";
import { WebView } from "react-native-webview";
import { supabase } from "./lib/supabase";

// 웹 앱 URL (개발 환경에서는 localhost, 프로덕션에서는 실제 URL)
const WEB_APP_URL =
  process.env.EXPO_PUBLIC_ENVIRONMENT === "test"
    ? "http://localhost:3000"
    : "https://todayrecord.vercel.app";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const webViewRef = useRef<WebView>(null);

  // WebView가 로드 완료되면 호출
  const handleLoadEnd = () => {
    setLoading(false);
  };

  // WebView에서 에러 발생 시 호출
  const handleError = (syntheticEvent: any) => {
    const { nativeEvent } = syntheticEvent;
    console.error("WebView error: ", nativeEvent);
    setError("웹 페이지를 불러오는 중 오류가 발생했습니다.");
    setLoading(false);
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
          {/* 에러 메시지 표시 (필요시 구현) */}
        </View>
      )}
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
      />
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
  },
});
