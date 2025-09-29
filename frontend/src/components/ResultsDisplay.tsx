import React from 'react';
import { BarChart3, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { SVRResult } from '../services/api';

interface ResultsDisplayProps {
  result: SVRResult;
}

export const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ result }) => {
  const { metrics, data_info, model_parameters, plots } = result;

  return (
    <div className="space-y-6">
      {/* Model Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Model Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {metrics.train_r2.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">Train R²</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-green-600">
                {metrics.test_r2.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">Test R²</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-orange-600">
                {metrics.train_mse.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">Train MSE</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-red-600">
                {metrics.test_mse.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">Test MSE</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-purple-600">
                {metrics.train_mae.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">Train MAE</p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <p className="text-2xl font-bold text-pink-600">
                {metrics.test_mae.toFixed(4)}
              </p>
              <p className="text-sm text-muted-foreground">Test MAE</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Model Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Model Configuration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">SVR Parameters</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>C (Regularization):</span>
                  <span className="font-medium">{model_parameters.C}</span>
                </div>
                <div className="flex justify-between">
                  <span>Epsilon:</span>
                  <span className="font-medium">{model_parameters.epsilon}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gamma:</span>
                  <span className="font-medium">{model_parameters.gamma}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kernel:</span>
                  <span className="font-medium">{model_parameters.kernel}</span>
                </div>
                <div className="flex justify-between">
                  <span>Test Size:</span>
                  <span className="font-medium">{model_parameters.test_size}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Dataset Information</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total Samples:</span>
                  <span className="font-medium">{data_info.total_samples}</span>
                </div>
                <div className="flex justify-between">
                  <span>Training Samples:</span>
                  <span className="font-medium">{data_info.training_samples}</span>
                </div>
                <div className="flex justify-between">
                  <span>Test Samples:</span>
                  <span className="font-medium">{data_info.test_samples}</span>
                </div>
                <div className="flex justify-between">
                  <span>Features:</span>
                  <span className="font-medium">{data_info.features}</span>
                </div>
                <div className="flex justify-between">
                  <span>Target Column:</span>
                  <span className="font-medium">{model_parameters.target_column}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="mt-4">
            <h4 className="font-medium mb-2">Selected Features</h4>
            <div className="flex flex-wrap gap-2">
              {model_parameters.feature_columns.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizations */}
      {plots && (
        <>
          {/* Actual vs Predicted Plot */}
          {plots.actual_vs_predicted && (
            <Card>
              <CardHeader>
                <CardTitle>Actual vs Predicted Values</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full flex justify-center">
                  <img 
                    src={plots.actual_vs_predicted} 
                    alt="Actual vs Predicted Values Plot"
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Residuals Plot */}
          {plots.residuals && (
            <Card>
              <CardHeader>
                <CardTitle>Residuals Plot</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full flex justify-center">
                  <img 
                    src={plots.residuals} 
                    alt="Residuals Plot"
                    className="max-w-full h-auto rounded-lg border"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Model Interpretation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Model Interpretation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm">
            <div>
              <strong>R² Score:</strong> Measures how well the model explains the variance in the target variable.
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>Values closer to 1.0 indicate better performance</li>
                <li>Test R² of {metrics.test_r2.toFixed(4)} suggests {metrics.test_r2 > 0.8 ? 'excellent' : metrics.test_r2 > 0.6 ? 'good' : metrics.test_r2 > 0.4 ? 'moderate' : 'poor'} performance</li>
              </ul>
            </div>
            
            <div>
              <strong>MSE (Mean Squared Error):</strong> Average squared differences between actual and predicted values.
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>Lower values indicate better performance</li>
                <li>Train MSE: {metrics.train_mse.toFixed(4)}, Test MSE: {metrics.test_mse.toFixed(4)}</li>
                {metrics.test_mse > metrics.train_mse * 1.5 && (
                  <li className="text-yellow-600">⚠️ Significant gap suggests possible overfitting</li>
                )}
              </ul>
            </div>

            <div>
              <strong>MAE (Mean Absolute Error):</strong> Average absolute differences between actual and predicted values.
              <ul className="list-disc list-inside ml-4 mt-1 text-muted-foreground">
                <li>More interpretable than MSE as it's in the same units as the target</li>
                <li>Test MAE: {metrics.test_mae.toFixed(4)}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
