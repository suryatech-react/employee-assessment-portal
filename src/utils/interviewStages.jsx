import {
    Description as DescriptionIcon,
    FilterAlt as FilterAltIcon,
    Code as CodeIcon,
    People as PeopleIcon,
    CheckCircle as CheckCircleIcon,
    Cancel as CancelIcon,
  } from '@mui/icons-material';
  
  export const INTERVIEW_STAGES = {
    applied: {
      label: 'Applied',
      color: 'default',
      icon: <DescriptionIcon />
    },
    screening: {
      label: 'Screening',
      color: 'info',
      icon: <FilterAltIcon />
    },
    technical: {
      label: 'Technical',
      color: 'warning',
      icon: <CodeIcon />
    },
    hr: {
      label: 'HR Round',
      color: 'primary',
      icon: <PeopleIcon />
    },
    offer: {
      label: 'Offer',
      color: 'success',
      icon: <CheckCircleIcon />
    },
    rejected: {
      label: 'Rejected',
      color: 'error',
      icon: <CancelIcon />
    }
  };