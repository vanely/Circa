import axios from '@/services/api';

export const uploadsApi = {
  // Get all uploads with filters
  getUploads: async (filters: Record<string, any> = {}): Promise<{ uploads: any[]; total: number }> => {
    const response = await axios.get('/api/uploads', { params: filters });
    return response.data;
  },

  // Get a single upload by ID
  getUploadById: async (uploadId: string): Promise<any> => {
    const response = await axios.get(`/api/uploads/${uploadId}`);
    return response.data;
  },

  // Get uploads by user
  getUserUploads: async (userId: string): Promise<{ uploads: any[] }> => {
    const response = await axios.get(`/api/uploads/user/${userId}`);
    return response.data;
  },

  // Get my uploads (current user)
  getMyUploads: async (): Promise<{ uploads: any[] }> => {
    const response = await axios.get('/api/uploads/me');
    return response.data;
  },

  // Generate presigned URL for client-side upload
  generatePresignedUrl: async (uploadData: {
    contentType: string;
    filename: string;
    filesize: number;
  }): Promise<{ presignedUrl: string; key: string; mediaId: string }> => {
    const response = await axios.post('/api/uploads/presign', uploadData);
    return response.data;
  },

  // Update media metadata after upload
  updateMediaMetadata: async (mediaId: string, metadata: any): Promise<any> => {
    const response = await axios.patch(`/api/uploads/media/${mediaId}`, metadata);
    return response.data;
  },

  // Delete an upload
  deleteUpload: async (uploadId: string): Promise<void> => {
    await axios.delete(`/api/uploads/${uploadId}`);
  },

  // Delete media
  deleteMedia: async (mediaId: string): Promise<void> => {
    await axios.delete(`/api/uploads/media/${mediaId}`);
  },

  // Upload file directly (for small files)
  uploadFile: async (formData: FormData): Promise<any> => {
    const response = await axios.post('/api/uploads', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }
};
