import React, { useEffect, useState } from 'react';
import { BsDisplay, BsPlusCircle } from 'react-icons/bs';
import { IoIosSwitch } from 'react-icons/io';
import { MdDelete, MdSettings } from 'react-icons/md';
import { toast } from 'react-toastify';
import {
  addDevice,
  assignDeviceToRoom,
  getDevicesByAdminId,
  removeDevice,
  updateDeviceStatus
} from '../firebaseServices';

const DeviceManagement = ({ adminId }) => {
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);
  const [newDeviceData, setNewDeviceData] = useState({
    name: '',
    type: 'light',
    roomId: '',
    status: 'off'
  });
  
  const [roomFilter, setRoomFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [rooms, setRooms] = useState([
    { id: 'living-room', name: 'Living Room' },
    { id: 'kitchen', name: 'Kitchen' },
    { id: 'bedroom', name: 'Bedroom' },
    { id: 'bathroom', name: 'Bathroom' },
    { id: 'garage', name: 'Garage' }
  ]);

  useEffect(() => {
    fetchDevices();
  }, [adminId]);

  const fetchDevices = async () => {
    try {
      setIsLoading(true);
      const deviceData = await getDevicesByAdminId(adminId);
      setDevices(deviceData);
    } catch (error) {
      console.error("Error fetching devices:", error);
      toast.error("Failed to load device data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDevice = async (e) => {
    e.preventDefault();
    try {
      const deviceData = {
        ...newDeviceData,
        adminId,
        lastUpdated: new Date()
      };
      
      await addDevice(deviceData);
      toast.success("Device added successfully");
      setShowAddDeviceForm(false);
      setNewDeviceData({
        name: '',
        type: 'light',
        roomId: '',
        status: 'off'
      });
      fetchDevices();
    } catch (error) {
      console.error("Error adding device:", error);
      toast.error("Failed to add device");
    }
  };

  const handleToggleDevice = async (deviceId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'on' ? 'off' : 'on';
      await updateDeviceStatus(deviceId, newStatus);
      toast.success(`Device ${newStatus === 'on' ? 'turned on' : 'turned off'}`);
      
      // Update local state to reflect change immediately
      setDevices(devices.map(device => {
        if (device.id === deviceId) {
          return { ...device, status: newStatus };
        }
        return device;
      }));
      
    } catch (error) {
      console.error("Error toggling device:", error);
      toast.error("Failed to update device status");
    }
  };

  const handleAssignRoom = async (deviceId, roomId) => {
    try {
      await assignDeviceToRoom(deviceId, roomId);
      toast.success("Device assigned to room");
      
      // Update local state
      setDevices(devices.map(device => {
        if (device.id === deviceId) {
          return { ...device, roomId };
        }
        return device;
      }));
      
    } catch (error) {
      console.error("Error assigning device to room:", error);
      toast.error("Failed to assign device to room");
    }
  };

  const handleRemoveDevice = async (deviceId) => {
    if (window.confirm("Are you sure you want to remove this device?")) {
      try {
        await removeDevice(deviceId);
        toast.success("Device removed successfully");
        fetchDevices();
      } catch (error) {
        console.error("Error removing device:", error);
        toast.error("Failed to remove device");
      }
    }
  };

  const filteredDevices = devices.filter(device => {
    return (roomFilter === 'all' || device.roomId === roomFilter) &&
           (typeFilter === 'all' || device.type === typeFilter) &&
           (statusFilter === 'all' || device.status === statusFilter);
  });

  return (
    <div className="dashboard-section">
      <h2 className="section-title">Device Management</h2>
      <div className="device-controls">
        <button className="control-btn" onClick={() => setShowAddDeviceForm(!showAddDeviceForm)}>
          <BsPlusCircle className="btn-icon" /> Add Device
        </button>
        <div className="device-filters">
          <select 
            className="device-filter"
            value={roomFilter}
            onChange={(e) => setRoomFilter(e.target.value)}
          >
            <option value="all">All Rooms</option>
            {rooms.map(room => (
              <option key={room.id} value={room.id}>{room.name}</option>
            ))}
          </select>
          <select 
            className="device-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="light">Lights</option>
            <option value="thermostat">Thermostats</option>
            <option value="lock">Locks</option>
            <option value="camera">Cameras</option>
            <option value="climate">Climate</option>
            <option value="door">Doors</option>
          </select>
          <select 
            className="device-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="on">Online</option>
            <option value="off">Offline</option>
          </select>
        </div>
      </div>
      
      {showAddDeviceForm && (
        <div className="add-device-form">
          <h3>Add New Device</h3>
          <form onSubmit={handleAddDevice}>
            <div className="form-group">
              <label>Device Name</label>
              <input 
                type="text" 
                value={newDeviceData.name} 
                onChange={(e) => setNewDeviceData({...newDeviceData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Device Type</label>
              <select 
                value={newDeviceData.type} 
                onChange={(e) => setNewDeviceData({...newDeviceData, type: e.target.value})} 
              >
                <option value="light">Light</option>
                <option value="thermostat">Thermostat</option>
                <option value="lock">Lock</option>
                <option value="camera">Camera</option>
                <option value="climate">Climate</option>
                <option value="door">Door</option>
              </select>
            </div>
            <div className="form-group">
              <label>Room</label>
              <select 
                value={newDeviceData.roomId} 
                onChange={(e) => setNewDeviceData({...newDeviceData, roomId: e.target.value})} 
              >
                <option value="">Select a room</option>
                {rooms.map(room => (
                  <option key={room.id} value={room.id}>{room.name}</option>
                ))}
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Device</button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddDeviceForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading-data">Loading device data...</div>
      ) : (
        <div className="devices-grid">
          {filteredDevices.length > 0 ? (
            filteredDevices.map(device => (
              <div key={device.id} className="device-card">
                <div className="device-header">
                  <h3 className="device-name">{device.name}</h3>
                  <span className={`device-status-indicator ${device.status === 'on' ? 'online' : 'offline'}`}></span>
                </div>
                <div className="device-body">
                  <p className="device-type">Type: {device.type}</p>
                  <p className="device-room">
                    Room: 
                    <select 
                      value={device.roomId || ''}
                      onChange={(e) => handleAssignRoom(device.id, e.target.value)}
                    >
                      <option value="">Not assigned</option>
                      {rooms.map(room => (
                        <option key={room.id} value={room.id}>{room.name}</option>
                      ))}
                    </select>
                  </p>
                  {device.value && <p className="device-value">Value: {device.value}</p>}
                  <p className="device-last-seen">
                    Last active: {device.lastUpdated ? new Date(device.lastUpdated.toDate()).toLocaleString() : 'Never'}
                  </p>
                </div>
                <div className="device-actions">
                  <button 
                    className={`device-toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
                    onClick={() => handleToggleDevice(device.id, device.status)}
                  >
                    <IoIosSwitch className="toggle-icon" />
                    {device.status === 'on' ? 'Turn Off' : 'Turn On'}
                  </button>
                  <div className="device-action-buttons">
                    <button className="device-settings-btn">
                      <MdSettings className="settings-icon" />
                    </button>
                    <button className="device-delete-btn" onClick={() => handleRemoveDevice(device.id)}>
                      <MdDelete className="delete-icon" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-devices">
              <BsDisplay className="no-device-icon" />
              <p>No devices found with the selected filters.</p>
              <button className="add-device-btn" onClick={() => setShowAddDeviceForm(true)}>Add your first device</button>
            </div>
          )}
        </div>
      )}
      
      <div className="device-management-groups">
        <h3>Device Groups</h3>
        <div className="device-groups-grid">
          <div className="device-group-card">
            <h4>Living Room</h4>
            <p>5 devices</p>
            <div className="group-actions">
              <button className="group-action-btn on">All On</button>
              <button className="group-action-btn off">All Off</button>
            </div>
          </div>
          <div className="device-group-card">
            <h4>Bedroom</h4>
            <p>3 devices</p>
            <div className="group-actions">
              <button className="group-action-btn on">All On</button>
              <button className="group-action-btn off">All Off</button>
            </div>
          </div>
          <div className="device-group-card add">
            <h4>Create New Group</h4>
            <button className="add-group-btn">
              <BsPlusCircle className="add-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeviceManagement;