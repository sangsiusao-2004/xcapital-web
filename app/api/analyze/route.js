import {
  analyzeMarket
} from "@/lib/tradingEngine";

export async function POST(req) {

  try {

    const body =
      await req.json();

    const {
      goldPrice,
      timeframe,
    } = body;

    // ENGINE
    const text =
      analyzeMarket(
        goldPrice,
        timeframe
      );

    return Response.json({
      success: true,
      message: text,
    });

  } catch (error) {

    console.log(error);

    return Response.json({
      success: false,
      message:
        "Bot lỗi",
    });
  }
}