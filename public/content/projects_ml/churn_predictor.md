# Enterprise Churn Predictor
## High-Throughput Classification Pipeline

An industrial-grade batch inference and classification pipeline designed to identify churn-risk accounts in enterprise SaaS environments.

### Core Metrics & Telemetry
- **Frameworks**: Scikit-Learn, XGBoost, LightGBM
- **Feature Engineering**: Pandas preprocessing pipelines with custom NumPy transformations
- **Data Throughput**: 1.2M records processed per batch execution
- **Model Type**: Binary Classification Ensemble

### Technical Highlights
- **Pre-processing Engine**: Robust imputation, scale alignment, and categorical encoding pipelines.
- **Batch Inference System**: Distributed chunk-based loading with async task workers for high reliability.
- **Metrics Dashboard**: Computes ROC-AUC, Precision-Recall curves, and custom monetary cost impact tables.
