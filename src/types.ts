export interface SnapshotTypes {
  numLevels: number
  feed: string
  bids: Array<Array<number>>
  asks: Array<Array<number>>
  product_id: string
}

export interface DeltaTypes {
  feed: string
  product_id: string
  bids: Array<Array<number> | null>
  asks: Array<Array<number> | null>
}

export interface OrderBookTypes {
  price: number
  total: number
  size: number
}
