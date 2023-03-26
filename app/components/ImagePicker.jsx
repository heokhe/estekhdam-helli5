import { Avatar, Tooltip } from '@mui/material'
import AddAPhotoOutlined from '@mui/icons-material/AddAPhotoOutlined'
import { useId, useState } from 'react'

export function ImagePicker({ size, ...props }) {
  const id = useId()
  const [src, setSrc] = useState('')

  const handleChange = event => {
    const input = event.target
    const [file] = input.files
    const reader = new FileReader()
    reader.addEventListener('load', () => {
      setSrc(reader.result)
    })
    if (file) {
      reader.readAsDataURL(file)
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      <input
        {...props}
        type="file"
        accept="image/*"
        id={id}
        style={{
          // We don't just set the display to none
          // because we want the input to be present, but just hidden.
          // This helps in showing errors for example.
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: size,
          transform: 'translateX(-50%)',
          opacity: 0,
          pointerEvents: 'none',
        }}
        onChange={handleChange}
      />
      <Tooltip
        title={src ? 'برای تغییر عکس کلیک کنید' : 'برای آپلود عکس کلیک کنید'}
        placement="top"
      >
        <Avatar
          component="label"
          htmlFor={id}
          sx={{
            width: size,
            height: size,
            bgcolor: 'primary.light',
            mx: 'auto',
            mb: 1,
            cursor: 'pointer',
          }}
          src={src}
        >
          <AddAPhotoOutlined sx={{ fontSize: size * 0.4 }} />
        </Avatar>
      </Tooltip>
    </div>
  )
}
