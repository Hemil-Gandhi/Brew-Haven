import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { Plus, X, Table as TableIcon, Layers } from 'lucide-react';

const Tables = () => {
  const { tables, floors, fetchTables, fetchFloors, createTable, updateTable } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  
  const [formData, setFormData] = useState({
    number: '',
    floorId: '',
    seats: 2,
    isActive: true,
    appointmentResource: ''
  });

  useEffect(() => {
    fetchTables();
    fetchFloors();
  }, [fetchTables, fetchFloors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTable) {
      await updateTable(editingTable._id, formData);
    } else {
      await createTable(formData);
    }
    setShowModal(false);
    setEditingTable(null);
    setFormData({ number: '', floorId: '', seats: 2, isActive: true, appointmentResource: '' });
  };

  const handleEdit = (table) => {
    setEditingTable(table);
    setFormData({ ...table, floorId: table.floorId._id || table.floorId });
    setShowModal(true);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Restaurant Tables</h3>
        <button 
          onClick={() => { setEditingTable(null); setShowModal(true); }}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Table</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tables.map((table) => (
          <div key={table._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${table.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                <TableIcon className="w-6 h-6" />
              </div>
              <button onClick={() => handleEdit(table)} className="text-xs font-bold text-primary hover:underline">Edit</button>
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Table {table.number}</h4>
              <p className="text-xs text-slate-500 flex items-center mt-1">
                <Layers className="w-3 h-3 mr-1" />
                {table.floorId?.name || 'Unknown Floor'} • {table.seats} Seats
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${table.isActive ? 'text-emerald-500' : 'text-slate-400'}`}>
                {table.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                ID: {table._id.slice(-4)}
              </span>
            </div>
          </div>
        ))}
        {tables.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <TableIcon className="w-10 h-10 mb-2 opacity-20" />
            <p>No tables configured yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{editingTable ? 'Edit Table' : 'Add New Table'}</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Table Number</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. 1, 10, VIP-1"
                  value={formData.number}
                  onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor</label>
                <select
                  required
                  className="input-field"
                  value={formData.floorId}
                  onChange={(e) => setFormData({ ...formData, floorId: e.target.value })}
                >
                  <option value="">Select Floor</option>
                  {floors.map(f => (
                    <option key={f._id} value={f._id}>{f.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Seat Count</label>
                <input
                  type="number"
                  required
                  className="input-field"
                  value={formData.seats}
                  onChange={(e) => setFormData({ ...formData, seats: parseInt(e.target.value) })}
                />
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  className="w-4 h-4 text-primary rounded border-slate-300 focus:ring-primary"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                />
                <label htmlFor="isActive" className="text-sm font-medium text-slate-700">Active and available for orders</label>
              </div>
              
              <div className="pt-4 flex space-x-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-8">
                  {editingTable ? 'Save Changes' : 'Create Table'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tables;
