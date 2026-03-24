# Docker down and up
docker compose down
docker compose up --build
# Check container yang aktif
docker ps
# Untuk melakukan Seed Data di Redis, masuk kedalam container
docker exec -it loadbalancer-backend1-1 sh
# lalu jalankan
node seed.js
# liat log worker
docker-compose logs -f worker
docker compose logs -f -t worker
docker compose logs -f worker | grep Processing
# multi service monitoring
docker compose logs -f nginx backend1 backend2 worker