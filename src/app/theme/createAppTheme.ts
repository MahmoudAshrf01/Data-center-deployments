import { createTheme } from '@mui/material/styles'

import { designTokens } from './tokens'

export const appTheme = createTheme({
  palette: {
    primary: designTokens.color.brand,
    info: { main: designTokens.color.info },
    warning: { main: designTokens.color.warning },
    error: { main: designTokens.color.destructive },
    background: {
      default: designTokens.color.paper,
      paper: designTokens.color.card,
    },
    divider: designTokens.color.line,
    text: {
      primary: designTokens.color.ink,
      secondary: designTokens.color.mute,
    },
  },
  typography: {
    fontFamily: designTokens.fontFamily,
  },
  shape: {
    borderRadius: designTokens.radius.control,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundColor: designTokens.color.paper,
        },
      },
    },
    MuiTooltip: {
      styleOverrides: {
        tooltip: {
          borderRadius: 8,
          backgroundColor: designTokens.color.ink,
          fontSize: '0.75rem',
          fontWeight: 600,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: `1px solid ${designTokens.color.line}`,
          borderRadius: designTokens.radius.card,
          boxShadow: designTokens.shadow.popover,
        },
      },
    },
    MuiBackdrop: {
      styleOverrides: {
        root: {
          backgroundColor: 'rgb(24 24 27 / 35%)',
          backdropFilter: 'blur(2px)',
          '&.MuiBackdrop-invisible': {
            backgroundColor: 'transparent',
            backdropFilter: 'none',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          minHeight: 42,
          borderRadius: designTokens.radius.control,
          backgroundColor: designTokens.color.card,
          fontSize: '0.875rem',
          fontWeight: 600,
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: designTokens.color.line,
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#a1a1aa',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: designTokens.color.ink,
            borderWidth: 1,
          },
          '&.Mui-focused': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          paddingTop: 10,
          paddingBottom: 10,
        },
        icon: {
          color: designTokens.color.mute,
          right: 10,
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          marginTop: 6,
          border: `1px solid ${designTokens.color.line}`,
          borderRadius: designTokens.radius.control,
          boxShadow: designTokens.shadow.popover,
        },
        list: {
          padding: 4,
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          minHeight: 38,
          borderRadius: 8,
          fontSize: '0.875rem',
          fontWeight: 600,
          '&.Mui-selected': {
            backgroundColor: '#ecfdf5',
            color: designTokens.color.brand.dark,
          },
          '&.Mui-selected:hover': {
            backgroundColor: '#d1fae5',
          },
        },
      },
    },
  },
})
