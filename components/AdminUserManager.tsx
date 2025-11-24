
import React, { useContext, useState } from 'react';
import { AppContext } from '../App';
import { User } from '../types';
import { Search, Plus, Edit, Lock, Unlock, UserX, RotateCcw, ShieldCheck, User as UserIcon, Filter, CheckCircle, XCircle } from 'lucide-react';

const AdminUserManager: React.FC = () => {
    const { managedUsers, adminActions } = useContext(AppContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'admin' | 'investor'>('all');
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [formData, setFormData] = useState<Partial<User>>({});

    const filteredUsers = managedUsers.filter(u => {
        const matchesSearch = 
            u.username.toLowerCase().includes(searchTerm.toLowerCase()) || 
            u.realName.includes(searchTerm) || 
            (u.extJson?.phone || '').includes(searchTerm);
        
        const matchesType = 
            typeFilter === 'all' ? true :
            typeFilter === 'admin' ? u.userType === 1 :
            u.userType === 2;
            
        return matchesSearch && matchesType;
    });

    const handleOpenModal = (user?: User) => {
        if (user) {
            setEditingUser(user);
            setFormData(user);
        } else {
            setEditingUser(null);
            setFormData({
                userType: 2,
                status: 1,
                accountBalance: 0,
                riskLevel: 5,
                riskLevelLabel: 'C5 (激进型)',
                extJson: { isQualifiedInvestor: false }
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newUser: User = {
            ...formData,
            id: editingUser ? editingUser.id : Date.now(),
            virtualAccount: formData.virtualAccount || `JC${Math.floor(Math.random()*1000000)}`,
            createTime: editingUser ? editingUser.createTime : new Date().toISOString()
        } as User;

        if (editingUser) {
            adminActions.updateUser(newUser);
        } else {
            adminActions.addUser(newUser);
        }
        setIsModalOpen(false);
    };

    const togglePermission = (perm: string) => {
        const currentPerms = formData.permissions || [];
        if (currentPerms.includes(perm)) {
            setFormData({ ...formData, permissions: currentPerms.filter(p => p !== perm) });
        } else {
            setFormData({ ...formData, permissions: [...currentPerms, perm] });
        }
    };

    const allPermissions = [
        { id: 'view', label: '查看数据' },
        { id: 'edit', label: '编辑数据' },
        { id: 'audit', label: '审核交易' },
        { id: 'export', label: '导出报表' },
        { id: 'admin', label: '系统管理' }
    ];

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        用户与权限管理
                    </h1>
                    <p className="text-sm text-gray-500">管理投资者账户、管理员角色及权限分配</p>
                </div>
                <button 
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm font-medium"
                >
                    <Plus className="w-4 h-4" /> 新增用户
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                {/* Filters */}
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setTypeFilter('all')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'all' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            全部
                        </button>
                        <button 
                            onClick={() => setTypeFilter('investor')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'investor' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            投资者
                        </button>
                        <button 
                            onClick={() => setTypeFilter('admin')}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${typeFilter === 'admin' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            管理员
                        </button>
                    </div>
                    <div className="relative w-full md:w-64">
                        <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input 
                            type="text" 
                            placeholder="搜索用户名、姓名、手机号..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white text-gray-500 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">用户 ID / 账号</th>
                                <th className="px-6 py-4">姓名 / 手机</th>
                                <th className="px-6 py-4">角色类型</th>
                                <th className="px-6 py-4 text-right">资产余额 (¥)</th>
                                <th className="px-6 py-4 text-center">状态</th>
                                <th className="px-6 py-4 text-center">操作</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredUsers.map(u => (
                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-bold text-gray-900">{u.username}</div>
                                        <div className="text-xs text-gray-400">ID: {u.id}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-gray-900">{u.realName}</div>
                                        <div className="text-xs text-gray-500">{u.extJson?.phone || '-'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {u.userType === 1 ? (
                                            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs flex items-center w-fit gap-1">
                                                <ShieldCheck className="w-3 h-3" /> {u.extJson?.roleName || '管理员'}
                                            </span>
                                        ) : (
                                            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs flex items-center w-fit gap-1">
                                                <UserIcon className="w-3 h-3" /> {u.extJson?.isQualifiedInvestor ? '合格投资者' : '普通用户'}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right font-mono">
                                        {u.accountBalance.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {u.status === 1 && (
                                            <span className="inline-flex items-center gap-1 text-green-700 bg-green-50 border border-green-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                <CheckCircle className="w-3 h-3" /> 正常
                                            </span>
                                        )}
                                        {u.status === 2 && (
                                            <span className="inline-flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                <Lock className="w-3 h-3" /> 冻结
                                            </span>
                                        )}
                                        {u.status === 3 && (
                                            <span className="inline-flex items-center gap-1 text-red-700 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full text-xs font-medium">
                                                <XCircle className="w-3 h-3" /> 注销
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex justify-center gap-2">
                                            <button 
                                                onClick={() => handleOpenModal(u)}
                                                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded" 
                                                title="编辑"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => adminActions.toggleUserStatus(u.id, u.status === 1 ? 2 : 1)}
                                                className={`p-1.5 rounded ${u.status === 1 ? 'hover:bg-orange-100 text-orange-600' : 'hover:bg-green-100 text-green-600'}`}
                                                title={u.status === 1 ? "冻结账户" : "解冻账户"}
                                            >
                                                {u.status === 1 ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                                            </button>
                                            <button 
                                                onClick={() => { if(window.confirm('确认重置密码?')) adminActions.resetUserPassword(u.id) }}
                                                className="p-1.5 hover:bg-gray-200 text-gray-600 rounded" 
                                                title="重置密码"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                            </button>
                                            {/* Only allow delete if not self */}
                                            {u.username !== 'admin' && (
                                                <button 
                                                    onClick={() => { if(window.confirm('确认删除用户?')) adminActions.deleteUser(u.id) }}
                                                    className="p-1.5 hover:bg-red-100 text-red-600 rounded" 
                                                    title="删除用户"
                                                >
                                                    <UserX className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl w-full max-w-lg p-6 shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">
                            {editingUser ? '编辑用户信息' : '新增用户'}
                        </h3>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">用户名</label>
                                    <input 
                                        required type="text" 
                                        value={formData.username || ''} 
                                        onChange={e => setFormData({...formData, username: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                        disabled={!!editingUser}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">真实姓名</label>
                                    <input 
                                        required type="text" 
                                        value={formData.realName || ''} 
                                        onChange={e => setFormData({...formData, realName: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1">手机号码</label>
                                <input 
                                    type="text" 
                                    value={formData.extJson?.phone || ''} 
                                    onChange={e => setFormData({...formData, extJson: { ...formData.extJson, phone: e.target.value }})}
                                    className="w-full border rounded-lg px-3 py-2 text-sm"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">账户类型</label>
                                    <select 
                                        value={formData.userType} 
                                        onChange={e => setFormData({...formData, userType: Number(e.target.value) as 1 | 2})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                                    >
                                        <option value={2}>投资者</option>
                                        <option value={1}>管理员</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-500 mb-1">账户状态</label>
                                    <select 
                                        value={formData.status} 
                                        onChange={e => setFormData({...formData, status: Number(e.target.value) as 1 | 2 | 3})}
                                        className="w-full border rounded-lg px-3 py-2 text-sm bg-white"
                                    >
                                        <option value={1}>正常</option>
                                        <option value={2}>冻结</option>
                                        <option value={3}>注销</option>
                                    </select>
                                </div>
                            </div>

                            {/* Conditional Fields based on User Type */}
                            {formData.userType === 2 ? (
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
                                    <h4 className="text-xs font-bold text-blue-700 uppercase">投资者属性配置</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">虚拟账户余额</label>
                                        <input 
                                            type="number" 
                                            value={formData.accountBalance} 
                                            onChange={e => setFormData({...formData, accountBalance: Number(e.target.value)})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.extJson?.isQualifiedInvestor || false}
                                            onChange={e => setFormData({...formData, extJson: { ...formData.extJson, isQualifiedInvestor: e.target.checked }})}
                                            className="rounded text-blue-600"
                                        />
                                        <label className="text-sm text-gray-700">认证为合格投资者</label>
                                    </div>
                                    {/* Admin hidden field: riskLevel is defaulted to 5 */}
                                    <div className="text-xs text-gray-400">默认风险等级: C5 (激进型)</div>
                                </div>
                            ) : (
                                <div className="bg-purple-50 p-4 rounded-lg border border-purple-100 space-y-3">
                                    <h4 className="text-xs font-bold text-purple-700 uppercase">管理员权限配置</h4>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-1">角色名称</label>
                                        <input 
                                            type="text" 
                                            value={formData.extJson?.roleName || ''}
                                            onChange={e => setFormData({...formData, extJson: { ...formData.extJson, roleName: e.target.value }})}
                                            className="w-full border rounded-lg px-3 py-2 text-sm"
                                            placeholder="例如：运营专员"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-500 mb-2">功能权限</label>
                                        <div className="flex flex-wrap gap-2">
                                            {allPermissions.map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => togglePermission(p.id)}
                                                    className={`px-3 py-1 rounded-full text-xs border ${
                                                        (formData.permissions || []).includes(p.id) 
                                                        ? 'bg-purple-600 text-white border-purple-600' 
                                                        : 'bg-white text-gray-600 border-gray-300'
                                                    }`}
                                                >
                                                    {p.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2 border border-gray-300 rounded-lg text-sm text-gray-600">取消</button>
                                <button type="submit" className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700">保存</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUserManager;
