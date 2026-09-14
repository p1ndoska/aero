const prisma = require('../prisma/prisma-client');

const defaultCards = [
  {
    title: 'Аэронавигационное обслуживание воздушных судов в воздушном пространстве Республики Беларусь',
    titleEn: 'Air navigation services in the airspace of the Republic of Belarus',
    titleBe: 'Аэранавігацыйнае абслугоўванне паветраных судоў у паветранай прасторы Рэспублікі Беларусь',
    href: '/services/air-navigation',
    sortOrder: 0,
  },
  {
    title: 'Аэропортовые услуги',
    titleEn: 'Airport services',
    titleBe: 'Аэрапортавыя паслугі',
    href: '/services/airport',
    sortOrder: 1,
  },
  {
    title: 'Пользование веб-сервисом «КПТС интернет-заявка»',
    titleEn: 'Use of the KPTS web service',
    titleBe: 'Карыстанне вэб-сэрвісам «КПТС інтэрнэт-заяўка»',
    href: '/services/kpts',
    sortOrder: 2,
  },
  {
    title: 'Прочие услуги',
    titleEn: 'Other services',
    titleBe: 'Іншыя паслугі',
    href: '/services/other',
    sortOrder: 3,
  },
];

async function seedHomeServiceCards() {
  const count = await prisma.homeServiceCard.count();
  if (count > 0) return;

  await prisma.homeServiceCard.createMany({
    data: defaultCards.map((card) => ({ ...card, isActive: true })),
  });
  console.log('Home service cards seeded:', defaultCards.length);
}

module.exports = { seedHomeServiceCards };
