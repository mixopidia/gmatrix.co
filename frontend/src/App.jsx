import { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import SymbolPicker from "./components/SymbolPicker.jsx";
import TickerPrice from "./components/TickerPrice.jsx";
import TVChart from "./components/TVChart.jsx";
import OrderBook from "./components/OrderBook.jsx";
import RecentTrades from "./components/RecentTrades.jsx";

export default function App() {
  const [symbol, setSymbol] = useState("BNB/USDT");

  return (
    <Container fluid className="mt-3">
      <h2 className="mb-3">Mixopidia Exchange (Dev)</h2>
      <Row className="g-3">
        {/* Left: pairs */}
        <Col xs={12} md={3}>
          <Card className="h-100">
            <Card.Header>Pairs</Card.Header>
            <Card.Body>
              <SymbolPicker value={symbol} onChange={setSymbol} />
            </Card.Body>
          </Card>
        </Col>

        {/* Center: ticker + chart */}
        <Col xs={12} md={6}>
          <Card className="mb-3">
            <Card.Body>
              <TickerPrice symbol={symbol} />
            </Card.Body>
          </Card>
          <Card>
            <Card.Body>
              <TVChart symbol={symbol} />
            </Card.Body>
          </Card>
        </Col>

        {/* Right: orderbook + trades */}
        <Col xs={12} md={3}>
          <Card className="mb-3">
            <Card.Header>Order Book</Card.Header>
            <Card.Body>
              <OrderBook symbol={symbol} />
            </Card.Body>
          </Card>
          <Card>
            <Card.Header>Recent Trades</Card.Header>
            <Card.Body>
              <RecentTrades symbol={symbol} />
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
