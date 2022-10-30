import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App.jsx';

console.log(`${process.env.REACT_APP_NAME} ${process.env.REACT_APP_VERSION}`)

ReactDOM.render(<App />, document.getElementById('root'));