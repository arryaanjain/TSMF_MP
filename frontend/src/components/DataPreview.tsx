import { Database, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import type { FileInfo } from '../services/api';

interface DataPreviewProps {
  fileInfo: FileInfo;
}

export const DataPreview: React.FC<DataPreviewProps> = ({ fileInfo }) => {
  return (
    <div className="space-y-6">
      {/* Dataset Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Dataset Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{fileInfo.shape[0]}</p>
              <p className="text-sm text-gray-600">Rows</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{fileInfo.shape[1]}</p>
              <p className="text-sm text-gray-600">Columns</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{fileInfo.filename}</p>
              <p className="text-sm text-gray-600">Filename</p>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">
                {Object.values(fileInfo.missing_values).reduce((sum, count) => sum + count, 0)}
              </p>
              <p className="text-sm text-gray-600">Missing Values</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Column Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Column Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3 font-medium">Column Name</th>
                  <th className="text-left p-3 font-medium">Data Type</th>
                  <th className="text-left p-3 font-medium">Missing Values</th>
                  <th className="text-left p-3 font-medium">Missing %</th>
                </tr>
              </thead>
              <tbody>
                {fileInfo.columns.map((column, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{column}</td>
                    <td className="p-3">
                      <span className={`
                        px-2 py-1 rounded-full text-xs font-medium
                        ${fileInfo.dtypes[column]?.includes('int') || fileInfo.dtypes[column]?.includes('float') 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'}
                      `}>
                        {fileInfo.dtypes[column]}
                      </span>
                    </td>
                    <td className="p-3">{fileInfo.missing_values[column] || 0}</td>
                    <td className="p-3">
                      {((fileInfo.missing_values[column] || 0) / fileInfo.shape[0] * 100).toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Data Preview */}
      <Card>
        <CardHeader>
          <CardTitle>Data Preview (First 5 rows)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b">
                  {fileInfo.columns.map((column, index) => (
                    <th key={index} className="text-left p-2 font-medium min-w-[100px]">
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {fileInfo.preview.map((row, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    {fileInfo.columns.map((column, colIndex) => (
                      <td key={colIndex} className="p-2">
                        {row[column] !== null && row[column] !== undefined 
                          ? String(row[column]) 
                          : <span className="text-gray-500 italic">null</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};