import React, { useEffect, useState } from 'react';
import { FaClock, FaEdit, FaLock, FaLockOpen, FaSave, FaShieldAlt } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { getSecuritySettingsByAdminId, updateSecuritySettings } from '../firebaseServices';

const SecuritySettings = ({ adminId }) => {
  const [securitySettings, setSecuritySettings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedSettings, setEditedSettings] = useState(null);
  
  // State for access schedules
  const [accessSchedules, setAccessSchedules] = useState([]);
  const [newSchedule, setNewSchedule] = useState({
    deviceId: '',
    userId: '',
    dayOfWeek: 'monday',
    startTime: '09:00',
    endTime: '17:00'
  });
  const [showAddScheduleForm, setShowAddScheduleForm] = useState(false);

  useEffect(() => {
    fetchSecuritySettings();
  }, [adminId]);

  const fetchSecuritySettings = async () => {
    try {
      setIsLoading(true);
      const settings = await getSecuritySettingsByAdminId(adminId);
      setSecuritySettings(settings);
      setEditedSettings(settings);
      
      // Transform access schedules object to array
      if (settings && settings.accessSchedules) {
        const schedulesArray = Object.entries(settings.accessSchedules).map(([id, schedule]) => ({
          id,
          ...schedule
        }));
        setAccessSchedules(schedulesArray);
      }
    } catch (error) {
      console.error("Error fetching security settings:", error);
      toast.error("Failed to load security settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      // Convert access schedules array back to object format for Firestore
      const schedulesObject = {};
      accessSchedules.forEach(schedule => {
        schedulesObject[schedule.id] = {
          deviceId: schedule.deviceId,
          userId: schedule.userId,
          dayOfWeek: schedule.dayOfWeek,
          startTime: schedule.startTime,
          endTime: schedule.endTime
        };
      });
      
      const updatedSettings = {
        ...editedSettings,
        accessSchedules: schedulesObject
      };
      
      await updateSecuritySettings(adminId, updatedSettings);
      setSecuritySettings(updatedSettings);
      setIsEditing(false);
      toast.success("Security settings updated successfully");
    } catch (error) {
      console.error("Error updating security settings:", error);
      toast.error("Failed to update security settings");
    }
  };

  const handleAddSchedule = () => {
    const scheduleId = `schedule_${Date.now()}`;
    const newScheduleItem = {
      id: scheduleId,
      ...newSchedule
    };
    
    setAccessSchedules([...accessSchedules, newScheduleItem]);
    setNewSchedule({
      deviceId: '',
      userId: '',
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '17:00'
    });
    setShowAddScheduleForm(false);
  };

  const handleRemoveSchedule = (scheduleId) => {
    setAccessSchedules(accessSchedules.filter(schedule => schedule.id !== scheduleId));
  };

  const toggleSystemArmed = async () => {
    try {
      const updatedSettings = {
        ...securitySettings,
        systemArmed: !securitySettings.systemArmed
      };
      
      await updateSecuritySettings(adminId, updatedSettings);
      setSecuritySettings(updatedSettings);
      setEditedSettings(updatedSettings);
      toast.success(`System ${updatedSettings.systemArmed ? 'armed' : 'disarmed'} successfully`);
    } catch (error) {
      console.error("Error toggling system armed status:", error);
      toast.error("Failed to update system armed status");
    }
  };
  
  const toggleSensitiveDevicesProtection = async () => {
    try {
      const updatedSettings = {
        ...securitySettings,
        sensitiveDevicesProtected: !securitySettings.sensitiveDevicesProtected
      };
      
      await updateSecuritySettings(adminId, updatedSettings);
      setSecuritySettings(updatedSettings);
      setEditedSettings(updatedSettings);
      toast.success(`Sensitive devices protection ${updatedSettings.sensitiveDevicesProtected ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error("Error toggling sensitive devices protection:", error);
      toast.error("Failed to update sensitive devices protection");
    }
  };

  return (
    <div className="dashboard-section">
      <h2 className="section-title">Security Settings</h2>
      
      {isLoading ? (
        <div className="loading-data">Loading security settings...</div>
      ) : securitySettings ? (
        <>
          <div className="security-cards">
            <div className="security-card">
              <div className="security-card-icon">
                {securitySettings.systemArmed ? <FaLock /> : <FaLockOpen />}
              </div>
              <div className="security-card-content">
                <h3>System Armed Status</h3>
                <p>The security system is currently {securitySettings.systemArmed ? 'ARMED' : 'DISARMED'}</p>
              </div>
              <div className="security-card-actions">
                <button 
                  className={`security-toggle-btn ${securitySettings.systemArmed ? 'active' : 'inactive'}`}
                  onClick={toggleSystemArmed}
                >
                  {securitySettings.systemArmed ? 'Disarm System' : 'Arm System'}
                </button>
              </div>
            </div>
            
            <div className="security-card">
              <div className="security-card-icon">
                <FaShieldAlt />
              </div>
              <div className="security-card-content">
                <h3>Sensitive Devices Protection</h3>
                <p>
                  Protection for cameras, locks, and other sensitive devices is currently 
                  {securitySettings.sensitiveDevicesProtected ? ' ENABLED' : ' DISABLED'}
                </p>
              </div>
              <div className="security-card-actions">
                <button 
                  className={`security-toggle-btn ${securitySettings.sensitiveDevicesProtected ? 'active' : 'inactive'}`}
                  onClick={toggleSensitiveDevicesProtection}
                >
                  {securitySettings.sensitiveDevicesProtected ? 'Disable Protection' : 'Enable Protection'}
                </button>
              </div>
            </div>
          </div>
          
          <div className="access-schedules-section">
            <div className="section-header">
              <h3>Access Schedules</h3>
              <button 
                className="add-schedule-btn" 
                onClick={() => setShowAddScheduleForm(!showAddScheduleForm)}
              >
                <FaEdit /> Add Schedule
              </button>
            </div>
            
            {showAddScheduleForm && (
              <div className="add-schedule-form">
                <h4>Add New Access Schedule</h4>
                <div className="form-group">
                  <label>Device ID</label>
                  <input 
                    type="text" 
                    placeholder="Device ID" 
                    value={newSchedule.deviceId} 
                    onChange={(e) => setNewSchedule({...newSchedule, deviceId: e.target.value})} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>User ID (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="Leave blank for all users" 
                    value={newSchedule.userId} 
                    onChange={(e) => setNewSchedule({...newSchedule, userId: e.target.value})} 
                  />
                </div>
                <div className="form-group">
                  <label>Day of Week</label>
                  <select 
                    value={newSchedule.dayOfWeek} 
                    onChange={(e) => setNewSchedule({...newSchedule, dayOfWeek: e.target.value})}
                  >
                    <option value="monday">Monday</option>
                    <option value="tuesday">Tuesday</option>
                    <option value="wednesday">Wednesday</option>
                    <option value="thursday">Thursday</option>
                    <option value="friday">Friday</option>
                    <option value="saturday">Saturday</option>
                    <option value="sunday">Sunday</option>
                    <option value="weekdays">Weekdays</option>
                    <option value="weekends">Weekends</option>
                    <option value="all">Every Day</option>
                  </select>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time</label>
                    <input 
                      type="time" 
                      value={newSchedule.startTime} 
                      onChange={(e) => setNewSchedule({...newSchedule, startTime: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <input 
                      type="time" 
                      value={newSchedule.endTime} 
                      onChange={(e) => setNewSchedule({...newSchedule, endTime: e.target.value})} 
                    />
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn-primary" onClick={handleAddSchedule}>Add Schedule</button>
                  <button className="btn-secondary" onClick={() => setShowAddScheduleForm(false)}>Cancel</button>
                </div>
              </div>
            )}
            
            {accessSchedules.length > 0 ? (
              <div className="schedules-table">
                <div className="table-header">
                  <div className="header-cell">Device ID</div>
                  <div className="header-cell">User ID</div>
                  <div className="header-cell">Day</div>
                  <div className="header-cell">Time Range</div>
                  <div className="header-cell">Actions</div>
                </div>
                <div className="table-body">
                  {accessSchedules.map(schedule => (
                    <div key={schedule.id} className="table-row">
                      <div className="cell">{schedule.deviceId}</div>
                      <div className="cell">{schedule.userId || 'All Users'}</div>
                      <div className="cell">{schedule.dayOfWeek}</div>
                      <div className="cell">{schedule.startTime} - {schedule.endTime}</div>
                      <div className="cell actions">
                        <button className="action-btn" onClick={() => handleRemoveSchedule(schedule.id)}>
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="no-schedules">
                <FaClock className="no-schedules-icon" />
                <p>No access schedules configured.</p>
                <button className="add-schedule-btn" onClick={() => setShowAddScheduleForm(true)}>
                  Add your first schedule
                </button>
              </div>
            )}
          </div>
          
          <div className="safety-systems-section">
            <h3>Safety Systems</h3>
            <div className="safety-systems-grid">
              <div className="safety-system-card">
                <h4>Water Sprinkler System</h4>
                <div className="toggle-container">
                  <span>Status:</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={editedSettings.waterSprinklerEnabled || false}
                      onChange={() => setEditedSettings({
                        ...editedSettings, 
                        waterSprinklerEnabled: !editedSettings.waterSprinklerEnabled
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {isEditing && (
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Response Time (seconds)</label>
                      <input 
                        type="number" 
                        value={editedSettings.waterSprinklerResponseTime || 30}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings, 
                          waterSprinklerResponseTime: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="safety-system-card">
                <h4>Emergency Ventilation</h4>
                <div className="toggle-container">
                  <span>Status:</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={editedSettings.ventilationEnabled || false}
                      onChange={() => setEditedSettings({
                        ...editedSettings, 
                        ventilationEnabled: !editedSettings.ventilationEnabled
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
                {isEditing && (
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Trigger CO2 Level (ppm)</label>
                      <input 
                        type="number" 
                        value={editedSettings.ventilationTriggerLevel || 1000}
                        onChange={(e) => setEditedSettings({
                          ...editedSettings, 
                          ventilationTriggerLevel: parseInt(e.target.value)
                        })}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="safety-system-card">
                <h4>Emergency Lighting</h4>
                <div className="toggle-container">
                  <span>Status:</span>
                  <label className="toggle-switch">
                    <input 
                      type="checkbox" 
                      checked={editedSettings.emergencyLightingEnabled || false}
                      onChange={() => setEditedSettings({
                        ...editedSettings, 
                        emergencyLightingEnabled: !editedSettings.emergencyLightingEnabled
                      })}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>
            </div>
            <div className="security-actions">
              {isEditing ? (
                <>
                  <button className="btn-primary" onClick={handleSaveSettings}>
                    <FaSave /> Save Settings
                  </button>
                  <button className="btn-secondary" onClick={() => {
                    setEditedSettings(securitySettings);
                    setIsEditing(false);
                  }}>
                    Cancel
                  </button>
                </>
              ) : (
                <button className="btn-primary" onClick={() => setIsEditing(true)}>
                  <FaEdit /> Edit Settings
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="no-settings">
          <FaShieldAlt className="no-settings-icon" />
          <p>No security settings found for this admin.</p>
          <button className="setup-security-btn" onClick={() => {
            setSecuritySettings({
              adminId,
              systemArmed: false,
              accessSchedules: {},
              sensitiveDevicesProtected: true
            });
            setEditedSettings({
              adminId,
              systemArmed: false,
              accessSchedules: {},
              sensitiveDevicesProtected: true
            });
            setIsEditing(true);
          }}>
            Set up security settings
          </button>
        </div>
      )}
    </div>
  );
};

export default SecuritySettings;