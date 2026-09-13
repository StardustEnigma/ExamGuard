# =======================================================
# Multi-stage Dockerfile for Go Concurrency Backend
# =======================================================

# Stage 1: Build binary
FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git and SSL certificates for fetching modules
RUN apk add --no-cache git ca-certificates

# Cache dependencies
COPY go.mod go.sum* ./
RUN go mod download || true

# Copy application source code
COPY . .

# Build statically linked binary
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o /examguard-server ./cmd/server/main.go || true

# Stage 2: Minimal runtime image
FROM alpine:3.19

WORKDIR /root/

RUN apk add --no-cache ca-certificates tzdata curl

# Copy compiled binary from builder
COPY --from=builder /examguard-server .

EXPOSE 8080

CMD ["./examguard-server"]
