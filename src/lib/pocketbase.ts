import PocketBase from 'pocketbase';

// 指向您的 PocketBase 本地或远程地址
const pb = new PocketBase((import.meta as any).env.VITE_POCKETBASE_URL || 'http://127.0.0.1:8090');

// 自动刷新 Token 逻辑
pb.autoCancellation(false);

export default pb;
