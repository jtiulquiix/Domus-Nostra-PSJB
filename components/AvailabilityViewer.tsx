import React from 'react';
import { Booking, BookingStatus } from '../types';

interface AvailabilityViewerProps {
  date: string;
  bookings: Booking[];
  roomId: string;
}

export const AvailabilityViewer: React.FC<AvailabilityViewerProps> = ({ date, bookings, roomId }) => {
  // Config: Hours of operation (8:00 AM to 10:00 PM)
  const startHour = 8;
  const endHour = 22;
  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Filter bookings for this room and date
  const dayBookings = bookings.filter(b => 
    b.roomId === roomId && 
    b.date === date && 
    b.status !== BookingStatus.REJECTED
  );

  const getHourStatus = (hour: number) => {
    const booking = dayBookings.find(b => {
      const bookingStart = parseInt(b.time.split(':')[0]);
      const bookingEnd = bookingStart + b.durationHours;
      return hour >= bookingStart && hour < bookingEnd;
    });

    if (!booking) return 'FREE';
    return booking.status;
  };

  const statusColors = {
    FREE: 'bg-emerald-100 border-emerald-200 text-emerald-700',
    [BookingStatus.PENDING]: 'bg-yellow-100 border-yellow-200 text-yellow-700',
    [BookingStatus.APPROVED]: 'bg-red-100 border-red-200 text-red-700',
    [BookingStatus.REJECTED]: 'bg-gray-100', // Should not happen due to filter
  };

  if (!date) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
      <h4 className="text-sm font-bold text-gray-700 mb-3 flex justify-between items-center">
        <span>Disponibilidad para el {date}</span>
      </h4>

      {/* Legend */}
      <div className="flex gap-3 mb-3 text-[10px] uppercase font-bold tracking-wider">
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-100 border border-emerald-200 rounded"></div> Libre</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-yellow-100 border border-yellow-200 rounded"></div> Pendiente</div>
        <div className="flex items-center gap-1"><div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div> Ocupado</div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
        {hours.map(hour => {
          const status = getHourStatus(hour);
          const timeLabel = `${hour}:00`;
          
          return (
            <div 
              key={hour} 
              className={`
                text-xs py-2 px-1 rounded border text-center font-medium transition-colors
                ${statusColors[status]}
              `}
            >
              {timeLabel}
            </div>
          );
        })}
      </div>
      
      {dayBookings.length > 0 && (
        <p className="text-xs text-gray-500 mt-3 text-center">
          * Hay {dayBookings.length} reserva(s) activa(s) este día.
        </p>
      )}
    </div>
  );
};