/*
 * Shared Tailwind design system.
 *
 * Cards:   ui-card, ui-panel
 * Buttons: ui-button + ui-button-primary|secondary|ink|ghost|danger
 * Tags:    ui-tag + ui-tag-neutral|success|info|warning|danger
 * Inputs:  ui-input
 */
tailwind.config = {
  theme: {
    extend: {
      fontFamily: { sans: ['Instrument Sans', 'sans-serif'] },
      colors: {
        ink: '#18181b',
        paper: '#fafafa',
        card: '#ffffff',
        line: '#e4e4e7',
        mute: '#71717a',
        muted: '#f4f4f5',
        brand: {
          50: '#ecfdf5',
          100: '#d1fae5',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
        },
        info: { 50: '#eff6ff', 200: '#bfdbfe', 600: '#2563eb', 700: '#1d4ed8' },
        warning: {
          50: '#fffbeb',
          200: '#fde68a',
          600: '#d97706',
          800: '#92400e',
        },
        destructive: {
          50: '#fef2f2',
          200: '#fecaca',
          600: '#dc2626',
          700: '#b91c1c',
        },
      },
      borderRadius: { control: '0.75rem', card: '1rem' },
      boxShadow: {
        card: '0 1px 2px rgba(24, 24, 27, 0.04)',
        'card-hover': '0 8px 24px rgba(24, 24, 27, 0.07)',
        popover: '0 12px 30px rgba(9, 9, 11, 0.08)',
      },
    },
  },
  plugins: [
    function ({ addComponents, theme }) {
      const focusRing = {
        outline: '2px solid transparent',
        outlineOffset: '2px',
        boxShadow: '0 0 0 3px rgba(24, 24, 27, 0.10)',
      }

      addComponents({
        '.ui-card': {
          borderWidth: '1px',
          borderColor: theme('colors.line'),
          borderRadius: theme('borderRadius.card'),
          backgroundColor: theme('colors.card'),
          boxShadow: theme('boxShadow.card'),
          transitionProperty:
            'color, background-color, border-color, transform, box-shadow',
          transitionDuration: '150ms',
          '&:hover': {
            borderColor: theme('colors.zinc.300'),
            boxShadow: theme('boxShadow.card-hover'),
          },
        },
        '.ui-panel': {
          borderWidth: '1px',
          borderColor: theme('colors.line'),
          borderRadius: theme('borderRadius.card'),
          backgroundColor: theme('colors.card'),
          boxShadow: theme('boxShadow.popover'),
        },
        '.ui-button': {
          display: 'inline-flex',
          minHeight: '2.5rem',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          borderRadius: theme('borderRadius.control'),
          padding: '0.5rem 1rem',
          fontSize: '0.8125rem',
          lineHeight: '1.25rem',
          fontWeight: '700',
          transitionProperty:
            'color, background-color, border-color, box-shadow',
          transitionDuration: '150ms',
          '&:focus-visible': focusRing,
          '&:disabled': { cursor: 'not-allowed', opacity: '0.5' },
        },
        '.ui-button-primary': {
          backgroundColor: theme('colors.brand.600'),
          color: theme('colors.white'),
          '&:hover': { backgroundColor: theme('colors.brand.700') },
        },
        '.ui-button-secondary': {
          borderWidth: '1px',
          borderColor: theme('colors.line'),
          backgroundColor: theme('colors.card'),
          color: theme('colors.ink'),
          '&:hover': { backgroundColor: theme('colors.muted') },
        },
        '.ui-button-ink': {
          backgroundColor: theme('colors.ink'),
          color: theme('colors.paper'),
          '&:hover': { backgroundColor: theme('colors.black') },
        },
        '.ui-button-ghost': {
          color: theme('colors.mute'),
          '&:hover': { backgroundColor: 'rgba(9, 9, 11, 0.05)' },
        },
        '.ui-button-danger': {
          backgroundColor: theme('colors.destructive.600'),
          color: theme('colors.white'),
          '&:hover': { backgroundColor: theme('colors.destructive.700') },
        },
        '.ui-tag': {
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.375rem',
          borderRadius: theme('borderRadius.full'),
          padding: '0.25rem 0.625rem',
          fontSize: '0.75rem',
          lineHeight: '1rem',
          fontWeight: '600',
        },
        '.ui-tag-neutral': {
          backgroundColor: theme('colors.muted'),
          color: theme('colors.mute'),
        },
        '.ui-tag-success': {
          backgroundColor: theme('colors.brand.50'),
          color: theme('colors.brand.700'),
        },
        '.ui-tag-info': {
          backgroundColor: theme('colors.info.50'),
          color: theme('colors.info.700'),
        },
        '.ui-tag-warning': {
          backgroundColor: theme('colors.warning.50'),
          color: theme('colors.warning.800'),
        },
        '.ui-tag-danger': {
          backgroundColor: theme('colors.destructive.50'),
          color: theme('colors.destructive.700'),
        },
        '.ui-input': {
          width: '100%',
          borderWidth: '1px',
          borderColor: theme('colors.line'),
          borderRadius: theme('borderRadius.control'),
          backgroundColor: theme('colors.card'),
          padding: '0.625rem 0.75rem',
          color: theme('colors.ink'),
          outline: 'none',
          '&::placeholder': { color: theme('colors.zinc.400') },
          '&:focus': {
            borderColor: theme('colors.ink'),
            boxShadow: '0 0 0 3px rgba(24, 24, 27, 0.10)',
          },
        },
      })
    },
  ],
}
