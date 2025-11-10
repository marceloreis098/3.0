import React, { useState, useEffect, useCallback } from 'react';
import { User, UserRole, AppSettings, License } from '../types';
import Icon from './common/Icon';
import { getSettings, saveSettings, checkApiStatus, checkDatabaseBackupStatus, backupDatabase, restoreDatabase, clearDatabase, getLicenseTotals, getLicenses } from '../services/apiService';
import DataConsolidation from './DataConsolidation';
import LicenseImport from './LicenseImport'; // Novo import
import PeriodicUpdate from './PeriodicUpdate';

interface SettingsProps {
    currentUser: User;
    onUserUpdate: (updatedUser: User) => void;
}

const DEFAULT_ENTREGA_TEMPLATE = `
<div class="text-center mb-6">
    <h1 class="text-2xl font-bold uppercase">TERMO DE RESPONSABILIDADE</h1>
    <p class="text-md mt-2">Utilização de Equipamento de Propriedade da Empresa</p>
</div>
<div class="space-y-4">
    <p><strong>Empresa:</strong> {{EMPRESA}}</p>
    <p><strong>Colaborador(a):</strong> {{USUARIO}}</p>
</div>
<div class="mt-6 border-t pt-4">
    <h2 class="font-bold mb-2">Detalhes do Equipamento:</h2>
    <ul class="list-disc list-inside space-y-1">
        <li><strong>Equipamento:</strong> {{EQUIPAMENTO}}</li>
        <li><strong>Patrimônio:</strong> {{PATRIMONIO}}</li>
        <li><strong>Serial:</strong> {{SERIAL}}</li>
    </ul>
</div>
<div class="mt-6 text-justify space-y-3">
    <p>Declaro, para todos os fins, ter recebido da empresa {{EMPRESA}} o equipamento descrito acima, em perfeitas condições de uso e funcionamento, para meu uso exclusivo no desempenho de minhas funções profissionais.</p>
    <p>Comprometo-me a zelar pela guarda, conservação e bom uso do equipamento, utilizando-o de acordo com as políticas de segurança e normas da empresa. Estou ciente de que o equipamento é uma ferramenta de trabalho e não deve ser utilizado para fins pessoais não autorizados.</p>
    <p>Em caso de dano, perda, roubo ou qualquer outro sinistro, comunicarei imediatamente meu gestor direto e o departamento de TI. Comprometo-me a devolver o equipamento nas mesmas condições em que o recebi, ressalvado o desgaste natural pelo uso normal, quando solicitado pela empresa ou ao término do meu contrato de trabalho.</p>
</div>
<div class="mt-12 text-center">
    <p>________________________________________________</p>
    <p class="mt-1 font-semibold">{{USUARIO}}</p>
</div>
<div class="mt-8 text-center">
    <p>Local e Data: {{DATA}}</p>
</div>
`;

const DEFAULT_DEVOLUCAO_TEMPLATE = `
<div class="text-center mb-6">
    <h1 class="text-2xl font-bold uppercase">TERMO DE DEVOLUÇÃO DE EQUIPAMENTO</h1>
    <p class="text-md mt-2">Devolução de Equipamento de Propriedade da Empresa</p>
</div>
<div class="space-y-4">
    <p><strong>Empresa:</strong> {{EMPRESA}}</p>
    <p><strong>Colaborador(a):</strong> {{USUARIO}}</p>
</div>
<div class="mt-6 border-t pt-4">
    <h2 class="font-bold mb-2">Detalhes do Equipamento:</h2>
    <ul class="list-disc list-inside space-y-1">
        <li><strong>Equipamento:</strong> {{EQUIPAMENTO}}</li>
        <li><strong>Patrimônio:</strong> {{PATRIMONIO}}</li>
        <li><strong>Serial:</strong> {{SERIAL}}</li>
    </ul>
</div>
<div class="mt-6 text-justify space-y-3">
    <p>Declaro, para todos os fins, ter devolvido à empresa {{EMPRESA}} o equipamento descrito acima, que estava sob minha responsabilidade para uso profissional.</p>
    <p>O equipamento foi devolvido nas mesmas condições em que o recebi, ressalvado o desgaste natural pelo uso normal, na data de {{DATA_DEVOLUCAO}}.</p>
</div>
<div class="mt-12 text-center">
    <p>________________________________________________</p>
    <p class="mt-1 font-semibold">{{USUARIO}}</p>
</div>
<div class="mt-8 text-center">
    <p>Local e Data: {{DATA}}</p>
</div>
`;


const SettingsToggle: React.FC<{
    label: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    name: string;
    description?: string;
    disabled?: boolean;
}> = ({ label, checked, onChange, name, description, disabled = false }) => (
    <div className="flex items-center justify-between py-3">
        <div>
            <label htmlFor={name} className={`font-medium text-gray-800 dark:text-dark-text-primary ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {label}
            </label>
            {description && <p className={`text-sm text-gray-500 dark:text-dark-text-secondary mt-1 ${disabled ? 'opacity-50' : ''}`}>{description}</p>}
        </div>
        <label htmlFor={name} className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input 
                type="checkbox" 
                id={name}
                name={name}
                checked={checked} 
                onChange={onChange}
                className="sr-only peer"
                disabled={disabled}
            />
            <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-brand-primary"></div>
        </label>
    </div>
);


const Settings: React.FC<SettingsProps> = ({ currentUser }) => {
    const [settings, setSettings] = useState<Partial<AppSettings>>({
        isSsoEnabled: false,
        is2faEnabled: false,
        require2fa: false,
        hasInitialConsolidationRun: false,
    });
    const [termoEntregaTemplate, setTermoEntregaTemplate] = useState('');
    const [termoDevolucaoTemplate, setTermoDevolucaoTemplate] = useState('');
    const [apiStatus, setApiStatus] = useState<{ ok: boolean; message?: string } | null>(null);
    const [hasGeminiApiKey, setHasGeminiApiKey] = useState<boolean | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isCheckingGeminiKey, setIsCheckingGeminiKey] = useState(false);
    const [backupStatus, setBackupStatus] = useState<{ hasBackup: boolean; backupTimestamp?: string } | null>(null);
    const [isDatabaseActionLoading, setIsDatabaseActionLoading] = useState(false);
    const [activeSettingsTab, setActiveSettingsTab] = useState<'general' | 'security' | 'database' | 'integration' | 'import' | 'termo'>('general');
    const [productNames, setProductNames] = useState<string[]>([]);


    const checkGeminiApiKeyStatus = async () => {
        setIsCheckingGeminiKey(true);
        try {
            if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
                const hasKey = await window.aistudio.hasSelectedApiKey();
                setHasGeminiApiKey(hasKey);
            } else {
                setHasGeminiApiKey(true); 
                console.warn("window.aistudio.hasSelectedApiKey não está disponível. Gerenciamento de chave Gemini via UI desativado.");
            }
        } catch (error) {
            console.error("Erro ao verificar status da chave Gemini:", error);
            setHasGeminiApiKey(false);
        } finally {
            setIsCheckingGeminiKey(false);
        }
    };

    const fetchAllData = useCallback(async () => {
        setIsLoading(true);
        
        const status = await checkApiStatus();
        setApiStatus(status);

        if (currentUser.role === UserRole.Admin) {
            try {
                const [data, dbBackupStatus, totals, licenses] = await Promise.all([
                    getSettings(),
                    checkDatabaseBackupStatus(),
                    getLicenseTotals(),
                    getLicenses(currentUser)
                ]);

                setSettings({
                    ...data,
                    isSsoEnabled: data.isSsoEnabled || false,
                    is2faEnabled: data.is2faEnabled || false,