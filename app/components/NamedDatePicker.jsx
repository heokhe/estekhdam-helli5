import { TextField } from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import AdapterJalali from '@date-io/date-fns-jalali'
import { useState } from 'react'

export function NamedDatePicker({ name, ...props }) {
  const [value, setValue] = useState(new Date())
  return (
    <>
      <LocalizationProvider dateAdapter={AdapterJalali}>
        <DatePicker
          mask="____/__/__"
          value={value}
          onChange={newValue => setValue(newValue)}
          maxDate={Date.now()}
          renderInput={params => <TextField {...params} {...props} />}
        />
      </LocalizationProvider>
      <input type="hidden" name={name} value={value.getTime()} />
    </>
  )
}
