import React, { useEffect, useState } from 'react';
import { FaBell, FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { addAlert, getAlertsByAdminId, updateAlertStatus } from '../firebaseServices';

const NotificationsAndAlerts = ({ adminId }) => {
  const [alerts, setAlerts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAlertForm, setShowAddAlertForm] = useState(false);
  const [newAlertData, setNewAlertData] = useState({
    title: '',
    description: '',
    type: 'info',
    threshold: '',
    deviceId: '',
    sendTo: 'all',
    priority: 'medium'
  });
  
  const [typeFilter, setTypeFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchAlerts();
  }, [adminId]);

  const fetchAlerts = async () => {
    try {
      setIsLoading(true);
      const alertsData = await getAlertsByAdminId(adminId);
      setAlerts(alertsData);
    } catch (error) {
      console.error("Error fetching alerts:", error);
      toast.error("Failed to load alerts data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      const alertData = {
        ...newAlertData,
        adminId,
        createdAt: new Date()
      };
      
      await addAlert(alertData);
      toast.success("Alert configuration added successfully");
      setShowAddAlertForm(false);
      setNewAlertData({
        title: '',
        description: '',
        type: 'info',
        threshold: '',
        deviceId: '',
        sendTo: 'all',
        priority: 'medium'
      });
      fetchAlerts();
    } catch (error) {
      console.error("Error adding alert:", error);
      toast.error("Failed to add alert configuration");
    }
  };

  const handleUpdateAlertStatus = async (alertId, status) => {
    try {
      await updateAlertStatus(alertId, status);
      toast.success("Alert status updated");
      
      // Update local state to reflect the change
      setAlerts(alerts.map(alert => {
        if (alert.id === alertId) {
          return { ...alert, status };
        }
        return alert;
      }));
    } catch (error) {
      console.error("Error updating alert status:", error);
      toast.error("Failed to update alert status");
    }
  };

  const filteredAlerts = alerts.filter(alert => {
    return (typeFilter === 'all' || alert.type === typeFilter) &&
           (priorityFilter === 'all' || alert.priority === priorityFilter);
  });

  return (
    <div className="dashboard-section">
      <h2 className="section-title">Notifications & Alerts</h2>
      
      <div className="alerts-controls">
        <button className="control-btn" onClick={() => setShowAddAlertForm(!showAddAlertForm)}>
          <FaPlus className="btn-icon" /> Add Alert Configuration
        </button>
        <div className="alert-filters">
          <select 
            className="alert-filter"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="info">Information</option>
            <option value="warning">Warning</option>
            <option value="danger">Danger</option>
            <option value="security">Security</option>
          </select>
          <select 
            className="alert-filter"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      
      {showAddAlertForm && (
        <div className="add-alert-form">
          <h3>Add New Alert Configuration</h3>
          <form onSubmit={handleAddAlert}>
            <div className="form-group">
              <label>Alert Title</label>
              <input 
                type="text" 
                value={newAlertData.title} 
                onChange={(e) => setNewAlertData({...newAlertData, title: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea 
                value={newAlertData.description} 
                onChange={(e) => setNewAlertData({...newAlertData, description: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Alert Type</label>
              <select 
                value={newAlertData.type} 
                onChange={(e) => setNewAlertData({...newAlertData, type: e.target.value})} 
              >
                <option value="info">Information</option>
                <option value="warning">Warning</option>
                <option value="danger">Danger</option>
                <option value="security">Security</option>
              </select>
            </div>
            <div className="form-group">
              <label>Threshold (if applicable)</label>
              <input 
                type="text" 
                placeholder="e.g. temperature > 40°C" 
                value={newAlertData.threshold} 
                onChange={(e) => setNewAlertData({...newAlertData, threshold: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Associated Device ID (optional)</label>
              <input 
                type="text" 
                value={newAlertData.deviceId} 
                onChange={(e) => setNewAlertData({...newAlertData, deviceId: e.target.value})} 
              />
            </div>
            <div className="form-group">
              <label>Send To</label>
              <select 
                value={newAlertData.sendTo} 
                onChange={(e) => setNewAlertData({...newAlertData, sendTo: e.target.value})} 
              >
                <option value="all">All Users</option>
                <option value="admin">Admin Only</option>
                <option value="family">Family Members</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select 
                value={newAlertData.priority} 
                onChange={(e) => setNewAlertData({...newAlertData, priority: e.target.value})} 
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Save Alert</button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddAlertForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading-data">Loading alerts configuration...</div>
      ) : (
        <>
          <div className="alerts-section">
            <h3>Alert Configurations</h3>
            {filteredAlerts.length > 0 ? (
              <div className="alerts-grid">
                {filteredAlerts.map(alert => (
                  <div key={alert.id} className={`alert-card ${alert.type}`}>
                    <div className="alert-header">
                      <h4>{alert.title}</h4>
                      <span className={`alert-priority ${alert.priority}`}>{alert.priority}</span>
                    </div>
                    <div className="alert-body">
                      <p>{alert.description}</p>
                      {alert.threshold && (
                        <p className="alert-threshold">Triggers when: {alert.threshold}</p>
                      )}
                      <p className="alert-recipients">Notifies: {alert.sendTo}</p>
                    </div>
                    <div className="alert-actions">
                      <select 
                        className="alert-status-select"
                        value={alert.status || 'active'} 
                        onChange={(e) => handleUpdateAlertStatus(alert.id, e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="snoozed">Snoozed</option>
                      </select>
                      <div className="alert-buttons">
                        <button className="alert-edit-btn">
                          <FaEdit />
                        </button>
                        <button className="alert-delete-btn">
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-alerts">
                <FaBell className="no-alerts-icon" />
                <p>No alert configurations found.</p>
                <button className="add-alert-btn" onClick={() => setShowAddAlertForm(true)}>
                  Set up your first alert
                </button>
              </div>
            )}
          </div>
          
          <div className="recent-notifications">
            <h3>Recent Notifications</h3>
            <div className="notifications-list">
              <div className="notification-item warning">
                <div className="notification-icon">
                  <FaBell />
                </div>
                <div className="notification-content">
                  <h4>Temperature Warning</h4>
                  <p>Kitchen temperature reached 32°C (threshold: 30°C)</p>
                  <span className="notification-time">Today, 15:42</span>
                </div>
              </div>
              <div className="notification-item info">
                <div className="notification-icon">
                  <FaBell />
                </div>
                <div className="notification-content">
                  <h4>New User Login</h4>
                  <p>Sarah Smith logged in from a new device</p>
                  <span className="notification-time">Today, 12:30</span>
                </div>
              </div>
              <div className="notification-item danger">
                <div className="notification-icon">
                  <FaBell />
                </div>
                <div className="notification-content">
                  <h4>Motion Detected</h4>
                  <p>Motion detected in Garage while system is armed</p>
                  <span className="notification-time">Yesterday, 23:15</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default NotificationsAndAlerts;