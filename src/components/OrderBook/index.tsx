import React from 'react'
import { DeltaTypes, SnapshotTypes, OrderBookTypes } from '../../types'
import './index.css'
import OrderColumn from '../OrderColumn'
import Button from '../Button'

interface Props {
  snapshot: SnapshotTypes | null
  delta: DeltaTypes | null
  button: () => void
  loading: boolean
  selectedFeed: string
}

const OrderBook = ({
  snapshot,
  delta,
  button,
  loading,
  selectedFeed,
}: Props): React.ReactElement => {
  const sortBids = (bids) => {
    const sliced = bids.slice().sort((a, b) => b[0] - a[0])
    return sliced
  }

  const sortAsks = (asks) => {
    const sliced = asks.slice().sort((a, b) => a[0] - b[0])
    return sliced
  }

  const transformData = (sorted: Array<number>): Array<OrderBookTypes> => {
    const newArr: Array<OrderBookTypes> = []

    sorted?.forEach((set, index) => {
      if (newArr.length === 0) {
        newArr.push({ total: set[1], size: set[1], price: set[0] })
      } else {
        const newTotal = newArr[index - 1]?.total + set[1]
        newArr.push({ total: newTotal, size: set[1], price: set[0] })
      }
    })
    return newArr.slice(0, 15)
  }

  const updateDeltas = (
    delta: Array<number>,
    snapshot: SnapshotTypes,
    type: string
  ): void => {
    delta.forEach((deltaItem) => {
      const deltaPrice = deltaItem[0]
      const deltaSize = deltaItem[1]

      const index = snapshot[type].findIndex((item) => item[0] === deltaPrice)

      if (index === -1 && deltaSize > 0) {
        snapshot[type].push(deltaItem)
      } else if (index > -1) {
        if (deltaSize == 0) {
          snapshot[type].splice(index, 1)
        } else {
          snapshot[type].splice(index, 1, deltaItem)
        }
      }
    })
  }

  const findAndReplaceDelta = (snapshot, deltas) => {
    if (deltas) {
      if (deltas.asks && deltas.asks.length > 0) {
        updateDeltas(deltas.asks, snapshot, 'asks')
      }
      if (deltas.bids && deltas.bids.length > 0) {
        updateDeltas(deltas.bids, snapshot, 'bids')
      }
    }
  }

  const ogBids = snapshot ? transformData(sortBids(snapshot.bids)) : null
  const ogAsks = snapshot ? transformData(sortAsks(snapshot.asks)) : null

  snapshot ? findAndReplaceDelta(snapshot, delta) : null

  const createSpread = () => {
    if (ogBids && ogAsks) {
      const ogBidPrice = ogBids[0]?.price as number
      const ogAsksPrice = ogAsks[0]?.price as number
      const bids = ogBids.length > 0 ? ogBidPrice : 0
      const asks = ogAsks.length > 0 ? ogAsksPrice : 0
      const spreadNumber = asks - bids
      const spreadPercent = (spreadNumber / ((bids + asks) / 2)) * 100

      return `${spreadNumber.toFixed(2)} (${spreadPercent.toFixed(2)}%)`
    }
  }

  const contract = selectedFeed === 'PI_XBTUSD' ? 'XBT' : 'ETH'

  return (
    <>
      <div className="desktop-ob">
        <div className="grid-2">
          <div className="header">
            <p
              className="color-white"
              style={{ position: 'absolute', left: 0 }}
            >
              Order Book
            </p>
            <p className="color-gray" style={{ textAlign: 'center' }}>
              Spread: {createSpread()}
            </p>
          </div>

          <OrderColumn
            columnLabels={['Total', 'Size', 'Price']}
            data={ogBids}
            type="bids"
          />
          <OrderColumn
            columnLabels={['Price', 'Size', 'Total']}
            data={ogAsks}
            type="asks"
          />
        </div>
        <h4 className="color-gray" style={{ textAlign: 'center' }}>
          Contract: {contract}
        </h4>
        <Button action={button} text="Toggle Feed" />
      </div>
      <div className="mobile-ob">
        {!loading ? (
          <>
            <div className="header">
              <p className="color-white">Order Book</p>
            </div>
            <OrderColumn
              columnLabels={['Price', 'Size', 'Total']}
              data={ogAsks}
              type="asks"
            />
            <div>
              <p className="color-gray" style={{ textAlign: 'center' }}>
                Spread: 17.0 (0.5%)
              </p>
            </div>
            <OrderColumn
              columnLabels={['Price', 'Size', 'Total']}
              data={ogBids}
              type="bids"
            />
            <h4 className="color-gray" style={{ textAlign: 'center' }}>
              Contract: {contract}
            </h4>
            <Button action={button} text="Toggle Feed" />
          </>
        ) : (
          <div className="color-gray">Loading...</div>
        )}
      </div>
    </>
  )
}

export default OrderBook
