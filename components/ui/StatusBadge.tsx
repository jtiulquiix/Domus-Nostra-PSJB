import React from 'react';
import { BookingStatus } from '../../types';

export const StatusBadge: React.FC<{ status: BookingStatus }> = ({ status }) => {
  const styles = {
    [BookingStatus.PENDING]: "bg-yellow-100 text-yellow-800 border border-yellow-200",
    [BookingStatus.APPROVED]: "bg-emerald-100 text-emerald-800 border border-emerald-200",
    [BookingStatus.REJECTED]: "bg-red-100 text-red-800 border border-red-200"
  };

  const labels = {
    [BookingStatus.PENDING]: "Pendiente",
    [BookingStatus.APPROVED]: "Aprobada",
    [BookingStatus.REJECTED]: "Rechazada"
  };

  const icons = {
    [BookingStatus.PENDING]: "fa-clock",
    [BookingStatus.APPROVED]: "fa-check-circle",
    [BookingStatus.REJECTED]: "fa-times-circle"
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit ${styles[status]}`}>
      <i className={`fas ${icons[status]}`}></i>
      {labels[status]}
    </span>
  );
};