# SVR RBF Application

A unified solution for performing Support Vector Regression with Radial Basis Function kernel. Users can upload CSV or XLSX files, configure SVR parameters, and visualize results through an intuitive web interface.

## Architecture

- **Backend**: FastAPI with Python for SVR implementation
- **Frontend**: React with TypeScript and Vite for the user interface
- **Machine Learning**: scikit-learn for SVR implementation
- **Visualization**: Plotly for interactive charts

## Features

### Backend (FastAPI)
- ✅ File upload endpoint (CSV, XLSX, XLS)
- ✅ Data preprocessing and validation
- ✅ SVR model training with RBF kernel
- ✅ Comprehensive metrics calculation (R², MSE, MAE)
- ✅ Interactive visualizations (Actual vs Predicted, Residuals)
- ✅ CORS configuration for frontend communication
- ✅ Environment-based configuration

### Frontend (React + TypeScript)
- ✅ Drag & drop file upload with validation
- ✅ Data preview with column information
- ✅ SVR parameter configuration interface
- ✅ Interactive results dashboard
- ✅ Step-by-step workflow
- ✅ Responsive design with Tailwind CSS

## Getting Started

### Prerequisites
- Python 3.8+
- Node.js 16+
- npm or yarn

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create and activate a virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your preferred settings
   ```

5. **Run the FastAPI server:**
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL (default: http://localhost:8000)
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:5173`

## Usage

1. **Upload Dataset**: Drag and drop or select a CSV/XLSX file containing your data
2. **Preview Data**: Review the dataset structure, columns, and data types
3. **Configure SVR**: Select target column, feature columns, and adjust SVR parameters:
   - **C**: Regularization parameter
   - **Epsilon**: Tube radius for SVR
   - **Gamma**: Kernel coefficient (scale/auto)
   - **Test Size**: Proportion of data for testing
4. **View Results**: Analyze model performance with metrics and visualizations

## API Endpoints

### GET `/health`
Health check endpoint

### POST `/api/v1/upload-info`
Upload file and get dataset information
- **Input**: Multipart form with file
- **Output**: File info including columns, dtypes, shape, and preview

### POST `/api/v1/train-svr`
Train SVR model on uploaded data
- **Input**: Multipart form with file and SVR parameters
- **Output**: Model metrics, configuration, and visualizations

## Configuration

### Backend Environment Variables
```bash
# FastAPI Configuration
HOST=0.0.0.0
PORT=8000
DEBUG=True

# CORS Configuration
CORS_ORIGINS=["http://localhost:5173"]

# SVR Default Parameters
DEFAULT_C=1.0
DEFAULT_EPSILON=0.1
DEFAULT_GAMMA=scale
DEFAULT_KERNEL=rbf
```

### Frontend Environment Variables
```bash
# API Configuration
VITE_API_URL=http://localhost:8000
VITE_API_PREFIX=/api/v1

# File Upload Limits
VITE_MAX_FILE_SIZE=52428800
VITE_ALLOWED_EXTENSIONS=csv,xlsx,xls
```

## Dependencies

### Backend
- **fastapi**: Web framework
- **pandas**: Data manipulation
- **scikit-learn**: Machine learning library
- **plotly**: Interactive visualizations
- **uvicorn**: ASGI server
- **python-multipart**: File upload support

### Frontend
- **react**: UI library
- **typescript**: Type safety
- **vite**: Build tool
- **tailwindcss**: Styling
- **axios**: HTTP client
- **react-dropzone**: File upload
- **react-plotly.js**: Chart visualization
- **lucide-react**: Icons

## File Structure

```
backend/
├── main.py                 # FastAPI application
├── requirements.txt        # Python dependencies
├── .env.example           # Environment variables template
└── .gitignore             # Git ignore rules

frontend/
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # UI components
│   │   ├── FileUpload.tsx
│   │   ├── DataPreview.tsx
│   │   ├── SVRConfig.tsx
│   │   └── ResultsDisplay.tsx
│   ├── services/         # API services
│   ├── lib/              # Utility functions
│   ├── App.tsx           # Main application
│   └── main.tsx          # Entry point
├── package.json          # Node dependencies
├── .env.example         # Environment variables template
└── tailwind.config.js   # Tailwind configuration
```

## Model Performance Metrics

The application provides comprehensive metrics to evaluate SVR performance:

- **R² Score**: Coefficient of determination (higher is better, max 1.0)
- **MSE**: Mean Squared Error (lower is better)
- **MAE**: Mean Absolute Error (lower is better, same units as target)

## Visualizations

- **Actual vs Predicted Plot**: Shows model accuracy
- **Residuals Plot**: Shows prediction errors distribution

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
