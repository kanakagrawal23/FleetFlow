import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight, 
  Download,
  Plus,
  ArrowUpDown,
  Truck,
  User,
  Calendar,
  Circle
} from 'lucide-react';

/**
 * TypeScript Interfaces
 */
export interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: any, row: T) => React.ReactNode;
}

interface DataTableProps<T> {
  title: string;
  data: T[];
  columns: Column<T>[];
  onAddClick?: () => void;
}

/**
 * Reusable Typed DataTable Component
 */
export const DataTable = <T extends Record<string, any>>({ 
  title, 
  data, 
  columns, 
  onAddClick 
}: DataTableProps<T>) => {
  const [searchTerm, setSearchTerm] = useState<string>('');

  return (
    <div className="w-full bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden">
      {/* Table Header */}
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 tracking-tight">{title}</h2>
          <p className="text-sm text-slate-500 mt-1">Manage and monitor your fleet activities.</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all w-full md:w-64"
            />
          </div>
          <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors" aria-label="Filter">
            <Filter className="w-4 h-4" />
          </button>
          <button 
            onClick={onAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all shadow-sm shadow-emerald-200"
          >
            <Plus className="w-4 h-4" />
            <span>Add New</span>
          </button>
        </div>
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50">
              {columns.map((col, idx) => (
                <th key={idx} className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <div className="flex items-center gap-2 cursor-pointer hover:text-slate-700 transition-colors">
                    {col.header}
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="group hover:bg-slate-50/80 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">
                    {col.render ? col.render(row[col.accessor], row) : String(row[col.accessor])}
                  </td>
                ))}
                <td className="px-6 py-4 text-right whitespace-nowrap">
                  <button className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-md transition-all">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-white">
        <p className="text-xs text-slate-500">
          Showing <span className="font-medium text-slate-700">1</span> to <span className="font-medium text-slate-700">{data.length}</span> of <span className="font-medium text-slate-700">{data.length}</span> results
        </p>
        <div className="flex items-center gap-2">
          <button className="p-2 text-slate-400 hover:text-slate-600 disabled:opacity-30" disabled>
            <ChevronLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 flex items-center justify-center text-sm font-medium bg-emerald-50 text-emerald-600 rounded-lg">1</button>
            <button className="w-8 h-8 flex items-center justify-center text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">2</button>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Example Usage with explicit Type definition
 */