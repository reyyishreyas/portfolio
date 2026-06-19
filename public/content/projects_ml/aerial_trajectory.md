# AI-Based Aerial Trajectory Prediction & Autonomous Simulation System
## Deep Learning Simulation Pipeline

A deep learning system built to predict aerial trajectories and run autonomous simulation visualizations.

### Core Metrics & Telemetry
- **Model Type**: Deep Recurrent Neural Networks (LSTM & GRU)
- **Primary Objective**: Sequence-to-sequence flight path prediction
- **Pipeline Components**: Synthetic data generation, feature scaling, model inference, and real-time visualization

### Technical Highlights
- **Architecture**: Employs Long Short-Term Memory (LSTM) and Gated Recurrent Unit (GRU) networks to handle complex flight sequences and temporal dynamics.
- **Data Preprocessing**: Custom synthetic flight telemetry data generation, normalization using MinMaxScaler, and multi-step window sequencing.
- **Autonomous Simulation**: Interactive 2D/3D visualization interface to plot and compare predicted versus ground-truth aerial trajectories.
- **Model Optimization**: Implements early stopping and dropout layers to prevent overfitting on noisy simulation parameters.
