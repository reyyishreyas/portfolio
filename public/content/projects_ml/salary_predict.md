# SalaryPredict AI
## End-to-end salary estimation with a benchmarked stacking ensemble

Delivered as the internship project at Launched Global on the program's ~19.5k-row, 29-feature salary dataset. 1st Place — Launched Global ML Expo.

### Core Metrics & Telemetry
- **Dataset**: ~19.5k rows · 29 features
- **Best model**: stacking ensemble — MAE ₹5,791 (vs ₹41,512 for linear regression)
- **Benchmark**: five regression approaches compared
- **Deployment**: Flask app with bulk prediction and dashboards

### Technical Highlights
- **Comparative benchmarking**: five regression approaches trained and compared on MAE and R² before shipping the winner.
- **Stacking ensemble**: combines base regressors to cut error far below the linear baseline.
- **Flask app**: single and bulk prediction with dashboards for exploring results.
- **Fairness audit**: predictions audited by location, department and education.
