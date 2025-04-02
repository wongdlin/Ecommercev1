import "react-responsive-carousel/lib/styles/carousel.min.css";
import "../css/Home.css";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [isHovered, setIsHovered] = useState(false);
  const fillColor = isHovered ? "#FFA500" : "#800080";
  const sectionRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const categoryImage = [
    { url: "src/img/orange.png", categoryname: "Orange" },
    { url: "src/img/grape.png", categoryname: "Grape" },
    { url: "src/img/strawberry.png", categoryname: "Strawberry" },
  ];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 } // Trigger when 30% of the section is visible
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);
  return (
    <>
      <div className="banner" style={{ backgroundColor: fillColor }}>
        <h1 className="banner-text">
          ALL NEW FLAVOR
          <br />
          ALL NEW FLAVOR
          <br />
          ALL NEW FLAVOR
        </h1>
        <div
          className="product"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className="soda"
            style={{ "--url": "url(src/img/grape.png)" }}
          ></div>
          <div
            className="soda"
            style={{ "--url": "url(src/img/orange.png)" }}
          ></div>
        </div>
        <div className="banner-info">
          <h1>Refreshing Drink</h1>
          <h5>Try Yours Today</h5>
        </div>
      </div>
      {/* svg curves start */}
      <div class="custom-shape-divider-top-1740985708">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            class="shape-fill"
            style={{ fill: fillColor }}
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            class="shape-fill"
            style={{ fill: fillColor }}
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            class="shape-fill"
            style={{ fill: fillColor }}
          ></path>
        </svg>
      </div>
      {/* svg curves end */}

      <div ref={sectionRef} className="section2-cont">
        <div className="soda-wrapper">
          <div
            className={`soda ${isVisible ? "visible" : ""}`}
            style={{ "--url": "url(src/img/grape.png)" }}
          ></div>
          <div
            className={`soda ${isVisible ? "visible" : ""}`}
            style={{ "--url": "url(src/img/orange.png)" }}
          ></div>
          <div
            className={`soda ${isVisible ? "visible" : ""}`}
            style={{ "--url": "url(src/img/strawberry.png)" }}
          ></div>
        </div>

        <div className="section-info">
          <h1>What Makes Us Special</h1>
          <h2>-Natural Ingredients</h2>
          <h2>-No Sugar Added</h2>
          <h2>-Made With Love</h2>
        </div>
      </div>
      {/* svg curve start */}
      <div class="custom-shape-divider-bottom-1741055599">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            class="shape-fill"
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            class="shape-fill"
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            class="shape-fill"
          ></path>
        </svg>
      </div>
      {/* svg curve end */}
      <h1 className="our-products-title">Our Products</h1>
      <div className="item-category">
        {categoryImage.map((item) => (
          <Link to="/ProductList">
            <div
              className="item-category-card"
              style={{ backgroundImage: `url(${item.url})` }}
            ></div>
            <h5 className="item-category-name">{item.categoryname}</h5>
          </Link>
        ))}
      </div>
      {/* svg curve start */}
      <div class="custom-shape-divider-top-1740985708">
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path
            d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
            opacity=".25"
            class="shape-fill"
            style={{ fill: "#FFA500" }}
          ></path>
          <path
            d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z"
            opacity=".5"
            class="shape-fill"
            style={{ fill: "#FFA500" }}
          ></path>
          <path
            d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"
            class="shape-fill"
            style={{ fill: "#FFA500" }}
          ></path>
        </svg>
      </div>
      {/* svg curve end */}
    </>
  );
}

export default Home;
