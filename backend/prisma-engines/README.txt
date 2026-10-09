Если при сборке Docker не скачиваются движки Prisma (wget: download timed out),
скачайте эти два файла в браузере и положите их в эту папку как есть (.gz):

https://binaries.prisma.sh/all_commits/361e86d0ea4987e9f53a565309b3eed797a6bcbd/linux-musl-openssl-3.0.x/schema-engine.gz
https://binaries.prisma.sh/all_commits/361e86d0ea4987e9f53a565309b3eed797a6bcbd/linux-musl-openssl-3.0.x/libquery_engine.so.node.gz

Сборка возьмёт файлы отсюда и ничего не будет скачивать.
