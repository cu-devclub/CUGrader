FROM golang:1.25-bookworm

# Install required system packages
RUN apt-get update && apt-get install -y --no-install-recommends \
    git make g++ pkg-config libcap-dev libsystemd-dev libseccomp-dev python3 ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Clone and build isolate
RUN git clone --depth 1 https://github.com/ioi/isolate.git /tmp/isolate \
    && cd /tmp/isolate \
    && make isolate isolate-cg-keeper \
    && make install \
    && rm -rf /tmp/isolate \
    && mkdir -p /var/local/lib/isolate

WORKDIR /app

# Copy Go module files first
COPY go.mod go.sum ./
RUN go mod download

# Copy Go source code
COPY . .

# Build Go service
RUN go build -ldflags="-w -s" -o judge-service .

ENTRYPOINT ["./judge-service"]
