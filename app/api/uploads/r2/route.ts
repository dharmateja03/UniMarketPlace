import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = process.env.R2_BUCKET;
const R2_PUBLIC_URL = process.env.R2_PUBLIC_URL;

function requireEnv(value: string | undefined, name: string) {
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

function getClient() {
  const accountId = requireEnv(R2_ACCOUNT_ID, "R2_ACCOUNT_ID");
  const accessKeyId = requireEnv(R2_ACCESS_KEY_ID, "R2_ACCESS_KEY_ID");
  const secretAccessKey = requireEnv(R2_SECRET_ACCESS_KEY, "R2_SECRET_ACCESS_KEY");

  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey }
  });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { filename, contentType } = body as { filename?: string; contentType?: string };

  if (!filename || !contentType) {
    return NextResponse.json({ error: "Missing filename or contentType" }, { status: 400 });
  }

  const bucket = requireEnv(R2_BUCKET, "R2_BUCKET");
  const publicUrlBase = requireEnv(R2_PUBLIC_URL, "R2_PUBLIC_URL");

  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

  const client = getClient();
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    ContentType: contentType
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 300 });
  const publicUrl = `${publicUrlBase.replace(/\/$/, "")}/${key}`;

  return NextResponse.json({ uploadUrl, publicUrl, key });
}
