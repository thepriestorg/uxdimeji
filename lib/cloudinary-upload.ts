type UploadResult = {
  url: string;
  public_id: string;
  width?: number;
  height?: number;
  format?: string;
};

async function responseMessage(response: Response) {
  const text = await response.text();
  if (!text) return `Upload failed (${response.status})`;
  try {
    const data = JSON.parse(text) as { error?: { message?: string } | string; message?: string };
    if (typeof data.error === "string") return data.error;
    return data.error?.message || data.message || `Upload failed (${response.status})`;
  } catch {
    return text.slice(0, 240);
  }
}

export async function uploadToCloudinary(file: File): Promise<UploadResult> {
  const signatureResponse = await fetch("/api/upload/sign", { method: "POST" });
  if (!signatureResponse.ok) throw new Error(await responseMessage(signatureResponse));

  const { signature, timestamp, cloudName, apiKey, folder } = await signatureResponse.json();
  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", folder);

  const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`, {
    method: "POST",
    body: formData,
  });
  if (!uploadResponse.ok) throw new Error(await responseMessage(uploadResponse));

  const result = await uploadResponse.json();
  return {
    url: result.secure_url,
    public_id: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
  };
}
