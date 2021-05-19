import React from 'react';
import axios from 'axios';
import { useState, useEffect } from 'react'
import Modal from "./modal"
import ModalResponse from './modalResponse';
import SuccessResponse from "./successResponse"
import ErrorResponse from "./errorResponse"
import StockListItem from './stockListItem'
import apiURL from '../services/apiURL'

function StockSection(props) {

    // VENTANAS MODALES
    const searchModalRef = React.useRef();
    const responseModalRef = React.useRef();
    const openSearchModal = () => {
        searchModalRef.current.openModal()
    };
    const openResponseModal = () => {
        responseModalRef.current.openModal()
    };
    const closeSearchModal = () => {
        setInputValue({
            byname: "",
            byStatus: "Out of stock"
        })
        searchModalRef.current.closeModal()
    };
    const closeResponseModal = () => {
        setResponse({
            error: false,
            success: false,
            msg: ""
        })
        responseModalRef.current.closeModal()
    };

    //ESTADOS
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState([])
    const [dataFiltered, setDataFiltered] = useState([])
    const [response, setResponse] = useState({
        success: false,
        error: false,
        msg: ""
    })

    //CONSIGUIENDO LA DATA DE STOCK DESDE DB
    async function getData() {
        const dataBase = await axios.get(`${apiURL}stock/`);
        setLoading(false)
        setData(dataBase.data)
        setDataFiltered(dataBase.data)
    }
    useEffect(() => {
        let token = localStorage.getItem("labToolUser");
        props.autoLogin(token)
        getData()
    }, [])

    //FILTRANDO LA DATA
    const [inputValue, setInputValue] = useState({
        byname: "",
        byStatus: "Out of stock"
    })
    const handletTypeInputChange = (event) => {
        setInputValue({
            ...inputValue,
            [event.target.name]: event.target.value
        })
    }
    const searchByName = (event) => {
        event.preventDefault();
        const name = inputValue.byname;
        setDataFiltered(data.filter(item => item.product.name.toLowerCase().includes(name)));
        document.getElementById("select").value = "Type";
        closeSearchModal()
    }
    const searchByStatus = (event) => {
        event.preventDefault();
        const status = inputValue.byStatus;
        setDataFiltered(data.filter(item => item.status === status));
        document.getElementById("select").value = "Type";
        closeSearchModal()
    }
    const searchByOrdered = (event) => {
        event.preventDefault();
        setDataFiltered(data.filter(item => item.request === true));
        document.getElementById("select").value = "Type";
        closeSearchModal()
    }
    const searchByType = (event) => {
        const type = event.target.value;
        if (type === "All") {
            setDataFiltered(data)
        } else {
            setDataFiltered(data.filter(item => item.product.type === type))
        }
    }

    return (
        <div className="gridSection grid">
            <div className="filter">
                <select id="select" name="bytype" onClick={searchByType}>
                    <option >Type</option>
                    <option value="All">Todos</option>
                    <option value="bebidas">Bebidas</option>
                    <option value="harinas">Harinas</option>
                    <option value="frutasyverduras">Frutas y Verduras</option>
                    <option value="carne">Carne</option>
                    <option value="pescado">Pescado</option>
                    <option value="prod.animal">Prod. Animal</option>
                    <option value="env-conservas">Env-Conservas</option>
                    <option value="repostería">Repostería</option>
                    <option value="dulces">Dulces</option>
                    <option value="limpieza">Limpieza</option>
                    <option value="higiene">Higiene</option>
                    <option value="gatos">Gatos</option>
                </select>
                <button className="button1" onClick={openSearchModal}>Advanced Search</button>
            </div>

            <div className="list">
                {loading ?
                    <div className="lds-default"><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div></div>
                    : dataFiltered.length > 0 ?
                        dataFiltered.map((item, index) => {
                            return <StockListItem item={item} key={index} />
                        })
                        : <p align="center">There is no item</p>
                }
            </div>


            <Modal ref={searchModalRef}>
                <div className="modalHead">
                    <h1>Advanced search</h1>
                    <button className="closeButton"onClick={closeSearchModal}><b>X</b></button>
                </div>
                <form className="form modalForm modalFormSearch">
                    <div className="searchModalInput">
                        <div>
                            <label htmlFor="byname">Search by product name</label>
                            <input type="text" name="byname" placeholder="Product name" onChange={handletTypeInputChange} />
                        </div>
                        <button className="button1" onClick={searchByName}>Search</button>
                    </div>
                    <div className="searchModalInput">
                        <div>
                            <label htmlFor="byStatus">Stock status</label>
                            <select name="byStatus" style={{width:"100%"}} onChange={handletTypeInputChange}>
                                <option value="Out of stock">Out of stock</option>
                                <option value="In stock">In stock</option>
                            </select>
                        </div>
                        <button className="button1" onClick={searchByStatus}>Search</button>
                    </div>
                    <div className="searchModalInput">
                        <div>
                            <label htmlFor="byOrdered">Order status</label>
                            <select name="byOrdered" style={{width:"100%"}} onChange={searchByType}>
                                <option>Currently ordered</option>
                            </select>
                        </div>
                        <button className="button1" onClick={searchByOrdered}>Search</button>
                    </div>
                </form>
            </Modal>
            {response.success === true &&
                <ModalResponse ref={responseModalRef} response="true">
                    <div>
                        <SuccessResponse />
                        <p>{response.msg}</p>
                        <button onClick={closeResponseModal} className="close">Close</button>
                    </div>
                </ModalResponse>
            }
            {response.error === true &&
                <ModalResponse ref={responseModalRef}>
                    <div>
                        <ErrorResponse />
                        <p>{response.msg.msg}</p>
                        <button onClick={closeResponseModal} className="close">Close</button>
                    </div>
                </ModalResponse>
            }
        </div>
    )
}

export default StockSection