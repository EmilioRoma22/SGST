import { useState } from "react";
import { addMonths, subMonths, format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay } from "date-fns";
import { es } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function CalendarioTaller() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const eventos = [
    { date: new Date(2025, 9, 30), title: "Entrega de reparación - Laptop Dell" },
    { date: new Date(2025, 9, 31), title: "Revisión impresora Epson" },
    { date: new Date(2025, 10, 2), title: "Cita con proveedor" },
  ];

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const renderHeader = () => (
    <div className="flex justify-between items-center mb-6">
      <button
        onClick={prevMonth}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <ChevronLeft className="text-gray-600" />
      </button>
      <h2 className="text-xl font-bold text-gray-800">
        {format(currentMonth, "MMMM yyyy", { locale: es }).toUpperCase()}
      </h2>
      <button
        onClick={nextMonth}
        className="p-2 rounded-full hover:bg-gray-200 transition"
      >
        <ChevronRight className="text-gray-600" />
      </button>
    </div>
  );

  const renderDays = () => {
    const days = [];
    const startDate = startOfWeek(currentMonth, { locale: es });

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-gray-700 uppercase text-sm">
          {format(addDays(startDate, i), "EEE", { locale: es })}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { locale: es });
    const endDate = endOfWeek(monthEnd, { locale: es });

    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const formattedDate = format(day, "d");
        const isEvent = eventos.some(e => isSameDay(e.date, day));
        const cloneDay = day;

        days.push(
          <div
            key={day.toString()}
            onClick={() => setSelectedDate(cloneDay)}
            className={`cursor-pointer text-center py-3 rounded-xl mx-1 transition-all
              ${!isSameMonth(day, monthStart) ? "text-gray-300" : "text-gray-700"}
              ${isSameDay(day, selectedDate) ? "bg-emerald-100 text-emerald-700 font-semibold" : "hover:bg-gray-100"}
            `}
          >
            {formattedDate}
            {isEvent && <div className="w-2 h-2 bg-emerald-500 rounded-full mx-auto mt-1"></div>}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(<div className="grid grid-cols-7" key={day.toString()}>{days}</div>);
      days = [];
    }
    return <div>{rows}</div>;
  };

  const eventosDia = eventos.filter(e => isSameDay(e.date, selectedDate));

  return (
    <div className="space-y-8">
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        {renderHeader()}
        {renderDays()}
        {renderCells()}
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Actividades del {format(selectedDate, "d 'de' MMMM yyyy", { locale: es })}
        </h3>

        {eventosDia.length > 0 ? (
          <ul className="space-y-3">
            {eventosDia.map((ev, i) => (
              <li key={i} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-emerald-50 transition">
                <span className="text-gray-700">{ev.title}</span>
                <span className="text-sm text-emerald-600 font-medium">Pendiente</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500 text-sm">No hay actividades para este día.</p>
        )}
      </div>
    </div>
  );
}
