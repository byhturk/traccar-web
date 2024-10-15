import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import Draggable from 'react-draggable';
import {
  Card,
  CardContent,
  Typography,
  CardActions,
  IconButton,
  Table,
  TableBody,
  TableRow,
  TableCell,
  Menu,
  MenuItem,
  CardMedia,
  Dialog,
  TextField,
  DialogActions,
  DialogContent,
  Button,
  Tooltip,
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import CloseIcon from '@mui/icons-material/Close';
import ReplayIcon from '@mui/icons-material/Replay';
import PublishIcon from '@mui/icons-material/Publish';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PendingIcon from '@mui/icons-material/Pending';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';
import PowerIcon from '@mui/icons-material/Power';
import SatelliteAltIcon from '@mui/icons-material/SatelliteAlt';
import BlockIcon from '@mui/icons-material/Block';
import BoltIcon from '@mui/icons-material/Bolt';
import SpeedIcon from '@mui/icons-material/Speed';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import RouteIcon from '@mui/icons-material/Route';
import NavigationIcon from '@mui/icons-material/Navigation';
import InsertLinkIcon from '@mui/icons-material/InsertLink';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import SignalCellular0BarIcon from '@mui/icons-material/SignalCellular0Bar';
import SignalCellular1BarIcon from '@mui/icons-material/SignalCellular1Bar';
import SignalCellular2BarIcon from '@mui/icons-material/SignalCellular2Bar';
import SignalCellular3BarIcon from '@mui/icons-material/SignalCellular3Bar';
import SignalCellular4BarIcon from '@mui/icons-material/SignalCellular4Bar';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NetworkCheckIcon from '@mui/icons-material/NetworkCheck';
import FenceIcon from '@mui/icons-material/Fence';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import BatteryChargingFullIcon from '@mui/icons-material/BatteryChargingFull';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import Battery4BarIcon from '@mui/icons-material/Battery4Bar';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import {
  formatAlarm, formatBoolean, formatIgnition, formatPercentage, formatStatus, getStatusColor,
} from '../../common/util/formatter';
import { useTranslation } from './LocalizationProvider';
import RemoveDialog from './RemoveDialog';
import PositionValue from './PositionValue';
import { useAdministrator, useDeviceReadonly, useRestriction } from '../util/permissions';
import usePositionAttributes from '../attributes/usePositionAttributes';
import { devicesActions } from '../../store';
import { useCatch, useCatchCallback } from '../../reactHelper';
import { useAttributePreference } from '../util/preferences';
import EngineIcon from '../../resources/images/data/engine.svg?react';


const iconMapping = {
  speed: <SpeedIcon color="primary" />,
  address: <LocationOnIcon color="primary" />,
  totalDistance: <RouteIcon color="primary" />,
  course: <NavigationIcon color="primary" />,
  ignition: <PowerIcon color="primary" />,
  alarm: <NotificationsActiveIcon color="error" />,
  blocked: <BlockIcon color="error" />,
  power: <BoltIcon color="primary" />,
  serverTime: <AccessTimeIcon color="primary" />,
  deviceTime: <AccessTimeIcon color="primary" />,
  fixTime: <AccessTimeIcon color="primary" />,
  network: <NetworkCheckIcon color="primary" />,
  geofenceIds: <FenceIcon color="primary" />,
  sat: <SatelliteAltIcon color="primary" />,
  distance: <RouteIcon color="primary" />,
  motion: <TrendingUpIcon color="primary" />,
  charge: <BatteryChargingFullIcon color="primary" />,
  batteryLevel: <Battery4BarIcon color="primary" />,
  rssi: <SignalCellularAltIcon color="primary" />,
  result: <ThumbUpIcon color="primary" />,
};

const useStyles = makeStyles((theme) => ({
  iconContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    pointerEvents: 'auto',
    width: theme.dimensions.popupMaxWidth,
  },
  media: {
    height: theme.dimensions.popupImageHeight,
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
  },
  mediaButton: {
    color: theme.palette.primary.contrastText,
    mixBlendMode: 'difference',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1, 1, 0, 2),
  },
  content: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    maxHeight: theme.dimensions.cardContentMaxHeight,
    overflow: 'auto',
  },
  icon: {
    width: '25px',
    height: '25px',
    marginRight: theme.spacing(1),
  },
  table: {
    '& .MuiTableCell-sizeSmall': {
      paddingLeft: 0,
      paddingRight: 0,
    },
  },
  cell: {
    borderBottom: 'none',
  },
  actions: {
    justifyContent: 'space-between',
  },
  root: ({ desktopPadding }) => ({
    pointerEvents: 'none',
    position: 'fixed',
    zIndex: 5,
    left: '50%',
    [theme.breakpoints.up('md')]: {
      left: `calc(50% + ${desktopPadding} / 2)`,
      bottom: theme.spacing(3),
    },
    [theme.breakpoints.down('md')]: {
      left: '50%',
      bottom: `calc(${theme.spacing(3)} + ${theme.dimensions.bottomBarHeight}px)`,
    },
    transform: 'translateX(-50%)',
  }),
  iconIgnition: {
    width: '25px',
    height: '25px',
    filter: 'brightness(0) invert(1)',
  },
  batteryText: {
    fontSize: '0.75rem',
    fontWeight: 'normal',
    lineHeight: '0.875rem',
  },
  success: {
    color: theme.palette.success.main,
  },
  warning: {
    color: theme.palette.warning.main,
  },
  error: {
    color: theme.palette.error.main,
  },
  neutral: {
    color: theme.palette.neutral.main,
  },

}));

const StatusRow = ({ name, content, icon }) => {
  const classes = useStyles();

  return (
    <TableRow>
      <TableCell className={classes.cell}>
      <div className={classes.iconContainer}>
          <div className={classes.icon}>
            {icon}
          </div>
        <Typography variant="body2">{name}</Typography>
      </div>
      </TableCell>
      <TableCell className={classes.cell}>
        <Typography variant="body2" color="textSecondary">{content}</Typography>
      </TableCell>
    </TableRow>
  );
};

const getRssiIcon = (rssi) => {
  let IconComponent;
  let color;

  if (rssi >= 0 && rssi <= 15) {
    IconComponent = SignalCellular0BarIcon;
    color = '#8a3227'; 
  } else if (rssi > 15 && rssi <= 45) {
    IconComponent = SignalCellular1BarIcon;
    color = '#4DB6AC'; 
  } else if (rssi > 45 && rssi <= 70) {
    IconComponent = SignalCellular2BarIcon;
    color = '#00959E'; // gri tonlarında bir renk
  } else if (rssi > 70 && rssi <= 90) {
    IconComponent = SignalCellular3BarIcon;
    color = '#00959E'; // yeşil-gri tonlarında bir renk
  } else if (rssi > 90 && rssi <= 100) {
    IconComponent = SignalCellular4BarIcon;
    color = '#00959E'; // tema rengi
  }

  return <IconComponent style={{ color,  width: 20, height: 20 }} />;
};


function getSatelliteIcon(sat) {
  let color;

  if (sat === 0) {
    color = '#F44336'; // Kırmızı renk
  } else if (sat >= 1 && sat <= 5) {
    color = '#90A4AE'; // Gri tonlarında bir renk
  } else if (sat >= 6 && sat <= 8) {
    color = '#78909C'; // Gri tonlarında bir renk
  } else if (sat >= 9 && sat <= 10) {
    color = '#00959E'; // Gri tonlarında bir renk
  } else if (sat >= 11 && sat <= 15) {
    color = '#00959E'; // Tema rengi
  }

  return <SatelliteAltIcon style={{ color ,  width: 20, height: 20 }} />;
}



const StatusCard = ({ deviceId, position, onClose, disableActions, desktopPadding = 0 }) => {
  const classes = useStyles({ desktopPadding });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const t = useTranslation();

  const deviceReadonly = useDeviceReadonly();
  const admin = useAdministrator();
  const userReadonly = useRestriction('readonly');

  const shareDisabled = useSelector((state) => state.session.server.attributes.disableShare);
  const user = useSelector((state) => state.session.user);
  const device = useSelector((state) => state.devices.items[deviceId]);

  const deviceImage = device?.attributes?.deviceImage;

  const positionAttributes = usePositionAttributes(t);
  const positionItems = useAttributePreference('positionItems', 'speed,address,totalDistance,power,alarm,fixTime');

  const navigationAppLink = useAttributePreference('navigationAppLink');
  const navigationAppTitle = useAttributePreference('navigationAppTitle');

  const [anchorEl, setAnchorEl] = useState(null);

  const [removing, setRemoving] = useState(false);

  const handleRemove = useCatch(async (removed) => {
    if (removed) {
      const response = await fetch('/api/devices');
      if (response.ok) {
        dispatch(devicesActions.refresh(await response.json()));
      } else {
        throw Error(await response.text());
      }
    }
    setRemoving(false);
  });

  const handleGeofence = useCatchCallback(async () => {
    const newItem = {
      name: t('sharedGeofence'),
      area: `CIRCLE (${position.latitude} ${position.longitude}, 50)`,
    };
    const response = await fetch('/api/geofences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newItem),
    });
    if (response.ok) {
      const item = await response.json();
      const permissionResponse = await fetch('/api/permissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId: position.deviceId, geofenceId: item.id }),
      });
      if (!permissionResponse.ok) {
        throw Error(await permissionResponse.text());
      }
      navigate(`/settings/geofence/${item.id}`);
    } else {
      throw Error(await response.text());
    }
  }, [navigate, position]);

  return (
    <>
      <div className={classes.root}>
        {device && (
          <Draggable
            handle={`.${classes.media}, .${classes.header}`}
          >
            <Card elevation={3} className={classes.card}>
              {deviceImage ? (
                <CardMedia
                  className={classes.media}
                  image={`/api/media/${device.uniqueId}/${deviceImage}`}
                >
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" className={classes.mediaButton} />
                  </IconButton>
                </CardMedia>
              ) : (
                <div className={classes.header}>
                  {position && position.attributes && position.attributes.hasOwnProperty('ignition') && (
                    <Tooltip title={`${formatIgnition(position.attributes.ignition, t)}`}>
                      <IconButton size="small">
                        {position.attributes.ignition ? (
                          <EngineIcon className={classes.success} style={{ width: 25, height: 25 }}  />
                        ) : (
                          <EngineIcon className={classes.neutral} style={{ width: 25, height: 25 }}/>
                        )}
                      </IconButton>
                    </Tooltip>
                  )}
                  {position && position.attributes && position.attributes.hasOwnProperty('sat') && (
                    <Tooltip title={`${t('positionSat')}: ${parseInt(position.attributes.sat, t)}`}>
                      <IconButton size="small">
                        {getSatelliteIcon(parseInt(position.attributes.sat))}
                      </IconButton>
                    </Tooltip>
                  )}
                  {position && position.attributes && position.attributes.hasOwnProperty('rssi') && (
                    <Tooltip title={`${t('positionRssi')}: ${formatPercentage(position.attributes.rssi, t)}`}>
                      <IconButton size="small">
                        {getRssiIcon(parseInt(position.attributes.rssi))}
                      </IconButton>
                    </Tooltip>
                  )}
                  {position && position.attributes && position.attributes.hasOwnProperty('charge') && (
                    <Tooltip title={`${t('positionCharge')}: ${formatBoolean(position.attributes.charge, t)}`}>
                      <IconButton size="small">
                        {position.attributes.charge ? (
                          <BatteryChargingFullIcon style={{color: "#00959E", width: 25, height: 25 }}  />
                        ) : (
                          <BatteryAlertIcon className={classes.error} style={{ width: 25, height: 25 }}/>
                        )}
                      </IconButton>
                    </Tooltip>
                  )}


                  {position && position.attributes && position.attributes.hasOwnProperty('result') && (
                    <Tooltip title={t('commandSent')}>
                      <IconButton size="small">
                       <ThumbUpIcon className={classes.success} style={{ width: 20, height: 20 }}  />
                      </IconButton>
                    </Tooltip>
                  )}
                  <IconButton
                    size="small"
                    onClick={onClose}
                    onTouchStart={onClose}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </div>
              )}
              {position && (
                <CardContent className={classes.content}>
                  {device.status === "online" ? (
                    <Typography color="primary" style={{ textAlign: 'center' }}>
                      {device.name}
                    </Typography>
                  ) : (
                    <Typography color="error" style={{ textAlign: 'center' }}>
                      {device.name} <br />
                      {t("eventDeviceOffline")}
                    </Typography>
                  )}
                  <Table size="small" classes={{ root: classes.table }}>
                  <TableBody>
                      {positionItems.split(',').filter((key) => position.hasOwnProperty(key) || position.attributes.hasOwnProperty(key)).map((key) => {
                        let icon = null;

                        // İlgili özelliklere göre uygun ikonları belirle
                        switch (key) {
                          case 'speed':
                          case 'address':
                          case 'totalDistance':
                          case 'course':
                          case 'ignition':
                          case 'alarm':
                          case 'blocked':
                          case 'power':
                          case 'serverTime':
                          case 'deviceTime':
                          case 'fixTime':
                          case 'network':
                          case 'geofenceIds':
                          case 'sat':
                          case 'distance':
                          case 'motion':
                          case 'charge':
                          case 'batteryLevel':
                          case 'rssi':
                          case 'result':
                            icon = iconMapping[key];
                            break;
                          default:
                            break;
                        }
                        return (
                          <StatusRow
                            key={key}
                            name={positionAttributes.hasOwnProperty(key) ? positionAttributes[key].name : key}
                            content={(
                              <PositionValue
                                position={position}
                                property={position.hasOwnProperty(key) ? key : null}
                                attribute={position.hasOwnProperty(key) ? null : key}
                              />
                            )}
                            icon={icon}
                          />
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              )}
              <CardActions classes={{ root: classes.actions }} disableSpacing>
                <IconButton
                  color="secondary"
                  onClick={(e) => setAnchorEl(e.currentTarget)}
                  disabled={!position  || userReadonly}
                >
                  <PendingIcon />
                </IconButton>
                <IconButton
                  onClick={() => navigate('/replay')}
                  disabled={disableActions || !position || userReadonly}
                >
                  <HistoryIcon />
                </IconButton>
                <IconButton
                  onClick={() => navigate(`/settings/device/${deviceId}/command`)}
                  disabled={disableActions || userReadonly}
                >
                  <SettingsIcon />
                  </IconButton>
                <IconButton
                    onClick={() => navigate(`/settings/device/${deviceId}/connections`)}
                    disabled={disableActions || userReadonly}
                  >
                    <InsertLinkIcon />
                </IconButton>
                <IconButton
                  onClick={() => navigate(`/settings/device/${deviceId}`)}
                  disabled={disableActions || deviceReadonly}
                >
                  <EditIcon />
                </IconButton>
                {admin && (//takipon
                  <IconButton
                    onClick={() => setRemoving(true)}
                    disabled={disableActions || deviceReadonly}
                    className={classes.negative}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </CardActions>
            </Card>
          </Draggable>
        )}
      </div>
      {position && (
        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
          {admin && (

          <MenuItem onClick={() => navigate(`/position/${position.id}`)}><Typography color="secondary">{t('sharedShowDetails')}</Typography></MenuItem>
          )} 
          <MenuItem onClick={handleGeofence}><Typography color="secondary">{t('sharedCreateGeofence')}</Typography></MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${position.latitude}%2C${position.longitude}`}>{t('linkGoogleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`http://maps.apple.com/?ll=${position.latitude},${position.longitude}`}>{t('linkAppleMaps')}</MenuItem>
          <MenuItem component="a" target="_blank" href={`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${position.latitude}%2C${position.longitude}&heading=${position.course}`}>{t('linkStreetView')}</MenuItem>
          {navigationAppTitle && <MenuItem component="a" target="_blank" href={navigationAppLink.replace('{latitude}', position.latitude).replace('{longitude}', position.longitude)}>{navigationAppTitle}</MenuItem>}
          {!shareDisabled && !user.temporary && <MenuItem onClick={() => navigate(`/settings/device/${deviceId}/share`)}><Typography color="primary">{t('deviceShare')}</Typography></MenuItem>}
        </Menu>
      )}
      <RemoveDialog
        open={removing}
        endpoint="devices"
        itemId={deviceId}
        onResult={(removed) => handleRemove(removed)}
      />
    </>
  );
};

export default StatusCard;
