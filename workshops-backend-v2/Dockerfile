FROM python:3.11-slim AS backend-v2

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py .
COPY solver.py .

EXPOSE 5010

CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5010", "server:app"]
