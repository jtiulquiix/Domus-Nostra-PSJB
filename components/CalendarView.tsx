import React, { useState } from 'react';
import { Booking, BookingStatus } from '../types';
import { Button } from './ui/Button';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface CalendarViewProps {
  bookings: Booking[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ bookings }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Helpers for Date Math
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  // Navigation
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Filter bookings for this month
  const getBookingsForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return bookings.filter(b => b.date === dateStr).sort((a, b) => a.time.localeCompare(b.time));
  };

  const getMonthBookings = () => {
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`;
    return bookings.filter(b => b.date.startsWith(prefix));
  };

  // Export Function (PDF)
  const exportToPDF = () => {
    const monthBookings = getMonthBookings();
    
    if (monthBookings.length === 0) {
      alert("No hay reservas para exportar en este mes.");
      return;
    }

    // Sort by date then time
    monthBookings.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });

    const doc = new jsPDF();

    // Title
    doc.setFontSize(18);
    doc.text(`Reporte de Reservas - ${monthNames[month]} ${year}`, 14, 20);
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 26);

    // Translation Map
    const statusMap = {
      [BookingStatus.APPROVED]: 'Aprobada',
      [BookingStatus.PENDING]: 'Pendiente',
      [BookingStatus.REJECTED]: 'Rechazada'
    };

    // Table Rows
    const tableData = monthBookings.map(b => [
      b.date,
      b.time,
      `${b.durationHours}h`,
      b.roomName,
      b.userName,
      statusMap[b.status] || b.status,
      b.purpose
    ]);

    // Generate Table
    autoTable(doc, {
      head: [['Fecha', 'Hora', 'Dur', 'Salón', 'Usuario', 'Estado', 'Motivo']],
      body: tableData,
      startY: 35,
      theme: 'grid',
      headStyles: { fillColor: [37, 99, 235] }, // Blue header
      styles: { fontSize: 8 },
      columnStyles: {
        0: { cellWidth: 20 }, // Fecha
        1: { cellWidth: 15 }, // Hora
        2: { cellWidth: 10 }, // Dur
        3: { cellWidth: 35 }, // Salón
        4: { cellWidth: 30 }, // Usuario
        5: { cellWidth: 20 }, // Estado
        6: { cellWidth: 'auto' } // Motivo (takes remaining space)
      }
    });

    // Save
    doc.save(`Reservas_${monthNames[month]}_${year}.pdf`);
  };

  // UI Helpers
  const statusColors = {
    [BookingStatus.APPROVED]: "bg-emerald-100 text-emerald-800 border-emerald-200",
    [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 border-yellow-200",
    [BookingStatus.REJECTED]: "bg-red-50 text-red-300 border-red-100 line-through opacity-60"
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[800px]">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between items-center gap-4 bg-gray-50">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 w-48 text-center md:text-left">
            {monthNames[month]} <span className="text-gray-400">{year}</span>
          </h2>
          <div className="flex bg-white rounded-lg border border-gray-300 shadow-sm">
            <button onClick={prevMonth} className="px-3 py-1 hover:bg-gray-100 border-r border-gray-300 rounded-l-lg"><i className="fas fa-chevron-left"></i></button>
            <button onClick={goToToday} className="px-3 py-1 hover:bg-gray-100 text-sm font-medium">Hoy</button>
            <button onClick={nextMonth} className="px-3 py-1 hover:bg-gray-100 border-l border-gray-300 rounded-r-lg"><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>
        
        <Button onClick={exportToPDF} variant="outline" className="text-sm">
          <i className="fas fa-file-pdf text-red-600"></i> Exportar PDF
        </Button>
      </div>

      {/* Grid Header */}
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-100">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
            {day}
          </div>
        ))}
      </div>

      {/* Grid Days */}
      <div className="grid grid-cols-7 flex-1 auto-rows-fr overflow-y-auto">
        {/* Empty cells for padding start of month */}
        {Array.from({ length: firstDay }).map((_, i) => (
          <div key={`empty-${i}`} className="bg-gray-50/50 border-b border-r border-gray-100 min-h-[100px]"></div>
        ))}

        {/* Day cells */}
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const dayBookings = getBookingsForDay(day);
          const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

          return (
            <div key={day} className={`border-b border-r border-gray-100 p-1 min-h-[100px] flex flex-col group hover:bg-blue-50/30 transition ${isToday ? 'bg-blue-50/50' : ''}`}>
              <div className="flex justify-between items-start px-1">
                <span className={`text-sm font-bold w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-700'}`}>
                  {day}
                </span>
                <span className="text-[10px] text-gray-400 font-medium opacity-0 group-hover:opacity-100">{dayBookings.length} reservas</span>
              </div>
              
              <div className="mt-1 space-y-1 overflow-y-auto max-h-[100px] no-scrollbar flex-1">
                {dayBookings.map(booking => (
                  <div 
                    key={booking.id}
                    className={`text-[10px] p-1 rounded border truncate cursor-help transition hover:scale-[1.02] ${statusColors[booking.status]}`}
                    title={`${booking.time} - ${booking.roomName}\nUsuario: ${booking.userName}\nMotivo: ${booking.purpose}`}
                  >
                    <span className="font-bold mr-1">{booking.time}</span>
                    {booking.roomName}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};