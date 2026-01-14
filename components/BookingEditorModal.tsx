import React, { useState } from 'react';
import { Booking, BookingStatus, Room } from '../types';
import { Button } from './ui/Button';

interface BookingEditorModalProps {
  booking: Booking;
  rooms: Room[];
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
  isLoading: boolean;
}

export const BookingEditorModal: React.FC<BookingEditorModalProps> = ({ booking, rooms, onClose, onSave, isLoading }) => {
  const [roomId, setRoomId] = useState(booking.roomId);
  const [date, setDate] = useState(booking.date);
  const [time, setTime] = useState(booking.time);
  const [duration, setDuration] = useState(booking.durationHours);
  const [status, setStatus] = useState<BookingStatus>(booking.status);
  const [purpose, setPurpose] = useState(booking.purpose);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedRoom = rooms.find(r => r.id === roomId);
    
    // Safety check: if room doesn't exist (e.g. deleted), use existing name or placeholder
    const roomName = selectedRoom ? selectedRoom.name : booking.roomName;

    onSave({
      ...booking,
      roomId,
      roomName,
      date,
      time,
      durationHours: duration,
      status,
      purpose
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm p-0 md:p-4">
      <div className="bg-white w-full md:max-w-lg rounded-t-2xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-gray-800 p-4 text-white flex justify-between items-center">
          <h3 className="font-bold text-lg">Modificar Reserva</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none font-bold"
              value={status}
              onChange={(e) => setStatus(e.target.value as BookingStatus)}
            >
              <option value={BookingStatus.PENDING}>Pendiente</option>
              <option value={BookingStatus.APPROVED}>Aprobada</option>
              <option value={BookingStatus.REJECTED}>Rechazada</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cambiar Salón</label>
            <select 
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            >
              {rooms.map(r => (
                <option key={r.id} value={r.id}>{r.name} (Cap: {r.capacity})</option>
              ))}
              {/* Fallback option if current room ID is not in the list (deleted room) */}
              {!rooms.find(r => r.id === roomId) && (
                <option value={roomId} disabled>Salón Eliminado o No Disponible</option>
              )}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha</label>
              <input 
                type="date" 
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora</label>
              <input 
                type="time" 
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
          </div>

          <div>
             <label className="block text-sm font-medium text-gray-700 mb-1">Duración (Horas)</label>
             <input 
                type="number"
                min="1"
                max="12"
                required
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
             />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea 
              required
              rows={2}
              className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <Button type="button" variant="secondary" onClick={onClose} fullWidth>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" fullWidth isLoading={isLoading}>
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};