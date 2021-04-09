const Display = (props) => {
  return (
    <div className={props.className}>
      {props.displayMessage}
    </div>
  );
};

export default Display;