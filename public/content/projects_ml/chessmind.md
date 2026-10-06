# ChessMind AI — Adaptive Chess Coach with Self-Hosted LLM
## Per-move Elo estimation with explainable, validated suggestions

An adaptive chess coach that estimates opponent strength from move history and serves Stockfish-validated move suggestions explained by a local LLM.

### Core Metrics & Telemetry
- **Model**: 8-model stacking ensemble on 50,028 move samples (game-level split — no game across train and test)
- **Accuracy**: Held-out R² 0.959 · MAE 0.76 Elo
- **Serving**: ~160 ms/move via FastAPI; first-feedback latency cut from 7.6 s to 1.7 s (streaming, caching)
- **Validation**: Stockfish-validated suggestions, explained by a local Ollama LLM
- **CI**: lint, typecheck, 63 tests and build on every push

### Technical Highlights
- **Custom move dataset**: 50,028 move samples with game-level splits, so no game leaks across train and test.
- **Stacking ensemble**: eight models combined to predict per-move Elo change, calibrated against opponent strength.
- **Adaptive serving**: FastAPI service answering in ~160 ms; streaming and caching cut first feedback from 7.6 s to 1.7 s.
- **Explainable moves**: every suggestion is validated against Stockfish and explained in plain language by a local Ollama LLM.
