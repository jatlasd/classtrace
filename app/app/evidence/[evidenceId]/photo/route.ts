import { getCurrentWorkspace } from "@/lib/auth/get-current-workspace";
import { getEvidencePhotoForWorkspace } from "@/lib/evidence/get-evidence-photo";
import { captureOperationalError } from "@/lib/monitoring/capture-operational-error";

const PHOTO_HEADERS = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

function unavailable(): Response {
  return new Response("Photo evidence is not available.", {
    status: 404,
    headers: {
      ...PHOTO_HEADERS,
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export async function GET(
  _request: Request,
  context: { params: Promise<{ evidenceId: string }> }
): Promise<Response> {
  try {
    const [workspace, params] = await Promise.all([
      getCurrentWorkspace(),
      context.params,
    ]);
    const photo = await getEvidencePhotoForWorkspace(
      workspace.workspaceId,
      params.evidenceId
    );

    if (
      !photo ||
      photo.contentType !== "image/webp" ||
      photo.imageData.byteLength === 0
    ) {
      return unavailable();
    }

    const body = photo.imageData.buffer.slice(
      photo.imageData.byteOffset,
      photo.imageData.byteOffset + photo.imageData.byteLength
    ) as ArrayBuffer;
    return new Response(body, {
      headers: {
        ...PHOTO_HEADERS,
        "Content-Type": photo.contentType,
        "Content-Length": String(photo.imageData.byteLength),
      },
    });
  } catch (error) {
    captureOperationalError("evidence.photo-read", error);
    return unavailable();
  }
}
