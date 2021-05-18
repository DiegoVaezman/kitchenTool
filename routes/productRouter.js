const Router = require("express").Router
const Product = require("../models/product")
const protectedRoute = require("../middlewares/protectedRoute")
const {validateNumber, validateString, validateId} = require("../helpers/validations")

const router = new Router()

//obteniendo todos los productos
router.get("/", protectedRoute, (req, res) => {
    Product.find({}, function (err, products) {
        if (err) {
            res.status(400).send({ msg: err.message})
        }
        if (products.length == 0) {
            return res.status(200).send({msg: "There are no products"})
        }
        res.status(200).send(products)})
})

//agregando nuevo producto
router.post("/newproduct", protectedRoute, (req, res) => {
    try {
        let catalog_number = 1   
        const name = req.body.name
        const type = req.body.type
        const trading_house = req.body.trading_house
        const reference_number = req.body.reference_number
        const price = req.body.price
        const information = req.body.information

        
        if (!name || !price || !type) {
            return res.status(400).send({ msg: "Product name, Type and Price are required"})
        }

        validateNumber(price)
        validateString(name)

        Product.find().sort({catalog_number:-1}).limit(1)
        .then(element => {
            if (element.length > 0){
                console.log(element)
                console.log(element[0].catalog_number)
                catalog_number = element[0].catalog_number + 1
            }
        

            //Crea el producto y lo guarda en la collección de productos
            const newproduct = new Product({
                catalog_number : catalog_number,
                name : name,
                type : type,
                trading_house : trading_house,
                reference_number : reference_number,
                price : price,
                information : information
            })
            newproduct.save()
            .then(doc => res.status(201).send(doc)) 
            .catch(error => {
                res.status(400).send({msg: error.message})
            })
        })
    } catch (error) {
        res.status(400).send({ msg: error.message})
    }
})

//eliminando producto
router.delete("/deleteproduct/:id", protectedRoute,(req, res) => {
    try {
        validateId(req.params.id)

        Product.findById(req.params.id, function (err, product) {
            if (!product) {
                return res.status(400).send({ msg: "This product_id dose not exist."})
            }
            //elimina el producto de la coleccion de cproducto
            Product.deleteOne({ _id : req.params.id}, function (err, result){
                if (err) throw err;
                return res.status(200).send({msg:"Product has been deleted"});
            })
        })
    } catch (error) {
        return res.status(400).send({ msg: error.message}) 
    }
})

//modificando producto
router.put("/:id/modify", protectedRoute, (req, res) => {
    try {
        let information = req.body.information

        validateId(req.params.id)
        validateString(information)
    
        Product.findById(req.params.id, function (err, item){
            if (err) throw err;
            if (!item) {
                return res.status(400).send({ msg: "This item_id dose not exist."})
            }

            try {
            validateString(information)
            } catch (error) {
                return res.status(400).send({ msg: error.message})  
            }
            
            Product.updateOne({ _id : req.params.id}, {$set: {information : information} }, function(err, result) {
                if (err) throw err;
                return res.status(200).send({msg: "Product modified"})
            })
        })
    } catch (error) {
        return res.status(400).send({ msg: error.message})
    }
})

//obteniendo un producto por su id
router.get("/:id", protectedRoute, (req, res) => {
    try{
        validateId(req.params.id)
        Product.findById(req.params.id, function (err, item) {
            if (err) throw err;
            if (!item) {
                return res.status(400).send({ msg: "This item_id dose not exist."})
            }
            res.status(200).send(item)
        })
    } catch (error) {
        res.status(400).send({ msg: error.message})  
    }
})

module.exports = router