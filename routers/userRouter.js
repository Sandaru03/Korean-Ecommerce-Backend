const express = require("express");
const {
    createUser,
    LoginUser,
    getUser,
    getCustomers,
    setCustomerBlock,
    updateUser,
    adminOnly,
    getAllAdmins,
    createAdmin,
    deleteAdmin,
} = require("../controllers/userControllers");

const userRouter = express.Router();

userRouter.post("/", createUser);
userRouter.post("/login", LoginUser);

userRouter.get("/", getUser);
userRouter.patch("/", updateUser);

// Admin routes
userRouter.get("/customers", adminOnly, getCustomers);
userRouter.patch("/customers/:email/block", adminOnly, setCustomerBlock);

// New: Admin Management Section
userRouter.get("/admins", adminOnly, getAllAdmins);
userRouter.post("/admins", adminOnly, createAdmin);
userRouter.delete("/admins/:id", adminOnly, deleteAdmin);

module.exports = userRouter;
