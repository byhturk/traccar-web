import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody, Grid } from '@mui/material';
import { useTranslation } from '../common/components/LocalizationProvider';

const EventListCard = ({ events, deviceDetails }) => {
  const [blinkingRows, setBlinkingRows] = useState(new Set());
  const t = useTranslation();
  const navigate = useNavigate();

  const handleEventClick = (eventId) => {
    navigate(`/event/${eventId}`);
  };

  const formatDateTime = dateTimeString => {
    const date = new Date(dateTimeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? '0' + minutes : minutes}`;
  };

  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinkingRows((prevBlinkingRows) => {
        const newBlinkingRows = new Set(prevBlinkingRows);
        // Son 1 dakika içindeki olayları filtrele
        const recentEvents = events.filter(event => {
          const eventTime = new Date(event.eventTime);
          const currentTime = new Date();
          return (currentTime - eventTime) <= 60000; // 1 dakika içinde olan olaylar
        });
        // Yanıp sönen satırları ayarla
        recentEvents.forEach(event => {
          if (newBlinkingRows.has(event.id)) {
            newBlinkingRows.delete(event.id); // Yanıp sönme süresi dolduğunda yanıp sönen satırı kaldır
          } else {
            newBlinkingRows.add(event.id); // Yanıp sönen satırı ekle
          }
        });
        return newBlinkingRows;
      });
    }, 1000); // 1 saniye aralıklı olarak yanıp sönmeyi başlat

    // 5 kez yanıp söndükten sonra yanıp sönmeyi durdur
    setTimeout(() => {
      clearInterval(blinkInterval);
    }, 5000);

    // Her güncelleme sonrasında interval'i temizle
    return () => clearInterval(blinkInterval);
  }, [events]);

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Saat</TableCell>
            <TableCell>Olay</TableCell>
            <TableCell>Plaka</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {events.map(event => (
            <TableRow key={event.id} onClick={() => handleEventClick(event.id)} style={{ backgroundColor: blinkingRows.has(event.id) ? 'lightgray' : 'inherit' }}>
              <TableCell>{formatDateTime(event.eventTime)}</TableCell>
              <TableCell>
                {event.type === 'alarm' ?
                  (event.attributes && event.attributes.alarm ?
                    t(`alarm${event.attributes.alarm.charAt(0).toUpperCase()}${event.attributes.alarm.slice(1)}`)
                    : t(`event${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`))
                  : t(`event${event.type.charAt(0).toUpperCase()}${event.type.slice(1)}`)}
              </TableCell>
              <TableCell>{deviceDetails.find(device => device.id === event.deviceId)?.name || event.deviceId}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default EventListCard;
