
import React from "react";
import { useContext } from "react";
import { ProductContext } from "../Context/ProductContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'

function EditProduct() {
  const { products, deleteProduct } = useContext(ProductContext);

  return (
    <div className="product-list-page">
      <h1>Product List</h1>
      <div>
        {products.map((product, index) => {
          return (
            <div key={index}>
              <div className="detail-product  card rounded-3 mb-4">
                <div className=" card-body p-4">
                  <div className="row d-flex justify-content-between align-items-center">
                    <div className="col-md-3 col-lg-3 col-xl-3">
                      <span className="lead fw-normal mb-2">{index + 1}. </span>
                      {product.title}
                    </div>
                    <div className="btn-mange col-md-1 col-lg-1 col-xl-1 text-end">
                      <div className="text-danger"
                        onClick={() => deleteProduct(product.serialN)}>
                            <FontAwesomeIcon className="btn-edit" icon={faTrash} />
                      </div>
                      <div className="text-success">
                        <FontAwesomeIcon className="btn-edit"  icon={faPen} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default EditProduct;
