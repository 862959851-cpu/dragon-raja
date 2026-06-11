FROM python:3.11-slim

LABEL description="卡塞尔学院录取通知书生成器"
LABEL source="https://github.com/jiangnan/dragon-raja-cassell"

# Install system deps: Tectonic, Chinese fonts, Liberation fonts for English
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    libgraphite2-3 \
    fonts-noto-cjk \
    fonts-liberation2 \
    && rm -rf /var/lib/apt/lists/*

# Install Tectonic (static binary)
ARG TECTONIC_VER=0.16.9
RUN curl -fsSL \
    "https://github.com/tectonic-typesetting/tectonic/releases/download/tectonic%40${TECTONIC_VER}/tectonic-${TECTONIC_VER}-x86_64-unknown-linux-musl.tar.gz" \
    | tar xz -C /usr/local/bin

# Pre-cache Tectonic bundle so first runtime compile is fast
ENV TECTONIC_CACHE_DIR=/tectonic-cache
RUN mkdir -p "$TECTONIC_CACHE_DIR" && \
    printf '%s\n' \
      '\documentclass{article}' \
      '\begin{document}' \
      'Pre-caching Tectonic bundle...' \
      '\end{document}' > /tmp/precache.tex && \
    tectonic -X compile --outdir /tmp /tmp/precache.tex 2>&1 && \
    rm -rf /tmp/precache.*

WORKDIR /app

# Copy app files (work/ contains everything)
COPY work/ .

# Use the deploy server
RUN mv server.deploy.py server.py

# Clean up dev files not needed in production
RUN rm -f generate_pdf.py server.js server.mjs package.json

# Runtime dirs
RUN mkdir -p outputs

EXPOSE 8080

CMD ["python3", "server.py"]
