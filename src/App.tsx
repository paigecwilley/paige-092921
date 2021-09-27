import React, { useEffect, useRef, useState } from 'react'
import './App.css'
import OrderBook from '../src/components/OrderBook'
import Button from '../src/components/Button'

import { SnapshotTypes, DeltaTypes } from './types'

const App: React.FC = (): React.ReactElement => {
  const [closed, setClosed] = useState<boolean>(false)
  const [errorMessage, setErrorMessage] = useState<boolean>(false)
  const [open, setOpen] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(true)
  const [visibilityChange, setVisibilityChange] = useState(false)
  const [selectedFeed, setSelectedFeed] = useState<'PI_XBTUSD' | 'PI_ETHUSD'>(
    'PI_XBTUSD'
  )
  const [data, setData] = useState<DeltaTypes | null>(null)

  const [snapshot, setSnapshot] = useState<SnapshotTypes | null>(null)

  const ws = useRef<WebSocket | null>()

  const toggleFeed = () => {
    setLoading(true)
    if (selectedFeed === 'PI_XBTUSD') {
      setSelectedFeed('PI_ETHUSD')
    } else {
      setSelectedFeed('PI_XBTUSD')
    }
  }

  const subscribe = (selectedFeed: string): void => {
    ws.current?.send(
      JSON.stringify({
        event: 'subscribe',
        feed: 'book_ui_1',
        product_ids: [selectedFeed],
      })
    )
  }

  const unsubscribe = (unselectedFeed: string): void => {
    ws.current?.send(
      JSON.stringify({
        event: 'unsubscribe',
        feed: 'book_ui_1',
        product_ids: [unselectedFeed],
      })
    )
  }

  useEffect(() => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      if (selectedFeed === 'PI_XBTUSD') {
        unsubscribe('PI_ETHUSD')
        subscribe('PI_XBTUSD')
      }
      if (selectedFeed === 'PI_ETHUSD') {
        unsubscribe('PI_XBTUSD')
        subscribe('PI_ETHUSD')
      }
    }
  }, [selectedFeed])

  useEffect(() => {
    if (!open) return

    let interval = 0

    ws.current = new WebSocket('wss://www.cryptofacilities.com/ws/v1')
    ws.current.onopen = () => {
      setClosed(false)
      subscribe('PI_XBTUSD')
    }
    ws.current.onclose = () => {
      console.log('websocket is closed now')
    }

    ws.current.onerror = () => {
      if (ws.current?.readyState !== WebSocket.CLOSED) {
        setErrorMessage(true)
      }
    }

    ws.current.onmessage = (e) => {
      setLoading(false)
      interval += 1
      const message = JSON.parse(e.data)
      if (Object.values(message).includes('book_ui_1_snapshot')) {
        setSnapshot(message)
      } else {
        if (interval % 3 == 0) {
          setData(message)
        }
      }
    }

    if (visibilityChange === false) {
      document.addEventListener('visibilitychange', () => {
        setVisibilityChange(true)
        if (document.visibilityState === 'hidden') {
          if (ws) {
            setClosed(true)
            setOpen(false)
            console.log('here')
            ws.current?.close()
            ws.current = null
          }
        }
      })
    }
  }, [open, visibilityChange])

  return (
    <div className="App">
      {!errorMessage ? (
        <main>
          {!closed ? (
            <OrderBook
              snapshot={snapshot}
              delta={data}
              button={toggleFeed}
              loading={loading}
              selectedFeed={selectedFeed}
            />
          ) : (
            <div className="reconnect-message">
              <h2>
                You&apos;ve disconnected from the order book. Connect again?
              </h2>
              <Button
                action={() => setOpen(true)}
                text="Connect to orderbook."
              />
            </div>
          )}
        </main>
      ) : (
        <div className="error-message">
          <h3> Failed to load the websocket. Please try again later</h3>
        </div>
      )}
    </div>
  )
}

export default App
