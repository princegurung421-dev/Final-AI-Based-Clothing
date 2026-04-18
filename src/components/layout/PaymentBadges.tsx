// Inline SVG payment-method marks. These are simplified wordmarks — not
// identical to the official brand assets, but close enough for a footer
// badge strip. Brand usage is allowed for merchants showing accepted methods.

export function VisaMark() {
  return (
    <svg viewBox="0 0 48 30" className="w-10 h-6" aria-label="Visa">
      <rect width="48" height="30" rx="4" fill="#fff" />
      <path
        d="M21.6 20.3l2.2-10.2h3.5l-2.2 10.2h-3.5zM34.9 10.4a8.7 8.7 0 00-3.1-.6c-3.4 0-5.8 1.8-5.8 4.4 0 1.9 1.7 3 3 3.6 1.3.6 1.8 1 1.8 1.6 0 .9-1 1.2-2 1.2a6.7 6.7 0 01-3.2-.7l-.5-.2-.5 3.1a10 10 0 003.8.7c3.7 0 6-1.8 6-4.5 0-1.5-.9-2.7-2.9-3.6-1.2-.6-1.9-1-1.9-1.6 0-.5.6-1.1 2-1.1a6.2 6.2 0 012.6.5l.3.2.4-3zM40 10.1h2.7L45.6 20H42c-.1-.5-.5-2.1-.5-2.1h-3.7l-.6 2H34l5-9c.4-.8 1-.8 1-.8zm-.4 4c0 .1-1 3.2-1 3.2h2.4l-.9-3.2c0-.1-.2-.6-.4-1 0 .4-.1.7-.1 1zM18.7 10.1l-3.4 7-.3-1.7c-.7-1.9-2.7-4-5-5l3 9.9h3.6l5.3-10.2h-3.2z"
        fill="#1A1F71"
      />
    </svg>
  )
}

export function MastercardMark() {
  return (
    <svg viewBox="0 0 48 30" className="w-10 h-6" aria-label="Mastercard">
      <rect width="48" height="30" rx="4" fill="#fff" />
      <circle cx="20" cy="15" r="7.2" fill="#EB001B" />
      <circle cx="28" cy="15" r="7.2" fill="#F79E1B" />
      <path
        d="M24 9.7a7.2 7.2 0 010 10.6 7.2 7.2 0 010-10.6z"
        fill="#FF5F00"
      />
    </svg>
  )
}

export function AmexMark() {
  return (
    <svg viewBox="0 0 48 30" className="w-10 h-6" aria-label="American Express">
      <rect width="48" height="30" rx="4" fill="#006FCF" />
      <text
        x="24"
        y="19"
        fontFamily="Arial, sans-serif"
        fontSize="6"
        fontWeight="700"
        fill="#fff"
        textAnchor="middle"
        letterSpacing="0.3"
      >
        AMEX
      </text>
    </svg>
  )
}

export function ApplePayMark() {
  return (
    <svg viewBox="0 0 48 30" className="w-10 h-6" aria-label="Apple Pay">
      <rect width="48" height="30" rx="4" fill="#000" />
      <text
        x="24"
        y="19"
        fontFamily="-apple-system, Helvetica, Arial, sans-serif"
        fontSize="7"
        fontWeight="600"
        fill="#fff"
        textAnchor="middle"
      >
        ⌘ Pay
      </text>
    </svg>
  )
}

export function GooglePayMark() {
  return (
    <svg viewBox="0 0 48 30" className="w-10 h-6" aria-label="Google Pay">
      <rect width="48" height="30" rx="4" fill="#fff" />
      <text
        x="24"
        y="19"
        fontFamily="Arial, sans-serif"
        fontSize="6"
        fontWeight="700"
        fill="#3c4043"
        textAnchor="middle"
      >
        G Pay
      </text>
    </svg>
  )
}

export function StripeAttribution() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] text-white/40">
      <span>Payments by</span>
      <svg viewBox="0 0 60 25" className="h-3.5" aria-label="Stripe">
        <path
          d="M59.7 14.3c0-4.2-2-7.5-6-7.5s-6.4 3.3-6.4 7.5c0 4.9 2.8 7.4 6.9 7.4 2 0 3.5-.4 4.7-1.1v-3.3c-1.2.6-2.5 1-4.2 1-1.7 0-3.2-.6-3.4-2.6h8.4v-1.4zM51.2 12c0-1.9 1.2-2.7 2.3-2.7s2.2.8 2.2 2.7h-4.5zm-11 2.3V4.2l-3.8.8v14.2c0 2.6 2 4.5 4.6 4.5 1.5 0 2.5-.3 3.1-.6v-3.1c-.6.2-3.5 1.1-3.5-1.7V14.4h3.5v-3.2h-3.5l-.4-3zm-8.4-3v1.9l-1.4-1.9h-3v18.8l3.8-.8v-4.6c.6.4 1.4 1 3 1 2.9 0 5.5-2.3 5.5-7.5 0-4.8-2.6-7.2-5.5-7.2-1.6 0-2.6.6-3.2 1.2l-.2-.9h-.8zm.2 10.4v-6.9c.5-.6 1.2-.9 2-.9 1.5 0 2.6 1.7 2.6 4.3s-1 4.3-2.6 4.3c-.8 0-1.5-.3-2-.8zM20 8.1c-2.7 0-4.3 1.2-4.3 3.3 0 3.3 4.6 2.8 4.6 4.2 0 .5-.4.9-1.3.9a8 8 0 01-3.8-1.1v3.6c1.2.5 2.5.7 3.8.7 2.8 0 4.5-1.1 4.5-3.3 0-3.6-4.6-3-4.6-4.3 0-.4.3-.7 1.1-.7 1.1 0 2.5.3 3.6.9V8.9c-1-.4-2.3-.8-3.6-.8zm-7.3-4L9 4.9v3l3.7.8V4.1zM8.9 6.8h3.8v14H9V6.8zM4.7 8l-.3-1.1H.9v14h3.8v-9.5c.9-1.2 2.4-1 3-.8V6.9c-.5-.2-2.3-.5-3 1.1z"
          fill="#fff"
        />
      </svg>
    </span>
  )
}
