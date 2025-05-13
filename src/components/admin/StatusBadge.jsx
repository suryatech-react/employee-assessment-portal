import React from 'react';
import {
  Chip,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import { INTERVIEW_STAGES } from '../../utils/interviewStages';

const StatusBadge = ({ status, onChange }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleStatusChange = (newStatus) => {
    onChange(newStatus);
    handleClose();
  };

  return (
    <>
      <Chip
        label={INTERVIEW_STAGES[status]?.label || status}
        color={INTERVIEW_STAGES[status]?.color || 'default'}
        onClick={handleClick}
        variant="outlined"
        size="small"
        sx={{ cursor: 'pointer' }}
      />
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {Object.entries(INTERVIEW_STAGES).map(([key, { label, icon }]) => (
          <MenuItem 
            key={key} 
            onClick={() => handleStatusChange(key)}
            selected={status === key}
          >
            <ListItemIcon>
              {icon}
            </ListItemIcon>
            {label}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default StatusBadge;