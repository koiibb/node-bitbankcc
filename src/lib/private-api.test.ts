import * as assert from 'power-assert';
import * as readlineSync from 'readline-sync';
import { PrivateApi } from './private-api';
import {
  ActiveOrderRequest,
  CancelOrderRequest,
  CancelOrdersRequest,
  DepositHistoryRequest,
  GetOrderRequest,
  GetOrdersRequest,
  OrderRequest,
  TradeHistoryRequest,
  WithdrawalAccountRequest,
  WithdrawalHistoryRequest,
  WithdrawalRequest,
} from './requestType';

const config = require('config');

let ctx: { orderId?: number } = {};

const testInit = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  assert(privateApi.endPoint);
  assert(privateApi.timeout > 0);
  assert(privateApi.keepAlive === false);
  assert(privateApi.endPoint);
};

const optionalCallbackTest = async () => {
  const options = {
    optionsCallback: function(option: any) {
      assert.equal(option.method, 'GET');
    },
    responseCallback: function(response: any) {
      assert.equal(response.success, 1);
    },
  };
  const privateApi = new PrivateApi(config.privateApi, options);
  const res = await privateApi.getAssets();
  assert.equal(res.success, 1);
};

const authMethodTest = async () => {
  const requestTimeConfig = {
    ...config.privateApi,
    authMethod: 'RequestTime',
  };
  const requestTimeOptions = {
    optionsCallback: function(option: any) {
      assert(!option.headers['ACCESS-NONCE']);
      assert(option.headers['ACCESS-REQUEST-TIME']);
      assert(option.headers['ACCESS-TIME-WINDOW']);
    },
  };
  const requestTimePrivateApi = new PrivateApi(requestTimeConfig, requestTimeOptions);
  await requestTimePrivateApi.getAssets();

  const nonceConfig = {
    ...config.privateApi,
    authMethod: 'Nonce',
  };
  const nonceOptions = {
    optionsCallback: function(option: any) {
      assert(option.headers['ACCESS-NONCE']);
      assert(!option.headers['ACCESS-REQUEST-TIME']);
      assert(!option.headers['ACCESS-TIME-WINDOW']);
    },
  };
  const noncePrivateApi = new PrivateApi(nonceConfig, nonceOptions);
  await noncePrivateApi.getAssets();
};

const nonceIncrementTest = async () => {
  const nonces: number[] = [];
  const nonceConfig = {
    ...config.privateApi,
    authMethod: 'Nonce',
  };
  const options = {
    optionsCallback: function(option: any) {
      nonces.push(option.headers['ACCESS-NONCE']);
    },
  };

  const privateApi = new PrivateApi(nonceConfig, options);
  await privateApi.getAssets();

  await privateApi.getAssets();
  assert.equal(nonces[nonces.length - 1] - nonces[0], 1);
  await privateApi.getAssets();
  assert.equal(nonces[nonces.length - 1] - nonces[0], 2);
  await privateApi.getAssets();
  assert.equal(nonces[nonces.length - 1] - nonces[0], 3);
};

const getAssetsTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const res = await privateApi.getAssets();
  assert.equal(res.success, 1);
};

const getMarginPositionsTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const res = await privateApi.getMarginPositions();
  assert.equal(res.success, 1);
};

const getOrderTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: GetOrderRequest = {
    order_id: 14541343,
    pair: 'btc_jpy',
  };
  const res = await privateApi.getOrder(params);
  assert.equal(res.success, 1);
};

const getActiveOrdersTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: ActiveOrderRequest = {
    pair: 'btc_jpy',
    count: 1,
    from_id: 14541346,
    end_id: 14541343,
    since: 1523419311277,
    end: 1523419024484,
  };
  const res = await privateApi.getActiveOrders(params);
  assert.equal(res.success, 1);
};

const getOrdersInfoTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: GetOrdersRequest = {
    order_ids: [14541343, 14541344],
    pair: 'btc_jpy',
  };
  const res = await privateApi.getOrdersInfo(params);
  assert.equal(res.success, 1);
};

const postOrderTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: OrderRequest = {
    pair: 'btc_jpy',
    amount: '0.01',
    price: 1000,
    side: 'buy',
    type: 'limit',
    post_only: true,
  };
  const res = await privateApi.postOrder(params);
  ctx = { orderId: res.data.order_id };
  assert.equal(res.success, 1);
};

const cancelOrderTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: CancelOrderRequest = {
    order_id: ctx.orderId!,
    pair: 'btc_jpy',
  };
  const res = await privateApi.cancelOrder(params);
  assert.equal(res.success, 1);
};

const cancelOrdersTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: CancelOrdersRequest = {
    order_ids: [14541370, 14541371],
    pair: 'btc_jpy',
  };
  const res = await privateApi.cancelOrders(params);
  assert.equal(res.success, 1);
};

const getDepositHistoryTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: DepositHistoryRequest = {
    asset: 'jpy',
  };
  const res = await privateApi.getDepositHistory(params);
  assert.equal(res.success, 1);
  assert.equal(res.data.deposits[0].asset, 'jpy');
};

const getWithdrawalAccountTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: WithdrawalAccountRequest = {
    asset: 'jpy',
  };
  const res = await privateApi.getWithdrawalAccount(params);
  assert.equal(res.success, 1);
};

const requestWithdrawalTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const accountRequestParams: WithdrawalAccountRequest = {
    asset: 'btc',
  };
  const uuid = await privateApi.getWithdrawalAccount(accountRequestParams).then(({ data }) => data.accounts[0].uuid);
  const otp = process.env.NODE_ENV === 'production' ? readlineSync.question('OTP: ') : '';
  const withdrawalRequestParams: WithdrawalRequest = {
    uuid,
    asset: 'btc',
    amount: '1',
    otp_token: otp,
  };
  const res = await privateApi.requestWithdrawal(withdrawalRequestParams);
  assert.equal(res.success, 1);
};

const getWithdrawalHistoryTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);

  const params1: WithdrawalHistoryRequest = {
    asset: 'jpy',
  };
  const res1 = await privateApi.getWithdrawalHistory(params1);
  assert.equal(res1.success, 1);
  assert.equal(res1.data.withdrawals[0].asset, 'jpy');
  assert.notEqual(res1.data.withdrawals[0].bank_name, undefined);

  const params2: WithdrawalHistoryRequest = {
    asset: 'btc',
  };
  const res2 = await privateApi.getWithdrawalHistory(params2);
  assert.equal(res2.success, 1);
  assert.equal(res2.data.withdrawals[0].asset, 'btc');
  assert.notEqual(res2.data.withdrawals[0].address, undefined);
};

const getTradeHistoryTest = async () => {
  const privateApi = new PrivateApi(config.privateApi);
  const params: TradeHistoryRequest = {
    pair: 'btc_jpy',
    count: 1,
    order_id: 14541370,
    since: 1523419311277,
    end: 1523419024484,
    order: 'asc',
  };
  const res = await privateApi.getTradeHistory(params);
  assert.equal(res.success, 1);
};

describe('PrivateAPI Test', () => {
  it('should init', testInit);
  it('should callback', optionalCallbackTest);
  it('switch auth method at header', authMethodTest);
  it('nonce should increment', nonceIncrementTest);
  it('GET /user/assets', getAssetsTest);
  it('GET /user/margin/positions', getMarginPositionsTest);
  it('GET /user/spot/order', getOrderTest);
  it('GET /user/spot/active_orders', getActiveOrdersTest);
  it('POST /user/spot/orders_info', getOrdersInfoTest);
  it('POST /user/spot/order', postOrderTest);
  it('POST /user/spot/cancel_order', cancelOrderTest);
  it('POST /user/spot/cancel_orders', cancelOrdersTest);
  it('GET /user/deposit_history', getDepositHistoryTest);
  it('GET /user/withdrawal_account', getWithdrawalAccountTest);
  it('POST /user/request_withdrawal', requestWithdrawalTest);
  it('GET /user/withdrawal_history', getWithdrawalHistoryTest);
  it('GET /user/spot/trade_history', getTradeHistoryTest);
});
