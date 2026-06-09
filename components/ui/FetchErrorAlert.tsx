type Props = {
  message: string;
  onRetry?: () => void;
  className?: string;
};

/** Message d'erreur réseau/API lisible pour l'utilisateur. */
export function FetchErrorAlert({ message, onRetry, className = "" }: Props) {
  return (
    <div
      className={`rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 ${className}`}
      role="alert"
    >
      <p>{message}</p>
      {onRetry ? (
        <button
          type="button"
          className="mt-2 font-semibold text-red-900 underline hover:no-underline"
          onClick={onRetry}
        >
          Réessayer
        </button>
      ) : null}
    </div>
  );
}
