//@ts-nocheck
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, ChevronRight, Menu, X, Search } from 'lucide-react';
import { FaUserCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/user/userSlice';
import { LoginForm } from '@/components/LoginForm';
import AccessibilitySettings from '@/components/AccessibilitySettings';
import HeaderLanguageSwitcher from '@/components/HeaderLanguageSwitcher';
import HeaderSocialLinks from '@/components/HeaderSocialLinks';
import { useLanguage } from '../contexts/LanguageContext';
import { canAccessAdminPanel } from '../utils/roleUtils';
import { useNavigationMenu, type SubMenuItem, type MenuItem } from '@/hooks/useNavigationMenu';
import { Button } from '@/components/ui/button';

function flattenSubmenuItems(items: SubMenuItem[]): SubMenuItem[] {
  const result: SubMenuItem[] = [];

  const walk = (list: SubMenuItem[]) => {
    list.forEach((item) => {
      result.push({
        name: item.name,
        href: item.href,
        external: item.external,
      });
      if (item.children?.length) walk(item.children);
    });
  };

  walk(items);
  return result;
}

function DropdownLink({
  item,
  onNavigate,
}: {
  item: SubMenuItem;
  onNavigate?: () => void;
}) {
  if (item.external) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className="header-dropdown__link"
        onClick={onNavigate}
      >
        {item.name}
      </a>
    );
  }

  return (
    <Link to={item.href} className="header-dropdown__link" onClick={onNavigate}>
      {item.name}
    </Link>
  );
}

function SubMenuLinks({
  items,
  onNavigate,
  columns = 1,
}: {
  items: SubMenuItem[];
  onNavigate?: () => void;
  columns?: 1 | 2;
}) {
  const flatItems = flattenSubmenuItems(items);

  const renderList = (listItems: SubMenuItem[], keyPrefix: string) => (
    <ul className="header-dropdown__list">
      {listItems.map((item, index) => (
        <li key={`${keyPrefix}-${item.href}-${item.name}-${index}`} className="header-dropdown__item">
          <DropdownLink item={item} onNavigate={onNavigate} />
        </li>
      ))}
    </ul>
  );

  if (columns === 2) {
    const splitAt = Math.ceil(flatItems.length / 2);
    const firstColumn = flatItems.slice(0, splitAt);
    const secondColumn = flatItems.slice(splitAt);

    return (
      <div className="header-dropdown__columns">
        {renderList(firstColumn, 'col1')}
        {secondColumn.length > 0 && renderList(secondColumn, 'col2')}
      </div>
    );
  }

  return renderList(flatItems, 'col1');
}

function DesktopDropdown({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const isActive = location.pathname.startsWith(item.href);

  const handleEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(true);
  };

  const handleLeave = () => {
    timerRef.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const submenuCount = flattenSubmenuItems(item.submenu ?? []).length;
  const useTwoColumns = submenuCount >= 7;

  useEffect(() => {
    if (!open) return;

    const adjustDropdownPosition = () => {
      const dropdown = dropdownRef.current;
      if (!dropdown) return;

      dropdown.style.left = '0';
      const rect = dropdown.getBoundingClientRect();
      const margin = 16;
      let offset = 0;

      if (rect.right > window.innerWidth - margin) {
        offset = window.innerWidth - margin - rect.right;
      }

      const shiftedLeft = rect.left + offset;
      if (shiftedLeft < margin) {
        offset += margin - shiftedLeft;
      }

      dropdown.style.left = `${offset}px`;
    };

    const runAdjustment = () => {
      requestAnimationFrame(adjustDropdownPosition);
    };

    runAdjustment();
    window.addEventListener('resize', runAdjustment);

    return () => {
      window.removeEventListener('resize', runAdjustment);
    };
  }, [open, submenuCount, useTwoColumns]);

  if (!item.submenu?.length) {
    return (
      <Link
        to={item.href}
        className={`header-nav__link ${isActive ? 'header-nav__link--active' : ''}`}
      >
        {item.name}
      </Link>
    );
  }

  return (
    <div
      className={`header-nav__item${open ? ' header-nav__item--open' : ''}`}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
    >
      <Link
        to={item.href}
        className={`header-nav__link header-nav__link--has-submenu ${isActive ? 'header-nav__link--active' : ''}${open ? ' header-nav__link--open' : ''}`}
      >
        {item.name}
      </Link>
      {open && (
        <div
          ref={dropdownRef}
          className={`header-dropdown${useTwoColumns ? ' header-dropdown--cols-2' : ''}`}
        >
          <div className="header-dropdown__trajectory-wrap" aria-hidden="true">
            <svg
              className="header-dropdown__trajectory"
              viewBox="0 0 240 70"
              preserveAspectRatio="none"
              overflow="visible"
            >
              <path
                className="header-dropdown__trajectory-line"
                d="M 8 58 Q 55 8, 110 42 T 212 18"
              />
              <path
                className="header-dropdown__trajectory-line header-dropdown__trajectory-line--secondary"
                d="M 20 48 Q 90 62, 160 38"
              />
            </svg>
            <svg className="header-dropdown__trajectory-arrow" viewBox="0 0 16 16" aria-hidden="true">
              <path className="header-dropdown__trajectory-arrow-line" d="M 1 13.5 L 13 8" />
              <path className="header-dropdown__trajectory-arrow-line" d="M 13 8 L 1 2.5" />
            </svg>
          </div>
          <div className="header-dropdown__content">
            <SubMenuLinks
              items={item.submenu}
              columns={useTwoColumns ? 2 : 1}
              onNavigate={() => setOpen(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileMenuSection({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  if (!item.submenu?.length) {
    return (
      <Link to={item.href} className="header-mobile__link" onClick={onClose}>
        {item.name}
      </Link>
    );
  }

  return (
    <div className="header-mobile__section">
      <button
        type="button"
        className="header-mobile__toggle"
        onClick={() => setExpanded((v) => !v)}
      >
        <span>{item.name}</span>
        <ChevronDown size={16} className={expanded ? 'header-mobile__chevron--open' : ''} />
      </button>
      {expanded && (
        <div className="header-mobile__submenu">
          <Link to={item.href} className="header-mobile__sublink header-mobile__sublink--main" onClick={onClose}>
            {item.name}
          </Link>
          {item.submenu.map((sub) =>
            sub.children?.length ? (
              <MobileNestedItem key={sub.href} item={sub} onClose={onClose} />
            ) : sub.external ? (
              <a
                key={sub.href}
                href={sub.href}
                target="_blank"
                rel="noopener noreferrer"
                className="header-mobile__sublink"
                onClick={onClose}
              >
                {sub.name}
              </a>
            ) : (
              <Link key={sub.href} to={sub.href} className="header-mobile__sublink" onClick={onClose}>
                {sub.name}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}

function MobileNestedItem({ item, onClose }: { item: SubMenuItem; onClose: () => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="header-mobile__nested">
      <button type="button" className="header-mobile__nested-toggle" onClick={() => setExpanded((v) => !v)}>
        <ChevronRight size={14} className={expanded ? 'header-mobile__chevron-right--open' : ''} />
        <span>{item.name}</span>
      </button>
      {expanded && item.children && (
        <div className="header-mobile__nested-list">
          <Link to={item.href} className="header-mobile__sublink" onClick={onClose}>
            {item.name}
          </Link>
          {item.children.map((child) =>
            child.external ? (
              <a
                key={child.href}
                href={child.href}
                target="_blank"
                rel="noopener noreferrer"
                className="header-mobile__sublink"
                onClick={onClose}
              >
                {child.name}
              </a>
            ) : (
              <Link key={child.href} to={child.href} className="header-mobile__sublink" onClick={onClose}>
                {child.name}
              </Link>
            ),
          )}
        </div>
      )}
    </div>
  );
}

export const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { menuItems } = useNavigationMenu();
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);

  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';

  const closeSearch = () => {
    setSearchOpen(false);
    setSearchQuery('');
  };

  const scrollSearchInputToEnd = (input?: HTMLInputElement | null) => {
    const target = input ?? searchInputRef.current;
    if (!target) return;
    requestAnimationFrame(() => {
      target.scrollLeft = target.scrollWidth;
    });
  };

  const handleSearchQueryChange = (value: string, input?: HTMLInputElement | null) => {
    setSearchQuery(value);
    scrollSearchInputToEnd(input);
  };

  const handleLogout = () => {
    dispatch(logout());
    setMobileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      closeSearch();
      setMobileOpen(false);
    }
  };

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!searchOpen) return;

    const frame = requestAnimationFrame(() => {
      searchInputRef.current?.focus();
    });

    const handleClickOutside = (event: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(event.target as Node)) {
        closeSearch();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [searchOpen]);

  return (
    <>
      <LoginForm isOpen={isLoginModalOpen} onClose={() => setIsLoginModalOpen(false)} />

      <header className="site-header a11y-content">
        <div className="site-header__inner">
          <Link to="/" className="site-header__brand" onClick={() => setMobileOpen(false)}>
            <img
              src="/logo.png"
              alt={t('company_name_short')}
              className="site-header__logo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/favicon.svg';
              }}
            />
            <span className="site-header__title">{t('company_full_name')}</span>
          </Link>

          <nav className="site-header__nav" aria-label="Main navigation">
            {menuItems.map((item) => (
              <DesktopDropdown key={item.href} item={item} />
            ))}
          </nav>

          <div className="site-header__actions">
            <div
              ref={searchWrapRef}
              className={`site-header__search site-header__search--desktop${searchOpen ? ' site-header__search--open' : ''}`}
            >
              <button
                type="button"
                className="site-header__icon-btn site-header__search-toggle"
                onClick={() => setSearchOpen((value) => !value)}
                aria-label={t('search')}
                aria-expanded={searchOpen}
              >
                <Search className="site-header__action-icon" aria-hidden="true" />
              </button>

              {searchOpen && (
                <form onSubmit={handleSearch} className="site-header__search-panel">
                  <label className="site-header__search-field">
                    <Search className="site-header__search-icon site-header__action-icon" aria-hidden="true" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => handleSearchQueryChange(e.target.value, e.currentTarget)}
                      onFocus={(e) => scrollSearchInputToEnd(e.currentTarget)}
                      placeholder={t('search')}
                      className="site-header__search-input"
                      aria-label={t('search')}
                    />
                  </label>
                  <button
                    type="button"
                    className="site-header__icon-btn site-header__search-close"
                    onClick={closeSearch}
                    aria-label="Close search"
                  >
                    <X className="site-header__action-icon" aria-hidden="true" />
                  </button>
                </form>
              )}
            </div>

            <AccessibilitySettings variant="header" />

            <div className="site-header__desktop-only">
              {!isAuthenticated ? (
                <button
                  type="button"
                  className="site-header__login-btn"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  <FaUserCircle className="site-header__action-icon" />
                  <span>{t('login')}</span>
                </button>
              ) : (
                <div className="site-header__user">
                  {canAccessAdminPanel(roleName) && (
                    <Link to="/admin" className="site-header__user-link">
                      {t('admin_panel')}
                    </Link>
                  )}
                  <Link to="/profile" className="site-header__user-link">
                    {user?.firstName || user?.email}
                  </Link>
                  <button type="button" className="site-header__logout-btn" onClick={handleLogout}>
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>

            <HeaderLanguageSwitcher />

            <HeaderSocialLinks />

            <button
              type="button"
              className="site-header__burger"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="site-header__action-icon" /> : <Menu className="site-header__action-icon" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="header-mobile">
          <div className="header-mobile__backdrop" onClick={() => setMobileOpen(false)} />
          <div className="header-mobile__panel">
            <div className="header-mobile__panel-header">
              <span className="header-mobile__panel-title">{t('menu') || 'Меню'}</span>
              <button type="button" className="site-header__icon-btn" onClick={() => setMobileOpen(false)}>
                <X className="site-header__action-icon" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="header-mobile__search">
              <label className="header-mobile__search-field">
                <Search size={16} className="header-mobile__search-icon" aria-hidden="true" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => handleSearchQueryChange(e.target.value, e.currentTarget)}
                  onFocus={(e) => scrollSearchInputToEnd(e.currentTarget)}
                  placeholder={t('search')}
                  aria-label={t('search')}
                />
              </label>
            </form>

            <nav className="header-mobile__nav">
              {menuItems.map((item) => (
                <MobileMenuSection key={item.href} item={item} onClose={() => setMobileOpen(false)} />
              ))}
            </nav>

            <div className="header-mobile__footer">
              <HeaderLanguageSwitcher mobile />
              <HeaderSocialLinks mobile />
              {!isAuthenticated ? (
                <Button
                  variant="outline"
                  className="header-mobile__login"
                  onClick={() => {
                    setIsLoginModalOpen(true);
                    setMobileOpen(false);
                  }}
                >
                  <FaUserCircle size={14} />
                  {t('login')}
                </Button>
              ) : (
                <div className="header-mobile__auth">
                  <Link to="/profile" onClick={() => setMobileOpen(false)}>
                    {user?.firstName || user?.email}
                  </Link>
                  <button type="button" onClick={handleLogout}>
                    {t('logout')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
