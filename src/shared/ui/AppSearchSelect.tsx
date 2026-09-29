import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'

interface SearchOption {
  readonly value: string
  readonly label: string
}

interface AppSearchSelectProps {
  readonly ariaLabel: string
  readonly value: string
  readonly options: readonly SearchOption[]
  readonly onChange: (value: string) => void
}

export function AppSearchSelect({
  ariaLabel,
  value,
  options,
  onChange,
}: AppSearchSelectProps) {
  const selected = options.find((option) => option.value === value) ?? null

  return (
    <Autocomplete
      size="small"
      sx={{
        '& .MuiInputBase-input': { color: '#18181b', fontWeight: 600 },
      }}
      options={options}
      value={selected}
      onChange={(_, option) => onChange(option?.value ?? '')}
      isOptionEqualToValue={(option, current) => option.value === current.value}
      getOptionLabel={(option) => option.label}
      slotProps={{
        listbox: {
          sx: {
            maxHeight: 220,
            '& .MuiAutocomplete-option': {
              color: '#18181b',
              fontWeight: 600,
            },
          },
        },
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          placeholder={`Search ${ariaLabel.toLowerCase()}`}
        />
      )}
    />
  )
}
