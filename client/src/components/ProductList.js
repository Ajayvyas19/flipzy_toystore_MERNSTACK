import React from "react";
import ProductCard from "./ProductCard";

export default function ProductList({ products }) {
    const location = useLocation();
  return (
    <div className="flex flex-wrap">
      {products.map((toy) => (
        <ProductCard
          key={toy._id}
          _id={toy._id}
          name={toy.name}
          price={toy.price}
          image={toy.image}
          description={toy.description}
        />
      ))}
    </div>
  );
}
