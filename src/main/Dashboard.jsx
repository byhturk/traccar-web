import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'; // MUI'den gelen pasta dilimi grafiği bileşenleri
import { Typography, Card, CardContent, Box, Grid } from '@mui/material';
import PageLayout from '../common/components/PageLayout';
import ReportsMenu from '../reports/components/ReportsMenu';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import EventListCard from './EventListCard';
import SpeedListCard from './SpeedListCard';
import GeofenceListCard from './GeofenceListCard';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import Snackbar from '@mui/material/Snackbar';
import HelpCenterIcon from '@mui/icons-material/HelpCenter';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import WifiIcon from '@mui/icons-material/Wifi';
import SpeedIcon from '@mui/icons-material/Speed';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import WifiTetheringErrorIcon from '@mui/icons-material/WifiTetheringError';
import MapIcon from '@mui/icons-material/Map';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AlertListCard from './AlertListCard';
import { useTranslation } from '../common/components/LocalizationProvider';

const Dashboard = () => {
  const theme = useTheme();
  const isLG = useMediaQuery(theme.breakpoints.down('lg'));
  const isMD = useMediaQuery(theme.breakpoints.down('md'));
  const isSM = useMediaQuery(theme.breakpoints.down('sm'));

  const t = useTranslation();

  const [deviceIds, setDeviceIds] = useState([]);
  
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [events, setEvents] = useState([]);
  const [eventsSpeed, setEventsSpeed] = useState([]);
  const [eventsGeofenceExit, setEventsGeofenceExit] = useState([]);


  // Online ve offline+unknown araç sayılarını state'te saklayalım
  const [onlineCount, setOnlineCount] = useState(0);
  const [offlineAndUnknownCount, setOfflineAndUnknownCount] = useState(0);
  const [motionCountTrue, setMotionCountTrue] = useState(0);
  const [motionCountFalse, setMotionCountFalse] = useState(0);

  const [open, setOpen] = React.useState(false);
  const [message, setMessage] = React.useState(true);


  const handleClickHareket = () => {
    setOpen(true);
    setMessage(t("handleClickMotion"));
  };

  const handleClickStatus = () => {
    setOpen(true);
    setMessage(t("handleClickStatus"));
  };

  const handleClickEvents = () => {
    setOpen(true);
    setMessage(t("handleClickEvents"));
  };

  const handleClickSpeed= () => {
    setOpen(true);
    setMessage(t("handleClickSpeed"));
  };
  const handleClickAlertCard= () => {
    setOpen(true);
    setMessage(t("handleClickAlertCard"));
  };

  const handleClickTable = () => {
    setOpen(true);
    setMessage(t("handleClickTable"));
  };

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpen(false);
  };

  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClose}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  // API'den verileri almak için useEffect kullanalım
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/devices');
        if (response.ok) {
          const data = await response.json();
          // Verileri işleyerek online, offline ve unknown araç sayılarını ve hareketli araç sayısını alalım
          const onlineDevices = data.filter(device => device.status === 'online');
          const offlineAndUnknownDevices = data.filter(device => device.status !== 'online');
          const motionDevicesTrue = data.filter(device => device.status === 'online' && device.motionState === true);
          const motionDevicesFalse = data.filter(device => device.motionState !== true || device.status !== 'online');
          setOnlineCount(onlineDevices.length);
          setOfflineAndUnknownCount(offlineAndUnknownDevices.length);
          setMotionCountTrue(motionDevicesTrue.length);
          setMotionCountFalse(motionDevicesFalse.length);
  
          // Device IDs'leri de state'e set et
          const deviceIds = data.map(device => device.id);
          setDeviceIds(deviceIds);
          setDeviceDetails(data);
  
          // Event data fetch
          const currentTime = new Date();
          const fourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000);
          const fromTime = fourHoursAgo.toISOString();
          const toTime = currentTime.toISOString();
  
          const queryParams = new URLSearchParams({
            from: fromTime,
            to: toTime,
          });
  
          deviceIds.forEach(deviceId => {
            queryParams.append('deviceId', deviceId);
          });
  
          const types = [
            'alarm', 'deviceInactive', 'deviceMoving', 'deviceStopped',
            'deviceOverspeed', 'deviceFuelDrop', 'geofenceEnter', 'geofenceExit',
            'ignitionOn', 'ignitionOff', 'maintenance', 'driverChanged'
          ];
  
          types.forEach(type => {
            queryParams.append('type', type);
          });
  
          const eventResponse = await fetch(`/api/reports/events?${queryParams.toString()}`, {
            headers: { Accept: 'application/json' },
          });
  
          if (eventResponse.ok) {
            const mergedEventData = await eventResponse.json();
            mergedEventData.sort((a, b) => new Date(b.eventTime) - new Date(a.eventTime));
            const lastTenEvents = mergedEventData.slice(0, 10);
            setEvents(lastTenEvents);
  
            const eventsSpeed = mergedEventData.filter(event => event.type === 'deviceOverspeed');
            setEventsSpeed(eventsSpeed);
  
            const eventsGeofenceExit = mergedEventData.filter(event => event.type === 'geofenceExit');
            setEventsGeofenceExit(eventsGeofenceExit);
          } else {
            throw Error(await eventResponse.text());
          }
  
        } else {
          throw Error(await response.text());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchData();
  
    const interval = setInterval(fetchData, 15000);
  
    return () => clearInterval(interval);
  }, []);
  

   // [] içindeki değişkenler değiştiğinde useEffect çalışır, bu durumda sadece ilk render'da çalışması için boş dizi veriyoruz

  // Pasta dilimi grafiği için veri formatını oluşturalım
  const pieChartData = [
    { name: 'Online', value: onlineCount },
    { name: 'Offline', value: offlineAndUnknownCount }
  ];

  const pieMotionData = [
    { name: 'Hareket', value: motionCountTrue },
    { name: 'Park', value: motionCountFalse }
  ];

  // Renklerin belirlenmesi
  const COLORS = ['#00959E', 'grey'];
  const [isExpanded, setIsExpanded] = useState(true);
  const [isExpandedAlert, setIsExpandedAlert] = useState(true);


  const handleToggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleAlertExpand = () => {
    setIsExpandedAlert(!isExpandedAlert);
  };

  const now = new Date();
  const filterTwoMounthLater = new Date(now.setMonth(now.getMonth() + 1));
  const filterLastYear = new Date(now.setMonth(now.getMonth() - 12 ));

  // Geçerli bir expirationTime olup olmadığını kontrol edin
const hasValidExpiration = deviceDetails.some(device => {
  const expirationTime = new Date(device.expirationTime);
  return expirationTime >= filterLastYear && expirationTime <= filterTwoMounthLater;
});

  return (
    <PageLayout menu={<ReportsMenu />} breadcrumbs={['mainpageTitle', 'dashboardTitle']}>

      {hasValidExpiration ? (
      <Grid container spacing={1} justifyContent="center" style={{ marginTop: '4px' }} > {/* Ortalamak için justifyContent="center" */}
        {/* User Alert List Kartı */}
        <Grid item xs={12} sm={10} md={10} lg={10} xl={5}>
          <Card sx={{ width: '100%', maxWidth: '1000px', height: '100%',}} onClick={handleClickTable}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <AnnouncementIcon style={{ color: '#26aeb5', fontSize: 30 }} sx={{ justifyContent: 'flex-start' }} onClick={handleClickAlertCard} />
                <Typography variant="h6" onClick={handleAlertExpand}> {`${t("reportCustom")} ${t("sharedNotifications")}`} </Typography>
                {!isExpandedAlert && (
                  <ExpandMoreIcon onClick={handleAlertExpand}/>
                )} 
                {isExpandedAlert && (
                  <ExpandLessIcon onClick={handleAlertExpand}/>
                )} 
              </Box>
              {isExpandedAlert && (
              <AlertListCard deviceDetails={deviceDetails}  />
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      ) : (
        <Typography variant="justify" style={{ fontSize: '14px', textAlign: 'center', marginTop: '10px' }}>
          {t("dashboardalert")}
        </Typography>
      )
      }

      <Grid container spacing={1} justifyContent="center" style={{ marginTop: '1px'}}> {/* Ortalamak için justifyContent="center" */}
        {/* Araç Bağlantı Durumu Kartı */}
        <Grid item xs={6} sm={5} md={5} lg={3} xl={3}>
          <Card sx={{ height: '100%', maxWidth: '400px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <WifiIcon style={{ color: '#26aeb5', fontSize: 30 }} sx={{ justifyContent: 'flex-start' }} onClick={handleClickStatus} />
                <Typography variant="h6" > {t("sharedConnections")}</Typography>
                <HelpCenterIcon style={{ color: 'rgba(128, 128, 128, 0.5)' }} sx={{ justifyContent: 'flex-end' }} onClick={handleClickStatus} />
              </Box>
              <Box display="flex" flexDirection="column" alignItems="center">
                <ResponsiveContainer width="100%" height={isMD ? 100 : isLG ? 100 : 150}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={pieChartData}
                      label={({ value }) => `${value}`}
                      labelLine={{ length: 1, strokeWidth: 1 }}
                      outerRadius={isMD ? 20 : isLG ? 25 : 35}
                      fill="#8884d8"
                      innerRadius={isMD ? 8 : isLG ? 10 : 15}
                      paddingAngle={8}
                      cornerRadius={5}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap">
                  <Box display="flex" alignItems="center" mr={1} mb={1}>
                    <Box width={12} height={12} mr={1} bgcolor={COLORS[0]} borderRadius="50%" />
                    <Typography variant="body2">Online</Typography>
                  </Box>
                  <Box display="flex" alignItems="center" mb={1}>
                    <Box width={12} height={12} mr={1} bgcolor={COLORS[1]} borderRadius="50%" />
                    <Typography variant="body2">Offline</Typography>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Hareketli Araçlar Kartı */}
        <Grid item xs={6} sm={5} md={5} lg={3} xl={3}>
        <Card sx={{ height: '100%', maxWidth: '400px' }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <SpeedIcon style={{ color: '#26aeb5', fontSize: 30 }} sx={{ justifyContent: 'flex-start' }} onClick={handleClickStatus} />
                <Typography variant="h6" >{t("positionMotion")}</Typography>
                <HelpCenterIcon style={{ color: 'rgba(128, 128, 128, 0.5)' }} sx={{ justifyContent: 'flex-end' }} onClick={handleClickHareket} />
              </Box>              
              <Box display="flex" flexDirection="column" alignItems="center">
              <ResponsiveContainer width="100%" height={isMD ? 100 : isLG ? 100 : 150}>
                  <PieChart>
                    <Pie
                      dataKey="value"
                      data={pieMotionData}
                      label={({ value }) => `${value}`}
                      labelLine={{ length: 1, strokeWidth: 1 }}
                      outerRadius={isMD ? 20 : isLG ? 25 : 35}
                      fill="#8884d8"
                      innerRadius={isMD ? 8 : isLG ? 10 : 15}
                      paddingAngle={11}
                      cornerRadius={2}
                    >
                      {pieMotionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                  <Box display="flex" justifyContent="center" alignItems="center" flexWrap="wrap">
                    <Box display="flex" alignItems="center" mr={1} mb={1}>
                      <Box width={12} height={12} mr={1} bgcolor={COLORS[0]} borderRadius="50%" />
                      <Typography variant="body2">{t("alarmMovement")}</Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Box width={12} height={12} mr={1} bgcolor={COLORS[1]} borderRadius="50%" />
                      <Typography variant="body2">{t("alarmParking")}</Typography>
                    </Box>
                  </Box>
                </Box>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Speed List Kartı */}
        <Grid item xs={6} sm={5} md={5} lg={3} xl={3}>
          <Card sx={{ width: '100%', maxWidth: '600px', height: '100%',}}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <WifiTetheringErrorIcon style={{ color: '#26aeb5', fontSize: 30 }} sx={{ justifyContent: 'flex-start' }} onClick={handleClickStatus} />
                <Typography variant="h6" style={{ fontSize: '18px', textAlign: 'center', marginTop: '10px' }} >{t("eventDeviceOverspeed")}</Typography>
                <HelpCenterIcon style={{ color: 'rgba(128, 128, 128, 0.5)' }} sx={{ justifyContent: 'flex-end' }} onClick={handleClickSpeed} />
              </Box>
              <SpeedListCard deviceDetails={deviceDetails} eventsSpeed={eventsSpeed}  />
            </CardContent>
          </Card>
        </Grid>

        {/* Bölge İhlal Kartı */}
        <Grid item xs={6} sm={5} md={5} lg={3} xl={3}>
          <Card sx={{ width: '100%', maxWidth: '600px', height: '100%',}}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <MapIcon style={{ color: '#26aeb5', fontSize: 30 }} sx={{ justifyContent: 'flex-start' }} onClick={handleClickStatus} />
                <Typography variant="h6" style={{ fontSize: '16px', textAlign: 'center', marginTop: '10px' }}> {t("eventGeofenceExit")} </Typography>
                <HelpCenterIcon style={{ color: 'rgba(128, 128, 128, 0.5)' }} sx={{ justifyContent: 'flex-end' }} onClick={handleClickSpeed} />
              </Box>
              <GeofenceListCard deviceDetails={deviceDetails} eventsGeofenceExit={eventsGeofenceExit}  />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={1} justifyContent="center" style={{ marginTop: '4px' }} > {/* Ortalamak için justifyContent="center" */}
        {/* Event List Kartı */}
        <Grid item xs={12} sm={10} md={10} lg={10} xl={5}>
          <Card sx={{ width: '100%', maxWidth: '1000px', height: '100%',}}>
            <CardContent onClick={handleToggleExpand} >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <NotificationsActiveIcon style={{ color: '#26aeb5', fontSize: 30 }} sx={{ justifyContent: 'flex-start' }} onClick={handleClickEvents} />
                <Typography variant="h6" onClick={handleToggleExpand}> {t("last10event")} </Typography>
                {!isExpanded && (
                  <ExpandMoreIcon onClick={handleToggleExpand}/>
                )} 
                {isExpanded && (
                  <ExpandLessIcon onClick={handleToggleExpand}/>
                )} 
              </Box>
              {isExpanded && (
              <EventListCard  events={events} deviceDetails={deviceDetails}  />
              )}
            </CardContent>
          </Card>
        </Grid>

      </Grid>
      <Snackbar
        open={open}
        autoHideDuration={6000}
        onClose={handleClose}
        action={action}
        message={message}
      />
    </PageLayout>
  );
};

export default Dashboard;
