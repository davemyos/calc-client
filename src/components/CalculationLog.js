const CalculationLog = (props) => {
  return (
    <div className={props.className}>
      <ul>
        {props.Text.map((subItems, i) => {
          return <li key={i}>{subItems}</li>
        })}
      </ul>      
    </div>
  );
};

export default CalculationLog;