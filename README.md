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
# connect to kafka
docker exec -it loadbalancer-kafka-1 bash
# kafka create topics
/opt/kafka/bin/kafka-topics.sh \
  --create \
  --topic orders \
  --bootstrap-server localhost:9092 \
  --partitions 1 \
  --replication-factor 1
# kafka cek topics
/opt/kafka/bin/kafka-topics.sh \
  --list \
  --bootstrap-server localhost:9092