import React, { Component } from 'react';
import HistoryOrder from '../components/HistoryOrder';
import MarketHistory from '../components/MarketHistory';
import MarketNews from '../components/MarketNews';
// import MarketPairs from '../components/MarketPairs';
import MarketsList from '../components/MarketsList';
import MarketTrade from '../components/MarketTrade';
import OrderBook from '../components/OrderBook';
import TradingChart from '../components/TradingChart';
import TradingChartDark from '../components/TradingChartDark';
import { ThemeConsumer } from '../context/ThemeContext';

export default class Exchange extends Component {
  render() {
    return (
      <div className="container-fluid mtb15 no-fluid">
        <div className="row sm-gutters">
          {/* LEFT: pairs list */}
          <div className="col-sm-12 col-md-3">
            <MarketsList />
          </div>

          {/* CENTER: chart + trade form */}
          <div className="col-sm-12 col-md-6">
            <ThemeConsumer>
              {({ data }) =>
                data?.theme === 'dark' ? <TradingChartDark /> : <TradingChart />
              }
            </ThemeConsumer>
            <MarketTrade />
          </div>

          {/* RIGHT: order book + market history */}
          <div className="col-md-3">
            <OrderBook />
            <MarketHistory />
          </div>

          {/* SECOND ROW: news + user history */}
          <div className="col-md-3">
            <MarketNews />
          </div>
          <div className="col-md-9">
            <HistoryOrder />
          </div>
        </div>
      </div>
    );
  }
}
