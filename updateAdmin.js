require("dotenv").config();
const bcrypt = require("bcrypt");
const User = require("./models/user");

async function updateAdminPassword() {
  try {
    const newPassword = "Gwangju119@@";
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    
    const admin = await User.findOne({ where: { role: "admin" } });
    
    if (admin) {
      admin.password = passwordHash;
      await admin.save();
      console.log(`Admin password for ${admin.email} has been successfully updated.`);
    } else {
      console.log("No admin user found in the database. Please create an admin account first.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error updating admin password:", error);
    process.exit(1);
  }
}

updateAdminPassword();
