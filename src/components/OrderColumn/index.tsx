import React from 'react'
import { OrderBookTypes } from '../../types'
import './index.css'

interface OrderColumnProps {
  columnLabels: Array<string>
  data: Array<OrderBookTypes> | null
  type: 'bids' | 'asks'
}

interface ItemRow {
  price: number
  size: number
  total: number
}

const OrderColumn = ({
  columnLabels,
  data,
  type,
}: OrderColumnProps): React.ReactElement => {
  const options = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }

  const columnTotal = (data: Array<OrderBookTypes>): number => {
    const length: number = data.length - 1
    if (data && data.length > 0 && data[length] !== undefined) {
      const lastItem = data[length] as OrderBookTypes
      return lastItem.total
    }
    return 1
  }

  return (
    <div className={`height ${type === 'asks' ? 'asks-only-mobile' : null}`}>
      <div className="grid-3 margin">
        {columnLabels.map((label) => (
          <p className="text color-gray" key={label}>
            {label.toUpperCase()}
          </p>
        ))}
      </div>
      {data ? (
        data.map((itemRow: ItemRow) => {
          const barWidth = (itemRow.total / columnTotal(data)) * 100
          return (
            <div className="grid-3" key={itemRow.price}>
              {columnLabels.map((label) => {
                const name = label.toLowerCase()

                if (name === 'price') {
                  return (
                    <p
                      className={`text ${
                        type === 'asks' ? 'text-price-red' : 'text-price-green'
                      }`}
                      key={`${label}+numbers`}
                    >
                      {Number(itemRow.price).toLocaleString('en', options)}
                    </p>
                  )
                }
                return (
                  <p className="text color-white" key={`${label}+numbers`}>
                    {itemRow[name]}
                  </p>
                )
              })}
              <div
                className={`bar-style ${
                  type === 'asks' ? 'bar-style-left' : 'bar-style-right'
                }`}
                style={{ width: `${barWidth}%` }}
              />
            </div>
          )
        })
      ) : (
        <div className="color-gray">Loading ...</div>
      )}
    </div>
  )
}

export default OrderColumn
