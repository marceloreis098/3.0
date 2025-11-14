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
    name: string;
    checked: boolean;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    description: string;
    disabled?: boolean;
}> = ({ label, name, checked, onChange, description, disabled = false }) => (
    <div className={`py-4 ${disabled ? 'opacity-50' : ''}`}>
        <div className="flex items-center justify-between">
            <div className="flex flex-col">
                <span className="font-semibold text-gray-800 dark:text-dark-text-primary">{label}</span>
                <span className="text-sm text-gray-500 dark:text-dark-text-secondary">{description}</span>
            </div>
            <label htmlFor={name} className="flex items-center cursor-pointer">
                <div className="relative">
                    <input 
                        id={name} 
                        name={name} 
                        type="checkbox" 
                        className="sr-only" 
                        checked={checked} 
                        onChange={onChange} 
                        disabled={disabled}
                    />
                    <div className={`block w-14 h-8 rounded-full ${checked ? 'bg-brand-primary' : 'bg-gray-300 dark:bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'transform translate-x-6' : ''}`}></div>
                </div>
            </label>
        </div>
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
                    require2fa: data.require2fa || false,
                    hasInitialConsolidationRun: data.hasInitialConsolidationRun || false,
                });
                
                setTermoEntregaTemplate(data.termo_entrega_template || DEFAULT_ENTREGA_TEMPLATE);
                setTermoDevolucaoTemplate(data.termo_devolucao_template || DEFAULT_DEVOLUCAO_TEMPLATE);
                setBackupStatus(dbBackupStatus);

                const currentProductNames = new Set<string>();
                licenses.forEach(l => currentProductNames.add(l.produto));
                Object.keys(totals).forEach(p => currentProductNames.add(p));
                setProductNames([...currentProductNames].sort());

            } catch (error) {
                console.error("Failed to fetch settings data:", error);
            }
        }
        
        await checkGeminiApiKeyStatus();
        setIsLoading(false);
    }, [currentUser]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setSettings(prev => ({ ...prev, [name]: checked }));
        } else {
            setSettings(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSave = async (section: string, dataToSave: any) => {
        setIsSaving(true);
        try {
            const result = await saveSettings(dataToSave, currentUser.username);
            if (result.success) {
                alert(`Configurações de ${section} salvas com sucesso!`);
            } else {
                alert(`Erro ao salvar configurações: ${result.message}`);
            }
        } catch (error: any) {
            alert(`Erro: ${error.message}`);
        } finally {
            setIsSaving(false);
            fetchAllData(); // Re-fetch all data to ensure consistency
        }
    };
    
     const handleDatabaseAction = async (action: 'backup' | 'restore' | 'clear') => {
        const actionMap = {
            backup: { confirm: "Tem certeza que deseja criar um novo backup do banco de dados? Isso sobrescreverá o backup anterior.", func: backupDatabase },
            restore: { confirm: "ATENÇÃO: Isso substituirá TODOS os dados atuais pelos dados do último backup. Esta ação é irreversível. Deseja continuar?", func: restoreDatabase },
            clear: { confirm: "PERIGO: Esta ação irá APAGAR TODOS os dados do inventário, licenças, usuários (exceto 'admin') e configurações. Esta ação é IRREVERSÍVEL. Tem certeza absoluta?", func: clearDatabase }
        };

        if (!window.confirm(actionMap[action].confirm)) return;

        setIsDatabaseActionLoading(true);
        try {
            const result = await actionMap[action].func(currentUser.username);
            if (result.success) {
                alert(result.message);
                if (action === 'restore' || action === 'clear') {
                     window.location.reload();
                } else {
                    fetchAllData();
                }
            } else {
                alert(`Erro: ${result.message}`);
            }
        } catch (error: any) {
             alert(`Erro: ${error}`);
        } finally {
            setIsDatabaseActionLoading(false);
        }
    };

    const handleSelectGeminiKey = async () => {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
            await window.aistudio.openSelectKey();
            // Assume success to avoid race condition and re-check
            setHasGeminiApiKey(true);
        } else {
            alert("A funcionalidade de seleção de chave não está disponível neste ambiente.");
        }
    };

    const renderGeneralSettings = () => (
        <div>
            <h3 className="text-xl font-bold mb-4">Configurações Gerais</h3>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Nome da Empresa</label>
                    <input type="text" name="companyName" value={settings.companyName || ''} onChange={handleChange} className="mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                </div>
                 <button onClick={() => handleSave('Gerais', { companyName: settings.companyName })} disabled={isSaving} className="bg-brand-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                    {isSaving ? 'Salvando...' : 'Salvar Configurações Gerais'}
                 </button>
            </div>
        </div>
    );
    
    const renderSecuritySettings = () => (
        <div>
            <h3 className="text-xl font-bold mb-4">Segurança</h3>
            <div className="divide-y dark:divide-dark-border">
                <SettingsToggle
                    label="Habilitar Single Sign-On (SSO) via SAML"
                    name="isSsoEnabled"
                    checked={settings.isSsoEnabled || false}
                    onChange={handleChange}
                    description="Permite que os usuários façam login usando um provedor de identidade externo."
                />
                <div className={`${!(settings.isSsoEnabled) ? 'opacity-50' : ''}`}>
                    <div className="py-3 space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">URL de Login do Provedor de Identidade (IdP)</label>
                        <input type="text" name="ssoUrl" value={settings.ssoUrl || ''} onChange={handleChange} disabled={!settings.isSsoEnabled} className="w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800 disabled:bg-gray-200 dark:disabled:bg-gray-700" />
                    </div>
                    {/* Other SSO fields would go here */}
                </div>
                
                 <SettingsToggle
                    label="Habilitar Autenticação de Dois Fatores (2FA) Globalmente"
                    name="is2faEnabled"
                    checked={settings.is2faEnabled || false}
                    onChange={handleChange}
                    description="Permite que os usuários ativem o 2FA em seus perfis."
                />
                 <SettingsToggle
                    label="Exigir 2FA para todos os usuários (exceto SSO)"
                    name="require2fa"
                    checked={settings.require2fa || false}
                    onChange={handleChange}
                    description="Força os usuários a configurarem o 2FA no próximo login."
                    disabled={!settings.is2faEnabled}
                />
            </div>
             <button onClick={() => handleSave('Segurança', { isSsoEnabled: settings.isSsoEnabled, ssoUrl: settings.ssoUrl, is2faEnabled: settings.is2faEnabled, require2fa: settings.require2fa })} disabled={isSaving} className="mt-6 bg-brand-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                {isSaving ? 'Salvando...' : 'Salvar Configurações de Segurança'}
             </button>
        </div>
    );

    const renderDatabaseSettings = () => (
        <div>
            <h3 className="text-xl font-bold mb-4">Gerenciamento do Banco de Dados</h3>
            <div className="space-y-6">
                <div className="p-4 border dark:border-dark-border rounded-lg">
                    <h4 className="font-semibold">Backup e Restauração</h4>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                        {backupStatus?.hasBackup 
                            ? `Último backup realizado em: ${new Date(backupStatus.backupTimestamp!).toLocaleString()}`
                            : 'Nenhum backup encontrado.'}
                    </p>
                    <div className="flex flex-wrap gap-3">
                         <button onClick={() => handleDatabaseAction('backup')} disabled={isDatabaseActionLoading} className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400">
                             <Icon name="DatabaseBackup" size={16}/> {isDatabaseActionLoading ? '...' : 'Criar Backup Agora'}
                         </button>
                         <button onClick={() => handleDatabaseAction('restore')} disabled={isDatabaseActionLoading || !backupStatus?.hasBackup} className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center gap-2 disabled:bg-gray-400">
                            <Icon name="History" size={16}/> {isDatabaseActionLoading ? '...' : 'Restaurar Último Backup'}
                         </button>
                    </div>
                </div>
                <div className="p-4 border border-red-500 rounded-lg">
                    <h4 className="font-semibold text-red-600 dark:text-red-400">Zona de Perigo</h4>
                    <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                       Ação irreversível que apaga todos os dados do sistema.
                    </p>
                    <button onClick={() => handleDatabaseAction('clear')} disabled={isDatabaseActionLoading} className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 disabled:bg-gray-400">
                        <Icon name="Trash2" size={16}/> {isDatabaseActionLoading ? '...' : 'Zerar Banco de Dados'}
                    </button>
                </div>
            </div>
        </div>
    );

    const renderIntegrationSettings = () => (
        <div>
            <h3 className="text-xl font-bold mb-4">Integrações</h3>
            <div className="p-4 border dark:border-dark-border rounded-lg">
                <h4 className="font-semibold flex items-center gap-2">Google Gemini API
                   {isCheckingGeminiKey ? <Icon name="LoaderCircle" className="animate-spin" /> : 
                     hasGeminiApiKey === true ? <Icon name="CircleCheck" className="text-green-500"/> :
                     hasGeminiApiKey === false ? <Icon name="TriangleAlert" className="text-red-500"/> : null}
                </h4>
                <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                    Necessário para as funcionalidades de IA, como o assistente de relatórios.
                </p>
                <div className="flex items-center gap-3">
                    <button onClick={handleSelectGeminiKey} className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700">
                        {hasGeminiApiKey ? 'Trocar Chave de API' : 'Selecionar Chave de API'}
                    </button>
                </div>
            </div>
        </div>
    );

     const renderImportSettings = () => (
        <div>
            <h3 className="text-xl font-bold mb-4">Importação e Atualização de Dados</h3>
            
            <div className="mb-8">
                {settings.hasInitialConsolidationRun ? (
                    <div className="p-4 bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 text-green-800 dark:text-green-200 rounded-lg flex items-center gap-3">
                        <Icon name="CircleCheck" size={24} />
                        <div>
                            <h4 className="font-bold">Consolidação Inicial Concluída</h4>
                            <p>O inventário de equipamentos foi inicializado. Você agora pode realizar atualizações periódicas.</p>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200 rounded-lg flex items-center gap-3">
                        <Icon name="TriangleAlert" size={24} />
                        <div>
                             <h4 className="font-bold">Ação Necessária: Consolidação Inicial</h4>
                            <p>A ferramenta de consolidação deve ser executada uma vez para criar a base inicial do inventário de equipamentos.</p>
                        </div>
                    </div>
                )}
            </div>

            <DataConsolidation currentUser={currentUser} />
            <LicenseImport currentUser={currentUser} productNames={productNames} onImportSuccess={fetchAllData} />
            {settings.hasInitialConsolidationRun && <PeriodicUpdate currentUser={currentUser} onUpdateSuccess={fetchAllData} />}
        </div>
    );

     const renderTermoSettings = () => (
        <div>
             <h3 className="text-xl font-bold mb-4">Modelos de Termos</h3>
             <p className="text-sm text-gray-500 dark:text-dark-text-secondary mb-4">
                Edite os templates HTML para os termos de entrega e devolução. Use os placeholders como `{{USUARIO}}` para inserir dados dinâmicos.
             </p>
            <div className="space-y-6">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Template do Termo de Entrega</label>
                    <textarea value={termoEntregaTemplate} onChange={(e) => setTermoEntregaTemplate(e.target.value)} rows={10} className="font-mono mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-dark-text-secondary">Template do Termo de Devolução</label>
                    <textarea value={termoDevolucaoTemplate} onChange={(e) => setTermoDevolucaoTemplate(e.target.value)} rows={10} className="font-mono mt-1 w-full p-2 border dark:border-dark-border rounded-md bg-white dark:bg-gray-800" />
                </div>
            </div>
            <button onClick={() => handleSave('Termos', { termo_entrega_template: termoEntregaTemplate, termo_devolucao_template: termoDevolucaoTemplate })} disabled={isSaving} className="mt-6 bg-brand-primary text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
                {isSaving ? 'Salvando...' : 'Salvar Templates'}
            </button>
        </div>
    );

    const tabs = [
        { id: 'general', label: 'Geral', icon: 'Settings' },
        { id: 'security', label: 'Segurança', icon: 'Shield' },
        { id: 'database', label: 'Banco de Dados', icon: 'Database' },
        { id: 'integration', label: 'Integrações', icon: 'Waypoints' },
        { id: 'import', label: 'Importação', icon: 'CloudUpload' },
        { id: 'termo', label: 'Termos', icon: 'FileText' },
    ];
    
    if (isLoading) return <div className="flex justify-center items-center h-full"><Icon name="LoaderCircle" className="animate-spin text-brand-primary" size={48} /></div>;

    return (
        <div className="bg-white dark:bg-dark-card p-4 sm:p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-brand-dark dark:text-dark-text-primary mb-6">Configurações do Sistema</h2>
            <div className="flex flex-col lg:flex-row gap-8">
                <nav className="flex-shrink-0 lg:w-1/4">
                    <ul className="space-y-2">
                        {tabs.map(tab => (
                            <li key={tab.id}>
                                <button
                                    onClick={() => setActiveSettingsTab(tab.id as any)}
                                    className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg text-left transition-colors ${
                                        activeSettingsTab === tab.id
                                            ? 'bg-brand-primary text-white'
                                            : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                                    }`}
                                >
                                    <Icon name={tab.icon as any} size={20} />
                                    <span>{tab.label}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>
                <div className="flex-grow">
                    {activeSettingsTab === 'general' && renderGeneralSettings()}
                    {activeSettingsTab === 'security' && renderSecuritySettings()}
                    {activeSettingsTab === 'database' && renderDatabaseSettings()}
                    {activeSettingsTab === 'integration' && renderIntegrationSettings()}
                    {activeSettingsTab === 'import' && renderImportSettings()}
                    {activeSettingsTab === 'termo' && renderTermoSettings()}
                </div>
            </div>
        </div>
    );
};

export default Settings;