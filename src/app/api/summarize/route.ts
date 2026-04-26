import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json({ summary: "" });
    }

    const aiUrl = process.env.AI_SUMMARY_URL;
    const aiApiKey = process.env.AI_SUMMARY_API_KEY;

    if (!aiUrl) {
      return NextResponse.json({ error: "AI_SUMMARY_URL not configured" }, { status: 500 });
    }

    const model = process.env.AI_SUMMARY_MODEL || "gpt-3.5-turbo";

    const response = await fetch(aiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(aiApiKey && { Authorization: `Bearer ${aiApiKey}` }),
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: "system",
            content: "You are a helpful assistant that summarizes notes. Provide a concise summary of the following note in 2-3 sentences.",
          },
          {
            role: "user",
            content: `Please summarize this note:\n\n${content}`,
          },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim() || "";

    return NextResponse.json({ summary, model });
  } catch (error) {
    console.error("Summarize API error:", error);
    return NextResponse.json({ error: "Failed to generate summary" }, { status: 500 });
  }
}