import { Link, useLocation } from 'react-router-dom';
import { useNavigationMenu, type MenuItem, type SubMenuItem } from '@/hooks/useNavigationMenu';

const HIDDEN_SIDEBAR_PREFIXES = ['/admin'];
const HIDDEN_SIDEBAR_PATHS = new Set(['/', '/profile', '/cookie-policy']);

export function shouldShowPageSidebar(pathname: string) {
  if (HIDDEN_SIDEBAR_PATHS.has(pathname)) return false;
  return !HIDDEN_SIDEBAR_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SIDEBAR_ARROWS = (() => {
  const rand = mulberry32(20260902);
  return Array.from({ length: 56 }, () => ({
    x: 6 + rand() * 148,
    y: 8 + rand() * 884,
    rotate: rand() * 360,
    scale: 0.42 + rand() * 0.78,
    opacity: 0.55 + rand() * 0.4,
  }));
})();

function SidebarDecoArrow({
  x,
  y,
  rotate,
  scale,
  opacity,
}: {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  opacity: number;
}) {
  return (
    <g
      className="page-nav-sidebar__deco-arrow"
      opacity={opacity}
      transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`}
    >
      <path className="page-nav-sidebar__deco-shaft" d="M 0 0 L 44 0" />
      <path className="page-nav-sidebar__deco-head" d="M 38 -5.2 L 50 0 L 38 5.2 Z" />
    </g>
  );
}

function SidebarArrowsDeco() {
  return (
    <div className="page-nav-sidebar__deco" aria-hidden="true">
      <svg viewBox="0 0 160 900" preserveAspectRatio="xMidYMid slice">
        {SIDEBAR_ARROWS.map((arrow, index) => (
          <SidebarDecoArrow key={index} {...arrow} />
        ))}
      </svg>
    </div>
  );
}

function collectHrefs(items: SubMenuItem[]): string[] {
  return items.flatMap((item) => [
    ...(item.external ? [] : [item.href]),
    ...(item.children ? collectHrefs(item.children) : []),
  ]);
}

function findCurrentMenuItem(menuItems: MenuItem[], pathname: string): MenuItem | null {
  return (
    [...menuItems]
      .sort((a, b) => b.href.length - a.href.length)
      .find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? null
  );
}

function isHrefActive(href: string, pathname: string, allHrefs: string[]) {
  if (pathname === href) return true;
  if (!pathname.startsWith(`${href}/`)) return false;

  return !allHrefs.some(
    (other) =>
      other !== href &&
      other.startsWith(href) &&
      (pathname === other || pathname.startsWith(`${other}/`)),
  );
}

function SidebarLink({
  item,
  pathname,
  allHrefs,
}: {
  item: SubMenuItem;
  pathname: string;
  allHrefs: string[];
}) {
  const active = !item.external && isHrefActive(item.href, pathname, allHrefs);
  const className = `page-nav-sidebar__link${active ? ' page-nav-sidebar__link--active' : ''}`;

  return (
    <li>
      {item.external ? (
        <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
          {item.name}
        </a>
      ) : (
        <Link to={item.href} className={className} aria-current={active ? 'page' : undefined}>
          {item.name}
        </Link>
      )}
      {item.children && item.children.length > 0 && (
        <ul className="page-nav-sidebar__nested">
          {item.children.map((child, index) => (
            <SidebarLink
              key={`${child.href}-${child.name}-${index}`}
              item={child}
              pathname={pathname}
              allHrefs={allHrefs}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

export const PageNavSidebar = () => {
  const { pathname } = useLocation();
  const { menuItems } = useNavigationMenu();
  const currentItem = findCurrentMenuItem(menuItems, pathname);
  const sectionItems: SubMenuItem[] =
    currentItem?.submenu && currentItem.submenu.length > 0
      ? currentItem.submenu
      : menuItems.map((item) => ({
          name: item.name,
          href: item.href,
        }));
  const allHrefs = collectHrefs(sectionItems);
  const title = currentItem?.name ?? null;

  return (
    <nav className="page-nav-sidebar" aria-label={title ?? undefined}>
      <SidebarArrowsDeco />
      {title && <p className="page-nav-sidebar__title">{title}</p>}
      <ul className="page-nav-sidebar__list">
        {sectionItems.map((item, index) => (
          <SidebarLink
            key={`${item.href}-${item.name}-${index}`}
            item={item}
            pathname={pathname}
            allHrefs={allHrefs}
          />
        ))}
      </ul>
    </nav>
  );
};
