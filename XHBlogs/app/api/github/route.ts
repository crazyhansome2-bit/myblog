import { NextResponse } from "next/server";

function readFormValue(params: URLSearchParams, key: string) {
  return params.get(key) || "";
}

export async function POST(req: Request) {
  try {
    const clientSecret = process.env.GITALK_CLIENT_SECRET;

    if (!clientSecret) {
      return NextResponse.json(
        { error: "GITALK_CLIENT_SECRET is not configured." },
        { status: 500 },
      );
    }

    const contentType = req.headers.get("content-type") || "";
    const rawBody = await req.text();
    let payload: Record<string, string> = {};

    if (contentType.includes("application/json")) {
      payload = JSON.parse(rawBody || "{}");
    } else {
      const params = new URLSearchParams(rawBody);
      payload = {
        client_id: readFormValue(params, "client_id"),
        code: readFormValue(params, "code"),
        redirect_uri: readFormValue(params, "redirect_uri"),
        state: readFormValue(params, "state"),
      };
    }

    const githubRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...payload,
        client_secret: clientSecret,
      }),
    });

    const data = await githubRes.json();
    return NextResponse.json(data, { status: githubRes.status });
  } catch (error) {
    console.error("[api/github] OAuth proxy failed:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
