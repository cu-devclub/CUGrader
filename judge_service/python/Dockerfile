FROM golang:1.23.4

# Install required system packages
RUN apt-get update && apt-get install -y \
    git make g++ pkg-config libcap-dev libsystemd-dev python3 \
    && rm -rf /var/lib/apt/lists/*

# Clone and build isolate
RUN git clone https://github.com/ioi/isolate.git /tmp/isolate \
    && cd /tmp/isolate \
    && make isolate isolate-cg-keeper \
    && make install \
    && rm -rf /tmp/isolate

# Create non-root user
RUN useradd -ms /bin/bash judgeuser
USER judgeuser
WORKDIR /home/judgeuser/python

# Copy Go module files first
COPY --chown=judgeuser:judgeuser go.mod go.sum ./
RUN go mod download

# Copy Go source code
COPY --chown=judgeuser:judgeuser . .

# Build your Go service
RUN go build -o judge-service .

# Run your service
ENTRYPOINT ["./judge-service"]
