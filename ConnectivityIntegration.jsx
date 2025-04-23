import React, { useEffect, useState } from 'react';
import { auth } from '../firebase';
import {
  addIntegration,
  getIntegrationsByAdminId,
  removeIntegration,
  updateIntegrationStatus
} from '../firebaseServices';

const ConnectivityIntegration = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: 'voice_assistant',
    status: 'active',
    details: '',
    vendor: ''
  });

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      const adminId = auth.currentUser?.uid;
      if (!adminId) return;
      
      const integrationsData = await getIntegrationsByAdminId(adminId);
      setIntegrations(integrationsData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching integrations:", error);
      setLoading(false);
    }
  };

  const handleAddIntegration = async () => {
    try {
      const adminId = auth.currentUser?.uid;
      if (!adminId) return;
      
      await addIntegration({
        ...newIntegration,
        adminId
      });
      
      setShowAddModal(false);
      setNewIntegration({
        name: '',
        type: 'voice_assistant',
        status: 'active',
        details: '',
        vendor: ''
      });
      
      fetchIntegrations();
    } catch (error) {
      console.error("Error adding integration:", error);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateIntegrationStatus(id, newStatus);
      setIntegrations(integrations.map(integration => 
        integration.id === id ? { ...integration, status: newStatus } : integration
      ));
    } catch (error) {
      console.error("Error updating integration status:", error);
    }
  };

  const handleRemoveIntegration = async (id) => {
    try {
      await removeIntegration(id);
      setIntegrations(integrations.filter(integration => integration.id !== id));
    } catch (error) {
      console.error("Error removing integration:", error);
    }
  };

  const getIntegrationTypeIcon = (type) => {
    switch (type) {
      case 'voice_assistant':
        return <span className="material-icons">mic</span>;
      case 'smart_hub':
        return <span className="material-icons">router</span>;
      case 'automation':
        return <span className="material-icons">auto_fix_high</span>;
      case 'security':
        return <span className="material-icons">security</span>;
      default:
        return <span className="material-icons">device_hub</span>;
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'disabled':
        return 'bg-gray-100 text-gray-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const renderIntegrationCard = (integration) => {
    return (
      <div key={integration.id} className="bg-white rounded-lg shadow p-4 mb-4">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center">
            <div className="p-2 rounded-full bg-blue-100 mr-3">
              {getIntegrationTypeIcon(integration.type)}
            </div>
            <div>
              <h3 className="font-semibold text-lg">{integration.name}</h3>
              <p className="text-sm text-gray-600">{integration.vendor}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(integration.status)}`}>
            {integration.status}
          </div>
        </div>
        
        {integration.details && (
          <p className="text-gray-700 text-sm mb-4">{integration.details}</p>
        )}
        
        <div className="flex justify-between items-center mt-4">
          <div>
            <select
              className="border rounded p-2 text-sm"
              value={integration.status}
              onChange={(e) => handleStatusChange(integration.id, e.target.value)}
            >
              <option value="active">Active</option>
              <option value="disabled">Disabled</option>
              <option value="pending">Pending</option>
            </select>
          </div>
          <div className="flex">
            <button 
              className="text-blue-600 hover:text-blue-800 mr-3"
              onClick={() => {/* Open edit modal */}}
            >
              Edit
            </button>
            <button 
              className="text-red-600 hover:text-red-800"
              onClick={() => handleRemoveIntegration(integration.id)}
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Connectivity & Integration</h2>
        <button 
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={() => setShowAddModal(true)}
        >
          Add Integration
        </button>
      </div>
      
      {/* Integration Categories */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Voice Assistants</h3>
          <p className="text-sm text-gray-700">Connect Google Assistant, Alexa, or Siri</p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Smart Hubs</h3>
          <p className="text-sm text-gray-700">Connect Samsung SmartThings, Hubitat, etc.</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">Automations</h3>
          <p className="text-sm text-gray-700">Connect IFTTT, Node-RED, or custom webhooks</p>
        </div>
      </div>
      
      {/* Connectivity Status */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <h3 className="font-semibold mb-3">System Connectivity</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Internet: Online</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Cloud Services: Connected</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
            <span>Local Network: Stable</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
            <span>Firmware: Update Available</span>
          </div>
        </div>
      </div>
      
      {/* Integrations List */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h3 className="font-semibold mb-4">Active Integrations</h3>
        
        {loading ? (
          <div className="text-center py-8">
            <p>Loading integrations...</p>
          </div>
        ) : integrations.length > 0 ? (
          <div>
            {integrations.map(integration => renderIntegrationCard(integration))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow">
            <p className="text-gray-600">No integrations found</p>
            <button 
              className="mt-3 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              onClick={() => setShowAddModal(true)}
            >
              Add your first integration
            </button>
          </div>
        )}
      </div>
      
      {/* Add Integration Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Add New Integration</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Integration Name</label>
              <input 
                type="text" 
                className="w-full border rounded p-2"
                value={newIntegration.name}
                onChange={(e) => setNewIntegration({...newIntegration, name: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Integration Type</label>
              <select 
                className="w-full border rounded p-2"
                value={newIntegration.type}
                onChange={(e) => setNewIntegration({...newIntegration, type: e.target.value})}
              >
                <option value="voice_assistant">Voice Assistant</option>
                <option value="smart_hub">Smart Hub</option>
                <option value="automation">Automation Service</option>
                <option value="security">Security System</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Vendor/Service</label>
              <input 
                type="text" 
                className="w-full border rounded p-2"
                value={newIntegration.vendor}
                onChange={(e) => setNewIntegration({...newIntegration, vendor: e.target.value})}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Details (Optional)</label>
              <textarea 
                className="w-full border rounded p-2"
                rows="3"
                value={newIntegration.details}
                onChange={(e) => setNewIntegration({...newIntegration, details: e.target.value})}
              ></textarea>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button 
                className="px-4 py-2 border rounded hover:bg-gray-100"
                onClick={() => setShowAddModal(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                onClick={handleAddIntegration}
              >
                Add Integration
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConnectivityIntegration;