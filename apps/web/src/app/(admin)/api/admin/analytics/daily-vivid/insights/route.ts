import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "../../../util/admin-auth";
import { GoogleGenerativeAI } from "@google/generative-ai";

function getGeminiClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenerativeAI(apiKey);
}

interface AnalyticsPayload {
  summary: {
    totalRecords: number;
    totalDailyVivid: number;
    totalTodoItems: number;
    uniqueUsersWithRecords: number;
    uniqueUsersWithDaily: number;
  };
  recordTypeDistribution: Record<string, number>;
  dailyTypeDistribution: Record<string, number>;
  q1Q2Usage: {
    bothQ1Q2: number;
    q1Only: number;
    q2Only: number;
    q3Count: number;
    sampleSize: number;
  };
  metrics: {
    avgContentLength: number;
    avgAlignmentScore: number | null;
    avgRecordsPerUser: number;
    avgDailyPerUser: number;
    avgMaxStreakDays: number;
  };
  todoUsage: {
    total: number;
    checked: number;
    completionRate: number;
    withScheduled: number;
  };
  keywordSample: string[];
  aspiredTraitsSample: string[];
}

/**
 * POST /api/admin/analytics/daily-vivid/insights
 * Daily Vivid 사용 분석 데이터 기반 AI 심층 인사이트 (Pro 모델 사용)
 */
export async function POST(request: NextRequest) {
  try {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) {
      return authResult;
    }

    const body = (await request.json().catch(() => ({}))) as AnalyticsPayload;
    if (!body.summary || !body.recordTypeDistribution) {
      return NextResponse.json(
        { error: "분석 데이터가 필요합니다. 먼저 페이지를 새로고침해주세요." },
        { status: 400 }
      );
    }

    const {
      summary,
      recordTypeDistribution,
      dailyTypeDistribution,
      q1Q2Usage,
      metrics,
      todoUsage,
      keywordSample = [],
      aspiredTraitsSample = [],
    } = body;

    const totalRecords = summary.totalRecords || 1;
    const totalDaily = summary.totalDailyVivid || 1;

    const recordTypeLines = Object.entries(recordTypeDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([t, c]) =>
          `  - ${t === "dream" || t === "vivid" ? "비비드" : t === "review" ? "회고" : t}: ${c}건 (${((c / totalRecords) * 100).toFixed(1)}%)`
      )
      .join("\n");

    const dailyTypeLines = Object.entries(dailyTypeDistribution)
      .sort((a, b) => b[1] - a[1])
      .map(
        ([t, c]) =>
          `  - ${t === "vivid" ? "비비드" : t === "review" ? "회고" : t}: ${c}건 (${((c / totalDaily) * 100).toFixed(1)}%)`
      )
      .join("\n");

    const prompt = `
다음은 VIVID 앱의 Daily Vivid 사용 패턴 분석 데이터입니다.
관리자가 제품 개선·기능 개발 방향을 파악할 수 있도록 심층 인사이트를 JSON 형식으로만 응답해주세요.

## ⭐ 가장 중요: 말투 규칙
- **알기 쉽게, 이해하기 쉽게** 작성해주세요.
- 전문 용어는 피하고, 누구나 한 번에 이해할 수 있는 쉬운 말로 써주세요.
- 문장은 짧고 명확하게. 한 문장에 핵심 하나만.
- 예시: "일치도 점수가 낮다" → "오늘 계획과 미래 비전이 잘 맞지 않는 편이에요"
- 예시: "Q1+Q2 활용률" → "아침에 오늘 계획과 미래 모습을 함께 쓰는 비율"

## VIVID 앱 기능 구조 (참고)
- **Q1 (오늘의 계획)**: "오늘 하루를 어떻게 보낼까?" - 아침 기록
- **Q2 (미래 비전)**: "앞으로의 나는 어떤 모습일까?" - 비전/목표 기록
- **Q3 (회고)**: "오늘의 나는 어떤 하루를 보냈을까?" - 저녁 회고 기록
- **비비드 리포트**: Q1+Q2 기반 AI 생성 리포트 (일치도, 키워드, 지향 모습)
- **회고 리포트**: Q3 기반 AI 회고 리포트
- **할 일(Todo)**: AI 생성 또는 수동 추가, 완료/미룸(예정일 지정) 기능

## 응답 형식 (반드시 이 JSON 구조를 따르세요)
{
  "usagePatterns": ["구체적 사용 패턴 1", "구체적 사용 패턴 2", ...],
  "keyInsights": ["핵심 인사이트 1", "핵심 인사이트 2", ...],
  "recommendations": ["권장사항 1", "권장사항 2", ...],
  "suggestedFeatures": ["추천 기능 1", "추천 기능 2", ...]
}

## 규칙
- **모든 문장은 쉬운 말로.** "~해요", "~이에요" 같은 친근한 말투 사용 가능. 딱딱한 보고서 톤 지양.
- usagePatterns: 어떤 기능이 어떻게 쓰이는지 **쉽게 설명**. 예) "10명 중 7명은 아침에 오늘 계획과 미래 모습을 함께 적어요"
- keyInsights: 숫자를 넣되 **의미를 쉽게 풀어서**. 예) "할 일을 70% 완료해요 → 대부분 잘 지키는 편이에요"
- recommendations: "~하면 좋겠어요", "~을 추가해보면 좋아요"처럼 **실행 가능한 쉬운 제안**
- suggestedFeatures: "사용자들이 ~를 원할 수 있어요. ~ 기능을 넣으면 좋겠어요"처럼 **이해하기 쉬운 제안**
- 키워드/지향 모습 샘플로 사용자 니즈 반영
- 한국어로 작성

## 데이터 요약
- 총 기록: ${summary.totalRecords}건
- AI 리포트: ${summary.totalDailyVivid}건
- 할 일 항목: ${summary.totalTodoItems}건
- 기록 유저: ${summary.uniqueUsersWithRecords}명
- 리포트 유저: ${summary.uniqueUsersWithDaily}명

## 기록 타입 분포 (vivid_records)
${recordTypeLines}

## AI 리포트 타입 분포 (daily_vivid)
${dailyTypeLines}

## Q1/Q2/Q3 활용 (샘플 ${q1Q2Usage.sampleSize}건)
- Q1+Q2 둘 다: ${q1Q2Usage.bothQ1Q2}건
- Q1만: ${q1Q2Usage.q1Only}건
- Q2만: ${q1Q2Usage.q2Only}건
- Q3(회고): ${q1Q2Usage.q3Count}건

## 핵심 지표
- 평균 기록 길이: ${metrics.avgContentLength}자
- 평균 일치도: ${metrics.avgAlignmentScore ?? "N/A"}
- 유저당 평균 기록: ${metrics.avgRecordsPerUser}건
- 유저당 평균 AI 리포트: ${metrics.avgDailyPerUser}건
- 평균 최대 연속 기록일: ${metrics.avgMaxStreakDays}일

## 할 일 활용
- 총: ${todoUsage.total}건, 완료: ${todoUsage.checked}건
- 완료율: ${todoUsage.completionRate}%
- 미룬 항목(예정일 지정): ${todoUsage.withScheduled}건

## 키워드 샘플 (current_keywords)
${keywordSample.slice(0, 30).join(", ") || "(없음)"}

## 지향하는 모습 샘플 (aspired_traits)
${aspiredTraitsSample.slice(0, 30).join(", ") || "(없음)"}
`;

    const genAI = getGeminiClient();
    // Pro 모델로 심층 분석 (gemini-1.5-pro)
    const model = genAI.getGenerativeModel({ model: "gemini-3.1-pro-preview" });

    const result = await model.generateContent(prompt);
    const text = result.response.text()?.trim() || "";

    let insights: {
      usagePatterns: string[];
      keyInsights: string[];
      recommendations: string[];
      suggestedFeatures: string[];
    } | null = null;

    let jsonStr = text;
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlock) jsonStr = codeBlock[1].trim();
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]) as {
          usagePatterns?: string[];
          keyInsights?: string[];
          recommendations?: string[];
          suggestedFeatures?: string[];
        };
        insights = {
          usagePatterns: Array.isArray(parsed.usagePatterns) ? parsed.usagePatterns : [],
          keyInsights: Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
          suggestedFeatures: Array.isArray(parsed.suggestedFeatures) ? parsed.suggestedFeatures : [],
        };
      } catch {
        // fallback
      }
    }

    if (!insights) {
      return NextResponse.json({
        insights: null,
        rawText: text || "인사이트를 생성할 수 없습니다.",
      });
    }

    return NextResponse.json({
      insights,
      rawText: null,
    });
  } catch (error) {
    console.error("[Analytics] daily-vivid insights API error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
