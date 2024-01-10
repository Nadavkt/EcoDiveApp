import React from "react";
import { useContext } from "react";
import { useState } from "react";
import { ProductContext } from "../Context/ProductContext";

function AddProduct() {
  const { addProduct } = useContext(ProductContext);

  const [serialN, SetSerialN] = useState("");
  const [image, setImage] = useState("");
  const [title, SetTitle] = useState("");
  const [description, SetDescription] = useState("");
  const [price, SetPrice] = useState("");
  const [salePrice, SetSalePrice] = useState("");
  const [category, SetCategory] = useState("");

  const AddNewProduct = (event) => {
    event.preventDefault();

    let newProduct = {
      serialN,
      img:
        image ||
        "https://erasmusnation-com.ams3.digitaloceanspaces.com/woocommerce-placeholder.png",
      title,
      description,
      price,
      salePrice,
      category,
    };
    console.log(newProduct);
    addProduct(newProduct);
  };

  return (
    <div className="manger-add-product">
      <form onSubmit={(event) => AddNewProduct(event)}>
        <h3>Add Product</h3>
        <div className=" mb-3">
          <label>
            <input
              type="text"
              placeholder="Serial number"
              className="add-product-line form-control"
              id="serialN"
              onChange={(event) => SetSerialN(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-3">
          <label>
            <input
              type="text"
              className="form-control"
              id="add-img"
              onChange={(event) => setImage(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-3">
          <label>
            <input
              type="text"
              placeholder="Title"
              className="add-product-line form-control"
              id="title"
              onChange={(event) => SetTitle(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-3">
          <label>
            <textarea
              type="text"
              placeholder="Description"
              className="text-area-line form-control"
              id="description"
              onChange={(event) => SetDescription(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-3">
          <label>
            <input
              type="text"
              placeholder="Price"
              className="add-product-line form-control"
              id="price"
              onChange={(event) => SetPrice(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-3">
          <label>
            <input
              type="text"
              placeholder="Sale Price"
              className="add-product-line form-control"
              id="salePrice"
              onChange={(event) => SetSalePrice(event.target.value)}
            />
          </label>
        </div>

        <div className="mb-3">
          <label>
            <input
              type="text"
              placeholder="Category"
              className="add-product-line form-control"
              id="category"
              onChange={(event) => SetCategory(event.target.value)}
            />
          </label>
        </div>

        <div className="">
          <button type="submit" className=" btn btn-primary">
            Add Product
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddProduct;
