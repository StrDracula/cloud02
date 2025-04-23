import React, { useEffect, useState } from 'react';
import { auth } from './firebase';
import { addSimulation, getSimulationsByAdminId, updateSimulationStatus } from './firebaseServices';

const SimulationTesting = () => {
  const [simulations, setSimulations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newSimulation, setNewSimulation] = useState({
    name: '',
    type: 'fire', // Default type
    description: '',
    scheduledDate: '',
    scheduledTime: '',
    affectedDevices: [],
    notifyUsers: true,
  });
  const [devices, setDevices] = useState([]);
  const [selectedDevices, setSelectedDevices] = useState([]);

  // Sample devices - in a real app, you would fetch these from Firestore
  useEffect(() => {
    setDevices([
      { id: 'device1', name: 'Smoke Detector - Living Room' },
      { id: 'device2', name: 'Smoke Detector - Kitchen' },
      { id: 'device3', name: 'Gas Sensor - Kitchen' },
      { id: 'device4', name: 'Motion Sensor - Front Door' },
      { id: 'device5', name: 'Smart Lock - Main Entrance' },
    ]);
  }, []);

  // Fetch all simulations for the current admin
  useEffect(() => {
    const fetchSimulations = async () => {
      try {
        setLoading(true);
        const user = auth.currentUser;
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        const adminId = user.uid;
        const simulationsData = await getSimulationsByAdminId(adminId);
        setSimulations(simulationsData);
      } catch (err) {
        console.error('Error fetching simulations:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSimulations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewSimulation(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDeviceSelection = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedDevices(selectedOptions);
    setNewSimulation(prev => ({
      ...prev,
      affectedDevices: selectedOptions
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Format date and time for storage
      const scheduledDateTime = new Date(`${newSimulation.scheduledDate}T${newSimulation.scheduledTime}`);
      
      const simulationData = {
        adminId: user.uid,
        name: newSimulation.name,
        type: newSimulation.type,
        description: newSimulation.description,
        scheduledAt: scheduledDateTime,
        affectedDevices: newSimulation.affectedDevices,
        notifyUsers: newSimulation.notifyUsers,
      };

      await addSimulation(simulationData);
      
      // Refresh simulations list
      const updatedSimulations = await getSimulationsByAdminId(user.uid);
      setSimulations(updatedSimulations);
      
      // Reset form
      setNewSimulation({
        name: '',
        type: 'fire',
        description: '',
        scheduledDate: '',
        scheduledTime: '',
        affectedDevices: [],
        notifyUsers: true,
      });
      setSelectedDevices([]);
      
    } catch (err) {
      console.error('Error adding simulation:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (simulationId, newStatus) => {
    try {
      setLoading(true);
      await updateSimulationStatus(simulationId, newStatus);
      
      // Update local state
      setSimulations(prevSimulations => 
        prevSimulations.map(sim => 
          sim.id === simulationId ? { ...sim, status: newStatus } : sim
        )
      );
    } catch (err) {
      console.error('Error updating simulation status:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in-progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const runSimulation = async (simulationId) => {
    await handleStatusUpdate(simulationId, 'in-progress');
    
    // Here you would implement the actual simulation logic
    // This might involve triggering events, sending notifications, etc.
    
    // For demo purposes, we'll just set a timeout to complete the simulation after 5 seconds
    setTimeout(async () => {
      await handleStatusUpdate(simulationId, 'completed');
    }, 5000);
  };

  if (loading && simulations.length === 0) {
    return <div className="flex justify-center items-center h-64"><div className="loader">Loading...</div></div>;
  }

  if (error) {
    return <div className="bg-red-100 text-red-700 p-4 rounded">Error: {error}</div>;
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-semibold mb-6">Simulation & Testing</h2>
      
      {/* Create New Simulation Form */}
      <div className="mb-8 bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Create New Simulation</h3>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Simulation Name</label>
              <input
                type="text"
                name="name"
                value={newSimulation.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                name="type"
                value={newSimulation.type}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="fire">Fire Alert</option>
                <option value="gas">Gas Leak</option>
                <option value="intruder">Intruder Alert</option>
                <option value="water">Water Leak</option>
                <option value="power">Power Failure</option>
              </select>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={newSimulation.description}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                rows="2"
              ></textarea>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Date</label>
              <input
                type="date"
                name="scheduledDate"
                value={newSimulation.scheduledDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
              <input
                type="time"
                name="scheduledTime"
                value={newSimulation.scheduledTime}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Affected Devices</label>
              <select
                multiple
                className="w-full p-2 border border-gray-300 rounded"
                onChange={handleDeviceSelection}
                value={selectedDevices}
              >
                {devices.map(device => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple devices</p>
            </div>
            
            <div className="col-span-1 md:col-span-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="notifyUsers"
                  checked={newSimulation.notifyUsers}
                  onChange={(e) => setNewSimulation(prev => ({
                    ...prev,
                    notifyUsers: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Send notifications to users during simulation</span>
              </label>
            </div>
          </div>
          
          <div className="mt-4">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Simulation'}
            </button>
          </div>
        </form>
      </div>
      
      {/* Simulations List */}
      <div>
        <h3 className="text-lg font-medium mb-4">Scheduled Simulations</h3>
        
        {simulations.length === 0 ? (
          <p className="text-gray-500">No simulations have been scheduled yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Scheduled Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {simulations.map((simulation) => (
                  <tr key={simulation.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{simulation.name}</div>
                      <div className="text-sm text-gray-500">{simulation.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap capitalize">{simulation.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {simulation.scheduledAt?.toDate ? (
                        simulation.scheduledAt.toDate().toLocaleString()
                      ) : (
                        "Date not available"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(simulation.status)}`}>
                        {simulation.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {simulation.status === 'scheduled' && (
                        <>
                          <button
                            onClick={() => runSimulation(simulation.id)}
                            className="text-blue-600 hover:text-blue-900 mr-3"
                          >
                            Run Now
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(simulation.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {simulation.status === 'in-progress' && (
                        <span className="text-yellow-600">Simulation in progress...</span>
                      )}
                      {simulation.status === 'completed' && (
                        <button
                          onClick={() => {
                            // Here you would implement viewing the results
                            alert('Viewing simulation results (to be implemented)');
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          View Results
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SimulationTesting;