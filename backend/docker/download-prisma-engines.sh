#!/bin/sh
set -e

COMMIT="${PRISMA_ENGINE_COMMIT:-361e86d0ea4987e9f53a565309b3eed797a6bcbd}"
TARGET="${PRISMA_ENGINE_TARGET:-linux-musl-openssl-3.0.x}"
DEST="${1:-/app/node_modules/@prisma/engines}"

MIRRORS="
https://binaries.prisma.sh
https://registry.npmmirror.com/-/binary/prisma
"

mkdir -p "$DEST"

WGET_OPTS="-q -T 60"
if [ "$WGET_INSECURE" = "1" ]; then
  WGET_OPTS="$WGET_OPTS --no-check-certificate"
fi

download_file() {
  file="$1"
  output="$2"

  for mirror in $MIRRORS; do
    url="$mirror/all_commits/$COMMIT/$TARGET/${file}.gz"
    echo "Trying $url"
    if wget $WGET_OPTS "$url" -O "/tmp/${file}.gz"; then
      gunzip -f "/tmp/${file}.gz"
      mv "/tmp/${file}" "$output"
      echo "Downloaded $file"
      return 0
    fi
    rm -f "/tmp/${file}.gz"
  done

  echo "Failed to download $file from all mirrors"
  return 1
}

download_file "schema-engine" "$DEST/schema-engine-linux-musl-openssl-3.0.x"
download_file "libquery_engine.so.node" "$DEST/libquery_engine-linux-musl-openssl-3.0.x.so.node"

chmod +x "$DEST/schema-engine-linux-musl-openssl-3.0.x"
