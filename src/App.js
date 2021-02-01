import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import './App.css';
import Home from "./components/Home";
import Room from "./components/Room";
import Header from "./components/Header";

function App() {
	return (
		<div>
			<Router>
				<Header />
				<Switch>
					<Route path="/" exact render={() => <Home />} />
					<Route exact path="/home" render={() => <Home />} />
					<Route path="/room/:id" render={() => <Room />} />
					<Route render={() => <h2>Page not found!</h2>} />
				</Switch>
			</Router>
		</div>
	)
}

export default App;