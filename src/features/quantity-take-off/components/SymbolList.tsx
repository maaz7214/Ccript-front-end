'use client';

import { useMemo } from 'react';

export interface SymbolListProps {
  symbolCounts: Record<string, number>;
  symbolColors: Record<string, string>;
  activeSymbol: string | null;
  onSymbolClick: (symbol: string) => void;
  totalSymbols?: number;
}

export default function SymbolList({
  symbolCounts,
  symbolColors,
  activeSymbol,
  onSymbolClick,
  totalSymbols,
}: SymbolListProps) {
  // Sort symbols by count (descending)
  const sortedSymbols = useMemo(() => {
    return Object.entries(symbolCounts)
      .sort((a, b) => b[1] - a[1]);
  }, [symbolCounts]);

  const calculatedTotal = useMemo(() => {
    return totalSymbols ?? sortedSymbols.reduce((sum, [, count]) => sum + count, 0);
  }, [sortedSymbols, totalSymbols]);

  if (sortedSymbols.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-2">
          <h3 className="text-sm font-semibold text-gray-700">Detected Symbols</h3>
        </div>
        <div className="p-4 text-center text-gray-500 text-sm">
          No symbols detected in this image
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Detected Symbols</h3>
        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
          {calculatedTotal} total
        </span>
      </div>
      
      {/* Symbol list */}
      <div className="overflow-auto flex-1 max-h-[250px]">
        <div className="p-2 space-y-1">
          {sortedSymbols.map(([symbol, count]) => {
            const color = symbolColors[symbol] || '#888';
            const isActive = activeSymbol === symbol;
            
            return (
              <button
                key={symbol}
                onClick={() => onSymbolClick(symbol)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#0D0D0D]/10 border border-[#0D0D0D]/30'
                    : 'hover:bg-gray-50 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className={`text-sm ${isActive ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                    {symbol.replace(/_/g, ' ')}
                  </span>
                </div>
                <span className={`text-sm font-semibold px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-[#0D0D0D] text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Color legend footer */}
      <div className="border-t border-gray-200 px-4 py-2 bg-gray-50">
        <div className="text-xs text-gray-500 mb-2">Color Legend</div>
        <div className="flex flex-wrap gap-1">
          {sortedSymbols.slice(0, 8).map(([symbol]) => {
            const color = symbolColors[symbol] || '#888';
            return (
              <div
                key={symbol}
                className="flex items-center gap-1 px-2 py-0.5 bg-white rounded text-xs border border-gray-100"
              >
                <div
                  className="w-2 h-2 rounded-sm"
                  style={{ backgroundColor: color }}
                />
                <span className="text-gray-600 truncate max-w-[60px]">{symbol.replace(/_/g, ' ')}</span>
              </div>
            );
          })}
          {sortedSymbols.length > 8 && (
            <div className="flex items-center px-2 py-0.5 text-xs text-gray-400">
              +{sortedSymbols.length - 8} more
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
