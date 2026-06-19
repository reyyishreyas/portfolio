# TRICP - Telecom Retention Intelligence & Churn Predictor
## Full-Stack Churn Analytics & Automated Retention System

An end-to-end customer churn analysis and proactive retention platform utilizing ensemble machine learning, explainable AI, and automated email campaigns.

### Core Metrics & Telemetry
- **Model Type**: Ensemble Classifiers (XGBoost, Random Forest, Logistic Regression)
- **Key Capabilities**: Customer churn probability scoring, What-If simulation, SHAP-based feature importance
- **Automation**: Event-driven SMTP integration for high-risk alerts

### Technical Highlights
- **Ensemble Model Architecture**: Leverages multiple classification algorithms combined into an ensemble pipeline to maximize recall on churn risk.
- **Explainable AI Integration**: Incorporates SHAP values to explain individual predictions, helping business stakeholders understand *why* a customer is likely to churn.
- **Interactive What-If Simulation**: Dynamic user dashboard allowing managers to adjust parameters (e.g. contract type, monthly charges) and preview the change in churn risk.
- **Automated Retention Pipeline**: Triggers custom, personalized retention emails to high-risk customers based on their primary churn risk factors (e.g. offering discounts on fiber optic connections).
