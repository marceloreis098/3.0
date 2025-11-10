import { User, Equipment, License, UserRole, EquipmentHistory, AuditLogEntry, AppSettings } from '../types';

const handleResponse = async (response: Response) => {
    // FIX: Check for "No Content" status and return early to avoid JSON parsing errors on empty responses.
    if (response.status === 2