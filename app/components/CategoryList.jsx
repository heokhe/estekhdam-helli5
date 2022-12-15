import { List, ListItemButton, ListItemText, Collapse } from '@mui/material';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ExpandLess from '@mui/icons-material/ExpandLess';
import { useState } from 'react';

function ListItemWithNestedList({
  list,
  children,
  initiallyOpen = false,
  ...props
}) {
  const [open, setOpen] = useState(initiallyOpen);
  return (
    <>
      <ListItemButton {...props} onClick={() => setOpen(!open)}>
        {children}
        {open ? <ExpandLess /> : <ExpandMore />}
      </ListItemButton>
      <Collapse in={open}>{list}</Collapse>
    </>
  );
}

export function CategoryList({
  categories,
  renderFinalItem,
  maximumVisibleDepth = 0,
  _depth = 0,
  ...props
}) {
  return (
    <List disablePadding {...props}>
      {categories.map((category) =>
        category.subcategories ? (
          <ListItemWithNestedList
            initiallyOpen={_depth < maximumVisibleDepth}
            key={category.id}
            list={
              <CategoryList
                key={`${category.id}children`}
                _depth={_depth + 1}
                maximumVisibleDepth={maximumVisibleDepth}
                categories={category.subcategories}
                renderFinalItem={renderFinalItem}
                sx={{ ml: 2, borderLeft: 1, borderColor: 'divider' }}
              />
            }
          >
            <ListItemText primary={category.title} />
          </ListItemWithNestedList>
        ) : (
          renderFinalItem(category)
        ),
      )}
    </List>
  );
}
