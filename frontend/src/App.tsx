import { useState } from 'react';
import { Activity, Github, ExternalLink } from 'lucide-react';
import { FileUpload } from './components/FileUpload';
import { DataPreview } from './components/DataPreview'
import { SVRConfig } from './components/SVRConfig';
import { ResultsDisplay } from './components/ResultsDisplay';
import { Button } from './components/ui/button';
import { Card, CardContent } from './components/ui/card';
import { apiService } from './services/api';
import type { FileInfo, SVRParameters, SVRResult } from './services/api';
import './App.css';

type AppStep = 'upload' | 'preview' | 'config' | 'results';

function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [svrResult, setSvrResult] = useState<SVRResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.uploadFileInfo(file);
      if (response.success && response.data) {
        setFileInfo(response.data);
        setCurrentStep('preview');
      } else {
        setError(response.error || 'Failed to process file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload file');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setFileInfo(null);
    setSvrResult(null);
    setCurrentStep('upload');
    setError('');
  };

  const handleConfigureModel = () => {
    setCurrentStep('config');
  };

  const handleTrainModel = async (parameters: SVRParameters) => {
    if (!selectedFile) return;

    setError('');
    setIsLoading(true);

    try {
      const response = await apiService.trainSVR(selectedFile, parameters);
      if (response.success && response.data) {
        setSvrResult(response.data);
        setCurrentStep('results');
      } else {
        setError(response.error || 'Failed to train model');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to train model');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartOver = () => {
    setSelectedFile(null);
    setFileInfo(null);
    setSvrResult(null);
    setCurrentStep('upload');
    setError('');
  };

  const getStepNumber = (step: AppStep): number => {
    const steps: AppStep[] = ['upload', 'preview', 'config', 'results'];
    return steps.indexOf(step) + 1;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">SVR RBF Application</h1>
                <p className="text-sm text-gray-600">
                  Support Vector Regression with Radial Basis Function Kernel
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub
                </Button>
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          {(['upload', 'preview', 'config', 'results'] as AppStep[]).map((step, index) => (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium
                ${currentStep === step 
                  ? 'bg-blue-600 text-white' 
                  : getStepNumber(currentStep) > index + 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }
              `}>
                {getStepNumber(currentStep) > index + 1 ? '✓' : index + 1}
              </div>
              <span className={`
                ml-2 text-sm font-medium capitalize
                ${currentStep === step ? 'text-blue-600' : 'text-gray-600'}
              `}>
                {step}
              </span>
              {index < 3 && (
                <div className={`
                  w-12 h-0.5 mx-4
                  ${getStepNumber(currentStep) > index + 1 ? 'bg-green-500' : 'bg-gray-200'}
                `} />
              )}
            </div>
          ))}
        </div>

        {/* Error Display */}
        {error && (
          <Card className="mb-6 border-red-200">
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2 text-red-600">
                <ExternalLink className="h-5 w-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-6">
          {currentStep === 'upload' && (
            <FileUpload
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              selectedFile={selectedFile || undefined}
              isUploading={isLoading}
            />
          )}

          {currentStep === 'preview' && fileInfo && (
            <>
              <DataPreview fileInfo={fileInfo} />
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={handleStartOver}>
                  Start Over
                </Button>
                <Button onClick={handleConfigureModel}>
                  Configure SVR Model
                </Button>
              </div>
            </>
          )}

          {currentStep === 'config' && fileInfo && (
            <>
              <SVRConfig
                fileInfo={fileInfo}
                onTrain={handleTrainModel}
                isTraining={isLoading}
              />
              <div className="flex justify-center">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep('preview')}
                  disabled={isLoading}
                >
                  Back to Preview
                </Button>
              </div>
            </>
          )}

          {currentStep === 'results' && svrResult && (
            <>
              <ResultsDisplay result={svrResult} />
              <div className="flex justify-center space-x-4">
                <Button variant="outline" onClick={() => setCurrentStep('config')}>
                  Modify Configuration
                </Button>
                <Button onClick={handleStartOver}>
                  Start New Analysis
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-gray-50/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-lg font-medium">
                  {currentStep === 'upload' ? 'Processing file...' : 'Training SVR model...'}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t bg-white mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-gray-600">
            <p>Built with FastAPI, React, and scikit-learn</p>
            <p className="mt-1">
              © {new Date().getFullYear()} SVR RBF Application. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
