import MenuItem from '@mui/material/MenuItem'
import Select, { type SelectChangeEvent } from '@mui/material/Select'

interface SelectOption<TValue extends string> {
  readonly value: TValue
  readonly label: string
}

interface AppSelectProps<TValue extends string> {
  readonly ariaLabel: string
  readonly value: TValue
  readonly options: readonly SelectOption<TValue>[]
  readonly onChange: (value: TValue) => void
}

export function AppSelect<TValue extends string>({
  ariaLabel,
  value,
  options,
  onChange,
}: AppSelectProps<TValue>) {
  function handleChange(event: SelectChangeEvent<TValue>) {
    onChange(event.target.value as TValue)
  }

  return (
    <Select<TValue>
      value={value}
      size="small"
      fullWidth
      inputProps={{ 'aria-label': ariaLabel }}
      MenuProps={{
        anchorOrigin: { vertical: 'bottom', horizontal: 'left' },
        transformOrigin: { vertical: 'top', horizontal: 'left' },
      }}
      onChange={handleChange}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  )
}
