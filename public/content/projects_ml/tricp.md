# TRICP — Telecom Retention Intelligence & Churn Predictor
## Full-stack churn analytics with automated retention and intervention simulation

An end-to-end customer retention platform: churn prediction over a stacking ensemble, retention-email automation and what-if intervention simulation, deployed live on Vercel.

### Core Metrics & Telemetry
- **Dataset**: 7,043 customers
- **Model**: Stacking ensemble — ROC AUC 0.827
- **Backend**: FastAPI with interactive OpenAPI docs
- **Frontend**: React/Vite, deployed on Vercel

### Technical Highlights
- **Churn scoring**: a stacking ensemble estimates churn probability for every customer.
- **Retention automation**: personalized retention emails triggered for high-risk customers based on their primary risk factors.
- **Intervention simulation**: managers preview how contract, billing and service changes shift churn risk before acting.
- **Built with AI pair-programming**: developed end-to-end with Claude Code, from the FastAPI backend to the React frontend.
