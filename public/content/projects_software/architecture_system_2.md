# Event Stream Broker
## High-Throughput Pub/Sub Message Hub

A highly concurrent pub/sub streaming platform designed to ingestion-process metrics and logs across massive telemetry systems.

### System Architecture & Backend Design
- **Architecture Style**: Event-driven message broker with consumer-group offset tracking.
- **Concurreny Model**: Non-blocking asynchronous I/O multiplexing utilizing epoll/kqueue event loops.
- **Separation of Concerns**: Isolated storage nodes (Log Segment Writer) from coordination nodes (Raft consensus manager).

### Database Integration & Routing Logic
- **Database Engine**: Custom log-structured merge (LSM) tree for telemetry metadata, and append-only disk segments.
- **Routing Engine**: Topic-partition mapping layer with consistent hashing rings for node-balance configuration.
- **Ingress Rate**: 120,000 write operations per second with zero message loss constraints.

### Security Handling & Production Workflows
- **Security Posture**: SASL/SCRAM authentication for clients, SSL encryption for inter-broker replication traffic.
- **CI/CD Pipeline**: Automated canary deployments and performance regression tests integrated inside GitHub workflows.
- **Telemetry System**: Datadog metrics and Grafana alerts for latency spikes.
