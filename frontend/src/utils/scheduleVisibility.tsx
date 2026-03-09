import React from 'react';

export function isVisibleBySchedule(element: any, now: Date, isAdminPreview: boolean): boolean {
  if (isAdminPreview) return true;

  const publishAt = element?.props?.publishAt ? new Date(element.props.publishAt) : null;
  const unpublishAt = element?.props?.unpublishAt ? new Date(element.props.unpublishAt) : null;

  if (publishAt && publishAt > now) return false;
  if (unpublishAt && unpublishAt < now) return false;

  return true;
}

export function renderScheduleBadge(element: any, isAdminPreview: boolean) {
  if (!isAdminPreview) return null;

  const publishAt = element?.props?.publishAt ? new Date(element.props.publishAt) : null;
  const unpublishAt = element?.props?.unpublishAt ? new Date(element.props.unpublishAt) : null;

  if (!publishAt && !unpublishAt) return null;

  const now = new Date();

  if (publishAt && publishAt > now) {
    return (
      <p className="mt-1 text-xs text-amber-600">
        Запланировано с {publishAt.toLocaleString('ru-RU')}
      </p>
    );
  }

  if (unpublishAt && unpublishAt < now) {
    return (
      <p className="mt-1 text-xs text-red-600">
        Снято с публикации с {unpublishAt.toLocaleString('ru-RU')}
      </p>
    );
  }

  return null;
}


