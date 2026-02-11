#!/usr/bin/env bash

set -euo pipefail

echo "========================================"
echo "  Zapusk proekta Aero v Docker (Linux)"
echo "  BD, migracii, skripty, HTTPS nginx"
echo "========================================"
echo

# Shag 1: Proverka .env fayla
echo "[Shag 1] Proverka .env fayla..."
if [[ ! -f .env ]]; then
  echo "[SOZDANIE] .env fayla..."
  if [[ -f env.docker.example ]]; then
    cp env.docker.example .env
    echo "[OK] Fayl .env sozdan iz env.docker.example"
    echo "[INFO] Proverte i pri neobhodimosti otredaktiruyte .env fayl"
  else
    echo "[OSHIBKA] Fayl env.docker.example ne nayden!"
    exit 1
  fi
else
  echo "[OK] Fayl .env uzhe sushestvuet"
fi
echo

# Shag 2: Proverka i sozdanie SSL sertifikatov
echo "[Shag 2] Proverka SSL sertifikatov..."
if [[ ! -d nginx/ssl ]]; then
  echo "[SOZDANIE] Direktorii nginx/ssl..."
  mkdir -p nginx/ssl
fi

if [[ ! -f nginx/ssl/cert.pem ]]; then
  echo "[VNIMANIE] SSL sertifikaty ne naydeny!"
  echo "[SOZDANIE] Popytka avtomaticheskogo sozdaniya..."
  echo

  if command -v openssl >/dev/null 2>&1; then
    set +e
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
      -keyout nginx/ssl/key.pem \
      -out nginx/ssl/cert.pem \
      -subj "/C=BY/ST=Minsk/L=Minsk/O=BelAeronavigatsia/CN=localhost"
    OPENSSL_EXIT=$?
    set -e

    if [[ $OPENSSL_EXIT -eq 0 ]]; then
      echo "[OK] SSL sertifikaty sozdany"
    else
      echo "[OSHIBKA] Oshibka pri sozdanii sertifikatov"
      echo
      echo "Varianty resheniya:"
      echo "1. Ustanovite OpenSSL (apt install openssl ili analogichno dlya vashey OS)"
      echo "2. Sozdayte sertifikaty vruchnuyu v papke nginx/ssl"
      echo
      echo "[VAZHNO] Bez SSL sertifikatov HTTPS ne budet rabotat!"
      exit 1
    fi
  else
    echo "[OSHIBKA] OpenSSL ne nayden!"
    echo "Ustanovite OpenSSL (apt install openssl ili analogichno dlya vashey OS)"
    echo "[VAZHNO] Bez SSL sertifikatov HTTPS ne budet rabotat!"
    exit 1
  fi
else
  echo "[OK] SSL sertifikaty naydeny"
fi
echo

# Shag 3: Proverka Docker
echo "[Shag 3] Proverka Docker..."
if ! command -v docker >/dev/null 2>&1; then
  echo "[OSHIBKA] Docker ne ustanovlen ili ne zapushchen!"
  echo
  echo "Ustanovite Docker (Docker Engine / Docker Desktop) i zapustite ego."
  echo "Skachat mozhno s sayta Docker."
  exit 1
else
  echo "[OK] $(docker --version)"
fi

if command -v docker-compose >/dev/null 2>&1; then
  echo "[OK] $(docker-compose --version)"
elif docker compose version >/dev/null 2>&1; then
  echo "[OK] $(docker compose version)"
else
  echo "[OSHIBKA] Docker Compose ne nayden!"
  echo "Ustanovite docker-compose ili ispolzuyte 'docker compose'."
  exit 1
fi
echo

DC="docker-compose"
if ! command -v docker-compose >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  DC="docker compose"
fi

# Shag 4: Proverka konteynerov
echo "[Shag 4] Proverka sushestvuyushchih konteynerov..."
if ! $DC -f docker-compose.https.yml ps -q >/dev/null 2>&1; then
  echo "[INFO] Konteynery ne naydeny, budut sozdany novye"
else
  echo "[INFO] Naydeny sushestvuyushchie konteynery, oni budut obnovleny pri neobhodimosti"
fi
echo

# Shag 5: Zapusk PostgreSQL
echo "[Shag 5] Zapusk PostgreSQL..."
echo "[ZAPUSK] Zapusk/obnovlenie konteynera bazy dannyh..."
$DC -f docker-compose.https.yml up -d postgres

echo "[OZHIDANIE] Ozhidanie gotovnosti PostgreSQL..."
until $DC -f docker-compose.https.yml exec -T postgres pg_isready -U prisma >/dev/null 2>&1; do
  echo "[OZHIDANIE] PostgreSQL eshche ne gotov, zhdem..."
  sleep 2
done
echo "[OK] PostgreSQL gotov k rabote"
echo

# Shag 6: Sbornka i zapusk proekta
echo "[Shag 6] Sbornka i zapusk proekta..."
echo "[INFO] Konteynery budut obnovleny tolko pri izmenenii koda"
echo "[INFO] BD i volumes NE budut udaleny"
echo

echo "[SBORKA] Sbornka konteynerov (tolko pri neobhodimosti)..."
$DC -f docker-compose.https.yml build
echo

echo "[ZAPUSK] Zapusk/obnovlenie vseh servisov..."
echo "[INFO] Backend avtomaticheski:"
echo "       - Proverit/sozdast BD (ensure-database.js)"
echo "       - Primenit vse migracii (prisma migrate deploy)"
echo "       - Zapustit vse skripty inicializacii (initialize-db.js)"
echo "       - Zapustit server"
echo "[INFO] Frontend budet sobran i razmeshchen v nginx"
echo "[INFO] Nginx budet rabotat na HTTPS (port 8443)"
echo "[INFO] Sushestvuyushchie konteynery budut perezapushcheny tolko pri neobhodimosti"
echo

$DC -f docker-compose.https.yml up -d

echo
echo "[PROVERKA] Ozhidanie zapuska servisov i inicializacii BD..."
echo "[INFO] Eto mozhet zanyat 30-60 sekund..."
sleep 15

echo
echo "[PROVERKA] Status konteynerov:"
$DC -f docker-compose.https.yml ps

echo
echo "[PROVERKA] Proverka logov backend na oshibki..."
if $DC -f docker-compose.https.yml logs --tail=30 backend | grep -Ei "ERROR|error" >/dev/null 2>&1; then
  echo "[VNIMANIE] Obnaruzheny oshibki v logah backend!"
  echo "Posmotrite logi: $DC -f docker-compose.https.yml logs backend"
else
  echo "[OK] Kriticheskih oshibok ne obnaruzheno"
fi
echo

echo "========================================"
echo "  Proekt uspeshno zapushchen!"
echo "========================================"
echo
echo "Dostup k prilozheniyu:"
echo "  HTTPS: https://localhost:8443"
echo "  HTTP:  http://localhost:8080 (perenapravlyaet na HTTPS)"
echo "  Backend API: https://localhost:8443/api"
echo
echo "Informaciya o BD:"
echo "  - Baza dannyh: mydb (sohranena, ne udalena)"
echo "  - Polzovatel: prisma"
echo "  - Vse migracii primeneny avtomaticheski"
echo "  - Vse skripty inicializacii vypolneny"
echo
echo "[VAZHNO] Konteynery i BD NE byli udaleny, tolko obnovleny pri neobhodimosti"
echo
echo "Poleznye komandy:"
echo "  - Logi vseh servisov: $DC -f docker-compose.https.yml logs -f"
echo "  - Logi backend:       $DC -f docker-compose.https.yml logs -f backend"
echo "  - Logi frontend:      $DC -f docker-compose.https.yml logs -f frontend"
echo "  - Logi nginx:         $DC -f docker-compose.https.yml logs -f nginx"
echo "  - Logi postgres:      $DC -f docker-compose.https.yml logs -f postgres"
echo "  - Ostanovka:          $DC -f docker-compose.https.yml stop"
echo "  - Ostanovka + udalenie: $DC -f docker-compose.https.yml down"
echo "  - Ostanovka + volumes:  $DC -f docker-compose.https.yml down -v  # UDALIT BD!"
echo "  - Status:             $DC -f docker-compose.https.yml ps"
echo "  - Perezapusk:         $DC -f docker-compose.https.yml restart"
echo



