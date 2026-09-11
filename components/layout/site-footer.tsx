import { Camera, MessageCircle, Play, Send, Users, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { getSiteSettings } from "@/lib/content/repository";

function EditorialLink({ href, label, icon: Icon, direct = false }: { href?: string; label: string; icon: LucideIcon; direct?: boolean }) {
  const content = <><Icon aria-hidden="true" /><span>{label}</span><b aria-hidden="true">{href ? "→" : "—"}</b></>;
  return href ? <a className={direct ? "footer-direct__link" : "footer-social__link"} href={href} target="_blank" rel="noreferrer">{content}</a> : <span className={`${direct ? "footer-direct__link" : "footer-social__link"} is-unavailable`} aria-disabled="true">{content}</span>;
}

export async function SiteFooter({ locale }: { locale: string }) {
  const settings = await getSiteSettings(locale);

  return (
    <footer className="site-footer">
      <div className="site-footer__brand">
        <Link className="wordmark" href={`/${locale}`}>{settings.siteTitle}</Link>
        <p>© {new Date().getFullYear()} Alexander Mikhaleff.<br />All rights reserved.</p>
      </div>

      <div className="footer-direct">
        <p className="footer-label">Direct contact</p>
        <EditorialLink href={settings.telegram} label="Telegram" icon={Send} direct />
        <EditorialLink href={settings.whatsapp} label="WhatsApp" icon={MessageCircle} direct />
        <small>Response within 24 hours</small>
      </div>

      <div className="site-footer__relations">
        <p>For collectors, galleries<br />and collaborations.</p>
        <nav className="footer-social" aria-label="Social media">
          <EditorialLink href={settings.instagram} label="Instagram" icon={Camera} />
          <EditorialLink href={settings.youtube} label="YouTube" icon={Play} />
          <EditorialLink href={settings.facebook} label="Facebook" icon={Users} />
        </nav>
      </div>

      <div className="site-footer__meta">
        <a href={`mailto:${settings.email}`}>{settings.email}</a>
        <span>{settings.location}</span>
        <a href="#top">To the top ↑</a>
      </div>
    </footer>
  );
}
