import { NextResponse } from "next/server";

export function interopJson<T>(data: T, init?: { status?: number; headers?: HeadersInit }): NextResponse<T> {
  const headers = new Headers(init?.headers);
  headers.set("Content-Type", "application/fhir+json");
  return NextResponse.json(data, { status: init?.status ?? 200, headers });
}

export function interopError(
  status: number,
  code: string,
  message: string,
  diagnostics?: string,
): NextResponse {
  return interopJson(
    {
      resourceType: "OperationOutcome",
      issue: [
        {
          severity: status >= 500 ? "fatal" : "error",
          code: "exception",
          diagnostics: diagnostics ?? message,
          details: { text: message, coding: [{ code }] },
        },
      ],
    },
    { status },
  );
}
