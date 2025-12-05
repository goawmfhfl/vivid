import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

/**
 * POST /api/test/token-test
 * AI 모델에 요청을 보내고 토큰 사용량을 반환하는 테스트 엔드포인트
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      model = "gpt-5-nano",
      systemPrompt = "You are a helpful assistant.",
      userPrompt,
      temperature = 0.7,
      maxTokens,
    } = body;

    if (!userPrompt) {
      return NextResponse.json(
        { error: "userPrompt is required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const openai = new OpenAI({ apiKey });

    const startTime = Date.now();

    // 최신 모델(gpt-5-nano 등)은 max_completion_tokens 사용
    // 구형 모델은 max_tokens 사용
    const useMaxCompletionTokens = ["gpt-5-nano", "gpt-5-mini"].includes(model);

    // 최신 모델(gpt-5-nano 등)은 temperature를 1.0으로만 지원
    // temperature가 1.0이 아니면 1.0으로 고정
    const modelsWithFixedTemperature = ["gpt-5-nano", "gpt-5-mini"];
    const finalTemperature = modelsWithFixedTemperature.includes(model)
      ? 1.0
      : temperature;

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: finalTemperature,
      ...(maxTokens && {
        [useMaxCompletionTokens ? "max_completion_tokens" : "max_tokens"]:
          maxTokens,
      }),
    });

    const endTime = Date.now();
    const duration = endTime - startTime;

    // 응답 내용 확인 및 로깅
    const choice = completion.choices[0];
    const content = choice?.message?.content || "";
    const finishReason = choice?.finish_reason;
    const usage = completion.usage;

    // finish_reason이 'stop'이 아닌 경우 로깅
    if (finishReason && finishReason !== "stop") {
      console.warn(`Warning: finish_reason is ${finishReason}`, {
        model,
        finishReason,
        hasContent: !!content,
        contentLength: content.length,
      });
    }

    // content가 비어있는 경우 경고
    if (!content && finishReason === "stop") {
      console.warn("Warning: Content is empty but finish_reason is stop", {
        model,
        usage,
        choices: completion.choices,
      });
    }

    // 모델별 토큰 가격 (USD per 1M tokens)
    // 참고: https://openai.com/api/pricing/
    // gpt-5-mini: 캐시된 입력 $0.25, 캐시되지 않은 입력은 일반 가격, 출력 $2.0
    const pricing: Record<
      string,
      { input: number; inputCached: number; output: number }
    > = {
      "gpt-5-mini": { input: 0.25, inputCached: 0.25, output: 2.0 }, // 캐시된 입력: $0.25
      "gpt-5-nano": { input: 0.15, inputCached: 0.15, output: 0.6 },
      "gpt-4-turbo": { input: 10.0, inputCached: 10.0, output: 30.0 },
      "gpt-4": { input: 30.0, inputCached: 30.0, output: 60.0 },
      "gpt-3.5-turbo": { input: 0.5, inputCached: 0.5, output: 1.5 },
    };

    const modelPricing = pricing[model] || pricing["gpt-5-nano"];

    // 캐시된 토큰 정보 추출 (OpenAI API 응답에서 제공)
    const cachedTokens =
      (usage as any)?.prompt_tokens_details?.cached_tokens || 0;
    const nonCachedTokens = (usage?.prompt_tokens || 0) - cachedTokens;

    // 캐시된 입력과 캐시되지 않은 입력 비용 계산
    const cachedInputCost =
      cachedTokens * (modelPricing.inputCached / 1_000_000);
    const nonCachedInputCost =
      nonCachedTokens * (modelPricing.input / 1_000_000);
    const inputCost = cachedInputCost + nonCachedInputCost;

    const outputCost =
      (usage?.completion_tokens || 0) * (modelPricing.output / 1_000_000);
    const totalCost = inputCost + outputCost;

    // USD to KRW 환율 (환경변수 또는 기본값 사용)
    // 실제 서비스에서는 환율 API를 사용하거나 환경변수로 관리하는 것이 좋습니다
    const USD_TO_KRW = parseFloat(process.env.USD_TO_KRW_RATE || "1350");

    return NextResponse.json({
      success: true,
      model,
      content,
      finish_reason: finishReason,
      usage: {
        prompt_tokens: usage?.prompt_tokens || 0,
        completion_tokens: usage?.completion_tokens || 0,
        total_tokens: usage?.total_tokens || 0,
        cached_tokens: cachedTokens,
      },
      cost: {
        input_cost_usd: inputCost,
        output_cost_usd: outputCost,
        total_cost_usd: totalCost,
        input_cost_krw: inputCost * USD_TO_KRW,
        output_cost_krw: outputCost * USD_TO_KRW,
        total_cost_krw: totalCost * USD_TO_KRW,
        cached_input_cost_usd: cachedInputCost,
        non_cached_input_cost_usd: nonCachedInputCost,
        input_price_per_1m: modelPricing.input,
        input_cached_price_per_1m: modelPricing.inputCached,
        output_price_per_1m: modelPricing.output,
        usd_to_krw_rate: USD_TO_KRW,
      },
      duration_ms: duration,
      duration_sec: duration / 1000,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Token test error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
