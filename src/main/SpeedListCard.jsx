import React from 'react';
import { Table, TableContainer, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';

const SpeedListCard = ({ deviceDetails, eventsSpeed }) => {
  // deviceOverspeed tipindeki olayları filtrele
  const overspeedEvents = eventsSpeed.filter(eventsSpeed => eventsSpeed.type === 'deviceOverspeed');

  // Her aracın deviceOverspeed olaylarının sayısını hesapla
  const overspeedEventsCountMap = {};
  overspeedEvents.forEach(eventsSpeed => {
    if (!overspeedEventsCountMap[eventsSpeed.deviceId]) {
      overspeedEventsCountMap[eventsSpeed.deviceId] = 1; // İlk deviceOverspeed olayını bulduğumuzda sayaç 1 olacak
    } else {
      overspeedEventsCountMap[eventsSpeed.deviceId]++; // Her bir sonraki deviceOverspeed olayı için sayaç artacak
    }
  });

  // En fazla olay sayısına sahip ilk 5 aracı bul
  const sortedDevices = Object.entries(overspeedEventsCountMap)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 5);
  
  // Veriyi grafik olarak hazırla
  const data = sortedDevices.map(([deviceId, ihlal]) => {
    const device = deviceDetails.find(device => device.id === parseInt(deviceId));
    const deviceName = device ? device.name : deviceId;
    return { deviceName, ihlal };
  });
  // Veri yoksa boş grafik göstermek için bir koşul oluştur
  if (data.length === 0) {
    return (
      <div style={{   color: '#26aeb5', textAlign: 'center', marginTop: '20px' }}>
        <ThumbUpOffAltIcon style={{ color: '#26aeb5', fontSize: 75 }} />
        <p>Mevcut Değil</p>
      </div>
    );
  }
  return (
    <div>
      <div style={{ marginTop: '20px' }}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="1 1" />
            <XAxis type="number" />
            <YAxis dataKey="deviceName" type="category" angle={-45} textAnchor="end" interval={0} tick={{ fontSize: 12 }} />
            <Tooltip label="İhlal Sayısı" />
            <Bar dataKey="ihlal" fill="#26aeb5" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/*
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Plaka</TableCell>
              <TableCell>İhlal Sayısı</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDevices.map(([deviceId, count]) => {
              const device = deviceDetails.find(device => device.id === parseInt(deviceId));
              const deviceName = device ? device.name : deviceId;
              return (
                <TableRow key={deviceId}>
                  <TableCell>{deviceName}</TableCell>
                  <TableCell>{count}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      */}
    </div>
  );
};

export default SpeedListCard;
