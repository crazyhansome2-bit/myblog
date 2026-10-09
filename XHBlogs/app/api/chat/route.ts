import { siteConfig } from "../../../siteConfig";

export const runtime = "edge";

function json(data: unknown, status = 200) {
  return Response.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  if (
    !body ||
    typeof body !== "object" ||
    !("message" in body) ||
    typeof body.message !== "string"
  ) {
    return json({ error: "A text message is required" }, 400);
  }

  const message = body.message.trim();
  if (!message || message.length > 2000) {
    return json({ error: "Message must contain 1 to 2000 characters" }, 400);
  }

  const apiKey = (process.env.SILICONFLOW_API_KEY || "").trim();
  const model = (process.env.SILICONFLOW_MODEL || "").trim();
  if (!apiKey || !model) {
    return json({ error: "SiliconFlow API key or model is not configured" }, 503);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      "https://api.siliconflow.cn/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: siteConfig.geminiConfig.systemPrompt },
            { role: "user", content: message },
          ],
          stream: false,
          max_tokens: 256,
          temperature: siteConfig.geminiConfig.temperature,
        }),
        signal: controller.signal,
        cache: "no-store",
      },
    );

    if (!response.ok) {
      // Log only the status; never log credentials or visitors' messages.
      console.error("SiliconFlow upstream status:", response.status);
      const error =
        response.status === 429
          ? "Model rate limit reached; try again later"
          : response.status === 401 || response.status === 403
            ? "Check the SiliconFlow API key and model permissions"
            : response.status === 404
              ? "Check the complete SiliconFlow model ID"
              : "Model service failed; check the account and model settings";
      return json({ error }, response.status === 429 ? 429 : 502);
    }

    let data;
    try {
      data = await response.json();
    } catch {
      return json({ error: "Model service returned invalid JSON" }, 502);
    }

    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      return json({ error: "Model service returned no text reply" }, 502);
    }

    return json({ reply: content.trim() });
  } catch {
    return json(
      {
        error: controller.signal.aborted
          ? "Model request timed out"
          : "Unable to reach the model service",
      },
      controller.signal.aborted ? 504 : 502,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export async function GET() {
  const configured = Boolean(
    process.env.SILICONFLOW_API_KEY?.trim() &&
      process.env.SILICONFLOW_MODEL?.trim(),
  );
  return json(
    {
      provider: "SiliconFlow",
      configured,
      connectionVerified: false,
    },
    configured ? 200 : 503,
  );
}
