import React, { Component } from 'react';

class Main extends Component {

    render() {
        return(
            <div id="content">
                <h1> Add Image </h1>
                <form onSubmit={ (event) => {
                    event.preventDefault()
                    const name = this.imageName.value
                    const price = this.imagePrice.value.toString()
                    this.props.handleUpload(name, price)
                }}>
                    <div className="form-group mr-sm-2">
                        <input id="imageName" type="text" 
                            ref={(input) => {this.imageName = input }} 
                            className="form-control" 
                            placeholder="Image Name"
                            required />
                    </div>
                    <div className="form-group mr-sm-2">
                        <input id="imagePrice" type="text" 
                            ref={(input) => {this.imagePrice = input }} 
                            className="form-control" 
                            placeholder="Image Price"
                            required />
                    </div>
                    <div className="form-group mr-sm-2">
                        <input id="image" type="file" 
                            onChange = {this.props.captureFile}
                            className="form-control" 
                            required />
                    </div>
                    <button type="submit" className="btn btn-primary">Upload</button>
                </form>
                <p>&nbsp;</p>
                <h2>Buy Image</h2>
                <table className="table">
                    <thead>
                        <tr>
                            <th scope="col">#</th>
                            <th scope="col">Name</th>
                            <th scope="col">Price</th>
                            <th scope="col">Image</th>
                            <th scope="col">Owner</th>
                            <th scope="col"></th>
                        </tr>
                    </thead>
                    <tbody id="imageList">
                        { this.props.images.map((image, key) => {
                            return(
                                <tr key={key}>
                                    <th scope="row">{image.id.toString()}</th>
                                    <td>{image.name}</td>
                                    <td>{image.price.toString()} PBC</td>
                                    <td><img src= {`http://127.0.0.1:8080/ipfs/${image.ipfsHash}`} alt=""/></td>
                                    <td>{image.owner}</td>
                                    <td>
                                        { (image.owner !== this.props.account)
                                            ? !image.purchased 
                                                ? <button 
                                                    name={image.id} 
                                                    value={image.price} 
                                                    onClick={(event) => {
                                                        this.props.purchaseImage(event.target.name, event.target.value, image.owner, key)
                                                    }}>Buy</button> 
                                                : <button name={image.id} value={image.name} onClick={(event)=>{
                                                    this.props.retrieveImage(event.target.name, event.target.value)
                                                }}>Download</button>
                                            : <button name={image.id} value={image.name} onClick={(event)=>{
                                                this.props.retrieveImage(event.target.name, event.target.value)
                                            }}>Download</button> 
                                        }
                                    </td>
                                </tr>
                            )
                        }) }
                    </tbody>
                </table>
            </div>
        );
    }
}

export default Main;