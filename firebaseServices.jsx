// First, let's create a file for our Firestore service functions
// firebaseService.js

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { db } from './firebase';

// User Management
export const getUsersByAdminId = async (adminId) => {
  try {
    const usersSnapshot = await getDocs(
      query(collection(db, "users"), where("adminId", "==", adminId))
    );
    const usersData = [];
    usersSnapshot.forEach((doc) => {
      usersData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return usersData;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

export const addUser = async (userData) => {
  try {
    const docRef = await addDoc(collection(db, "users"), {
      ...userData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

export const updateUserRole = async (userId, role) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      role: role,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const updateUserStatus = async (userId, status) => {
  try {
    await updateDoc(doc(db, "users", userId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating user status:", error);
    throw error;
  }
};

export const removeUser = async (userId) => {
  try {
    await deleteDoc(doc(db, "users", userId));
    return true;
  } catch (error) {
    console.error("Error removing user:", error);
    throw error;
  }
};

// Device Management
export const getDevicesByAdminId = async (adminId) => {
  try {
    const devicesSnapshot = await getDocs(
      query(collection(db, "devices"), where("adminId", "==", adminId))
    );
    const devicesData = [];
    devicesSnapshot.forEach((doc) => {
      devicesData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return devicesData;
  } catch (error) {
    console.error("Error fetching devices:", error);
    throw error;
  }
};

export const addDevice = async (deviceData) => {
  try {
    const docRef = await addDoc(collection(db, "devices"), {
      ...deviceData,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding device:", error);
    throw error;
  }
};

export const updateDeviceStatus = async (deviceId, status) => {
  try {
    await updateDoc(doc(db, "devices", deviceId), {
      status: status,
      lastUpdated: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating device status:", error);
    throw error;
  }
};

export const assignDeviceToRoom = async (deviceId, roomId) => {
  try {
    await updateDoc(doc(db, "devices", deviceId), {
      roomId: roomId,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error assigning device to room:", error);
    throw error;
  }
};

export const removeDevice = async (deviceId) => {
  try {
    await deleteDoc(doc(db, "devices", deviceId));
    return true;
  } catch (error) {
    console.error("Error removing device:", error);
    throw error;
  }
};

// Notifications & Alerts
export const getAlertsByAdminId = async (adminId) => {
  try {
    const alertsSnapshot = await getDocs(
      query(collection(db, "alerts"), where("adminId", "==", adminId))
    );
    const alertsData = [];
    alertsSnapshot.forEach((doc) => {
      alertsData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return alertsData;
  } catch (error) {
    console.error("Error fetching alerts:", error);
    throw error;
  }
};

export const addAlert = async (alertData) => {
  try {
    const docRef = await addDoc(collection(db, "alerts"), {
      ...alertData,
      timestamp: serverTimestamp(),
      status: 'unread'
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding alert:", error);
    throw error;
  }
};

export const updateAlertStatus = async (alertId, status) => {
  try {
    await updateDoc(doc(db, "alerts", alertId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating alert status:", error);
    throw error;
  }
};

// Security Settings
export const getSecuritySettingsByAdminId = async (adminId) => {
  try {
    const docRef = doc(db, "securitySettings", adminId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      // Create default security settings if none exist
      const defaultSettings = {
        adminId,
        systemArmed: false,
        accessSchedules: {},
        sensitiveDevicesProtected: true,
        createdAt: serverTimestamp()
      };
      await setDoc(docRef, defaultSettings);
      return { id: adminId, ...defaultSettings };
    }
  } catch (error) {
    console.error("Error fetching security settings:", error);
    throw error;
  }
};

export const updateSecuritySettings = async (adminId, settingsData) => {
  try {
    await updateDoc(doc(db, "securitySettings", adminId), {
      ...settingsData,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating security settings:", error);
    throw error;
  }
};

// System Analytics & Logs
export const addActivityLog = async (logData) => {
  try {
    const docRef = await addDoc(collection(db, "activityLogs"), {
      ...logData,
      timestamp: serverTimestamp()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding activity log:", error);
    throw error;
  }
};

export const getActivityLogsByAdminId = async (adminId, limit = 50) => {
  try {
    const logsSnapshot = await getDocs(
      query(
        collection(db, "activityLogs"), 
        where("adminId", "==", adminId),
        // Add a limit to the query
        // You could also add orderBy("timestamp", "desc") if you want the most recent logs
      )
    );
    const logsData = [];
    logsSnapshot.forEach((doc) => {
      logsData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return logsData;
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    throw error;
  }
};

// Connectivity & Integration
export const getIntegrationsByAdminId = async (adminId) => {
  try {
    const integrationsSnapshot = await getDocs(
      query(collection(db, "integrations"), where("adminId", "==", adminId))
    );
    const integrationsData = [];
    integrationsSnapshot.forEach((doc) => {
      integrationsData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return integrationsData;
  } catch (error) {
    console.error("Error fetching integrations:", error);
    throw error;
  }
};

export const addIntegration = async (integrationData) => {
  try {
    const docRef = await addDoc(collection(db, "integrations"), {
      ...integrationData,
      createdAt: serverTimestamp(),
      status: 'active'
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding integration:", error);
    throw error;
  }
};

export const updateIntegrationStatus = async (integrationId, status) => {
  try {
    await updateDoc(doc(db, "integrations", integrationId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating integration status:", error);
    throw error;
  }
};

export const removeIntegration = async (integrationId) => {
  try {
    await deleteDoc(doc(db, "integrations", integrationId));
    return true;
  } catch (error) {
    console.error("Error removing integration:", error);
    throw error;
  }
};

// Simulation & Testing
export const getSimulationsByAdminId = async (adminId) => {
  try {
    const simulationsSnapshot = await getDocs(
      query(collection(db, "simulations"), where("adminId", "==", adminId))
    );
    const simulationsData = [];
    simulationsSnapshot.forEach((doc) => {
      simulationsData.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return simulationsData;
  } catch (error) {
    console.error("Error fetching simulations:", error);
    throw error;
  }
};

export const addSimulation = async (simulationData) => {
  try {
    const docRef = await addDoc(collection(db, "simulations"), {
      ...simulationData,
      createdAt: serverTimestamp(),
      status: 'scheduled'
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding simulation:", error);
    throw error;
  }
};

export const updateSimulationStatus = async (simulationId, status) => {
  try {
    await updateDoc(doc(db, "simulations", simulationId), {
      status: status,
      updatedAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error("Error updating simulation status:", error);
    throw error;
  }
};
