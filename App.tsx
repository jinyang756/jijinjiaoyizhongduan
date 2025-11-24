
import React, { useState, createContext, Suspense, lazy, useEffect, useContext } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, PieChart, Wallet, Building2, Calculator, Home, Menu, User as UserIcon, Database, FileCheck, Users, LogOut, TrendingUp, Coins, Settings, ShieldCheck, Activity, BarChart3, Headphones, UserCog } from 'lucide-react';

import { AppContextType, User, UserPosition, TransactionRecord, FundViewModel, FundNav, SysConfig, DividendRecord, OperationLog, BacktestTask, ChatSession, ChatMessage } from './types';
import CustomerService from './components/CustomerService';
import { generateMockHistory } from './services/simulationService';
// import { ApiService } from './api/services'; // Disable API for Mock Mode

// Lazy Load Components
const Dashboard = lazy(() => import('./components/Dashboard'));
const FundMarket = lazy(() => import('./components/FundMarket'));
const Portfolio = lazy(() => import('./components/Portfolio'));
const OfficialSite = lazy(() => import('./components/OfficialSite'));
const Login = lazy(() => import('./components/Login'));
const QualifiedInvestor = lazy(() => import('./components/QualifiedInvestor'));
const Tools = lazy(() => import('./components/Tools'));

// Admin Components
const AdminDashboard = lazy(() => import('./components/AdminDashboard'));
const AdminFundManager = lazy(() => import('./components/AdminFundManager'));
const AdminTransactionAudit = lazy(() => import('./components/AdminTransactionAudit'));
const AdminNavManager = lazy(() => import('./components/AdminNavManager'));
const AdminAssetManager = lazy(() => import('./components/AdminAssetManager'));
const AdminReports = lazy(() => import('./components/AdminReports'));
const AdminSettings = lazy(() => import('./components/AdminSettings'));
const AdminSecurity = lazy(() => import('./components/AdminSecurity'));
const AdminSimulation = lazy(() => import('./components/AdminSimulation'));
const AdminCustomerService = lazy(() => import('./components/AdminCustomerService'));
const AdminUserManager = lazy(() => import('./components/AdminUserManager')); // New

// Initial Mock State
const initialUser: User = {
    id: 1,
    username: 'u001',
    realName: '尊贵客户',
    userType: 2, // 投资者
    virtualAccount: 'JC888888',
    accountBalance: 500000,
    unsettledCash: 0,
    status: 1, // 正常
    riskLevel: 5, // Default to C5
    riskLevelLabel: 'C5 (激进型)',
    extJson: {
        isQualifiedInvestor: false,
        phone: ''
    },
    createTime: new Date().toISOString()
};

const initialSysConfig: SysConfig = {
    largeTxThreshold: 100000,
    defaultSubFee: 0.015,
    defaultRedeemFee: 0.005,
    platformName: '聚财众发交易系统',
    enableAutoAudit: false,
    navUpdateFreq: 'daily',
    riskAlertThreshold: 10,
    features: {
        enableSIP: true,
        enableDividend: true
    }
};

// Initial Funds Data (Lifted from FundMarket)
const initialFunds: FundViewModel[] = [
    { 
        id: 1, fundName: '聚财稳健增长混合A', fundCode: 'JC001', fundType: 3, fundTypeLabel: '混合型',
        riskLevel: 3, riskLevelLabel: '中风险 (C3)', 
        nav: 1.5420, navAccumulated: 2.1420, dailyReturnRate: 1.25, 
        yearToDate: 12.45, maxDrawdown: -8.5, sharpeRatio: 1.8, issueDate: '2018-05-20',
        lockupPeriod: 7, navInitial: 1.0, subscriptionFeeRate: 0.0015, redemptionFeeRate: 0.005,
        managementFeeRate: 0.015, status: 2, statusLabel: '存续期', simulateSettlementDays: 3,
        extJson: { manager: '王强', strategy: '主观多头', description: '聚焦蓝筹白马，追求长期稳健增值。' },
        createTime: '', updateTime: ''
    },
    { 
        id: 2, fundName: '聚财科技先锋股票', fundCode: 'JC002', fundType: 1, fundTypeLabel: '股票型',
        riskLevel: 4, riskLevelLabel: '中高风险 (C4)', 
        nav: 2.1050, navAccumulated: 2.1050, dailyReturnRate: -0.85, 
        yearToDate: 25.60, maxDrawdown: -15.2, sharpeRatio: 1.2, issueDate: '2020-03-15',
        lockupPeriod: 30, navInitial: 1.0, subscriptionFeeRate: 0.0015, redemptionFeeRate: 0.005,
        managementFeeRate: 0.015, status: 2, statusLabel: '存续期', simulateSettlementDays: 3,
        extJson: { manager: '李明', strategy: '行业轮动', description: '布局人工智能、新能源等高成长赛道。' },
        createTime: '', updateTime: ''
    },
    { 
        id: 3, fundName: '聚财纯债债券C', fundCode: 'JC003', fundType: 2, fundTypeLabel: '债券型',
        riskLevel: 2, riskLevelLabel: '中低风险 (C2)', 
        nav: 1.0580, navAccumulated: 1.3580, dailyReturnRate: 0.05, 
        yearToDate: 4.20, maxDrawdown: -1.2, sharpeRatio: 2.5, issueDate: '2019-01-10',
        lockupPeriod: 1, navInitial: 1.0, subscriptionFeeRate: 0, redemptionFeeRate: 0.001,
        managementFeeRate: 0.008, status: 2, statusLabel: '存续期', simulateSettlementDays: 1,
        extJson: { manager: '张华', strategy: '债券策略', description: '主投国债金融债，低风险稳健理财。' },
        createTime: '', updateTime: ''
    },
    { 
        id: 4, fundName: '聚财激进回报专户', fundCode: 'JC004', fundType: 5, fundTypeLabel: '期货型',
        riskLevel: 5, riskLevelLabel: '高风险 (C5)', 
        nav: 3.4200, navAccumulated: 4.5000, dailyReturnRate: 2.15, 
        yearToDate: 35.80, maxDrawdown: -22.5, sharpeRatio: 1.1, issueDate: '2021-06-01',
        lockupPeriod: 180, navInitial: 1.0, subscriptionFeeRate: 0.01, redemptionFeeRate: 0.01,
        managementFeeRate: 0.02, status: 2, statusLabel: '存续期', simulateSettlementDays: 5,
        extJson: { manager: '赵雷', strategy: '管理期货', description: '杠杆策略，追求超额收益，高风险。' },
        createTime: '', updateTime: ''
    },
    { 
        id: 5, fundName: '聚财量化中性一号', fundCode: 'JC005', fundType: 3, fundTypeLabel: '混合型',
        riskLevel: 3, riskLevelLabel: '中风险 (C3)', 
        nav: 1.1200, navAccumulated: 1.1200, dailyReturnRate: 0.12, 
        yearToDate: 8.50, maxDrawdown: -3.5, sharpeRatio: 2.1, issueDate: '2022-09-01',
        lockupPeriod: 90, navInitial: 1.0, subscriptionFeeRate: 0.0015, redemptionFeeRate: 0.005,
        managementFeeRate: 0.015, status: 2, statusLabel: '存续期', simulateSettlementDays: 7,
        extJson: { manager: 'System', strategy: '量化中性', description: '完全对冲市场风险，追求绝对收益。' },
        createTime: '', updateTime: ''
    }
];

// Create Context
export const AppContext = createContext<AppContextType>({} as AppContextType);

// Sidebar Component
const Sidebar = ({ isAdmin }: { isAdmin: boolean }) => {
    const location = useLocation();
    const { logout, chatSessions } = useContext(AppContext);
    
    // Count unread messages for admin
    const unreadCount = chatSessions.reduce((acc, session) => acc + (session.unreadByAdmin ? 1 : 0), 0);
    
    type NavItem = {
        path: string;
        icon: React.ElementType;
        label: string;
        badge?: number;
    };

    const userNavItems: NavItem[] = [
        { path: '/', icon: LayoutDashboard, label: '账户总览' },
        { path: '/market', icon: ShoppingCart, label: '基金超市' },
        { path: '/portfolio', icon: PieChart, label: '我的持仓' },
        { path: '/tools', icon: Calculator, label: '投资工具' },
    ];

    const adminNavItems: NavItem[] = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: '管理总览' },
        { path: '/admin/reports', icon: BarChart3, label: '数据报表' },
        { path: '/admin/users', icon: UserCog, label: '用户管理' }, // New
        { path: '/admin/funds', icon: Database, label: '产品发行' },
        { path: '/admin/assets', icon: Coins, label: '持仓分红' },
        { path: '/admin/nav', icon: TrendingUp, label: '净值管理' },
        { path: '/admin/transactions', icon: FileCheck, label: '交易清算' },
        { path: '/admin/service', icon: Headphones, label: '在线客服', badge: unreadCount },
        { path: '/admin/simulation', icon: Activity, label: '系统沙箱' },
        { path: '/admin/settings', icon: Settings, label: '系统配置' },
        { path: '/admin/security', icon: ShieldCheck, label: '安全权限' },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    return (
        <div className={`w-64 border-r h-screen hidden md:flex flex-col sticky top-0 z-20 ${isAdmin ? 'bg-gray-900 border-gray-800 text-white' : 'bg-white border-gray-200'}`}>
            <div className={`p-6 border-b ${isAdmin ? 'border-gray-800' : 'border-gray-100'}`}>
                <div className={`flex items-center gap-2 ${isAdmin ? 'text-white' : 'text-blue-700'}`}>
                    <Wallet className="w-8 h-8" />
                    <div>
                        <h1 className="font-bold text-lg leading-tight">聚财众发</h1>
                        <p className={`text-xs ${isAdmin ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isAdmin ? '基金管理后台' : '专业交易系统'}
                        </p>
                    </div>
                </div>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto no-scrollbar">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const activeClass = isAdmin 
                        ? 'bg-gray-800 text-white font-medium shadow-sm border border-gray-700' 
                        : 'bg-blue-50 text-blue-700 font-medium';
                    const inactiveClass = isAdmin
                        ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700';

                    return (
                        <Link 
                            key={item.path} 
                            to={item.path}
                            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                                isActive ? activeClass : inactiveClass
                            }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5" />
                                {item.label}
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    );
                })}
                
                <div className={`pt-4 mt-4 border-t ${isAdmin ? 'border-gray-800' : 'border-gray-100'}`}>
                    <button 
                        onClick={logout}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isAdmin ? 'text-red-400 hover:bg-gray-800 hover:text-red-300' : 'text-red-500 hover:bg-red-50'}`}
                    >
                        <LogOut className="w-5 h-5" />
                        退出登录
                    </button>
                    <Link to="/website" className={`flex items-center gap-3 px-4 py-3 rounded-xl mt-2 ${isAdmin ? 'text-gray-500 hover:text-white hover:bg-gray-800' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'}`}>
                        <Building2 className="w-5 h-5" /> 返回官网
                    </Link>
                </div>
            </nav>
        </div>
    );
};

// Mobile Bottom Navigation
const MobileNav = ({ isAdmin }: { isAdmin: boolean }) => {
    const location = useLocation();
    
    const userNavItems = [
        { path: '/', icon: Home, label: '首页' },
        { path: '/market', icon: ShoppingCart, label: '基金超市' },
        { path: '/portfolio', icon: PieChart, label: '持仓' },
        { path: '/tools', icon: Calculator, label: '投资工具' },
    ];
    
    const adminNavItems = [
        { path: '/admin/dashboard', icon: Home, label: '概览' },
        { path: '/admin/reports', icon: BarChart3, label: '报表' },
        { path: '/admin/service', icon: Headphones, label: '客服' },
        { path: '/admin/simulation', icon: Activity, label: '沙箱' },
    ];

    const navItems = isAdmin ? adminNavItems : userNavItems;

    return (
        <div className={`fixed bottom-0 left-0 right-0 border-t flex justify-around items-center p-2 pb- safe-area-pb z-50 md:hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] ${isAdmin ? 'bg-gray-900 border-gray-800 text-gray-400' : 'bg-white border-gray-200'}`}>
            {navItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                    <Link 
                        key={item.path} 
                        to={item.path}
                        className={`flex flex-col items-center p-2 rounded-lg w-full ${
                            isActive ? (isAdmin ? 'text-white' : 'text-blue-600') : ''
                        }`}
                    >
                        <item.icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} />
                        <span className="text-[10px] font-medium">{item.label}</span>
                    </Link>
                );
            })}
        </div>
    );
};

// Main Layout
const AppLayout: React.FC<{ children: React.ReactNode, user: User }> = ({ children, user }) => {
    // Determine admin status based on userType from state (which is restored from localStorage)
    const isAdmin = user.userType === 1; 
    return (
        <div className={`flex min-h-screen font-sans ${isAdmin ? 'bg-gray-100' : 'bg-gray-50'} text-gray-900`}>
            <Sidebar isAdmin={isAdmin} />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <div className={`md:hidden p-4 border-b flex justify-between items-center shrink-0 z-20 ${isAdmin ? 'bg-gray-900 text-white border-gray-800' : 'bg-white'}`}>
                    <div className="flex items-center gap-2">
                        <Wallet className="w-6 h-6" />
                        <h1 className="font-bold">{isAdmin ? '管理后台' : '聚财交易'}</h1>
                    </div>
                    <Link to="/website" className="text-xs bg-gray-700 text-gray-300 px-3 py-1 rounded-full">官网</Link>
                </div>
                
                <main className="flex-1 overflow-y-auto scroll-smooth pb-20 md:pb-0">
                    {children}
                </main>
                <MobileNav isAdmin={isAdmin} />
            </div>
            {!isAdmin && <CustomerService />}
        </div>
    );
};

const PageLoader = () => (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
    // 1. Initialize State with localStorage check
    const [user, setUser] = useState<User>(() => {
        try {
            const stored = localStorage.getItem('jucai_user');
            if (stored) {
                const parsedUser = JSON.parse(stored);
                // Deep merge to ensure nested objects like extJson are preserved correctly even if stored data is partial
                return { 
                    ...initialUser, 
                    ...parsedUser,
                    riskLevel: parsedUser.riskLevel || 5, // Force 5 if missing
                    riskLevelLabel: parsedUser.riskLevelLabel || 'C5 (激进型)',
                    extJson: { 
                        ...initialUser.extJson, 
                        ...(parsedUser.extJson || {}) 
                    }
                };
            }
            return initialUser;
        } catch(e) { 
            console.error("Failed to restore user session:", e);
            return initialUser; 
        }
    });

    const [managedUsers, setManagedUsers] = useState<User[]>(() => {
        try {
            const stored = localStorage.getItem('jucai_managed_users');
            return stored ? JSON.parse(stored) : [
                { ...initialUser, id: 1001, username: 'admin', realName: '系统管理员', userType: 1, permissions: ['all'], extJson: { roleName: '超级管理员', phone: 'admin' } },
                { ...initialUser, id: 1002, username: 'investor1', realName: '王小明', userType: 2, accountBalance: 500000, extJson: { isQualifiedInvestor: true, phone: '13800138000' } },
                { ...initialUser, id: 1003, username: 'investor2', realName: '李华', userType: 2, accountBalance: 100000, extJson: { isQualifiedInvestor: false, phone: '13900139000' } }
            ];
        } catch(e) { return []; }
    });

    const [sysConfig, setSysConfig] = useState<SysConfig>(() => {
        try {
            const stored = localStorage.getItem('jucai_sysconfig');
            return stored ? { ...initialSysConfig, ...JSON.parse(stored) } : initialSysConfig;
        } catch(e) { return initialSysConfig; }
    });

    const [funds, setFunds] = useState<FundViewModel[]>(() => {
        try {
            const stored = localStorage.getItem('jucai_funds');
            return stored ? JSON.parse(stored) : initialFunds;
        } catch(e) { return initialFunds; }
    });

    const [holdings, setHoldings] = useState<UserPosition[]>(() => {
        try {
            const stored = localStorage.getItem('jucai_holdings');
            return stored ? JSON.parse(stored) : [];
        } catch(e) { return []; }
    });

    const [transactions, setTransactions] = useState<TransactionRecord[]>(() => {
        try {
            const stored = localStorage.getItem('jucai_transactions');
            return stored ? JSON.parse(stored) : [];
        } catch(e) { return []; }
    });

    const [dividendRecords, setDividendRecords] = useState<DividendRecord[]>(() => {
        try {
            const stored = localStorage.getItem('jucai_dividends');
            return stored ? JSON.parse(stored) : [];
        } catch(e) { return []; }
    });

    const [operationLogs, setOperationLogs] = useState<OperationLog[]>(() => {
        try {
            const stored = localStorage.getItem('jucai_logs');
            return stored ? JSON.parse(stored) : [];
        } catch(e) { return []; }
    });

    const [chatSessions, setChatSessions] = useState<ChatSession[]>(() => {
        try {
            const stored = localStorage.getItem('jucai_chats');
            return stored ? JSON.parse(stored) : [];
        } catch(e) { return []; }
    });

    const [backtestTasks, setBacktestTasks] = useState<BacktestTask[]>([]); // Non-persistent for demo

    const [navLogs, setNavLogs] = useState<Record<number, FundNav[]>>(() => {
        try {
            const stored = localStorage.getItem('jucai_navlogs');
            if (stored) return JSON.parse(stored);
            
            const initialLogs: Record<number, FundNav[]> = {};
            initialFunds.forEach(f => {
                const chartPoints = generateMockHistory(f, 30);
                initialLogs[f.id] = chartPoints.map((p, idx) => ({
                    id: Date.now() + idx,
                    fundId: f.id,
                    navDate: p.time,
                    nav: p.value,
                    navAccumulated: p.value,
                    dailyReturnRate: 0,
                    createTime: new Date().toISOString()
                })).reverse();
                
                for (let i = 1; i < initialLogs[f.id].length; i++) {
                    const prev = initialLogs[f.id][i-1].nav;
                    const curr = initialLogs[f.id][i].nav;
                    initialLogs[f.id][i].dailyReturnRate = ((curr - prev) / prev) * 100;
                }
            });
            return initialLogs;
        } catch(e) { return {}; }
    });

    // 2. Persistence Effects
    useEffect(() => { localStorage.setItem('jucai_user', JSON.stringify(user)); }, [user]);
    useEffect(() => { localStorage.setItem('jucai_managed_users', JSON.stringify(managedUsers)); }, [managedUsers]);
    useEffect(() => { localStorage.setItem('jucai_funds', JSON.stringify(funds)); }, [funds]);
    useEffect(() => { localStorage.setItem('jucai_holdings', JSON.stringify(holdings)); }, [holdings]);
    useEffect(() => { localStorage.setItem('jucai_transactions', JSON.stringify(transactions)); }, [transactions]);
    useEffect(() => { localStorage.setItem('jucai_navlogs', JSON.stringify(navLogs)); }, [navLogs]);
    useEffect(() => { localStorage.setItem('jucai_dividends', JSON.stringify(dividendRecords)); }, [dividendRecords]);
    useEffect(() => { localStorage.setItem('jucai_sysconfig', JSON.stringify(sysConfig)); }, [sysConfig]);
    useEffect(() => { localStorage.setItem('jucai_logs', JSON.stringify(operationLogs)); }, [operationLogs]);
    useEffect(() => { localStorage.setItem('jucai_chats', JSON.stringify(chatSessions)); }, [chatSessions]);

    const login = (phone: string, isAdmin: boolean = false) => {
        if (isAdmin) {
             setUser(prev => ({ 
                 ...prev, 
                 userType: 1, 
                 realName: '系统管理员',
                 extJson: { ...prev.extJson, phone: 'admin' } 
             }));
             logOperation('LOGIN', 'System', '管理员登录成功');
        } else {
             // Find in managed users or create dummy
             const found = managedUsers.find(u => u.extJson?.phone === phone);
             if (found) {
                 setUser(found);
             } else {
                 setUser(prev => ({ 
                    ...prev, 
                    userType: 2,
                    realName: '尊贵客户',
                    extJson: { ...prev.extJson, phone } 
                }));
             }
        }
    };

    const logout = () => {
        logOperation('LOGOUT', 'System', '用户/管理员退出登录');
        const resetUser = { ...initialUser };
        setUser(resetUser);
        
        // Clear all persistent data on logout to simulate full session clear
        // In a real app, you might want to keep some non-sensitive data
        setHoldings([]);
        setTransactions([]);
        
        localStorage.removeItem('jucai_user');
        localStorage.removeItem('jucai_holdings');
        localStorage.removeItem('jucai_transactions');
        localStorage.removeItem('jucai_dividends');
        localStorage.removeItem('jucai_logs');
        localStorage.removeItem('token'); // Clear auth token if exists
    };

    const certifyInvestor = () => {
        setUser(prev => ({ 
            ...prev, 
            extJson: { ...prev.extJson, isQualifiedInvestor: true } 
        }));
    };

    const updateUserRisk = (score: number, level: number, label: string) => {
        setUser(prev => ({ 
            ...prev, 
            riskLevel: level,
            riskLevelLabel: label,
            extJson: { ...prev.extJson, riskScore: score }
        }));
    };

    const logOperation = (action: string, target: string, content: string) => {
        const newLog: OperationLog = {
            id: Date.now(),
            operatorId: user.id,
            operatorName: user.realName || user.username,
            actionType: action,
            targetObject: target,
            content: content,
            ipAddress: '192.168.1.1', // Mock
            createTime: new Date().toISOString()
        };
        setOperationLogs(prev => [newLog, ...prev]);
    };

    // Chat Logic
    const sendUserMessage = (text: string, image?: string) => {
        if (!user.id) return;
        const sessionId = `s_${user.id}`;
        
        setChatSessions(prev => {
            const existing = prev.find(s => s.sessionId === sessionId);
            const newMessage: ChatMessage = {
                id: `m_${Date.now()}`,
                sender: 'user',
                text,
                image,
                timestamp: new Date().toISOString()
            };

            if (existing) {
                return prev.map(s => s.sessionId === sessionId ? {
                    ...s,
                    messages: [...s.messages, newMessage],
                    unreadByAdmin: true,
                    lastActiveTime: new Date().toISOString()
                } : s);
            } else {
                return [...prev, {
                    sessionId,
                    userId: user.id,
                    userName: user.realName || `User ${user.id}`,
                    messages: [newMessage],
                    unreadByAdmin: true,
                    unreadByUser: false,
                    lastActiveTime: new Date().toISOString()
                }];
            }
        });
    };

    const sendAdminMessage = (sessionId: string, text: string) => {
        setChatSessions(prev => prev.map(s => {
            if (s.sessionId === sessionId) {
                return {
                    ...s,
                    messages: [...s.messages, {
                        id: `m_${Date.now()}`,
                        sender: 'agent',
                        text,
                        timestamp: new Date().toISOString()
                    }],
                    unreadByUser: true,
                    lastActiveTime: new Date().toISOString()
                };
            }
            return s;
        }));
    };

    const markSessionRead = (sessionId: string) => {
        setChatSessions(prev => prev.map(s => {
             if (s.sessionId === sessionId) {
                 return { ...s, unreadByAdmin: false };
             }
             return s;
        }));
    };

    const buyFund = async (fund: FundViewModel, amount: number, signature: string): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                if (user.accountBalance < amount) {
                    resolve({ success: false, message: '账户余额不足' });
                    return;
                }

                const feeRate = fund.subscriptionFeeRate || sysConfig.defaultSubFee;
                const netAmount = amount / (1 + feeRate);
                const fee = amount - netAmount;
                const nav = fund.nav || fund.navInitial || 1.0;
                const shares = netAmount / nav;

                setUser(prev => ({ ...prev, accountBalance: prev.accountBalance - amount }));

                const now = new Date();
                const coolingOffDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();

                const newTx: TransactionRecord = {
                    id: Date.now(),
                    tradeNo: 'TX' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    userId: user.id,
                    fundId: fund.id,
                    tradeType: 1, // 申购
                    tradeTypeLabel: '申购',
                    tradeAmount: amount,
                    tradeShares: shares,
                    navDate: new Date().toISOString().split('T')[0],
                    nav: nav,
                    feeAmount: fee,
                    actualAmount: amount,
                    tradeStatus: 5, // 冷静期
                    tradeStatusLabel: '冷静期',
                    applyTime: now.toISOString(),
                    coolingOffDeadline: coolingOffDeadline,
                    contractSignTime: now.toISOString(),
                    signature: signature,
                    fundInfo: {
                        fundCode: fund.fundCode,
                        fundName: fund.fundName
                    }
                };
                setTransactions(prev => [...prev, newTx]);

                // Auto-create holding logic (duplicated for mock simplicity)
                setHoldings(prev => {
                    const existing = prev.find(h => h.fundId === fund.id);
                    if (existing) {
                        const newShares = existing.holdShares + shares;
                        const newTotalCost = (existing.averageCost * existing.holdShares) + amount; 
                        return prev.map(h => h.fundId === fund.id ? {
                            ...h,
                            holdShares: newShares,
                            averageCost: newTotalCost / newShares,
                            totalAsset: newShares * nav,
                            latestNav: nav,
                            profitAmount: (newShares * nav) - (newTotalCost / newShares * newShares), 
                            profitRate: 0 
                        } : h);
                    } else {
                        return [...prev, {
                            id: Date.now(),
                            userId: user.id,
                            fundId: fund.id,
                            holdShares: shares,
                            averageCost: nav, 
                            holdDays: 0,
                            latestNav: nav,
                            totalAsset: netAmount, 
                            profitAmount: 0,
                            profitRate: 0,
                            fundInfo: {
                                fundCode: fund.fundCode,
                                fundName: fund.fundName,
                                fundTypeLabel: fund.fundTypeLabel,
                                simulateSettlementDays: fund.simulateSettlementDays
                            }
                        }];
                    }
                });

                resolve({ success: true, message: '合同签署成功，交易已进入冷静期' });
            }, 1000);
        });
    };

    const redeemFund = async (fundId: number, shares: number): Promise<{ success: boolean; message: string }> => {
        return new Promise((resolve) => {
            setTimeout(() => {
                const holding = holdings.find(h => h.fundId === fundId);
                if (!holding || holding.holdShares < shares) {
                    resolve({ success: false, message: '持有份额不足' });
                    return;
                }

                const nav = holding.latestNav;
                const grossAmount = shares * nav;
                const feeRate = sysConfig.defaultRedeemFee; 
                const fee = grossAmount * feeRate;
                const netAmount = grossAmount - fee;
                const cycle = holding.fundInfo.simulateSettlementDays || 3;
                const arrivalDate = new Date();
                arrivalDate.setDate(arrivalDate.getDate() + cycle);

                setUser(prev => ({ 
                    ...prev, 
                    unsettledCash: (prev.unsettledCash || 0) + netAmount 
                }));

                const newTx: TransactionRecord = {
                    id: Date.now(),
                    tradeNo: 'TX' + Math.random().toString(36).substr(2, 9).toUpperCase(),
                    userId: user.id,
                    fundId: fundId,
                    tradeType: 2, // 赎回
                    tradeTypeLabel: '赎回',
                    tradeAmount: netAmount,
                    tradeShares: shares,
                    navDate: new Date().toISOString().split('T')[0],
                    nav: nav,
                    feeAmount: fee,
                    actualAmount: netAmount,
                    tradeStatus: 3, // 清算中
                    tradeStatusLabel: '清算中',
                    applyTime: new Date().toISOString(),
                    settleTime: arrivalDate.toISOString(),
                    fundInfo: {
                        fundCode: holding.fundInfo.fundCode,
                        fundName: holding.fundInfo.fundName
                    }
                };
                setTransactions(prev => [...prev, newTx]);

                setHoldings(prev => {
                    const remainingShares = holding.holdShares - shares;
                    if (remainingShares < 0.0001) {
                        return prev.filter(h => h.fundId !== fundId);
                    }
                    return prev.map(h => h.fundId === fundId ? {
                        ...h,
                        holdShares: remainingShares,
                        totalAsset: remainingShares * nav
                    } : h);
                });

                resolve({ success: true, message: `赎回申请已提交 (预计T+${cycle}日到账)` });
            }, 800);
        });
    };

    const depositCash = (amount: number) => {
        setUser(prev => ({ ...prev, accountBalance: prev.accountBalance + amount }));
        const newTx: TransactionRecord = {
            id: Date.now(),
            tradeNo: 'DEP' + Date.now(),
            userId: user.id,
            fundId: 0,
            tradeType: 3,
            tradeTypeLabel: '充值',
            tradeAmount: amount,
            nav: 1,
            navDate: new Date().toISOString(),
            feeAmount: 0,
            actualAmount: amount,
            tradeStatus: 4,
            tradeStatusLabel: '已完成',
            applyTime: new Date().toISOString()
        };
        setTransactions(prev => [...prev, newTx]);
    };

    const processSettlement = () => {
        let totalSettled = 0;
        let totalConfirmed = 0;

        setTransactions(prev => prev.map(tx => {
            if (tx.tradeStatus === 3) {
                totalSettled += tx.actualAmount;
                return { ...tx, tradeStatus: 4, tradeStatusLabel: '已完成' };
            }
            if (tx.tradeStatus === 5) { 
                totalConfirmed++;
                return { ...tx, tradeStatus: 2, tradeStatusLabel: '已确认' };
            }
            return tx;
        }));

        setUser(prev => ({
            ...prev,
            accountBalance: prev.accountBalance + totalSettled,
            unsettledCash: Math.max(0, (prev.unsettledCash || 0) - totalSettled)
        }));
    };

    // --- Admin Actions ---
    const adminAddFund = (fund: FundViewModel) => {
        setFunds(prev => [...prev, fund]);
        logOperation('CREATE_FUND', fund.fundCode, '发行新基金产品');
    };

    const adminUpdateFund = (fund: FundViewModel) => {
        setFunds(prev => prev.map(f => f.id === fund.id ? fund : f));
        logOperation('UPDATE_FUND', fund.fundCode, '更新基金基础参数');
    };

    const adminAuditTransaction = (txId: number, action: 'confirm' | 'reject', remark?: string) => {
        setTransactions(prev => prev.map(tx => {
            if (tx.id === txId) {
                if (action === 'confirm') {
                    if (tx.tradeStatus === 3) {
                        setUser(u => ({
                            ...u,
                            accountBalance: u.accountBalance + tx.actualAmount,
                            unsettledCash: Math.max(0, (u.unsettledCash || 0) - tx.actualAmount)
                        }));
                        logOperation('AUDIT_TX_CONFIRM', tx.tradeNo, '赎回确认到账');
                        return { ...tx, tradeStatus: 4, tradeStatusLabel: '已完成' };
                    }
                    if (tx.tradeStatus === 5) {
                        logOperation('AUDIT_TX_CONFIRM', tx.tradeNo, '申购确认');
                        return { ...tx, tradeStatus: 2, tradeStatusLabel: '已确认' };
                    }
                    return { ...tx, tradeStatus: 2, tradeStatusLabel: '已确认' };
                } else {
                    if (tx.tradeType === 1) {
                        setUser(u => ({ ...u, accountBalance: u.accountBalance + tx.actualAmount }));
                    }
                    if (tx.tradeType === 2 && tx.tradeShares) {
                         setHoldings(prevH => {
                             const existing = prevH.find(h => h.fundId === tx.fundId);
                             if (existing) {
                                 return prevH.map(h => h.fundId === tx.fundId ? {
                                     ...h,
                                     holdShares: h.holdShares + (tx.tradeShares || 0),
                                     totalAsset: (h.holdShares + (tx.tradeShares || 0)) * h.latestNav
                                 } : h);
                             } else {
                                return [...prevH, {
                                    id: Date.now(),
                                    userId: tx.userId,
                                    fundId: tx.fundId,
                                    holdShares: tx.tradeShares || 0,
                                    averageCost: tx.nav,
                                    holdDays: 0,
                                    latestNav: tx.nav,
                                    totalAsset: (tx.tradeShares || 0) * tx.nav,
                                    profitAmount: 0,
                                    profitRate: 0,
                                    fundInfo: {
                                        fundCode: tx.fundInfo?.fundCode || '',
                                        fundName: tx.fundInfo?.fundName || '',
                                        fundTypeLabel: '未知', 
                                        simulateSettlementDays: 3
                                    }
                                }];
                             }
                         });
                         setUser(u => ({ ...u, unsettledCash: Math.max(0, (u.unsettledCash || 0) - tx.actualAmount) }));
                    }
                    logOperation('AUDIT_TX_REJECT', tx.tradeNo, `驳回交易: ${remark}`);
                    return { ...tx, tradeStatus: 6, tradeStatusLabel: '已驳回', remark: remark || '管理员驳回' };
                }
            }
            return tx;
        }));
    };

    const adminLiquidateFund = (fundId: number) => {
        setFunds(prev => prev.map(f => f.id === fundId ? { ...f, status: 3, statusLabel: '清算期' } : f));
        
        const targetHoldings = holdings.filter(h => h.fundId === fundId);
        targetHoldings.forEach(h => {
             const amount = h.totalAsset;
             setUser(u => ({ ...u, accountBalance: u.accountBalance + amount }));
             const newTx: TransactionRecord = {
                id: Date.now() + Math.random(),
                tradeNo: 'LIQ' + Date.now(),
                userId: h.userId,
                fundId: fundId,
                tradeType: 2, 
                tradeTypeLabel: '强制清算',
                tradeAmount: amount,
                tradeShares: h.holdShares,
                navDate: new Date().toISOString().split('T')[0],
                nav: h.latestNav,
                feeAmount: 0,
                actualAmount: amount,
                tradeStatus: 4,
                tradeStatusLabel: '已完成',
                applyTime: new Date().toISOString(),
                remark: '基金清算退款',
                fundInfo: {
                    fundCode: h.fundInfo.fundCode,
                    fundName: h.fundInfo.fundName
                }
            };
            setTransactions(prev => [...prev, newTx]);
        });

        setHoldings(prev => prev.filter(h => h.fundId !== fundId));
        logOperation('LIQUIDATE_FUND', String(fundId), '触发基金清算，强制兑付所有持仓');
        alert("清算指令已下达，所有用户持仓已强制兑付至余额。");
    };

    const updateFundsAndHoldingsWithNav = (fundId: number, newNav: number, newAccumNav: number, dailyReturn: number) => {
        setFunds(prev => prev.map(f => f.id === fundId ? {
            ...f,
            nav: newNav,
            navAccumulated: newAccumNav,
            dailyReturnRate: dailyReturn
        } : f));

        setHoldings(prev => prev.map(h => {
            if (h.fundId === fundId) {
                return {
                    ...h,
                    latestNav: newNav,
                    totalAsset: h.holdShares * newNav,
                    profitAmount: (h.holdShares * newNav) - (h.averageCost * h.holdShares),
                    profitRate: (newNav - h.averageCost) / h.averageCost
                };
            }
            return h;
        }));
    };

    const adminUpdateNav = (fundId: number, navRecord: FundNav) => {
        setNavLogs(prev => {
            const fundLogs = prev[fundId] || [];
            const otherLogs = fundLogs.filter(l => l.navDate !== navRecord.navDate);
            const newLogs = [...otherLogs, navRecord].sort((a, b) => new Date(a.navDate).getTime() - new Date(b.navDate).getTime());
            
            const latestLog = newLogs[newLogs.length - 1];
            if (latestLog.navDate === navRecord.navDate) {
                 updateFundsAndHoldingsWithNav(fundId, navRecord.nav, navRecord.navAccumulated, navRecord.dailyReturnRate || 0);
            }
            return { ...prev, [fundId]: newLogs };
        });
        logOperation('UPDATE_NAV', String(fundId), `录入净值: ${navRecord.navDate} - ${navRecord.nav}`);
    };

    const adminBatchUpdateNav = (fundId: number, navRecords: FundNav[]) => {
        setNavLogs(prev => {
            const fundLogs = prev[fundId] || [];
            // Explicitly typing the Map to ensure values are FundNav
            const logMap = new Map<string, FundNav>();
            fundLogs.forEach(l => logMap.set(l.navDate, l));
            navRecords.forEach(r => logMap.set(r.navDate, r));

            const newLogs = Array.from(logMap.values()).sort((a, b) => new Date(a.navDate).getTime() - new Date(b.navDate).getTime());
            
            const latestLog = newLogs[newLogs.length - 1];
            updateFundsAndHoldingsWithNav(fundId, latestLog.nav, latestLog.navAccumulated, latestLog.dailyReturnRate || 0);
            return { ...prev, [fundId]: newLogs };
        });
        logOperation('BATCH_UPDATE_NAV', String(fundId), `批量导入净值 ${navRecords.length} 条`);
    };

    const adminAdjustHolding = (holdingId: number, newShares: number, newCost: number, remark: string) => {
        setHoldings(prev => prev.map(h => {
            if (h.id === holdingId) {
                return {
                    ...h,
                    holdShares: newShares,
                    averageCost: newCost,
                    totalAsset: newShares * h.latestNav,
                    profitAmount: (newShares * h.latestNav) - (newCost * newShares)
                };
            }
            return h;
        }));
        logOperation('ADJUST_HOLDING', String(holdingId), `手动调整持仓: ${remark}`);
    };

    const adminExecuteDividend = (fundId: number, type: 1 | 2, amountPerShare: number, date: string) => {
        const targetFund = funds.find(f => f.id === fundId);
        if (!targetFund) return;
        const targetHoldings = holdings.filter(h => h.fundId === fundId);
        if (targetHoldings.length === 0) return;

        let totalAmount = 0;
        let affectedCount = 0;

        targetHoldings.forEach(h => {
            affectedCount++;
            const payout = h.holdShares * amountPerShare;
            totalAmount += payout;

            if (type === 1) { 
                setUser(u => ({ ...u, accountBalance: u.accountBalance + payout }));
                const newTx: TransactionRecord = {
                    id: Date.now() + Math.random(),
                    tradeNo: 'DIV' + Date.now(),
                    userId: h.userId,
                    fundId: fundId,
                    tradeType: 4, 
                    tradeTypeLabel: '现金分红',
                    tradeAmount: payout,
                    nav: h.latestNav,
                    navDate: date,
                    feeAmount: 0,
                    actualAmount: payout,
                    tradeStatus: 4,
                    tradeStatusLabel: '已完成',
                    applyTime: new Date().toISOString(),
                    fundInfo: { fundCode: targetFund.fundCode, fundName: targetFund.fundName }
                };
                setTransactions(prev => [...prev, newTx]);
            } else { 
                const newShares = payout / h.latestNav;
                setHoldings(prevH => prevH.map(ph => ph.id === h.id ? {
                    ...ph,
                    holdShares: ph.holdShares + newShares,
                    totalAsset: (ph.holdShares + newShares) * ph.latestNav
                } : ph));
                 const newTx: TransactionRecord = {
                    id: Date.now() + Math.random(),
                    tradeNo: 'DIV' + Date.now(),
                    userId: h.userId,
                    fundId: fundId,
                    tradeType: 4,
                    tradeTypeLabel: '红利再投',
                    tradeAmount: payout,
                    tradeShares: newShares,
                    nav: h.latestNav,
                    navDate: date,
                    feeAmount: 0,
                    actualAmount: payout,
                    tradeStatus: 4,
                    tradeStatusLabel: '已完成',
                    applyTime: new Date().toISOString(),
                    fundInfo: { fundCode: targetFund.fundCode, fundName: targetFund.fundName }
                };
                setTransactions(prev => [...prev, newTx]);
            }
        });

        const record: DividendRecord = {
            id: Date.now(),
            dividendNo: 'D' + Date.now(),
            fundId,
            fundName: targetFund.fundName,
            dividendDate: date,
            dividendType: type,
            dividendTypeLabel: type === 1 ? '现金分红' : '红利再投',
            dividendPerShare: amountPerShare,
            totalDividendAmount: totalAmount,
            affectedUserCount: affectedCount,
            confirmTime: new Date().toISOString()
        };
        setDividendRecords(prev => [record, ...prev]);
        logOperation('EXECUTE_DIVIDEND', targetFund.fundName, `执行分红: ${type===1?'现金':'再投'}, 每份 ${amountPerShare}`);
    };

    const updateSysConfig = (config: SysConfig) => {
        setSysConfig(config);
        logOperation('UPDATE_CONFIG', 'System', '更新全局系统配置');
    };

    const backupData = () => {
        const backup = {
            timestamp: new Date().toISOString(),
            funds,
            users: [user], // Mock
            holdings,
            transactions,
            navLogs,
            dividendRecords,
            sysConfig
        };
        // In reality, trigger download
        console.log("Backup Data Ready:", backup);
        logOperation('BACKUP_DATA', 'System', '全量数据备份导出');
        alert("全量数据备份文件已生成 (Check Console)");
    };

    const generateMockUsers = (count: number) => {
        const newUsers: User[] = [];
        for (let i = 0; i < count; i++) {
            const id = Date.now() + i;
            newUsers.push({
                id,
                username: `user_${id.toString().substr(-4)}`,
                realName: `测试用户${i+1}`,
                userType: 2,
                virtualAccount: `JC${Math.floor(Math.random()*1000000)}`,
                accountBalance: Math.floor(Math.random() * 1000000) + 50000,
                status: 1,
                extJson: { isQualifiedInvestor: Math.random() > 0.5, phone: `13${Math.floor(Math.random()*1000000000)}` },
                createTime: new Date().toISOString()
            });
        }
        setManagedUsers(prev => [...prev, ...newUsers]);
        logOperation('MOCK_GEN_USERS', 'Simulation', `生成 ${count} 个测试用户`);
        alert(`已生成 ${count} 个测试用户数据`);
    };

    const generateMockTransactions = (count: number) => {
        const newTxs: TransactionRecord[] = [];
        for(let i=0; i<count; i++) {
             const fund = funds[Math.floor(Math.random() * funds.length)];
             const type = Math.random() > 0.5 ? 1 : 2;
             const amount = Math.floor(Math.random() * 50000) + 1000;
             newTxs.push({
                 id: Date.now() + i,
                 tradeNo: 'TRD' + Math.random().toString(36).substr(2, 6).toUpperCase(),
                 userId: Math.floor(Math.random() * 100) + 1000,
                 fundId: fund.id,
                 tradeType: type,
                 tradeTypeLabel: type === 1 ? '申购' : '赎回',
                 tradeAmount: amount,
                 nav: fund.nav || 1,
                 navDate: new Date().toISOString().split('T')[0],
                 feeAmount: 0,
                 actualAmount: amount,
                 tradeStatus: 4,
                 tradeStatusLabel: '已完成',
                 applyTime: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
                 fundInfo: { fundCode: fund.fundCode, fundName: fund.fundName }
             });
        }
        setTransactions(prev => [...prev, ...newTxs]);
        logOperation('MOCK_GEN_TXS', 'Simulation', `生成 ${count} 条测试交易记录`);
    };

    // User Management Actions
    const adminAddUser = (u: User) => {
        setManagedUsers(prev => [...prev, { ...u, id: Date.now(), createTime: new Date().toISOString() }]);
        logOperation('ADD_USER', u.username, '新增用户');
    };

    const adminUpdateUser = (u: User) => {
        setManagedUsers(prev => prev.map(user => user.id === u.id ? u : user));
        logOperation('UPDATE_USER', u.username, '更新用户信息');
    };

    const adminDeleteUser = (id: number) => {
        setManagedUsers(prev => prev.filter(u => u.id !== id));
        logOperation('DELETE_USER', String(id), '删除用户');
    };

    const adminToggleUserStatus = (id: number, status: 1 | 2 | 3) => {
        setManagedUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u));
        logOperation('CHANGE_STATUS', String(id), `更改用户状态至 ${status}`);
    };

    const adminResetUserPassword = (id: number) => {
        logOperation('RESET_PWD', String(id), '重置用户密码');
        alert("密码已重置为默认密码: 123456");
    };

    return (
        <AppContext.Provider value={{ 
            user, managedUsers, holdings, transactions, funds, navLogs, sysConfig, dividendRecords, operationLogs, backtestTasks, chatSessions,
            login, logout, updateUserRisk, certifyInvestor, buyFund, redeemFund, depositCash, processSettlement, sendUserMessage,
            adminActions: { 
                addFund: adminAddFund, 
                updateFund: adminUpdateFund, 
                auditTransaction: adminAuditTransaction,
                updateNav: adminUpdateNav,
                batchUpdateNav: adminBatchUpdateNav,
                liquidateFund: adminLiquidateFund,
                adjustHolding: adminAdjustHolding,
                executeDividend: adminExecuteDividend,
                updateSysConfig,
                logOperation,
                backupData,
                generateMockUsers,
                generateMockTransactions,
                sendAdminMessage,
                markSessionRead,
                addUser: adminAddUser,
                updateUser: adminUpdateUser,
                deleteUser: adminDeleteUser,
                toggleUserStatus: adminToggleUserStatus,
                resetUserPassword: adminResetUserPassword
            }
        }}>
            <Router>
                <Suspense fallback={<PageLoader />}>
                    <Routes>
                        <Route path="/website" element={<OfficialSite />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/*" element={
                            user.extJson?.phone ? (
                                <AppLayout user={user}>
                                    <Routes>
                                        {/* User Routes */}
                                        <Route path="/" element={
                                            user.userType === 1 ? <Navigate to="/admin/dashboard" replace /> : <Dashboard />
                                        } />
                                        <Route path="/market" element={<FundMarket />} />
                                        <Route path="/portfolio" element={<Portfolio />} />
                                        <Route path="/tools" element={<Tools />} />
                                        <Route path="/qualification" element={<QualifiedInvestor />} />

                                        {/* Admin Routes */}
                                        <Route path="/admin/dashboard" element={<AdminDashboard />} />
                                        <Route path="/admin/users" element={<AdminUserManager />} />
                                        <Route path="/admin/funds" element={<AdminFundManager />} />
                                        <Route path="/admin/nav" element={<AdminNavManager />} />
                                        <Route path="/admin/transactions" element={<AdminTransactionAudit />} />
                                        <Route path="/admin/assets" element={<AdminAssetManager />} />
                                        <Route path="/admin/reports" element={<AdminReports />} />
                                        <Route path="/admin/settings" element={<AdminSettings />} />
                                        <Route path="/admin/security" element={<AdminSecurity />} />
                                        <Route path="/admin/simulation" element={<AdminSimulation />} />
                                        <Route path="/admin/service" element={<AdminCustomerService />} />

                                        <Route path="*" element={<Navigate to="/" replace />} />
                                    </Routes>
                                </AppLayout>
                            ) : (
                                <Navigate to="/website" replace />
                            )
                        } />
                    </Routes>
                </Suspense>
            </Router>
        </AppContext.Provider>
    );
};

export default App;
