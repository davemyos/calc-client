import './App.css';
import React, { useState, useEffect } from "react";
import Display from './components/Display';
import Button from './components/Button';
import CalculationLog from './components/CalculationLog';
import io from "socket.io-client";

const socket = io("https://myos-calc-server.herokuapp.com/");
//http://localhost:5000
//https://myos-calc-server.herokuapp.com/

const MAX_SIZE_OF_CALC_LOG = 10;

const App = () => {
  const [input, setInput] = useState("0");
  const [prevNum, setPrevNum] = useState("");
  const [curNum, setCurNum] = useState("");
  const [operator, setOperator] = useState("");
  const [calculationLog, setCalculationLog] = useState([]);
  const [waitingForNewNum, setWaitingForNewNum] = useState(true);

  useEffect(() => {
    socket.on("calcMessage", (msg) => {
      console.log(`received: ${msg}`);
      setCalculationLog(msg);
    });  
  }, []);

  const clickButton = (e) => {
    if (e === "+" || e === "-" || e === "/" || e === "*") {
      setOperator(e);
    } else if (input!=="0") {
      if (waitingForNewNum) {
        setInput(e);
        setWaitingForNewNum(false);
      } else {
        setInput(input + e);
      }
    } else {
      setInput(e);
      setWaitingForNewNum(false);
    }  
  };

  const handleClear = () => {
    setInput("0");
    setPrevNum("");
    setCurNum("");
    setOperator("");
    setWaitingForNewNum(true);
  };

  const addZeroToInput = (e)=> {
    if (!waitingForNewNum) {
      if (input!=="0") {
        setInput(input + e);
        setWaitingForNewNum(false);
      } else if (input === "") {
        setInput(input + e);
        setWaitingForNewNum(false);
      }
    } else {
      setInput(e);
      setWaitingForNewNum(false);
    }
  };

  const addDecimalToInput = (e) => {
    if (waitingForNewNum) {
      setInput("0" + e);
      setWaitingForNewNum(false);
    } else {
      if (input.indexOf(".") === -1) {
        setInput(input + e);
        setWaitingForNewNum(false);
      }
    }
  };

  const performOperation = (e) => {
    setPrevNum(parseFloat(input).toString());
    setWaitingForNewNum(true);
    setOperator(e);
  }   

  const solveIt = () => {   
   setCurNum(parseFloat(input).toString());
   setWaitingForNewNum(true);
  };

  const round = (value, decimals) => {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
  };

  useEffect(() => {
    const doTheMath = {
        "+": function(x, y) {return x + y},
        "-": function(x, y) {return x - y},
        "x": function(x, y) {return x * y},
        "/": function(x, y) {return x / y}
    };

    if (curNum !== "") {
      if (operator !== "") {
        let solution = doTheMath[operator](parseFloat(prevNum),parseFloat(curNum));

        if (solution !== null){
          //remove last item from the list if the list will be too large after adding an item to it
          if (calculationLog.length >= MAX_SIZE_OF_CALC_LOG)
            calculationLog.length = MAX_SIZE_OF_CALC_LOG-1;

          //set the precision
          let decimalIndex = solution.toString().indexOf(".");
          if ((decimalIndex > -1) && (solution.toString().length > decimalIndex + 5)) {
            solution = round(solution, 5);
          }

          let lastResult = [prevNum + operator + curNum + "=" + solution];
          let tmp = lastResult;

          tmp = tmp.concat(calculationLog)
          setCalculationLog(tmp);

          socket.emit("calcMessage", lastResult);          
        }

        setInput(solution);
        setOperator("");
        setCurNum("");
        setWaitingForNewNum(true);
      }
    } 
  }, [curNum, operator, prevNum, calculationLog])  

  return (
    <div className="App">
      <Display className="display" displayMessage={input} />

      <div className="keyPad">
        <div>
          <Button Text="7" onClick={clickButton} />
          <Button Text="8" onClick={clickButton} />
          <Button Text="9" onClick={clickButton} />
          <Button Text="/" onClick={performOperation} />
        </div>
        <div>
          <Button Text="4" onClick={clickButton} />
          <Button Text="5" onClick={clickButton} />
          <Button Text="6" onClick={clickButton} />
          <Button Text="x" onClick={performOperation} />
        </div>
        <div>
          <Button Text="1" onClick={clickButton} />
          <Button Text="2" onClick={clickButton} />
          <Button Text="3" onClick={clickButton} />
          <Button Text="+" onClick={performOperation} />
        </div>
        <div>
          <Button Text="C" onClick={handleClear} />
          <Button Text="0" onClick={addZeroToInput} />
          <Button Text="." onClick={addDecimalToInput} />
          <Button Text="-" onClick={performOperation} />
        </div>
        <div>
          <Button Text="&nbsp;" onClick={clickButton} />
          <Button Text="&nbsp;" onClick={clickButton} />
          <Button Text="&nbsp;" onClick={clickButton} />
          <Button Text="=" onClick={solveIt} />
        </div>
      </div>

      <CalculationLog className="calculationLog" Text={calculationLog} />
    </div>
  );
};

export default App;
