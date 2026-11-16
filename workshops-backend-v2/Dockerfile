FROM python:3.11-slim AS backend-v2

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py .
COPY solver.py .

EXPOSE 5010

# Above the longest request solver.py allows: 15 requested assignments x 60 s.
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5010", "--timeout", "960", "server:app"]
