import { signOut } from 'firebase/auth';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { BsDisplay, BsHouseDoor } from 'react-icons/bs';
import { FaUserCog, FaUsers } from 'react-icons/fa';
import { IoIosNotifications, IoIosSwitch } from 'react-icons/io';
import { MdOutlineAnalytics, MdOutlineSecurity, MdSettings } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/Dashboard.css';
import { useAuth } from '../AuthContext';
import { auth, db } from '../firebase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [adminId, setAdminId] = useState('');
  const [devices, setDevices] = useState([]);
  const [users, setUsers] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activeSection, setActiveSection] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);

  // Fetch admin details and data on component mount
  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        if (currentUser) {
          // Get admin ID (generate if not exists)
          const adminDocRef = doc(db, "users", currentUser.uid);
          const adminDoc = await getDoc(adminDocRef);
          
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            setAdminId(adminData.adminId || generateAdminId(currentUser.uid));
            
            // Fetch associated users
            const usersSnapshot = await getDocs(collection(db, "users"));
            const usersData = [];
            usersSnapshot.forEach((doc) => {
              const userData = doc.data();
              if (userData.adminId === adminData.adminId) {
                usersData.push({
                  id: doc.id,
                  ...userData
                });
              }
            });
            setUsers(usersData);
            
            // Mock devices and alerts data for demonstration
            setDevices(getMockDevices());
            setAlerts(getMockAlerts());
          }
        }
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching admin data:", error);
        toast.error("Failed to load dashboard data");
        setIsLoading(false);
      }
    };
    
    fetchAdminData();
  }, [currentUser]);

  const generateAdminId = (uid) => {
    // Generate a unique admin ID based on the user ID
    return `admin-${uid.substring(0, 8)}`;
  };

  const getMockDevices = () => {
    return [
      { id: 1, name: 'Living Room Light', type: 'light', status: 'on', lastActive: '5 mins ago' },
      { id: 2, name: 'Kitchen Thermostat', type: 'thermostat', status: 'on', lastActive: '2 mins ago', value: '22°C' },
      { id: 3, name: 'Front Door Lock', type: 'lock', status: 'locked', lastActive: '1 hour ago' },
      { id: 4, name: 'Bedroom AC', type: 'climate', status: 'off', lastActive: '6 hours ago' },
      { id: 5, name: 'Garage Door', type: 'door', status: 'closed', lastActive: '2 days ago' },
      { id: 6, name: 'Security Camera', type: 'camera', status: 'on', lastActive: 'Just now' }
    ];
  };

  const getMockAlerts = () => {
    return [
      { id: 1, type: 'security', message: 'Motion detected at front door', timestamp: '2 mins ago', severity: 'high' },
      { id: 2, type: 'device', message: 'Kitchen light disconnected', timestamp: '1 hour ago', severity: 'medium' },
      { id: 3, type: 'user', message: 'Guest login: Alex Smith', timestamp: '3 hours ago', severity: 'low' },
      { id: 4, type: 'system', message: 'Software update available', timestamp: '5 hours ago', severity: 'low' }
    ];
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to log out');
      console.error('Logout error:', error);
    }
  };

  const handleToggleDevice = (deviceId) => {
    setDevices(devices.map(device => {
      if (device.id === deviceId) {
        const newStatus = device.status === 'on' ? 'off' : 'on';
        return { ...device, status: newStatus };
      }
      return device;
    }));
    toast.success('Device status updated!');
  };

  const copyAdminId = () => {
    navigator.clipboard.writeText(adminId);
    toast.info('Admin ID copied to clipboard!');
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-sidebar">
        <div className="sidebar-header">
          <BsHouseDoor className="logo-icon" />
          <h3>SmartHome</h3>
        </div>
        <div className="sidebar-menu">
          <div 
            className={`sidebar-item ${activeSection === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveSection('overview')}
          >
            <MdOutlineAnalytics className="sidebar-icon" />
            <span>Overview</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'devices' ? 'active' : ''}`}
            onClick={() => setActiveSection('devices')}
          >
            <BsDisplay className="sidebar-icon" />
            <span>Devices</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'users' ? 'active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <FaUsers className="sidebar-icon" />
            <span>Users</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'security' ? 'active' : ''}`}
            onClick={() => setActiveSection('security')}
          >
            <MdOutlineSecurity className="sidebar-icon" />
            <span>Security</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'alerts' ? 'active' : ''}`}
            onClick={() => setActiveSection('alerts')}
          >
            <IoIosNotifications className="sidebar-icon" />
            <span>Notifications</span>
          </div>
          <div 
            className={`sidebar-item ${activeSection === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveSection('settings')}
          >
            <MdSettings className="sidebar-icon" />
            <span>Settings</span>
          </div>
        </div>
      </div>
      
      <div className="main-content">
        <div className="dashboard-header">
          <div className="user-info">
            <h1>Admin Dashboard</h1>
            <p>Welcome, {currentUser?.displayName || currentUser?.email || 'Administrator'}</p>
          </div>
          <div className="header-actions">
            <button className="admin-id-btn" onClick={copyAdminId}>
              <FaUserCog className="btn-icon" />
              Admin ID: {adminId}
            </button>
            <button className="logout-btn" onClick={handleLogout}>Logout</button>
          </div>
        </div>
        
        <div className="dashboard-content">
          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="dashboard-section">
              <h2 className="section-title">System Overview</h2>
              <div className="stat-cards">
                <div className="stat-card">
                  <h3>Devices</h3>
                  <p className="stat-number">{devices.length}</p>
                  <p className="stat-text">{devices.filter(d => d.status === 'on').length} devices active</p>
                </div>
                <div className="stat-card">
                  <h3>Users</h3>
                  <p className="stat-number">{users.length}</p>
                  <p className="stat-text">Family members & guests</p>
                </div>
                <div className="stat-card">
                  <h3>Alerts</h3>
                  <p className="stat-number">{alerts.length}</p>
                  <p className="stat-text">{alerts.filter(a => a.severity === 'high').length} high priority</p>
                </div>
                <div className="stat-card">
                  <h3>System Status</h3>
                  <p className="stat-number status-ok">Online</p>
                  <p className="stat-text">All systems operational</p>
                </div>
              </div>
              
              <div className="overview-sections">
                <div className="recent-alerts">
                  <h3>Recent Alerts</h3>
                  <div className="alert-list">
                    {alerts.slice(0, 3).map(alert => (
                      <div key={alert.id} className={`alert-item severity-${alert.severity}`}>
                        <span className="alert-type">{alert.type}</span>
                        <p className="alert-message">{alert.message}</p>
                        <span className="alert-time">{alert.timestamp}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="recent-devices">
                  <h3>Recently Active Devices</h3>
                  <div className="device-list-mini">
                    {devices.slice(0, 3).map(device => (
                      <div key={device.id} className="device-item-mini">
                        <div className="device-info">
                          <span className="device-name">{device.name}</span>
                          <span className={`device-status status-${device.status}`}>{device.status}</span>
                        </div>
                        <span className="device-last-active">{device.lastActive}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Devices Section */}
          {activeSection === 'devices' && (
            <div className="dashboard-section">
              <h2 className="section-title">Device Management</h2>
              <div className="device-controls">
                <button className="control-btn">
                  <span className="btn-icon">+</span> Add Device
                </button>
                <div className="device-filters">
                  <select className="device-filter">
                    <option>All Rooms</option>
                    <option>Living Room</option>
                    <option>Kitchen</option>
                    <option>Bedroom</option>
                    <option>Garage</option>
                  </select>
                  <select className="device-filter">
                    <option>All Types</option>
                    <option>Lights</option>
                    <option>Thermostats</option>
                    <option>Locks</option>
                    <option>Cameras</option>
                  </select>
                  <select className="device-filter">
                    <option>All Status</option>
                    <option>Online</option>
                    <option>Offline</option>
                  </select>
                </div>
              </div>
              
              <div className="devices-grid">
                {devices.map(device => (
                  <div key={device.id} className="device-card">
                    <div className="device-header">
                      <h3 className="device-name">{device.name}</h3>
                      <span className={`device-status-indicator ${device.status === 'on' ? 'online' : 'offline'}`}></span>
                    </div>
                    <div className="device-body">
                      <p className="device-type">Type: {device.type}</p>
                      {device.value && <p className="device-value">Value: {device.value}</p>}
                      <p className="device-last-seen">Last active: {device.lastActive}</p>
                    </div>
                    <div className="device-actions">
                      <button 
                        className={`device-toggle-btn ${device.status === 'on' ? 'on' : 'off'}`}
                        onClick={() => handleToggleDevice(device.id)}
                      >
                        <IoIosSwitch className="toggle-icon" />
                        {device.status === 'on' ? 'Turn Off' : 'Turn On'}
                      </button>
                      <button className="device-settings-btn">
                        <MdSettings className="settings-icon" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="dashboard-section">
              <h2 className="section-title">User Management</h2>
              <div className="user-controls">
                <button className="control-btn">
                  <span className="btn-icon">+</span> Invite User
                </button>
                <div className="user-filters">
                  <select className="user-filter">
                    <option>All Roles</option>
                    <option>Family</option>
                    <option>Guest</option>
                  </select>
                  <select className="user-filter">
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>
              </div>
              
              <div className="admin-id-section">
                <div className="admin-id-card">
                  <h3>Your Admin ID</h3>
                  <p className="admin-id-value">{adminId}</p>
                  <p className="admin-id-info">Share this ID with family members and guests when they sign up to connect their accounts to your smart home.</p>
                  <button className="copy-admin-id" onClick={copyAdminId}>
                    Copy Admin ID
                  </button>
                </div>
              </div>
              
              <div className="users-table">
                <div className="table-header">
                  <div className="header-cell">Name</div>
                  <div className="header-cell">Email</div>
                  <div className="header-cell">Role</div>
                  <div className="header-cell">Joined</div>
                  <div className="header-cell">Status</div>
                  <div className="header-cell">Actions</div>
                </div>
                <div className="table-body">
                  {users.length > 0 ? (
                    users.map((user, index) => (
                      <div key={index} className="table-row">
                        <div className="cell">{user.name}</div>
                        <div className="cell">{user.email}</div>
                        <div className="cell">
                          <span className={`role-badge ${user.role}`}>{user.role}</span>
                        </div>
                        <div className="cell">{new Date(user.createdAt?.toDate()).toLocaleDateString()}</div>
                        <div className="cell">
                          <span className="status-badge active">Active</span>
                        </div>
                        <div className="cell actions">
                          <button className="action-btn">Edit</button>
                          <button className="action-btn delete">Remove</button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-users">
                      <p>No users connected to your account yet.</p>
                      <p>Share your Admin ID with family members or guests to connect them.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          
          {/* Security Section */}
          {activeSection === 'security' && (
            <div className="dashboard-section">
              <h2 className="section-title">Security Controls</h2>
              <div className="security-cards">
                <div className="security-card">
                  <div className="security-icon">
                    <MdOutlineSecurity />
                  </div>
                  <h3>System Status</h3>
                  <div className="security-status active">Protected</div>
                  <p>Your security system is active and monitoring your home.</p>
                  <button className="security-btn">Security Settings</button>
                </div>
                
                <div className="security-card">
                  <div className="security-icon">
                    <FaUsers />
                  </div>
                  <h3>Access Control</h3>
                  <p>Manage which users can access specific devices and areas.</p>
                  <button className="security-btn">Configure Access</button>
                </div>
                
                <div className="security-card">
                  <div className="security-icon">
                    <IoIosNotifications />
                  </div>
                  <h3>Security Alerts</h3>
                  <p>Customize when and how you receive security notifications.</p>
                  <button className="security-btn">Alert Settings</button>
                </div>
              </div>
              
              <div className="security-activity">
                <h3>Recent Security Activity</h3>
                <div className="activity-list">
                  <div className="activity-item">
                    <span className="activity-time">Today, 10:32 AM</span>
                    <span className="activity-event">Front door unlocked by Jane (Family)</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">Today, 8:15 AM</span>
                    <span className="activity-event">Motion detected in living room</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">Yesterday, 7:45 PM</span>
                    <span className="activity-event">Security system armed</span>
                  </div>
                  <div className="activity-item">
                    <span className="activity-time">Yesterday, 6:22 PM</span>
                    <span className="activity-event">Guest user "Alex" accessed front door</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Alerts Section */}
          {activeSection === 'alerts' && (
            <div className="dashboard-section">
              <h2 className="section-title">Notifications & Alerts</h2>
              <div className="alerts-controls">
                <div className="alert-filters">
                  <button className="filter-btn active">All</button>
                  <button className="filter-btn">Security</button>
                  <button className="filter-btn">Devices</button>
                  <button className="filter-btn">Users</button>
                  <button className="filter-btn">System</button>
                </div>
                <select className="priority-filter">
                  <option>All Priorities</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </div>
              
              <div className="alerts-list">
                {alerts.map(alert => (
                  <div key={alert.id} className={`alert-card severity-${alert.severity}`}>
                    <div className="alert-header">
                      <span className={`alert-type ${alert.type}`}>{alert.type}</span>
                      <span className="alert-time">{alert.timestamp}</span>
                    </div>
                    <div className="alert-content">
                      <p className="alert-message">{alert.message}</p>
                    </div>
                    <div className="alert-actions">
                      <button className="alert-btn">Resolve</button>
                      <button className="alert-btn secondary">Details</button>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="notification-settings">
                <h3>Notification Settings</h3>
                <div className="settings-list">
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Security Alerts</h4>
                      <p>Get notifications for motion detection, door/window openings</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked onChange={() => {}} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>Device Status Changes</h4>
                      <p>Get notified when devices go offline or malfunction</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked onChange={() => {}} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="setting-item">
                    <div className="setting-info">
                      <h4>User Login Activity</h4>
                      <p>Notifications when users log in or make changes</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" onChange={() => {}} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Settings Section */}
          {activeSection === 'settings' && (
            <div className="dashboard-section">
              <h2 className="section-title">System Settings</h2>
              
              <div className="settings-grid">
                <div className="settings-card">
                  <h3>Profile Settings</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Name</label>
                      <input type="text" value={currentUser?.displayName || ''} />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" value={currentUser?.email || ''} disabled />
                    </div>
                    <button className="settings-save-btn">Update Profile</button>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>Home Settings</h3>
                  <div className="settings-form">
                    <div className="form-group">
                      <label>Home Name</label>
                      <input type="text" placeholder="My Smart Home" />
                    </div>
                    <div className="form-group">
                      <label>Time Zone</label>
                      <select>
                        <option>UTC-8 - Pacific Time</option>
                        <option>UTC-7 - Mountain Time</option>
                        <option>UTC-6 - Central Time</option>
                        <option>UTC-5 - Eastern Time</option>
                        <option>UTC+0 - Greenwich Mean Time</option>
                      </select>
                    </div>
                    <button className="settings-save-btn">Save Settings</button>
                  </div>
                </div>
                
                <div className="settings-card">
                  <h3>System Preferences</h3>
                  <div className="settings-toggle-list">
                    <div className="settings-toggle-item">
                      <div className="toggle-label">
                        <p>Dark Mode</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" onChange={() => {}} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="toggle-label">
                        <p>Email Notifications</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked onChange={() => {}} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                    <div className="settings-toggle-item">
                      <div className="toggle-label">
                        <p>Auto-logout after inactivity</p>
                      </div>
                      <label className="toggle-switch">
                        <input type="checkbox" checked onChange={() => {}} />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>
                </div>
                
                <div className="settings-card danger">
                  <h3>Advanced Settings</h3>
                  <div className="danger-actions">
                    <button className="danger-btn">Reset System Settings</button>
                    <button className="danger-btn">Unlink All Devices</button>
                    <button className="danger-btn critical">Delete Account</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;