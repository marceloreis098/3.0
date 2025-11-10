import { User, Equipment, License, UserRole, EquipmentHistory, AuditLogEntry, AppSettings } from '../types';

const API_BASE_URL = `http://${window.location.hostname}:3001/api`;

const handleResponse = async (response: Response) => {
    if (response.status === 204) {
        return; // No content, successful
    }
    const data = await response.json();
    if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }
    return data;
};

// Auth
export const login = async (credentials: { username: string, password?: string, ssoToken?: string }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
    });
    return handleResponse(response);
};

export const verify2FA = async (userId: number, token: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/verify-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
    });
    return handleResponse(response);
};

export const generate2FASecret = async (userId: number): Promise<{ secret: string; qrCodeUrl: string }> => {
    const response = await fetch(`${API_BASE_URL}/generate-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
};

export const enable2FA = async (userId: number, token: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/enable-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, token }),
    });
    return handleResponse(response);
};

export const disable2FA = async (userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/disable-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
};

export const disableUser2FA = async (userId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/disable-user-2fa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
    });
    return handleResponse(response);
};

// Equipment
export const getEquipment = async (currentUser: User): Promise<Equipment[]> => {
    const response = await fetch(`${API_BASE_URL}/equipment?userId=${currentUser.id}&role=${currentUser.role}`);
    return handleResponse(response);
};

export const getEquipmentHistory = async (equipmentId: number): Promise<EquipmentHistory[]> => {
    const response = await fetch(`${API_BASE_URL}/equipment/${equipmentId}/history`);
    return handleResponse(response);
};

export const addEquipment = async (equipment: Omit<Equipment, 'id'>, currentUser: User): Promise<Equipment> => {
    const response = await fetch(`${API_BASE_URL}/equipment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment, username: currentUser.username }),
    });
    return handleResponse(response);
};

export const updateEquipment = async (equipment: Equipment, username: string): Promise<Equipment> => {
    const response = await fetch(`${API_BASE_URL}/equipment/${equipment.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipment, username }),
    });
    return handleResponse(response);
};

export const deleteEquipment = async (id: number, username: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/equipment/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    return handleResponse(response);
};

export const importEquipment = async (equipmentList: Omit<Equipment, 'id'>[], username: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/equipment/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentList, username }),
    });
    return handleResponse(response);
};

export const periodicUpdateEquipment = async (equipmentList: Partial<Equipment>[], username: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/equipment/periodic-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipmentList, username }),
    });
    return handleResponse(response);
};


// Licenses
export const getLicenses = async (currentUser: User): Promise<License[]> => {
    const response = await fetch(`${API_BASE_URL}/licenses?userId=${currentUser.id}&role=${currentUser.role}`);
    return handleResponse(response);
};

export const addLicense = async (license: Omit<License, 'id'>, currentUser: User): Promise<License> => {
    const response = await fetch(`${API_BASE_URL}/licenses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license, username: currentUser.username }),
    });
    return handleResponse(response);
};

export const updateLicense = async (license: License, username: string): Promise<License> => {
    const response = await fetch(`${API_BASE_URL}/licenses/${license.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ license, username }),
    });
    return handleResponse(response);
};

export const deleteLicense = async (id: number, username: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/licenses/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    return handleResponse(response);
};

export const getLicenseTotals = async (): Promise<Record<string, number>> => {
    const response = await fetch(`${API_BASE_URL}/licenses/totals`);
    return handleResponse(response);
};

export const saveLicenseTotals = async (totals: Record<string, number>, username: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/licenses/totals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totals, username }),
    });
    return handleResponse(response);
};

export const renameProduct = async (oldName: string, newName: string, username: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/licenses/rename-product`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldName, newName, username }),
    });
    return handleResponse(response);
};

export const importLicenses = async (importData: { productName: string; licenses: Omit<License, 'id' | 'produto' | 'approval_status' | 'rejection_reason'>[] }, username: string): Promise<{ success: boolean, message: string }> => {
    const response = await fetch(`${API_BASE_URL}/licenses/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...importData, username }),
    });
    return handleResponse(response);
};

// Users
export const getUsers = async (): Promise<User[]> => {
    const response = await fetch(`${API_BASE_URL}/users`);
    return handleResponse(response);
};

export const addUser = async (user: Omit<User, 'id'>, username: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, username }),
    });
    return handleResponse(response);
};

export const updateUser = async (user: User, username: string): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${user.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, username }),
    });
    return handleResponse(response);
};

export const updateUserProfile = async (userId: number, profileData: { realName: string, avatarUrl: string }): Promise<User> => {
    const response = await fetch(`${API_BASE_URL}/users/${userId}/profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
    });
    return handleResponse(response);
};

export const deleteUser = async (id: number, username: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    return handleResponse(response);
};

// Audit Log
export const getAuditLog = async (): Promise<AuditLogEntry[]> => {
    const response = await fetch(`${API_BASE_URL}/audit-log`);
    return handleResponse(response);
};

// Approvals
export const getPendingApprovals = async (): Promise<{id: number; name: string; type: 'equipment' | 'license'}[]> => {
    const response = await fetch(`${API_BASE_URL}/approvals/pending`);
    return handleResponse(response);
};

export const approveItem = async (type: 'equipment' | 'license', id: number, username: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/approvals/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, username }),
    });
    return handleResponse(response);
};

export const rejectItem = async (type: 'equipment' | 'license', id: number, username: string, reason: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/approvals/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, id, username, reason }),
    });
    return handleResponse(response);
};

// Settings & System
export const getSettings = async (): Promise<AppSettings> => {
    const response = await fetch(`${API_BASE_URL}/settings`);
    return handleResponse(response);
};

export const saveSettings = async (settings: AppSettings, username: string): Promise<{ success: boolean, message: string }> => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ settings, username }),
    });
    return handleResponse(response);
};

export const checkApiStatus = async (): Promise<{ ok: boolean; message?: string }> => {
    try {
        const response = await fetch(API_BASE_URL);
        if (response.ok) {
            return { ok: true };
        }
        return { ok: false, message: `A API retornou um status não esperado: ${response.status}` };
    } catch (error) {
        return { ok: false, message: 'Não foi possível conectar à API. Verifique se o servidor backend está em execução.' };
    }
};

export const getTermoTemplates = async (): Promise<{ entregaTemplate: string, devolucaoTemplate: string }> => {
    const response = await fetch(`${API_BASE_URL}/config/termo-templates`);
    return handleResponse(response);
};

// Database Management
export const checkDatabaseBackupStatus = async (): Promise<{ hasBackup: boolean; backupTimestamp?: string }> => {
    const response = await fetch(`${API_BASE_URL}/database/backup-status`);
    return handleResponse(response);
};

export const backupDatabase = async (username: string): Promise<{ success: boolean; message: string; backupTimestamp?: string }> => {
    const response = await fetch(`${API_BASE_URL}/database/backup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    return handleResponse(response);
};

export const restoreDatabase = async (username: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/database/restore`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    return handleResponse(response);
};

export const clearDatabase = async (username: string): Promise<{ success: boolean; message: string }> => {
    const response = await fetch(`${API_BASE_URL}/database/clear`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
    });
    return handleResponse(response);
};
