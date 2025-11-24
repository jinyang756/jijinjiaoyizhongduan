import pb from '../src/lib/pocketbase';
import { FundProduct, FundNav, User, TransactionRecord, UserPosition, FundViewModel } from '../types';

/**
 * 统一 API 服务层 - PocketBase 实现版
 */
export const ApiService = {
    // --- 认证模块 ---
    auth: {
        login: async (phoneOrEmail: string, password: string) => {
            // PocketBase 默认使用 email/username 登录
            // 如果这里是手机号，您需要在 PB 中将 phone 设为 username 或使用 filter 查找
            // 这里假设用户使用 email 或 username 登录
            const authData = await pb.collection('users').authWithPassword(phoneOrEmail, password);
            return { 
                token: authData.token, 
                user: mapPbUserToLocal(authData.record) 
            };
        },
        
        logout: () => {
            pb.authStore.clear();
        },

        getCurrentUser: () => {
            const model = pb.authStore.model;
            return model ? mapPbUserToLocal(model) : null;
        },

        // 更新用户信息 (如认证状态)
        updateProfile: async (userId: string, data: Partial<User>) => {
            const record = await pb.collection('users').update(userId, {
                realName: data.realName,
                userType: data.userType,
                accountBalance: data.accountBalance,
                riskLevel: data.riskLevel,
                isQualifiedInvestor: data.extJson?.isQualifiedInvestor,
                phone: data.extJson?.phone
            });
            return mapPbUserToLocal(record);
        }
    },

    // --- 基金产品模块 ---
    fund: {
        getList: async () => {
            const records = await pb.collection('fund_products').getFullList({
                sort: '-created',
            });
            return records.map(mapPbFundToLocal);
        },

        getDetail: async (id: string) => {
            const record = await pb.collection('fund_products').getOne(id);
            return mapPbFundToLocal(record);
        },

        // 管理端：创建/更新
        create: async (fund: Partial<FundProduct>) => {
            return await pb.collection('fund_products').create({
                ...fund,
                // 转换 extJson 等字段适配 PB 结构
                manager: fund.extJson?.manager,
                strategy: fund.extJson?.strategy
            });
        },
        
        update: async (id: string, fund: Partial<FundProduct>) => {
            return await pb.collection('fund_products').update(id, {
                ...fund,
                manager: fund.extJson?.manager,
                strategy: fund.extJson?.strategy
            });
        }
    },

    // --- 交易模块 ---
    transaction: {
        // 提交交易申请
        create: async (tx: Partial<TransactionRecord>) => {
            if (!pb.authStore.model) throw new Error("Not logged in");
            
            return await pb.collection('transactions').create({
                tradeNo: tx.tradeNo,
                user: pb.authStore.model.id,
                fund: tx.fundId, // PB 使用 ID 关联
                tradeType: tx.tradeType,
                amount: tx.tradeAmount,
                shares: tx.tradeShares,
                nav: tx.nav,
                status: tx.tradeStatus, // 1=待确认
                fee: tx.feeAmount,
                signature: tx.signature,
                contractSignTime: tx.contractSignTime
            });
        },

        // 获取当前用户的交易列表
        getMyList: async () => {
            if (!pb.authStore.model) return [];
            const records = await pb.collection('transactions').getFullList({
                sort: '-created',
                filter: `user = "${pb.authStore.model.id}"`,
                expand: 'fund' // 关联查询基金信息
            });
            return records.map(mapPbTxToLocal);
        },

        // 管理端：获取所有待审核交易
        getPendingList: async () => {
            const records = await pb.collection('transactions').getFullList({
                sort: '-created',
                filter: `status = 1 || status = 3`, // 待确认 或 清算中
                expand: 'fund,user'
            });
            return records.map(mapPbTxToLocal);
        },

        // 管理端：审核交易
        audit: async (txId: string, status: number, remark?: string) => {
            return await pb.collection('transactions').update(txId, {
                status: status,
                remark: remark
            });
        }
    },

    // --- 净值管理 ---
    nav: {
        getHistory: async (fundId: string) => {
            const records = await pb.collection('fund_nav_logs').getFullList({
                sort: 'navDate',
                filter: `fund = "${fundId}"`
            });
            return records.map(r => ({
                id: r.id, // string ID
                fundId: r.fund,
                navDate: r.navDate, // string 'YYYY-MM-DD'
                nav: r.nav,
                navAccumulated: r.navAccumulated,
                dailyReturnRate: r.dailyReturnRate,
                createTime: r.created
            }));
        }
    }
};

// --- Mappers (数据转换层: PB <-> App Type) ---

const mapPbUserToLocal = (record: any): User => ({
    id: record.id, // PocketBase ID is string (15 chars)
    username: record.username,
    realName: record.realName,
    userType: record.userType, // 1=Admin, 2=Investor
    virtualAccount: record.virtualAccount,
    accountBalance: record.accountBalance,
    status: record.accountStatus, // 1=Normal
    riskLevel: record.riskLevel,
    createTime: record.created,
    extJson: {
        isQualifiedInvestor: record.isQualifiedInvestor,
        phone: record.phone, // Assuming you added phone field
        roleName: record.roleName
    }
});

const mapPbFundToLocal = (record: any): FundViewModel => ({
    id: record.id,
    fundCode: record.fundCode,
    fundName: record.fundName,
    fundType: record.fundType,
    fundTypeLabel: getTypeLabel(record.fundType),
    riskLevel: record.riskLevel,
    riskLevelLabel: `R${record.riskLevel}`,
    nav: record.currentNav,
    navAccumulated: record.currentNavAccumulated,
    yearToDate: record.yearToDate,
    maxDrawdown: record.maxDrawdown,
    sharpeRatio: record.sharpeRatio,
    issueDate: record.issueDate,
    lockupPeriod: record.lockupPeriod,
    navInitial: record.navInitial,
    subscriptionFeeRate: record.subscriptionFeeRate,
    redemptionFeeRate: record.redemptionFeeRate,
    managementFeeRate: record.managementFeeRate,
    status: record.status,
    statusLabel: getStatusLabel(record.status),
    simulateSettlementDays: record.settlementDays,
    extJson: {
        manager: record.manager,
        strategy: record.strategy,
        description: record.description
    },
    createTime: record.created,
    updateTime: record.updated
});

const mapPbTxToLocal = (record: any): TransactionRecord => ({
    id: record.id,
    tradeNo: record.tradeNo,
    userId: record.user,
    fundId: record.fund,
    tradeType: record.tradeType,
    tradeTypeLabel: getTradeTypeLabel(record.tradeType),
    tradeAmount: record.amount,
    tradeShares: record.shares,
    nav: record.nav,
    navDate: record.created.split(' ')[0], // Approximation
    feeAmount: record.fee,
    actualAmount: record.amount, // Simplification
    tradeStatus: record.status,
    tradeStatusLabel: getTxStatusLabel(record.status),
    applyTime: record.created,
    signature: record.signature,
    fundInfo: record.expand?.fund ? {
        fundCode: record.expand.fund.fundCode,
        fundName: record.expand.fund.fundName
    } : undefined
});

// Helpers
function getTypeLabel(t: number) { return ['股票型','债券型','混合型','货币型','期货型'][t-1] || '未知'; }
function getStatusLabel(s: number) { return ['募集期','存续期','清算期','暂停'][s-1] || '未知'; }
function getTradeTypeLabel(t: number) { return ['申购','赎回','充值','分红'][t-1] || '其他'; }
function getTxStatusLabel(s: number) { return ['待确认','已确认','清算中','已完成','冷静期','已驳回'][s-1] || '未知'; }