const Button = (props) => {
  return (
    <button 
      className="button"
      onClick={() => props.onClick(props.Text)}
    >
      {props.Text}
    </button>
  );
};

export default Button;