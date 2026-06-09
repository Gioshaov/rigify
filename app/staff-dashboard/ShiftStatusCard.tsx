"use client";

import { useState } from "react";

export function ShiftStatusCard() {
  const [isOnShift, setIsOnShift] = useState(true);

  const handleToggleShift = () => {
    setIsOnShift(!isOnShift);
    console.log(isOnShift ? "Ending shift" : "Starting shift");
  };

  return (
    <div className="w-72 flex-shrink-0">
      <div className="bg-zinc-900 border border-zinc-700 rounded-sm p-5 h-full flex flex-col">
        <p className="text-amber-400 uppercase tracking-widest text-[10px] mb-3">
          SHIFT STATUS
        </p>

        {isOnShift ? (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white font-bold text-xl">ON SHIFT</p>
            </div>
            <p className="text-zinc-400 text-sm font-mono mt-1">Until 8:00 PM</p>
            <hr className="border-zinc-700 my-4" />
            <p className="text-zinc-500 uppercase tracking-widest text-[10px]">TODAY</p>
            <p className="text-white font-mono text-sm mt-1">10:00 AM — 8:00 PM</p>
            <button
              data-testid="end-shift-btn"
              onClick={handleToggleShift}
              className="border border-red-900 text-red-400 text-xs uppercase tracking-widest px-3 py-1.5 hover:bg-red-900/20 transition-colors w-full mt-auto"
            >
              END SHIFT
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-zinc-600" />
              <p className="text-zinc-400 font-bold text-xl">OFF SHIFT</p>
            </div>
            <p className="text-zinc-500 text-sm font-mono mt-1">Not currently working</p>
            <hr className="border-zinc-700 my-4" />
            <p className="text-zinc-500 uppercase tracking-widest text-[10px]">TODAY</p>
            <p className="text-zinc-400 font-mono text-sm mt-1">10:00 AM — 8:00 PM</p>
            <button
              data-testid="start-shift-btn"
              onClick={handleToggleShift}
              className="border border-green-900 text-green-400 text-xs uppercase tracking-widest px-3 py-1.5 hover:bg-green-900/20 transition-colors w-full mt-auto"
            >
              START SHIFT
            </button>
          </>
        )}
      </div>
    </div>
  );
}
