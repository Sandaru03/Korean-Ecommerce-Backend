const express = require("express");
const {
    createUser,
    LoginUser,
    getUser,
    getCustomers,
    setCustomerBlock,
} = require("../controllers/userControllers");

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", LoginUser);

userRouter.get("/", getUser);

// Admin routes
userRouter.get("/customers", getCustomers);
userRouter.patch("/customers/:email/block", setCustomerBlock);

module.exports = userRouter;
