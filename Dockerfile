# 1. Pake Node.js versi 18 (Stabil)
FROM node:18-slim

# 2. Install FFmpeg & Python (Wajib buat engine downloader)
# Walaupun codingan lu JS, yt-dlp aslinya butuh python
RUN apt-get update && \
    apt-get install -y ffmpeg python3 python3-pip && \
    rm -rf /var/lib/apt/lists/*

# 3. Set folder kerja
WORKDIR /app

# 4. Copy package.json dulu (biar cache Docker jalan)
COPY package*.json ./

# 5. Install dependencies Node.js
RUN npm install --production

# 6. Copy semua sisa codingan lu (server.js, public, dll)
COPY . .

# 7. Bikin folder temp (buat processing sementara, auto-delete setelah send ke user)
RUN mkdir -p temp

# 8. Buka Port (Misal aplikasi lu jalan di port 3000)
EXPOSE 3000

# 9. Jalanin servernya
CMD ["node", "server.js"]