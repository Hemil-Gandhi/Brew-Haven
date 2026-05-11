import React, { useState, useEffect } from 'react';
import useAppStore from '../../store/useAppStore';
import { Plus, X, Layers, Save } from 'lucide-react';

const Floors = () => {
  const { floors, fetchFloors, createFloor } = useAppStore();
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');

  useEffect(() => {
    fetchFloors();
  }, [fetchFloors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createFloor({ name });
    setName('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Restaurant Floors</h3>
        <button 
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Floor</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {floors.map((floor) => (
          <div key={floor._id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center text-primary">
              <Layers className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-slate-800">{floor.name}</h4>
              <p className="text-xs text-slate-500">Created {new Date(floor.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        ))}
        {floors.length === 0 && (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-2xl">
            <Layers className="w-10 h-10 mb-2 opacity-20" />
            <p>No floors created yet.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Add New Floor</h3>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-50 rounded-full">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Floor Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Ground Floor, Rooftop"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="pt-4 flex space-x-3 justify-end">
                <button type="button" onClick={() => setShowModal(false)} className="px-6 py-2 rounded-lg font-medium border border-slate-200 hover:bg-slate-50">
                  Cancel
                </button>
                <button type="submit" className="btn-primary px-8">
                  Create Floor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Floors;
