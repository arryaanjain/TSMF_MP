import React, { useState } from 'react';
import { Settings, Target } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { FileInfo, SVRParameters } from '../services/api';

interface SVRConfigProps {
  fileInfo: FileInfo;
  onTrain: (parameters: SVRParameters) => void;
  isTraining: boolean;
}

export const SVRConfig: React.FC<SVRConfigProps> = ({
  fileInfo,
  onTrain,
  isTraining,
}) => {
  const [config, setConfig] = useState<SVRParameters>({
    C: 1.0,
    epsilon: 0.1,
    gamma: 'scale',
    kernel: 'rbf',
    target_column: '',
    feature_columns: [],
    test_size: 0.2,
    random_state: 42,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const numericColumns = fileInfo.columns.filter(
    col => fileInfo.dtypes[col]?.includes('int') || fileInfo.dtypes[col]?.includes('float')
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!config.target_column) {
      newErrors.target_column = 'Please select a target column';
    }
    
    if (config.feature_columns?.length === 0) {
      newErrors.feature_columns = 'Please select at least one feature column';
    }
    
    setErrors(newErrors);
    
    if (Object.keys(newErrors).length === 0) {
      onTrain(config);
    }
  };

  const handleFeatureToggle = (column: string) => {
    const currentFeatures = config.feature_columns || [];
    const newFeatures = currentFeatures.includes(column)
      ? currentFeatures.filter(f => f !== column)
      : [...currentFeatures, column];
    
    setConfig({ ...config, feature_columns: newFeatures });
  };

  const availableFeatures = fileInfo.columns.filter(col => col !== config.target_column);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          SVR Configuration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Target Column Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Target className="h-4 w-4" />
              Target Column
            </label>
            <select
              value={config.target_column}
              onChange={(e) => setConfig({ ...config, target_column: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select target column...</option>
              {numericColumns.map(column => (
                <option key={column} value={column}>
                  {column} ({fileInfo.dtypes[column]})
                </option>
              ))}
            </select>
            {errors.target_column && (
              <p className="text-sm text-red-600 mt-1">{errors.target_column}</p>
            )}
          </div>

          {/* Feature Columns Selection */}
          <div>
            <label className="text-sm font-medium mb-2 block">
              Feature Columns
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-md p-3">
              {availableFeatures.map(column => (
                <label key={column} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.feature_columns?.includes(column) || false}
                    onChange={() => handleFeatureToggle(column)}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm">{column}</span>
                </label>
              ))}
            </div>
            {errors.feature_columns && (
              <p className="text-sm text-red-600 mt-1">{errors.feature_columns}</p>
            )}
          </div>

          {/* SVR Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">C (Regularization)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                value={config.C}
                onChange={(e) => setConfig({ ...config, C: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Epsilon</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={config.epsilon}
                onChange={(e) => setConfig({ ...config, epsilon: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Gamma</label>
              <select
                value={config.gamma}
                onChange={(e) => setConfig({ ...config, gamma: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="scale">Scale</option>
                <option value="auto">Auto</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Test Size</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                max="0.9"
                value={config.test_size}
                onChange={(e) => setConfig({ ...config, test_size: parseFloat(e.target.value) })}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isTraining}
            size="lg"
          >
            {isTraining ? 'Training Model...' : 'Train SVR Model'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
