import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Typography } from '@mui/material';
import { useTranslation } from '../common/components/LocalizationProvider';

const AlertListCard = ({ deviceDetails }) => {
  const [alertDevices, setAlertDevices] = useState([]);
  const [smsWarning, setSmsWarning] = useState(null);
  const user = useSelector((state) => state.session.user);
  const attributes = user.attributes;
  const smsLimit = attributes.smsLimit;
  const disableSms = attributes.ui?.disableSms;
  const t = useTranslation();


  useEffect(() => {
    const now = new Date();
    const filterTwoMounthLater = new Date(now.setMonth(now.getMonth() + 1));
    const filterLastYear = new Date(now.setMonth(now.getMonth() - 12 ));

    // Filtreleme işlemi
    const filteredDevices = deviceDetails.filter(device => {
      const expirationTime = device.expirationTime;
      
      const expirationDate = new Date(expirationTime);
      return expirationDate >= filterLastYear && expirationDate <= filterTwoMounthLater;
    });

    setAlertDevices(filteredDevices);

    // SMS uyarısını kontrol et
    if (!disableSms && smsLimit < 500) {
      setSmsWarning(`SMS limitiniz azalmış! Kalan: ${smsLimit}`);
    } else {
      setSmsWarning(null);
    }
  }, [deviceDetails, smsLimit, disableSms]);

  return (
    <div>
      {smsWarning && (
        <Typography variant="body2" color="error">
          {smsWarning}
        </Typography>
      )}
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("sharedDevice")}</TableCell>
              <TableCell>{t("userExpirationTime")}</TableCell>
              <TableCell>{t("sharedDescription")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alertDevices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={2}>Uyarı gerektiren araç bulunmuyor.</TableCell>
              </TableRow>
            ) : (
              alertDevices.map(device => (
                <TableRow key={device.id}>
                  <TableCell>{device.name}</TableCell>
                  <TableCell>{new Date(device.expirationTime).toLocaleDateString()}</TableCell>
                  <TableCell style={{ color: new Date(device.expirationTime) < new Date() ? 'red' : 'inherit' }}>
                    {device.expirationTime && new Date(device.expirationTime) < new Date() 
                      ? t("paketAlertgecmis")  // Eğer expirationTime geçmişse
                      : t("paketAlert")        // Eğer expirationTime geçmemişse
                    }
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default AlertListCard;
