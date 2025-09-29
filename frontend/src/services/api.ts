import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const API_PREFIX = import.meta.env.VITE_API_PREFIX || '/api/v1';

const api = axios.create({
  baseURL: `${API_BASE_URL}${API_PREFIX}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface FileInfo {
  filename: string;
  shape: [number, number];
  columns: string[];
  dtypes: Record<string, string>;
  missing_values: Record<string, number>;
  preview: Record<string, any>[];
}

export interface SVRParameters {
  C?: number;
  epsilon?: number;
  gamma?: string;
  kernel?: string;
  target_column: string;
  feature_columns?: string[];
  test_size?: number;
  random_state?: number;
}

export interface SVRMetrics {
  train_mse: number;
  test_mse: number;
  train_r2: number;
  test_r2: number;
  train_mae: number;
  test_mae: number;
}

export interface SVRResult {
  model_parameters: SVRParameters & { feature_columns: string[] };
  metrics: SVRMetrics;
  data_info: {
    total_samples: number;
    training_samples: number;
    test_samples: number;
    features: number;
    feature_names: string[];
  };
  plots: {
    actual_vs_predicted: any;
    residuals: any;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const apiService = {
  async uploadFileInfo(file: File): Promise<ApiResponse<FileInfo>> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post<ApiResponse<FileInfo>>('/upload-info', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async trainSVR(file: File, parameters: SVRParameters): Promise<ApiResponse<SVRResult>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('parameters', JSON.stringify(parameters));

    const response = await api.post<ApiResponse<SVRResult>>('/train-svr', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async healthCheck(): Promise<{ status: string; version: string }> {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  },
};
