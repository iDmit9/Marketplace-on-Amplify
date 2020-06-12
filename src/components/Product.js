import React from "react";
import { API, graphqlOperation } from 'aws-amplify';
import { S3Image } from 'aws-amplify-react';
import { Notification, Popover, Button, Dialog, Card, Form, Input, Radio } from "element-react";
import { updateProduct, deleteProduct } from '../graphql/mutations';
import { Link } from 'react-router-dom';
import { convertCentsToDollars, convertDollarsToCents } from '../utils';
import { UserContext } from '../App';
import PayButton from './PayButton';

class Product extends React.Component {
  state = {
    description: '',
    price: '',
    shipped: true,
    updateProductDialog: false,
    deleteProductDialog: false
  };

  handleUpdateProduct = async productId => {
    try {
      this.setState({ updateProductDialog: false });
      const { description, price, shipped } = this.state
      const input = {
        id: productId,
        description,
        shipped,
        price: convertDollarsToCents(price)
      }
      const result = await API.graphql(graphqlOperation(updateProduct, { input }))
      console.log('updateProduct', { result })
      Notification({
        title: 'Success',
        message: 'Product successfully updated',
        type: 'success'
      });
    } catch (err) {
      console.log(`Failed to update product with id: ${productId} `, err)
    }
  }

  handleDeleteProduct = async productId => {
    try {
      this.setState({ deleteProductDialog: false });
      const input = {
        id: productId
      }
      await API.graphql(graphqlOperation(deleteProduct, { input }));
      Notification({
        title: 'Success',
        message: 'Product successfully deleted',
        type: 'success'
      });
    } catch (err) {
      console.log(`Failed to delete product with id: ${productId} `, err)
    }
  }

  render() {
    const { product } = this.props;
    const {
      updateProductDialog,
      deleteProductDialog,
      description,
      shipped,
      price
    } = this.state;

    return (
      <UserContext.Consumer>
        {({ userAttributes }) => {
          const isProductOwner = userAttributes && userAttributes.sub === product.owner;
          const isEmailVerified = userAttributes && userAttributes.email_verified;

          return (
            <div className='card-container'>
              <Card bodyStyle={{ padding: 0, minWidth: '200px' }}>
                <S3Image
                  imgKey={product.file.key}
                  theme={{
                    photoImg: { maxWidth: '100%', maxHeight: '100%' }
                  }}
                />
                <div className="card-body">
                  <h3 className="m-0">{product.description}</h3>
                  <div className="items-center">
                    <img
                      src={`https://icon.now.sh/${product.shipped
                        ? 'markunread_mailbox'
                        : 'mail'}`}
                      alt='Shipping Icon'
                      className='icon'
                    />
                    {product.shipped ? 'Shipped' : 'Emailed'}
                  </div>
                  <div className="text-right">
                    <span className="mx-1">
                      ${convertCentsToDollars(product.price)}
                    </span>
                    {isEmailVerified
                      ? (!isProductOwner && (
                        <PayButton product={product} userAttributes={userAttributes} />
                      )) : (
                        <Link to='/profile' className='link'>
                          Verify Email
                        </Link>
                      )
                    }
                  </div>
                </div>
              </Card>
              {/* Update / Delete Product Buttons */}
              <div className="text-center">
                {isProductOwner && (
                  <>
                    <Button
                      type='warning'
                      icon='edit'
                      className='m-1'
                      onClick={() => this.setState({
                        updateProductDialog: true,
                        description: product.description,
                        shipped: product.shipped,
                        price: convertCentsToDollars(product.price)
                      })}
                    />
                    <Popover
                      placement='top'
                      width='160'
                      trigger='click'
                      visible={deleteProductDialog}
                      content={
                        <>
                          <p>Do you want to delete this? </p>
                          <div className='text-right'>
                            <Button
                              size='mini'
                              type='text'
                              className='m-1'
                              onClick={() => this.setState({ deleteProductDialog: false })}
                            >
                              Cancel
                            </Button >
                            <Button
                              size='mini'
                              type='primary'
                              className='m-1'
                              onClick={() => this.handleDeleteProduct(product.id)}
                            >
                              Confirm
                            </Button>
                          </div>
                        </>
                      }
                    >
                      <Button
                        onClick={() => this.setState({ deleteProductDialog: true })}
                        type='danger'
                        icon='delete'
                      />
                    </Popover>
                  </>
                )}
              </div>

              {/* Update Product Dialog */}
              <Dialog
                title='Update Product'
                size='large'
                customClass='dialog'
                visible={updateProductDialog}
                onCancel={() => this.setState({ updateProductDialog: false })}
              >
                <Dialog.Body>
                  <Form labelPosition='top'>
                    <Form.Item label='Update Description'>
                      <Input
                        icon='information'
                        placeholder='Product Description'
                        value={description}
                        trim={true}
                        onChange={description => this.setState({ description })}
                      />
                    </Form.Item>
                    <Form.Item label='Update Price'>
                      <Input
                        type='number'
                        icon='plus'
                        placeholder='Price ($USD)'
                        value={price}
                        onChange={price => this.setState({ price })}
                      />
                    </Form.Item>
                    <Form.Item label='Update Shipping'>
                      <div className="text-center">
                        <Radio
                          value='true'
                          checked={shipped === true}
                          onChange={() => this.setState({ shipped: true })}
                        >
                          Shipped
                        </Radio>
                        <Radio
                          value='false'
                          checked={shipped !== true}
                          onChange={() => this.setState({ shipped: false })}
                        >
                          Emailed
                        </Radio>
                      </div>
                    </Form.Item>
                  </Form>
                </Dialog.Body>
                <Dialog.Footer>
                  <Button
                    onClick={() => this.setState({ updateProductDialog: false })}
                  >
                    Cancel
                  </Button>
                  <Button
                    type='primary'
                    onClick={() => this.handleUpdateProduct(product.id)}
                  >
                    Update
                  </Button>
                </Dialog.Footer>
              </Dialog>
            </div>
          )
        }}
      </UserContext.Consumer>
    )
  }
}

export default Product;
