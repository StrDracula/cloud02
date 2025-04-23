import React, { useEffect, useState } from 'react';
import { FaUserEdit, FaUserPlus, FaUserTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useAuth } from '../AuthContext';
import { addUser, getUsersByAdminId, removeUser, updateUserRole, updateUserStatus } from '../firebaseServices';

const UserManagement = ({ adminId }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    role: 'family',
    status: 'active'
  });
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, [adminId]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const userData = await getUsersByAdminId(adminId);
      setUsers(userData);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load user data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    try {
      const userData = {
        ...newUserData,
        adminId,
        addedBy: currentUser.uid,
        addedAt: new Date()
      };
      
      await addUser(userData);
      toast.success("User added successfully");
      setShowAddUserForm(false);
      setNewUserData({
        name: '',
        email: '',
        role: 'family',
        status: 'active'
      });
      fetchUsers();
    } catch (error) {
      console.error("Error adding user:", error);
      toast.error("Failed to add user");
    }
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      toast.success("User role updated");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user role:", error);
      toast.error("Failed to update user role");
    }
  };

  const handleUpdateStatus = async (userId, newStatus) => {
    try {
      await updateUserStatus(userId, newStatus);
      toast.success("User status updated");
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status");
    }
  };

  const handleRemoveUser = async (userId) => {
    if (window.confirm("Are you sure you want to remove this user?")) {
      try {
        await removeUser(userId);
        toast.success("User removed successfully");
        fetchUsers();
      } catch (error) {
        console.error("Error removing user:", error);
        toast.error("Failed to remove user");
      }
    }
  };

  const copyAdminId = () => {
    navigator.clipboard.writeText(adminId);
    toast.info('Admin ID copied to clipboard!');
  };

  const filteredUsers = users.filter(user => {
    return (roleFilter === 'all' || user.role === roleFilter) &&
           (statusFilter === 'all' || user.status === statusFilter);
  });

  return (
    <div className="dashboard-section">
      <h2 className="section-title">User Management</h2>
      <div className="user-controls">
        <button className="control-btn" onClick={() => setShowAddUserForm(!showAddUserForm)}>
          <FaUserPlus className="btn-icon" /> Invite User
        </button>
        <div className="user-filters">
          <select 
            className="user-filter" 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="family">Family</option>
            <option value="guest">Guest</option>
            <option value="admin">Admin</option>
          </select>
          <select 
            className="user-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="blocked">Blocked</option>
          </select>
        </div>
      </div>
      
      {showAddUserForm && (
        <div className="add-user-form">
          <h3>Add New User</h3>
          <form onSubmit={handleAddUser}>
            <div className="form-group">
              <label>Name</label>
              <input 
                type="text" 
                value={newUserData.name} 
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={newUserData.email} 
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})} 
                required 
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select 
                value={newUserData.role} 
                onChange={(e) => setNewUserData({...newUserData, role: e.target.value})} 
              >
                <option value="family">Family</option>
                <option value="guest">Guest</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Add User</button>
              <button type="button" className="btn-secondary" onClick={() => setShowAddUserForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}
      
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
        
        {isLoading ? (
          <div className="loading-data">Loading user data...</div>
        ) : (
          <div className="table-body">
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <div key={user.id} className="table-row">
                  <div className="cell">{user.name}</div>
                  <div className="cell">{user.email}</div>
                  <div className="cell">
                    {editingUser === user.id ? (
                      <select 
                        value={user.role} 
                        onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                        onBlur={() => setEditingUser(null)}
                      >
                        <option value="family">Family</option>
                        <option value="guest">Guest</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span 
                        className={`role-badge ${user.role}`}
                        onClick={() => setEditingUser(user.id)}
                      >
                        {user.role}
                      </span>
                    )}
                  </div>
                  <div className="cell">{user.addedAt ? new Date(user.addedAt.toDate()).toLocaleDateString() : 'N/A'}</div>
                  <div className="cell">
                    <select 
                      className={`status-select ${user.status}`}
                      value={user.status || 'active'} 
                      onChange={(e) => handleUpdateStatus(user.id, e.target.value)}
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </div>
                  <div className="cell actions">
                    <button className="action-btn" onClick={() => setEditingUser(user.id)}>
                      <FaUserEdit />
                    </button>
                    <button className="action-btn delete" onClick={() => handleRemoveUser(user.id)}>
                      <FaUserTimes />
                    </button>
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
        )}
      </div>
      
      <div className="activity-logs">
        <h3>User Activity Logs</h3>
        <div className="logs-table">
          <div className="table-header">
            <div className="header-cell">User</div>
            <div className="header-cell">Action</div>
            <div className="header-cell">Time</div>
            <div className="header-cell">Details</div>
          </div>
          <div className="table-body">
            <div className="table-row">
              <div className="cell">John Doe</div>
              <div className="cell">Login</div>
              <div className="cell">Today, 10:32 AM</div>
              <div className="cell">IP: 192.168.1.5</div>
            </div>
            <div className="table-row">
              <div className="cell">Sarah Smith</div>
              <div className="cell">Device Control</div>
              <div className="cell">Today, 09:15 AM</div>
              <div className="cell">Turned on Living Room Lights</div>
            </div>
            <div className="table-row">
              <div className="cell">Guest User</div>
              <div className="cell">Login</div>
              <div className="cell">Yesterday, 7:45 PM</div>
              <div className="cell">IP: 192.168.1.10</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;