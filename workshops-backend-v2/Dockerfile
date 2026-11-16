FROM python:3.11-slim AS backend-v2

WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY server.py .
COPY solver.py .

EXPOSE 5010

# See solver.py: timeout here should be enough for all assignments to be computed
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:5010", "--timeout", "960", "server:app"]
