const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface UploadResponse {
  message: string;
  file_url: string;
}

class UploadApi {
  private async uploadFile(endpoint: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);

    const token = sessionStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    const data: UploadResponse = await response.json();
    return data.file_url;
  }

  async uploadAvatar(file: File): Promise<string> {
    return this.uploadFile('/upload/avatar', file);
  }

  async uploadKYC(file: File): Promise<string> {
    return this.uploadFile('/upload/kyc', file);
  }

  async uploadPOD(file: File): Promise<string> {
    return this.uploadFile('/upload/pod', file);
  }

  getFileUrl(filename: string): string {
    return `${API_URL}/uploads/${filename}`;
  }
}

export default new UploadApi();
