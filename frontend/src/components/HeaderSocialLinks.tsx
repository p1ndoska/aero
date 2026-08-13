//@ts-nocheck
import { useEffect, useRef, useState } from 'react';
import { Share2 } from 'lucide-react';
import { FaInstagram, FaTelegram } from 'react-icons/fa';
import { useLanguage } from '../contexts/LanguageContext';

const SOCIAL_LINKS = [
  {
    href: 'https://t.me/gp_belaeronavigatsia',
    label: 'Telegram',
    Icon: FaTelegram,
  },
  {
    href: 'https://www.instagram.com/gp_belaeronavigatsia/',
    label: 'Instagram',
    Icon: FaInstagram,
  },
];

interface HeaderSocialLinksProps {
  mobile?: boolean;
}

export default function HeaderSocialLinks({ mobile = false }: HeaderSocialLinksProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={`site-header__social${open ? ' site-header__social--open' : ''}${mobile ? ' site-header__social--mobile' : ''}`}
    >
      <button
        type="button"
        className="site-header__icon-btn site-header__social-toggle"
        onClick={() => setOpen((value) => !value)}
        aria-label={t('social_networks') || 'Social networks'}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Share2 className="site-header__action-icon" />
      </button>

      {open && (
        <div className="site-header__social-menu" role="menu">
          {SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="site-header__social-link"
              role="menuitem"
              aria-label={label}
              onClick={() => setOpen(false)}
            >
              <Icon size={16} aria-hidden="true" />
              <span>{label}</span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
