# Car Damage Detection

1 dự án vip pro tầm cỡ vũ trụ của 3 anh coder đam mê công nghệ. This project utilizes YOLOv8 for car damage detection with a React frontend.

## Prerequisites

- **Python** (3.8 or higher)
- **Node.js** (16 or higher) and **npm**
- **Git LFS**

> [!IMPORTANT] > **Git LFS Required**: This project uses Git Large File Storage (LFS) for the model file `best.pt`.
> When cloning the repository, make sure you have Git LFS installed:
>
> ```bash
> git lfs install
> git clone https://github.com/TDTer/Car-Damage-Detection.git
> git lfs pull
> ```

## Project Structure

- `backend/`: FastAPI backend server.
- `yolo-scan-ui/`: React + Vite frontend application.

## Setup Instructions

### 1. Backend Setup

Navigate to the `backend` directory:

```bash
cd backend
```

Create a virtual environment:

```bash
# Windows
python -m venv venv
.\venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Verify that `models/best.pt` exists (it should be pulled by Git LFS).

Start the backend server:

```bash
uvicorn main:app --host 127.0.0.1 --port 8001
```

The API will run at `http://127.0.0.1:8001`.

### 2. Frontend Setup

Open a new terminal and navigate to the `yolo-scan-ui` directory:

```bash
cd yolo-scan-ui
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The application will run at `http://localhost:5173`.

## Usage

1.  Open your browser and navigate to `http://localhost:5173`.
2.  **Login Credentials**:
    - **Username**: `sda`
    - **Password**: `dsad`
3.  Upload an image of a car to detect damages.

## Troubleshooting

- **Login Failed**: Ensure the backend is running on `127.0.0.1:8001`. If running on a different IP, update `src/api/api.js`.
- **Model Not Found**: If `best.pt` is missing or small (pointer file), run `git lfs pull` in the root directory.
