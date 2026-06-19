# SalaryPredict AI
## End-to-End Regression & Comparative Modelling Engine

An end-to-end salary estimation system that compares multiple regression models and serves predictions through a Flask dashboard.

### Core Metrics & Telemetry
- **Model Type**: Regression Comparison (XGBoost, Gradient Boosting, Random Forest, Voting Ensembles)
- **Primary Objective**: Low-variance compensation estimation
- **Deployment Interface**: Flask-based RESTful service and visual dashboard
- **Expo Rank**: 1st Place - Launched Global ML Expo

### Technical Highlights
- **Comparative Modeling**: Evaluated and compared several high-performance regression models (Random Forest, XGBoost, Gradient Boosting) using metrics like Mean Absolute Error (MAE) and R².
- **End-to-End Workflow**: Built a complete ML pipeline covering preprocessing (imputation, encoding), feature selection, hyperparameter tuning, model training, and deployment.
- **Flask Dashboard**: Developed an interactive web-based dashboard using Flask to take user details (experience, skills, location) and display compensation projections.
- **Ensemble Voting**: Implemented an ensemble voting regressor that averages predictions from individual estimators to reduce prediction variance.
