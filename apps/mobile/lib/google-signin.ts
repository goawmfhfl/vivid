import { Platform } from "react-native";
import {
  GoogleSignin,
  isErrorWithCode,
  isSuccessResponse,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { supabase } from "./supabase";

let isConfigured = false;

export class NativeGoogleSignInError extends Error {
  constructor(
    message: string,
    public code?: string,
    public userCancelled?: boolean
  ) {
    super(message);
    this.name = "NativeGoogleSignInError";
  }
}

export const configureGoogleSignIn = () => {
  if (isConfigured) return;

  const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
  if (!webClientId) {
    console.warn(
      "[Google Sign-In] EXPO_PUBLIC_WEB_CLIENT_ID가 없어 GoogleSignin.configure를 건너뜁니다."
    );
    return;
  }

  GoogleSignin.configure({
    webClientId,
    offlineAccess: true,
  });
  isConfigured = true;
};

export const signInWithGoogle = async () => {
  configureGoogleSignIn();

  const webClientId = process.env.EXPO_PUBLIC_WEB_CLIENT_ID;
  if (!webClientId) {
    throw new NativeGoogleSignInError(
      "EXPO_PUBLIC_WEB_CLIENT_ID가 설정되지 않았습니다.",
      "missing_web_client_id"
    );
  }

  try {
    if (Platform.OS === "android") {
      await GoogleSignin.hasPlayServices({
        showPlayServicesUpdateDialog: true,
      });
    }

    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      throw new NativeGoogleSignInError(
        "구글 로그인 결과를 확인하지 못했습니다.",
        "missing_google_response"
      );
    }

    const idToken = response.data.idToken;
    if (!idToken) {
      throw new NativeGoogleSignInError(
        "구글 ID 토큰을 가져오지 못했습니다.",
        "missing_id_token"
      );
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    if (error) {
      throw new NativeGoogleSignInError(
        error.message || "Supabase 세션 생성에 실패했습니다.",
        error.code
      );
    }

    return data;
  } catch (error) {
    if (error instanceof NativeGoogleSignInError) {
      throw error;
    }

    if (isErrorWithCode(error)) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        throw new NativeGoogleSignInError(
          "구글 로그인이 취소되었습니다.",
          error.code,
          true
        );
      }
      if (error.code === statusCodes.IN_PROGRESS) {
        throw new NativeGoogleSignInError(
          "이미 구글 로그인이 진행 중입니다.",
          error.code
        );
      }
      if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        throw new NativeGoogleSignInError(
          "Google Play 서비스를 사용할 수 없습니다.",
          error.code
        );
      }

      throw new NativeGoogleSignInError(
        error.message || "구글 로그인 중 오류가 발생했습니다.",
        error.code
      );
    }

    throw new NativeGoogleSignInError("구글 로그인 중 오류가 발생했습니다.");
  }
};
