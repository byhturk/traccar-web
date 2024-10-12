import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';


import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  FormControlLabel,
  Checkbox,
  FormGroup,
  Button,
  TextField,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useTranslation, useTranslationKeys } from '../common/components/LocalizationProvider';
import EditItemView from './components/EditItemView';
import { prefixString, unprefixString } from '../common/util/stringUtils';
import SelectField from '../common/components/SelectField';
import SettingsMenu from './components/SettingsMenu';
import { useCatch } from '../reactHelper';
import useSettingsStyles from './common/useSettingsStyles';
import useFeatures from '../common/util/useFeatures';/** features ekledik */
import { useAdministrator } from '../common/util/permissions';

const NotificationPage = () => {
  const classes = useSettingsStyles();
  const t = useTranslation();
  const admin = useAdministrator();


  const [item, setItem] = useState();

  const alarms = useTranslationKeys((it) => it.startsWith('alarm')).map((it) => ({
    key: unprefixString('alarm', it),
    name: t(it),
  }));

  const features = useFeatures(); /* tanımlama yaptık */

  const [notificationTypes, setNotificationTypes] = useState([]);
  const allowedTypes = ['alarm', 'geofenceEnter', 'geofenceExit', 'ignitionOn', 'ignitionOff', 'deviceOnline', 'deviceOffline','deviceUnknown', 'deviceMoving', 'deviceStopped', 'deviceOverspeed', 'maintenance'];

  useEffect(() => {
    const fetchNotificationTypes = async () => {
      const response = await fetch('/api/notifications/types');
      const types = await response.json();

      // Admin'e göre filtreleme
      const filteredTypes = admin ? types : types.filter(type => allowedTypes.includes(type.type));
      setNotificationTypes(filteredTypes);
    };
    fetchNotificationTypes();
  }, [admin]);

  const testNotificators = useCatch(async () => {
    await Promise.all(item.notificators.split(/[, ]+/).map(async (notificator) => {
      const response = await fetch(`/api/notifications/test/${notificator}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) {
        throw Error(await response.text());
      }
    }));
  });

  const user = useSelector((state) => state.session.user);
  const [attributes] = useState(user.attributes);
  const smsLimit = attributes.smsLimit;


  const validate = () => item && item.type && item.notificators && (!item.notificators?.includes('command') || item.commandId);

  return (
    <EditItemView
      endpoint="notifications"
      item={item}
      setItem={setItem}
      validate={validate}
      menu={<SettingsMenu />}
      breadcrumbs={['settingsTitle', 'sharedNotification']}
    >
      {item && (
        <>
          <Accordion defaultExpanded>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedRequired')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <SelectField
                value={item.type}
                onChange={(e) => setItem({ ...item, type: e.target.value })}
                data={notificationTypes} // Filtrelenmiş türler burada
                keyGetter={(it) => it.type}
                titleGetter={(it) => t(prefixString('event', it.type))}
                label={t('sharedType')}
              />
              {item.type === 'alarm' && (
                <SelectField
                  multiple
                  value={item.attributes && item.attributes.alarms ? item.attributes.alarms.split(/[, ]+/) : []}
                  onChange={(e) => setItem({ ...item, attributes: { ...item.attributes, alarms: e.target.value.join() } })}
                  data={alarms}
                  keyGetter={(it) => it.key}
                  label={t('sharedAlarms')}
                />
              )}
              <SelectField
                multiple
                value={item.notificators ? (features.disableSms ? item.notificators.split(/[, ]+/).filter((value) => value !== 'sms') : item.notificators.split(/[, ]+/)) : []}
                onChange={(e) => setItem({ ...item, notificators: features.disableSms ? e.target.value.filter((value) => value !== 'sms').join() : e.target.value.join() })}
                endpoint="/api/notifications/notificators"
                keyGetter={(it) => it.type}
                titleGetter={(it) => t(prefixString('notificator', it.type))}
                label={t('notificationNotificators')}
              />
              {item.notificators?.includes('command') && (
                <SelectField
                  value={item.commandId}
                  onChange={(e) => setItem({ ...item, commandId: Number(e.target.value) })}
                  endpoint="/api/commands"
                  titleGetter={(it) => it.description}
                  label={t('sharedSavedCommand')}
                />
              )}
              {features.disableSms && (
                <Typography variant="body2" color="secondary" >
                  SMS paketiniz Mevcut değil.
                </Typography>
              )}
              {smsLimit >= 0 && !features.disableSms && (
                <Typography className={classes.smsLimit} variant="body2"  color="primary" style={{ fontStyle: 'italic' }}>
                  {t('notificatorSms')} {t('userUserLimit')} :{smsLimit ? smsLimit : 0 }
                </Typography>
              )}
              <Button
                variant="outlined"
                color="primary"
                onClick={testNotificators}
                disabled={!item.notificators}
              >
                {t('sharedTestNotificators')}
              </Button>
              <FormGroup>
                <FormControlLabel
                  control={(
                    <Checkbox
                      checked={item.always}
                      onChange={(e) => setItem({ ...item, always: e.target.checked })}
                    />
                    )}
                  label={t('notificationAlways')}
                />
              </FormGroup>
            </AccordionDetails>
          </Accordion>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle1">
                {t('sharedExtra')}
              </Typography>
            </AccordionSummary>
            <AccordionDetails className={classes.details}>
              <TextField
                value={item.description || ''}
                onChange={(e) => setItem({ ...item, description: e.target.value })}
                label={t('sharedDescription')}
              />
              <SelectField
                value={item.calendarId}
                onChange={(e) => setItem({ ...item, calendarId: Number(e.target.value) })}
                endpoint="/api/calendars"
                label={t('sharedCalendar')}
              />
            </AccordionDetails>
          </Accordion>
        </>
      )}
    </EditItemView>
  );
};

export default NotificationPage;
