import { auth } from "@/lib/auth";

export const runtime = "edge";

export const GET = auth.handler;
export const POST = auth.handler;
