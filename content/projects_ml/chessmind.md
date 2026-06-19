# ChessMind AI - Adaptive Chess Intelligence System
## Adaptive Gameplay & Feature Analysis Engine

An adaptive chess engine powered by machine learning that analyzes games in real-time, extracts advanced positional features, and adjusts its playing strength dynamically.

### Core Metrics & Telemetry
- **Model Type**: Supervised Classification and Regression (Random Forest & XGBoost)
- **Dataset Size**: 100,000+ custom gameplay entries
- **Feature Set**: Centipawn loss, move quality metrics, game phase indicators, evaluation deltas
- **APIs Integrated**: Stockfish Engine & Gemini API

### Technical Highlights
- **Custom Gameplay Dataset**: Constructed a unique dataset of over 100,000 board configurations and evaluation metrics.
- **Advanced Feature Engineering**: Extracted centipawn loss, evaluation changes, game phase indicators (opening, middle, endgame), and custom tactical flags.
- **Model Training**: Trained supervised machine learning models, comparing Random Forest and XGBoost classifiers for move recommendation and quality classification.
- **Adaptive Intelligence**: Built a dynamic Elo adjustment system that reacts to opponent skill, leveraging Stockfish evaluation telemetry and Gemini strategic feedback.
