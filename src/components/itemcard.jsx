import "../css/itemcard.css";
import { Link } from "react-router-dom";
// import { useNavigate } from "react-router-dom";

function ItemCard({ item }) {
  // const navigate = useNavigate();

  // const handleClick = () => {
  //   navigate(`../Product?id=${item.id}`);
  // };

  return (
    <Link to={window.location.origin + "/Product?id=" + item.id}>
      {/* <div onClick={handleClick}> */}
        <div
          className="item-category-card"
          style={{ backgroundImage: `url(${item.image})` }}
          alt={item.title}
        ></div>
        <h5 className="item-category-name">
          {item.title} <br />
          Price:{item.price}
        </h5>
      {/* </div> */}
    </Link>
  );
}

export default ItemCard;
