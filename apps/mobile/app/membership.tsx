import React, { useCallback, useEffect, useState, useRef } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  SafeAreaView,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import Purchases, {
  PurchasesPackage,
  PurchasesOffering,
} from "react-native-purchases";
import { supabase } from "../lib/supabase";

const WEB_APP_URL_BASE =
  process.env.EXPO_PUBLIC_WEB_APP_URL ||
  process.env.EXPO_PUBLIC_BASE_URL ||
  "";

const LABELS: Record<string, string> = {
  monthly: "월간",
  annual: "연간",
};

export default function MembershipScreen() {
  const router = useRouter();
  const { plan: planParam } = useLocalSearchParams<{ plan?: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [monthlyPackage, setMonthlyPackage] = useState<PurchasesPackage | null>(
    null
  );
  const [annualPackage, setAnnualPackage] = useState<PurchasesPackage | null>(
    null
  );
  const [selectedPackage, setSelectedPackage] =
    useState<PurchasesPackage | null>(null);
  const autoPurchaseTriggered = useRef(false);

  const loadOfferings = async () => {
    setLoading(true);
    setError(null);
    try {
      const offerings = await Purchases.getOfferings();
      const current =
        offerings.current ?? (offerings.all["Default"] as PurchasesOffering);
      if (current) {
        const monthly = current.monthly ?? null;
        const annual = current.annual ?? null;
        setMonthlyPackage(monthly);
        setAnnualPackage(annual);

        // 웹에서 선택한 플랜(연간/월간)에 맞춰 RevenueCat 패키지 자동 선택
        if (planParam === "annual" && annual) {
          setSelectedPackage(annual);
        } else if (planParam === "monthly" && monthly) {
          setSelectedPackage(monthly);
        }
      } else {
        setError("상품 정보를 불러오지 못했습니다.");
      }
    } catch (e) {
      const err = e as { message?: string };
      setError(err?.message ?? "상품 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadOfferings();
  }, [planParam]);

  // RevenueCat app_user_id = Supabase user id 연동 (웹훅 404 방지)
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user?.id) {
        Purchases.logIn(session.user.id).catch((e) =>
          console.warn("[RevenueCat] logIn on membership mount failed:", e)
        );
      }
    });
  }, []);

  const handlePurchase = useCallback(
    async (pkg: PurchasesPackage, planType: "annual" | "monthly") => {
      setPurchasing(true);
      try {
        const { customerInfo } = await Purchases.purchasePackage(pkg);
        const isPro = customerInfo.entitlements.active["pro"] != null;
        if (isPro) {
          // Supabase user_metadata.subscription 업데이트
          const apiBase = (WEB_APP_URL_BASE || "")
            .replace(/\/$/, "")
            .split("?")[0];
          if (apiBase) {
            try {
              const {
                data: { session },
              } = await supabase.auth.getSession();
              if (session?.access_token) {
                const res = await fetch(
                  `${apiBase}/api/subscriptions/complete-purchase`,
                  {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${session.access_token}`,
                    },
                    body: JSON.stringify({ planType }),
                  }
                );
                if (!res.ok) {
                  console.warn(
                    "[Membership] 구독 정보 sync 실패:",
                    res.status
                  );
                } else {
                  console.log(
                    "[Membership] 구독 정보 Supabase 업데이트 완료"
                  );
                }
              }
            } catch (syncErr) {
              console.warn("[Membership] 구독 sync 오류:", syncErr);
            }
          }
          router.replace("/");
        }
    } catch (e) {
      const err = e as {
        userCancelled?: boolean;
        code?: number;
        message?: string;
      };
      const cancelled =
        err.userCancelled === true ||
        err.code === 1 || /* PURCHASE_CANCELLED_ERROR */
        /cancelled|canceled/i.test(err?.message ?? "");
      if (!cancelled) {
        Alert.alert(
          "결제 실패",
          err?.message ?? "결제 중 오류가 발생했습니다."
        );
      }
      // 취소 시 Alert는 patchConsoleForPurchaseCancel에서 1회만 표시
    } finally {
      setPurchasing(false);
    }
  },
    [router]
  );

  // 웹 "지금 시작하기" 클릭 후 이 화면으로 진입 시 plan 파라미터가 있으면 바로 결제 시트 호출
  useEffect(() => {
    if (
      autoPurchaseTriggered.current ||
      purchasing ||
      loading ||
      !planParam ||
      (planParam !== "annual" && planParam !== "monthly")
    ) {
      return;
    }
    const pkg = planParam === "annual" ? annualPackage : monthlyPackage;
    if (pkg) {
      autoPurchaseTriggered.current = true;
      void handlePurchase(pkg, planParam);
    }
  }, [loading, planParam, annualPackage, monthlyPackage, purchasing, handlePurchase]);

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      const isPro = customerInfo.entitlements.active["pro"] != null;
      if (isPro) {
        router.replace("/");
      } else {
        Alert.alert(
          "복원 결과",
          "복원할 구독 내역이 없습니다."
        );
      }
    } catch (e) {
      const err = e as { message?: string };
      Alert.alert(
        "복원 실패",
        err?.message ?? "구입 내역 복원 중 오류가 발생했습니다."
      );
    } finally {
      setRestoring(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>프로 멤버십</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6B7A6F" />
            <Text style={styles.loadingText}>상품 정보를 불러오는 중...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity
              onPress={() => void loadOfferings()}
              style={styles.retryButton}
            >
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.packagesContainer}>
            {annualPackage && (
              <TouchableOpacity
                style={[
                  styles.packageButton,
                  selectedPackage?.identifier === annualPackage.identifier &&
                    styles.packageButtonSelected,
                ]}
                onPress={() => setSelectedPackage(annualPackage)}
                disabled={purchasing}
              >
                <View style={styles.packageContent}>
                  <Text style={styles.packageLabel}>
                    {LABELS.annual ?? annualPackage.identifier}
                  </Text>
                  <Text style={styles.packagePrice}>
                    {annualPackage.product.priceString}
                  </Text>
                </View>
                <Text style={styles.packagePeriod}>년</Text>
              </TouchableOpacity>
            )}
            {monthlyPackage && (
              <TouchableOpacity
                style={[
                  styles.packageButton,
                  selectedPackage?.identifier === monthlyPackage.identifier &&
                    styles.packageButtonSelected,
                ]}
                onPress={() => setSelectedPackage(monthlyPackage)}
                disabled={purchasing}
              >
                <View style={styles.packageContent}>
                  <Text style={styles.packageLabel}>
                    {LABELS.monthly ?? monthlyPackage.identifier}
                  </Text>
                  <Text style={styles.packagePrice}>
                    {monthlyPackage.product.priceString}
                  </Text>
                </View>
                <Text style={styles.packagePeriod}>월</Text>
              </TouchableOpacity>
            )}
            {!monthlyPackage && !annualPackage && !loading && !error && (
              <Text style={styles.emptyText}>
                현재 이용 가능한 상품이 없습니다.
              </Text>
            )}
          </View>
        )}

        {!loading && !error && (monthlyPackage || annualPackage) && (
          <TouchableOpacity
            style={[
              styles.nextButton,
              (!selectedPackage || purchasing) && styles.nextButtonDisabled,
            ]}
            onPress={() =>
              selectedPackage
                ? void handlePurchase(
                    selectedPackage,
                    selectedPackage === monthlyPackage ? "monthly" : "annual"
                  )
                : undefined
            }
            disabled={!selectedPackage || purchasing}
          >
            <Text style={styles.nextButtonText}>
              {purchasing ? "결제 진행 중..." : "다음"}
            </Text>
          </TouchableOpacity>
        )}

        {purchasing && (
          <View style={styles.overlay}>
            <ActivityIndicator size="large" color="#6B7A6F" />
            <Text style={styles.overlayText}>결제 진행 중...</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => void handleRestore()}
          disabled={restoring}
          style={styles.restoreButton}
        >
          <Text style={styles.restoreButtonText}>
            {restoring ? "복원 중..." : "구입 내역 복원"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF8",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  backButtonText: {
    fontSize: 24,
    color: "#2b2b2b",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2b2b2b",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  errorContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  errorText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  retryButton: {
    marginTop: 16,
    paddingVertical: 10,
    paddingHorizontal: 24,
    backgroundColor: "#7f8f7a",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  packagesContainer: {
    gap: 12,
  },
  packageButton: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.06)",
  },
  packageButtonSelected: {
    borderColor: "#6B7A6F",
    backgroundColor: "rgba(107, 122, 111, 0.08)",
  },
  nextButton: {
    marginTop: 24,
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: "#6B7A6F",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  nextButtonDisabled: {
    backgroundColor: "#B0B8B2",
    opacity: 0.8,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  packageContent: {
    flex: 1,
  },
  packageLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2b2b2b",
  },
  packagePrice: {
    fontSize: 16,
    color: "#6B7280",
    marginTop: 4,
  },
  packagePeriod: {
    fontSize: 14,
    color: "#6B7280",
  },
  emptyText: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    paddingVertical: 40,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  overlayText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6B7280",
  },
  restoreButton: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    paddingVertical: 12,
  },
  restoreButtonText: {
    fontSize: 14,
    color: "#6B7280",
  },
});
