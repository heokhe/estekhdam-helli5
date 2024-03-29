import {
  List,
  ListItemButton,
  ListItemText,
  Collapse,
  IconButton,
} from '@mui/material'
import ExpandMore from '@mui/icons-material/ExpandMore'
import ExpandLess from '@mui/icons-material/ExpandLess'
import { useState } from 'react'

function ListItemWithNestedList({
  list,
  children,
  actions,
  initiallyOpen = false,
  ...props
}) {
  const [open, setOpen] = useState(initiallyOpen)
  const toggle = () => setOpen(!open)
  const listItemIsClickable = actions.length === 0
  return (
    <>
      <ListItemButton
        {...props}
        onClick={listItemIsClickable ? toggle : undefined}
      >
        {children}
        {actions}
        <IconButton onClick={!listItemIsClickable ? toggle : undefined}>
          {open ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </ListItemButton>
      <Collapse in={open}>{list}</Collapse>
    </>
  )
}

export function CategoryList({
  categories,
  renderFinalItem,
  parentItemActions = () => [],
  maximumVisibleDepth = 0,
  _depth = 0,
  ...props
}) {
  return (
    <List disablePadding {...props}>
      {categories.map(category =>
        category.data ? (
          renderFinalItem(category)
        ) : (
          <ListItemWithNestedList
            initiallyOpen={_depth < maximumVisibleDepth}
            key={category.id}
            list={
              <CategoryList
                key={`${category.id}children`}
                _depth={_depth + 1}
                maximumVisibleDepth={maximumVisibleDepth}
                categories={category.subcategories ?? []}
                renderFinalItem={renderFinalItem}
                parentItemActions={parentItemActions}
                sx={{ ml: 2, borderLeft: 1, borderColor: 'divider' }}
              />
            }
            actions={parentItemActions(category)}
          >
            <ListItemText primary={category.title} />
          </ListItemWithNestedList>
        )
      )}
    </List>
  )
}
