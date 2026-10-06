# Research Paper Analyst
## Agentic RAG with a RAGAS evaluation harness

Answers questions across a corpus of five research papers with cited sources, and measures its own retrieval quality on a fixed evaluation set. Live at research-agent-rag.streamlit.app.

### Core Metrics & Telemetry
- **Pipeline**: planner → retriever → verifier (LangChain + LangGraph + Gemini)
- **Retrieval**: hybrid BM25 + FAISS with reciprocal rank fusion
- **Evaluation**: RAGAS on a fixed 30-question set — faithfulness, context precision, context recall
- **Shipping**: 15-test pytest suite, Dockerfile, Streamlit deployment

### Technical Highlights
- **Agentic stages**: a planner routes each query, a retriever pulls evidence, and a verifier checks the answer against its sources before it is shown.
- **Hybrid retrieval**: BM25 (keywords) and FAISS (embeddings) combined with reciprocal rank fusion for grounded, source-cited answers.
- **RAG evaluation harness**: RAGAS scores faithfulness, context precision and context recall on a fixed 30-question set across dense and hybrid retrieval configurations.
- **Reproducible shipping**: a pytest suite and Dockerfile so the evaluation runs the same way anywhere.
