"use client";

import { useState, useEffect, useCallback } from "react";

export type Locale = "ru" | "en";
const LOCALE_KEY = "hypehub_locale";

const dict = {
  ru: {
    catalog: "Каталог аккаунтов",
    catalogDesc: "Готовые аккаунты с живыми подписчиками. Все проверены.",
    howToBuy: "Как купить",
    advantages: "Наши преимущества",
    faq: "Частые вопросы",
    buy: "Купить",
    buyNow: "Купить",
    addToFavorites: "В избранное",
    compare: "Сравнить",
    search: "Поиск",
    searchPlaceholder: "Поиск по названию, описанию, платформе...",
    favorites: "Избранное",
    online: "Онлайн 24/7",
    scrollToCatalog: "Каталог ниже",
    visitors: "Посетителей сегодня",
    secure: "Антивирус / SSL",
    trustpilot: "Trustpilot",
    instant: "Мгновенная выдача",
    crypto: "Крипта",
    warranty: "Гарантия до 14 дней",
    support: "Поддержка 24/7",
    home: "Главная",
    reviews: "Отзывы",
    blog: "Блог",
    about: "О нас",
    account: "Мои заказы",
    refer: "Рефералка",
    opt: "Опт",
    terms: "Условия",
    privacy: "Конфиденциальность",
    allRights: "© 2026 ХайпХаб · Данные защищены",
    systemOnline: "SYSTEM ONLINE 24/7",
    findOrders: "Введите email для просмотра заказов",
    email: "Email",
    find: "Найти",
    noOrders: "Заказов не найдено",
    ordersFound: "НАЙДЕНО ЗАКАЗОВ",
    bonusPoints: "Бонусы",
    totalSpent: "Всего потрачено",
    sell: "В продаже",
    archived: "В архиве",
    addProduct: "Добавить товар",
    searchByName: "Поиск по названию...",
    allStatuses: "Все статусы",
    selectAll: "ВЫБРАТЬ ВСЕ",
    inArchive: "В архив",
    restore: "Восстановить",
    edit: "Изменить",
    delete: "Удалить",
    save: "Сохранить",
    cancel: "Отмена",
    create: "Создать",
    status: "Статус",
    available: "В продаже",
    reserved: "Забронирован",
    sold: "Продан",
    pending: "Ожидает оплаты",
    paid: "Оплачен",
    delivered: "Доставлен",
    cancelled: "Отменён",
    new: "Новое",
    replied: "Отвечено",
    closed: "Закрыто",
    approve: "Одобрить",
    reject: "Отклонить",
    reply: "Ответить",
    download: "Скачать .txt",
    login: "Логин",
    password: "Пароль",
    amount: "Сумма",
    method: "Способ оплаты",
    date: "Дата",
  },
  en: {
    catalog: "Account Catalog",
    catalogDesc: "Ready accounts with live followers. All verified.",
    howToBuy: "How to Buy",
    advantages: "Our Advantages",
    faq: "FAQ",
    buy: "Buy",
    buyNow: "Buy Now",
    addToFavorites: "Add to favorites",
    compare: "Compare",
    search: "Search",
    searchPlaceholder: "Search by name, description, platform...",
    favorites: "Favorites",
    online: "ONLINE 24/7",
    scrollToCatalog: "Catalog below",
    visitors: "Visitors today",
    secure: "Secure / SSL",
    trustpilot: "Trustpilot",
    instant: "Instant delivery",
    crypto: "Crypto",
    warranty: "Up to 14-day warranty",
    support: "24/7 Support",
    home: "Home",
    reviews: "Reviews",
    blog: "Blog",
    about: "About",
    account: "My Orders",
    refer: "Refer & Earn",
    opt: "Wholesale",
    terms: "Terms",
    privacy: "Privacy",
    allRights: "© 2026 HypeHub · Data Protected",
    systemOnline: "SYSTEM ONLINE 24/7",
    findOrders: "Enter email to view orders",
    email: "Email",
    find: "Find",
    noOrders: "No orders found",
    ordersFound: "ORDERS FOUND",
    bonusPoints: "Bonus Points",
    totalSpent: "Total Spent",
    sell: "Available",
    archived: "Archived",
    addProduct: "Add Product",
    searchByName: "Search by name...",
    allStatuses: "All statuses",
    selectAll: "SELECT ALL",
    inArchive: "Archive",
    restore: "Restore",
    edit: "Edit",
    delete: "Delete",
    save: "Save",
    cancel: "Cancel",
    create: "Create",
    status: "Status",
    available: "Available",
    reserved: "Reserved",
    sold: "Sold",
    pending: "Pending payment",
    paid: "Paid",
    delivered: "Delivered",
    cancelled: "Cancelled",
    new: "New",
    replied: "Replied",
    closed: "Closed",
    approve: "Approve",
    reject: "Reject",
    reply: "Reply",
    download: "Download .txt",
    login: "Login",
    password: "Password",
    amount: "Amount",
    method: "Payment method",
    date: "Date",
  },
};

export function useLocale() {
  const [locale, setLocale] = useState<Locale>("ru");

  useEffect(() => {
    const saved = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (saved === "ru" || saved === "en") {
      queueMicrotask(() => setLocale(saved));
    }
  }, []);

  const toggle = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "ru" ? "en" : "ru";
      localStorage.setItem(LOCALE_KEY, next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: keyof typeof dict.ru): string => dict[locale][key] || dict.ru[key] || key,
    [locale]
  );

  return { locale, toggle, t };
}
