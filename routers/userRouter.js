const express = require("express");
const {
    createAdmin,
    createUser,
    LoginUser,
    getUser,
    getCustomers,
    setCustomerBlock,
} = require("../controllers/userControllers");

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/create-admin", createAdmin);
userRouter.post("/login", LoginUser);

userRouter.get("/", getUser);

// Admin routes
userRouter.get("/customers", getCustomers);
userRouter.patch("/customers/:email/block", setCustomerBlock);

module.exports = userRouter;
