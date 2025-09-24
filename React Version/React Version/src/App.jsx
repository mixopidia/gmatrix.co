import React from "react";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";
import Wallet from "./pages/wallet.jsx";
import Markets from "./pages/markets.jsx";

function Home() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Mixopidia UI is up ✅</h1>
      <p>Router is working. Try these:</p>
      <ul>
        <li><Link to="/wallet">/wallet</Link></li>
        <li><Link to="/markets">/markets</Link></li>
      </ul>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Home} />
        <Route path="/wallet" component={Wallet} />
        <Route path="/markets" component={Markets} />
      </Switch>
    </Router>
  );
}

