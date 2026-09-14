CREATE TABLE "HomeServiceCard" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "titleEn" TEXT,
    "titleBe" TEXT,
    "href" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomeServiceCard_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "HomeServiceCard_isActive_sortOrder_idx"
ON "HomeServiceCard"("isActive", "sortOrder");

INSERT INTO "HomeServiceCard"
    ("title", "titleEn", "titleBe", "href", "sortOrder", "isActive", "updatedAt")
VALUES
    (
        'Аэронавигационное обслуживание воздушных судов в воздушном пространстве Республики Беларусь',
        'Air navigation services in the airspace of the Republic of Belarus',
        'Аэранавігацыйнае абслугоўванне паветраных судоў у паветранай прасторы Рэспублікі Беларусь',
        '/services/air-navigation',
        0,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'Аэропортовые услуги',
        'Airport services',
        'Аэрапортавыя паслугі',
        '/services/airport',
        1,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'Пользование веб-сервисом «КПТС интернет-заявка»',
        'Use of the KPTS web service',
        'Карыстанне вэб-сэрвісам «КПТС інтэрнэт-заяўка»',
        '/services/kpts',
        2,
        true,
        CURRENT_TIMESTAMP
    ),
    (
        'Прочие услуги',
        'Other services',
        'Іншыя паслугі',
        '/services/other',
        3,
        true,
        CURRENT_TIMESTAMP
    );
