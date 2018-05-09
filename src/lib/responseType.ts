// root
export interface Response<T> {
  success: number;
  data: T;
}

// Ticker
export interface TickerResponse {
  sell: string;
  buy: string;
  high: string;
  low: string;
  last: string;
  vol: string;
  timestamp: number;
}

// Depth
export interface DepthResponse {
  asks: number[][];
  bids: number[][];
}

// Transactions
export interface TransactionsResponse {
  transactions: TransactionResponse[];
}

export interface TransactionResponse {
  transaction_id: number;
  side: string;
  price: string;
  amount: string;
  executed_at: number;
}

// Candlestick
export interface CandlestickResponse {
  candlestick: CandleWithTypeResponse[];
  timestamp: number;
}

export interface CandleWithTypeResponse {
  type: string;
  ohlcv: string[];
}

// Assets
export interface AssetsResponse {
  assets: AssetResponse[];
}

export interface AssetResponse {
  asset: string;
  amount_precision: number;
  onhand_amount: string;
  locked_amount: string;
  free_amount: string;
  stop_deposit: boolean;
  stop_withdrawal: boolean;
  withdrawal_fee: any;
}

// Order
export interface OrderResponse {
  order_id: number;
  pair: string;
  side: string;
  type: string;
  start_amount: string;
  remaining_amount: string;
  executed_amount: string;
  price: string;
  average_price: string;
  ordered_at: number;
  status: string;
}

export interface OrdersResponse {
  orders: OrderResponse[];
}

export interface ActiveOrdersResponse {
  orders: OrderResponse[];
}

// Trade
export interface TradeHistoryResponse {
  trades: TradeResponse[];
}

export interface TradeResponse {
  trade_id: number;
  pair: string;
  order_id: number;
  side: string;
  type: string;
  amount: string;
  price: string;
  maker_taker: string;
  fee_amount_base: string;
  fee_amount_quote: string;
  executed_at: number;
}

// Withdraw
export interface WithdrawalAccountResponse {
  uuid: string;
  label: string;
  address: string;
}

export interface WithdrawalResponse {
  uuid: string;
  asset: string;
  amount: number;
  account_uuid: string;
  fee: string;
  status: string;
  label: string;
  txid: string;
  address: string;
}
