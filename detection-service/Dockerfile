FROM python:3.9-slim

# Install system dependencies if any are needed (e.g., git, curl)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /code

# Copy requirements and install dependencies
COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

# Set up a new user named "user" with UID 1000 to avoid running as root
RUN useradd -m -u 1000 user
USER user

# Set environment variables for huggingface environment
ENV HOME=/home/user \
    PATH=/home/user/.local/bin:$PATH \
    PYTHONUNBUFFERED=1

# Set the working directory inside home
WORKDIR $HOME/app

# Copy the app to working directory and set owner to user
COPY --chown=user . $HOME/app

# Hugging Face Spaces runs on port 7860
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "7860"]
