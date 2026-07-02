import { logger } from "@/core/config/logger";
import { MEDIA_ENDPOINTS } from "./endpoints";
import { apiClient } from "@/core/api/client";
import { MediaDeleteResponse, MediaResponse } from "../types";
// ─── Media Service ─────────────────────────────────────────────────

export const mediaService = {
  async upload(data: any): Promise<MediaResponse> {
    logger.log("MEDIA", "Uploading media file");
    const res = await apiClient.post<MediaResponse>(MEDIA_ENDPOINTS.UPLOAD, data);
    logger.log("MEDIA", "Media file uploaded successfully");
    return res.data;
  },

  async delete(id: string) {
    logger.log("MEDIA", "Deleting media file", { id });
    const res = await apiClient.delete<MediaDeleteResponse>(MEDIA_ENDPOINTS.DELETE(id));
    logger.log("MEDIA", "Media file deleted successfully", { id });
    return res.data;
  },
};
