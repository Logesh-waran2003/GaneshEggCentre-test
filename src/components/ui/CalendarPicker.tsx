import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "../../lib/utils";

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

function formatDate(ts: number) {
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

interface CalendarPickerProps {
  value: number; // start-of-day timestamp
  onChange: (ts: number) => void;
}

export function CalendarPicker({ value, onChange }: CalendarPickerProps) {
  const [open, setOpen] = useState(false);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selected = new Date(value);
  const [viewYear, setViewYear] = useState(selected.getFullYear());
  const [viewMonth, setViewMonth] = useState(selected.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  // Build grid: pad with prev/next month days
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrev = new Date(viewYear, viewMonth, 0).getDate();

  const cells: { day: number; month: "prev" | "cur" | "next" }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: daysInPrev - i, month: "prev" });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d, month: "cur" });
  const remaining = 42 - cells.length;
  for (let d = 1; d <= remaining; d++) cells.push({ day: d, month: "next" });

  const handleSelect = (cell: typeof cells[0]) => {
    let m = viewMonth, y = viewYear;
    if (cell.month === "prev") { m--; if (m < 0) { m = 11; y--; } }
    if (cell.month === "next") { m++; if (m > 11) { m = 0; y++; } }
    const d = new Date(y, m, cell.day);
    d.setHours(0, 0, 0, 0);
    onChange(d.getTime());
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-11 px-4 rounded-2xl border border-gray-200 bg-white text-sm font-medium text-gray-700 text-left flex items-center justify-between focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <span>{formatDate(value)}</span>
        <ChevronRight className={cn("size-4 text-gray-400 transition-transform", open && "rotate-90")} />
      </button>

      {open && (
        <div className="absolute top-13 left-0 right-0 z-50 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 mt-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <button type="button" onClick={prevMonth} className="p-1.5 rounded-xl hover:bg-gray-100">
              <ChevronLeft className="size-4 text-gray-600" />
            </button>
            <span className="text-sm font-bold text-gray-800">{MONTHS[viewMonth]} {viewYear}</span>
            <button type="button" onClick={nextMonth} className="p-1.5 rounded-xl hover:bg-gray-100">
              <ChevronRight className="size-4 text-gray-600" />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((cell, i) => {
              const cellDate = new Date(
                cell.month === "prev" ? (viewMonth === 0 ? viewYear - 1 : viewYear) : cell.month === "next" ? (viewMonth === 11 ? viewYear + 1 : viewYear) : viewYear,
                cell.month === "prev" ? (viewMonth === 0 ? 11 : viewMonth - 1) : cell.month === "next" ? (viewMonth === 11 ? 0 : viewMonth + 1) : viewMonth,
                cell.day
              );
              cellDate.setHours(0, 0, 0, 0);
              const isSelected = cellDate.getTime() === value;
              const isToday = cellDate.getTime() === today.getTime();
              const isOther = cell.month !== "cur";

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSelect(cell)}
                  className={cn(
                    "h-8 w-full rounded-xl text-xs font-medium transition-colors",
                    isSelected && "bg-indigo-600 text-white",
                    !isSelected && isToday && "ring-2 ring-indigo-400 text-indigo-700 font-bold",
                    !isSelected && !isToday && isOther && "text-gray-300",
                    !isSelected && !isToday && !isOther && "text-gray-700 hover:bg-indigo-50",
                  )}
                >
                  {cell.day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
