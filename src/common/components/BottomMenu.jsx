import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper, BottomNavigation, BottomNavigationAction, Menu, MenuItem, Typography, Badge, ListItemIcon,Snackbar
} from '@mui/material';

import DescriptionIcon from '@mui/icons-material/Description';
import MapIcon from '@mui/icons-material/Map';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import ContactEmergencyIcon from '@mui/icons-material/ContactEmergency';
import AddAlertIcon from '@mui/icons-material/AddAlert';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import CropIcon from '@mui/icons-material/Crop';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import HomeIcon from '@mui/icons-material/Home';
import GroupIcon from '@mui/icons-material/Group';
import BuildIcon from '@mui/icons-material/Build';
import DisplaySettingsIcon from '@mui/icons-material/DisplaySettings';

import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import { sessionActions } from '../../store';
import { useTranslation } from './LocalizationProvider';
import { useAdministrator, useRestriction } from '../util/permissions';
import { nativePostMessage } from './NativeInterface';
import PhonelinkSetup from '@mui/icons-material/PhonelinkSetup';

const BottomMenu = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const t = useTranslation();
  const admin = useAdministrator();

  const readonly = useRestriction('readonly');
  const disableReports = useRestriction('disableReports');
  const user = useSelector((state) => state.session.user);
  const socket = useSelector((state) => state.session.socket);
  const theme = useTheme();
  const desktop = useMediaQuery(theme.breakpoints.up('md'));

  const [anchorEl, setAnchorEl] = useState(null);
  const [isReportsMenuOpen, setIsReportsMenuOpen] = useState(false);


  const handleReportsMenuToggle = () => {
    setIsReportsMenuOpen(!isReportsMenuOpen);
    // Diğer menüyü kapatmak için
  };

  const currentSelection = () => {
    if (location.pathname === `/settings/user/${user.id}`) {
      return 'account';
    } if (location.pathname.startsWith('/settings/preferences')) {
      return 'settings';
    } if (location.pathname.startsWith('/settings')) {
      return 'settings';
    } if (location.pathname.startsWith('/reports')) {
      return 'reports';
    } if (location.pathname.startsWith('/Reportsmenu')) {
      return 'Reportsmenu';
    } if (location.pathname === '/') {
      return 'map';
    } if (location.pathname === '/dashboard') {
      return 'dashboard';
    } if (location.pathname === '/settings/supportpage') {
      return 'settings';
    }
    return null;
  };

  const handleSettings = () => {
    setAnchorEl(null);
    navigate(`/settings/preferences`);
  };

  const handleAccount = () => {
    setAnchorEl(null);
    navigate(`/settings/user/${user.id}`);
  };
  const handleNotifications = () => {
    setAnchorEl(null);
    navigate('/settings/notifications');
  };
  const handleDevices = () => {
    setAnchorEl(null);
    navigate('/settings/devices');
  };
  const handleGeofences = () => {
    setAnchorEl(null);
    navigate('/geofences');
  };
  const handleGroups = () => {
    setAnchorEl(null);
    navigate('/settings/groups');
  };
  const handleClendars = () => {
    setAnchorEl(null);
    navigate('/settings/calendars');
  };
  const mainterance = () => {
    setAnchorEl(null);
    navigate('/settings/maintenances');
  };
  const handleSupport = () => {
    setAnchorEl(null);
    navigate('/settings/supportpage');
  };

  const handleServer = () => {
    setAnchorEl(null);
    navigate('/settings/server');
  };

  const handleUsers = () => {
    setAnchorEl(null);
    navigate('/settings/users');
  };


  const handleLogout = async () => {
    setAnchorEl(null);

    const notificationToken = window.localStorage.getItem('notificationToken');
    if (notificationToken && !user.readonly) {
      window.localStorage.removeItem('notificationToken');
      const tokens = user.attributes.notificationTokens?.split(',') || [];
      if (tokens.includes(notificationToken)) {
        const updatedUser = {
          ...user,
          attributes: {
            ...user.attributes,
            notificationTokens: tokens.length > 1 ? tokens.filter((it) => it !== notificationToken).join(',') : undefined,
          },
        };
        await fetch(`/api/users/${user.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedUser),
        });
      }
    }

    await fetch('/api/session', { method: 'DELETE' });
    nativePostMessage('logout');
    navigate('/login');
    dispatch(sessionActions.updateUser(null));
  };

  const handleSelection = (event, value) => {
    switch (value) {
      case 'dashboard':
        navigate('/dashboard');
        break;
      case 'map':
        navigate('/');
        break;
      case 'support':
        navigate('/Supportpage');
        break;
      case 'reports':
        navigate('/reports/event');
        break;
      case 'reportsmenu':
        navigate('/Reportsmenu');
        break;
      case 'settings':
        navigate('/settings/preferences');
        break;
      case 'settingsmenu':
        navigate('/settingsmenu');
        break;
      case 'account':
        setAnchorEl(event.currentTarget);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <Paper square elevation={6}>
      <BottomNavigation value={currentSelection()} onChange={handleSelection} showLabels>
        
        <BottomNavigationAction
          label={t('dashboardTitle')}
          icon={(
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <HomeIcon />
            </Badge>
          )}
          value="dashboard"
        />
        <BottomNavigationAction
          label={t('mapTitle')}
          icon={(
            <Badge color="error" variant="dot" overlap="circular" invisible={socket !== false}>
              <MapIcon />
            </Badge>
          )}
          value="map"
        />
        {!disableReports ? (desktop ? (
          <BottomNavigationAction label={t('reportTitle')} icon={<DescriptionIcon />} value="reports" onClick={handleReportsMenuToggle} />
        ) : (
          <BottomNavigationAction label={t('reportTitle')} icon={<DescriptionIcon />} value="reports" onClick={handleReportsMenuToggle} />
        )) : (
          <BottomNavigationAction label={t('reportTitle')} icon={<DescriptionIcon />} value="yetkisiz" />
        )}
        {readonly ? (
          <BottomNavigationAction label={t('loginLogout')} icon={<ExitToAppIcon />} value="logout" />
        ) : (
          <BottomNavigationAction label={t('settingsTitle')} icon={<SettingsIcon />} value="account" />
        )}
        
      </BottomNavigation>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={handleSettings}>
          <ListItemIcon>
            <PhonelinkSetup fontSize="small" color="second" />
          </ListItemIcon>
          <Typography color="textSecond">{t('sharedExtra')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleAccount}>
          <ListItemIcon>
            <ContactEmergencyIcon fontSize="small" color="second" />
          </ListItemIcon>
          <Typography color="textSecond">{t('settingsUser')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleNotifications}>
          <ListItemIcon>
            <AddAlertIcon fontSize="small" color="second" />
          </ListItemIcon>
          <Typography color="textSecond">{t('sharedNotifications')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleDevices}>
          <ListItemIcon>
            <SatelliteAltIcon fontSize="small" color="second" />
          </ListItemIcon>
          <Typography color="textSecond">{t('deviceTitle')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleGeofences}>
          <ListItemIcon>
            <CropIcon fontSize="small" color="green" />
          </ListItemIcon>
          <Typography color="textGreen">{t('sharedGeofences')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleGroups}>
          <ListItemIcon>
            <WorkspacesIcon fontSize="small" color="second" />
          </ListItemIcon>
          <Typography color="textSecond">{t('settingsGroups')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleClendars}>
          <ListItemIcon>
            <CalendarMonthIcon fontSize="small" color="second" />
          </ListItemIcon>
          <Typography color="textSecond">{t('sharedCalendars')}</Typography>
        </MenuItem>
        <MenuItem onClick={mainterance}>
          <ListItemIcon>
            <BuildIcon fontSize="small" color="second" />
          </ListItemIcon>
          <Typography color="textSecond">{t('sharedMaintenance')}</Typography>
        </MenuItem>
        <MenuItem onClick={handleSupport}>
          <ListItemIcon>
            <SupportAgentIcon fontSize="small" color="primary" />
          </ListItemIcon>
          <Typography color="textPrimary">{t('support')}</Typography>
        </MenuItem>
        {admin && 
          <MenuItem onClick={handleServer}>
            <ListItemIcon>
              <DisplaySettingsIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="textPrimary">{t('settingsServer')}</Typography>
          </MenuItem>
        }
        {admin && 
          <MenuItem onClick={handleUsers}>
            <ListItemIcon>
              <GroupIcon fontSize="small" color="error" />
            </ListItemIcon>
            <Typography color="textPrimary">{t('settingsUsers')}</Typography>
          </MenuItem>
        }
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" color="error" />
          </ListItemIcon>
          <Typography color="error">{t('loginLogout')} </Typography>
        </MenuItem>
      </Menu>
    </Paper>
    
  );
};

export default BottomMenu;
