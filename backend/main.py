import os
import json
import pandas as pd
import numpy as np
from typing import Optional, List, Dict, Any
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from sklearn.svm import SVR
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
import matplotlib
matplotlib.use('Agg')  # Use non-interactive backend
import matplotlib.pyplot as plt
import seaborn as sns
from io import StringIO, BytesIO
import base64
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(
    title=os.getenv("APP_NAME", "SVR RBF Application"),
    version=os.getenv("APP_VERSION", "1.0.0"),
    description="Support Vector Regression with RBF Kernel API"
)

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000", 
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "http://localhost:8000"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Pydantic Models
class FileInfo(BaseModel):
    filename: str
    shape: tuple[int, int]
    columns: List[str]
    dtypes: Dict[str, str]
    missing_values: Dict[str, int]
    preview: List[Dict[str, Any]]

class SVRParameters(BaseModel):
    C: Optional[float] = 1.0
    epsilon: Optional[float] = 0.1
    gamma: Optional[str] = "scale"
    kernel: Optional[str] = "rbf"
    target_column: str
    feature_columns: Optional[List[str]] = None
    test_size: Optional[float] = 0.2
    random_state: Optional[int] = 42

class SVRMetrics(BaseModel):
    train_mse: float
    test_mse: float
    train_r2: float
    test_r2: float
    train_mae: float
    test_mae: float

class SVRResult(BaseModel):
    model_parameters: Dict[str, Any]
    metrics: SVRMetrics
    data_info: Dict[str, Any]
    plots: Dict[str, Any]

class ApiResponse(BaseModel):
    success: bool
    message: str
    data: Optional[Any] = None
    error: Optional[str] = None

# Utility Functions
def read_file(file: UploadFile) -> pd.DataFrame:
    """Read uploaded file into pandas DataFrame"""
    try:
        if file.filename.endswith('.csv'):
            content = file.file.read().decode('utf-8')
            df = pd.read_csv(StringIO(content))
        elif file.filename.endswith(('.xlsx', '.xls')):
            content = file.file.read()
            df = pd.read_excel(BytesIO(content))
        else:
            raise HTTPException(status_code=400, detail="Unsupported file format")
        
        return df
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading file: {str(e)}")

def create_plot_base64(fig) -> str:
    """Convert matplotlib figure to base64 string"""
    try:
        buffer = BytesIO()
        fig.savefig(buffer, format='png', dpi=150, bbox_inches='tight', 
                   facecolor='white', edgecolor='none')
        buffer.seek(0)
        plot_data = buffer.getvalue()
        buffer.close()
        plt.close(fig)
        
        encoded_plot = base64.b64encode(plot_data).decode('utf-8')
        return f"data:image/png;base64,{encoded_plot}"
    except Exception as e:
        plt.close(fig)
        raise Exception(f"Error creating plot: {str(e)}")

# API Endpoints
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "app": os.getenv("APP_NAME", "SVR RBF Application")
    }

@app.post("/api/v1/upload-info", response_model=ApiResponse)
async def upload_file_info(file: UploadFile = File(...)):
    """Upload file and return basic information about the dataset"""
    try:
        # Validate file size
        max_size = int(os.getenv("MAX_FILE_SIZE", 50485760))  # 50MB
        if file.size and file.size > max_size:
            return ApiResponse(
                success=False,
                message="File too large",
                error=f"File size exceeds {max_size} bytes"
            )
        
        # Validate file extension
        allowed_extensions = ["csv", "xlsx", "xls"]
        file_extension = file.filename.split(".")[-1].lower()
        if file_extension not in allowed_extensions:
            return ApiResponse(
                success=False,
                message="Invalid file format",
                error=f"Only {allowed_extensions} files are allowed"
            )
        
        # Read the file
        df = read_file(file)
        
        # Get file information
        file_info = FileInfo(
            filename=file.filename,
            shape=(len(df), len(df.columns)),
            columns=df.columns.tolist(),
            dtypes={col: str(dtype) for col, dtype in df.dtypes.items()},
            missing_values={col: int(df[col].isnull().sum()) for col in df.columns},
            preview=df.head().fillna("").to_dict('records')
        )
        
        return ApiResponse(
            success=True,
            message="File uploaded successfully",
            data=file_info.dict()
        )
        
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to process file",
            error=str(e)
        )

@app.post("/api/v1/train-svr", response_model=ApiResponse)
async def train_svr_model(
    file: UploadFile = File(...),
    parameters: str = Form(...)
):
    """Train SVR model and return results"""
    try:
        # Parse parameters
        params = SVRParameters.parse_raw(parameters)
        
        # Read the file
        df = read_file(file)
        
        # Validate target column
        if params.target_column not in df.columns:
            return ApiResponse(
                success=False,
                message="Invalid target column",
                error=f"Column '{params.target_column}' not found in dataset"
            )
        
        # Select features
        if params.feature_columns:
            feature_cols = params.feature_columns
        else:
            feature_cols = [col for col in df.columns if col != params.target_column]
        
        # Validate feature columns
        missing_cols = [col for col in feature_cols if col not in df.columns]
        if missing_cols:
            return ApiResponse(
                success=False,
                message="Invalid feature columns",
                error=f"Columns not found: {missing_cols}"
            )
        
        # Prepare data
        X = df[feature_cols].select_dtypes(include=[np.number])
        y = df[params.target_column]
        
        if X.empty:
            return ApiResponse(
                success=False,
                message="No numeric features found",
                error="At least one numeric feature column is required"
            )
        
        # Handle missing values
        X = X.fillna(X.mean())
        y = y.fillna(y.mean())
        
        # Split data
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=params.test_size, random_state=params.random_state
        )
        
        # Scale features
        scaler = StandardScaler()
        X_train_scaled = scaler.fit_transform(X_train)
        X_test_scaled = scaler.transform(X_test)
        
        # Train SVR model
        svr = SVR(
            C=params.C,
            epsilon=params.epsilon,
            gamma=params.gamma,
            kernel=params.kernel
        )
        svr.fit(X_train_scaled, y_train)
        
        # Make predictions
        y_train_pred = svr.predict(X_train_scaled)
        y_test_pred = svr.predict(X_test_scaled)
        
        # Calculate metrics
        metrics = SVRMetrics(
            train_mse=float(mean_squared_error(y_train, y_train_pred)),
            test_mse=float(mean_squared_error(y_test, y_test_pred)),
            train_r2=float(r2_score(y_train, y_train_pred)),
            test_r2=float(r2_score(y_test, y_test_pred)),
            train_mae=float(mean_absolute_error(y_train, y_train_pred)),
            test_mae=float(mean_absolute_error(y_test, y_test_pred))
        )
        
        # Create plots
        plt.style.use('default')
        
        # Actual vs Predicted plot
        fig1, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
        fig1.patch.set_facecolor('white')
        
        # Training data
        ax1.scatter(y_train, y_train_pred, alpha=0.7, color='#3498db', s=50, edgecolors='darkblue', linewidth=0.5)
        min_val = min(y_train.min(), y_train_pred.min())
        max_val = max(y_train.max(), y_train_pred.max())
        ax1.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect Prediction')
        ax1.set_xlabel('Actual Values', fontsize=12)
        ax1.set_ylabel('Predicted Values', fontsize=12)
        ax1.set_title(f'Training Set - Actual vs Predicted\n(R² = {metrics.train_r2:.3f})', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.legend()
        
        # Test data
        ax2.scatter(y_test, y_test_pred, alpha=0.7, color='#2ecc71', s=50, edgecolors='darkgreen', linewidth=0.5)
        min_val = min(y_test.min(), y_test_pred.min())
        max_val = max(y_test.max(), y_test_pred.max())
        ax2.plot([min_val, max_val], [min_val, max_val], 'r--', lw=2, label='Perfect Prediction')
        ax2.set_xlabel('Actual Values', fontsize=12)
        ax2.set_ylabel('Predicted Values', fontsize=12)
        ax2.set_title(f'Test Set - Actual vs Predicted\n(R² = {metrics.test_r2:.3f})', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3)
        ax2.legend()
        
        plt.tight_layout(pad=3.0)
        actual_vs_predicted_plot = create_plot_base64(fig1)
        
        # Residuals plot
        fig2, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 7))
        fig2.patch.set_facecolor('white')
        
        # Training residuals
        train_residuals = y_train - y_train_pred
        ax1.scatter(y_train_pred, train_residuals, alpha=0.7, color='#3498db', s=50, edgecolors='darkblue', linewidth=0.5)
        ax1.axhline(y=0, color='red', linestyle='--', linewidth=2, label='Zero Error Line')
        ax1.set_xlabel('Predicted Values', fontsize=12)
        ax1.set_ylabel('Residuals (Actual - Predicted)', fontsize=12)
        ax1.set_title('Training Set - Residuals Plot', fontsize=14, fontweight='bold')
        ax1.grid(True, alpha=0.3)
        ax1.legend()
        
        # Test residuals
        test_residuals = y_test - y_test_pred
        ax2.scatter(y_test_pred, test_residuals, alpha=0.7, color='#2ecc71', s=50, edgecolors='darkgreen', linewidth=0.5)
        ax2.axhline(y=0, color='red', linestyle='--', linewidth=2, label='Zero Error Line')
        ax2.set_xlabel('Predicted Values', fontsize=12)
        ax2.set_ylabel('Residuals (Actual - Predicted)', fontsize=12)
        ax2.set_title('Test Set - Residuals Plot', fontsize=14, fontweight='bold')
        ax2.grid(True, alpha=0.3)
        ax2.legend()
        
        plt.tight_layout(pad=3.0)
        residuals_plot = create_plot_base64(fig2)
        
        # Prepare result
        result = SVRResult(
            model_parameters={
                **params.dict(),
                "feature_columns": X.columns.tolist()
            },
            metrics=metrics,
            data_info={
                "total_samples": len(df),
                "training_samples": len(X_train),
                "test_samples": len(X_test),
                "features": len(X.columns),
                "feature_names": X.columns.tolist()
            },
            plots={
                "actual_vs_predicted": actual_vs_predicted_plot,
                "residuals": residuals_plot
            }
        )
        
        return ApiResponse(
            success=True,
            message="SVR model trained successfully",
            data=result.dict()
        )
        
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to train SVR model",
            error=str(e)
        )

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "main:app",
        host=os.getenv("HOST", "0.0.0.0"),
        port=int(os.getenv("PORT", 8000)),
        reload=bool(os.getenv("RELOAD", True))
    )