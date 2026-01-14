import React, { useEffect, useState } from 'react';
import { Booking, Room, User } from '../types';
import { StorageService } from '../services/storage';
import { BookingModal } from './BookingModal';
import { Button } from './ui/Button';
import { StatusBadge } from './ui/StatusBadge';

interface UserDashboardProps {
  currentUser: User;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ currentUser }) => {
  const [view, setView] = useState<'ROOMS' | 'MY_BOOKINGS'>('ROOMS');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    StorageService.getRooms().then(setRooms);
    loadBookings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser.id]);

  const loadBookings = async () => {
    const data = await StorageService.getBookings();
    setAllBookings(data);
  };

  const myBookings = allBookings.filter(b => b.userId === currentUser.id);

  const handleBookingSubmit = async (date: string, time: string, duration: number, purpose: string) => {
    if (!selectedRoom) return;

    setIsLoading(true);
    await StorageService.createBooking({
      roomId: selectedRoom.id,
      roomName: selectedRoom.name,
      userId: currentUser.id,
      userName: currentUser.name,
      date,
      time,
      durationHours: duration,
      purpose
    });
    
    setIsLoading(false);
    setSelectedRoom(null);
    setView('MY_BOOKINGS'); // Switch to bookings view to show status
    loadBookings(); // Refresh list to show new pending booking
    alert('Solicitud enviada con éxito. Espera la aprobación del administrador.');
  };

  return (
    <div className="pb-24 max-w-5xl mx-auto">
      {/* Tab Switcher */}
      <div className="flex bg-white p-1 rounded-xl shadow-sm border border-gray-100 mb-6 mx-auto w-full max-w-md">
        <button 
          onClick={() => setView('ROOMS')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'ROOMS' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <i className="fas fa-door-open mr-2"></i> Salones
        </button>
        <button 
          onClick={() => setView('MY_BOOKINGS')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${view === 'MY_BOOKINGS' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
        >
          <i className="fas fa-list-alt mr-2"></i> Mis Reservas
        </button>
      </div>

      {view === 'ROOMS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map(room => (
            <div key={room.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col transition hover:shadow-lg hover:translate-y-[-2px]">
              <div className="h-40 bg-gray-200 relative">
                 <img src={room.imageUrl} alt={room.name} className="w-full h-full object-cover" />
                 <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                   Cap: {room.capacity}
                 </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-bold text-lg text-gray-800 mb-1">{room.name}</h3>
                <div className="flex flex-wrap gap-1 mb-4">
                  {room.features.map(f => (
                    <span key={f} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full border border-gray-200">
                      {f}
                    </span>
                  ))}
                </div>
                <div className="mt-auto">
                  <Button variant="primary" fullWidth onClick={() => setSelectedRoom(room)}>
                    Reservar
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {view === 'MY_BOOKINGS' && (
        <div className="space-y-4">
          {myBookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-calendar-times text-2xl text-blue-400"></i>
              </div>
              <h3 className="text-gray-900 font-medium">Sin reservas aún</h3>
              <p className="text-gray-500 text-sm mt-1">Explora los salones y haz tu primera solicitud.</p>
              <button onClick={() => setView('ROOMS')} className="mt-4 text-blue-600 font-medium text-sm hover:underline">
                Ir a Salones
              </button>
            </div>
          ) : (
            myBookings.map(booking => (
              <div key={booking.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-gray-800">{booking.roomName}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      <i className="fas fa-calendar mr-1"></i> {booking.date} &bull; {booking.time}
                    </p>
                  </div>
                  <StatusBadge status={booking.status} />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
                   Motivo: <span className="italic">{booking.purpose}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedRoom && (
        <BookingModal 
          room={selectedRoom}
          existingBookings={allBookings}
          onClose={() => setSelectedRoom(null)} 
          onSubmit={handleBookingSubmit}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};