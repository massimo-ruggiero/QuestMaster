# Quest Master

"Quest Master" is a project designed to assist authors in creating interactive narrative experiences, combining classical planning techniques (Planning Domain Definition Language - PDDL) with the capabilities offered by generative artificial intelligence (Large Language Models - LLM). The system is structured into two main phases: a story generation phase (Phase 1) and an interactive narrative game phase (Phase 2).

## Project Goal

The primary goal of Quest Master is to guide authors through the creation of a coherent and structured narrative experience, formally represented as a planning problem in PDDL. It also aims to provide an interactive gameplay experience based on the logical structure defined in the preceding phase.

## How to Run the Project

Follow these steps to get the "Quest Master" project up and running on your system.

### Prerequisites

Ensure you have the following tools installed:
* Python 3.x
* Node.js and npm

All Python dependencies can be installed via `pip`:
```bash
pip install -r requirements.txt
```

### Backend Installation and Startup

1.  **Clone the repository** (if you haven't already).
2.  **Navigate to the project's root directory**.
3.  **Start the backend server**:
    ```bash
    python backend/main.py
    ```
    The backend will be listening on `http://127.0.0.1:5001` (or the configured address).

### Frontend Installation and Startup

1.  **Navigate to the frontend directory**:
    ```bash
    cd frontend/frontend
    ```
    *Note*: Ensure you are in the correct folder where the `package.json` file is located.

2.  **Install Node.js dependencies (first time only)**:
    ```bash
    npm install
    ```

3.  **Start the frontend application**:
    ```bash
    npm run dev
    ```
    The frontend will be available at `http://localhost:5001` (or another port indicated by your React development environment).

Once both the backend and frontend are running, you can access the application through your web browser at the frontend address.
