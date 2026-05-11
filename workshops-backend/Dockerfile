FROM golang:1.21.4 AS backend

WORKDIR /app
COPY go.mod ./
COPY go.sum ./
RUN go mod download
COPY src/*.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o /workshops-backend

EXPOSE 5000

ENTRYPOINT ["./workshops-backend"]
