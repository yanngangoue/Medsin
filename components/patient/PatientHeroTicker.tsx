const TICKER_TEXT =
  "Laissez-nous vous montrer qu'une vraie prise en charge, c'est possible en ligne. 🩺";

export function PatientHeroTicker() {
  return (
    <div className="promo-hero-ticker" aria-hidden>
      <div className="promo-hero-ticker-track">
        <span className="promo-hero-ticker-group">{TICKER_TEXT}</span>
        <span className="promo-hero-ticker-group">{TICKER_TEXT}</span>
        <span className="promo-hero-ticker-group">{TICKER_TEXT}</span>
        <span className="promo-hero-ticker-group">{TICKER_TEXT}</span>
      </div>
      <span className="sr-only">{TICKER_TEXT}</span>
    </div>
  );
}
