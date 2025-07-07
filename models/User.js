// backend/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs'; // Import bcryptjs for password hashing

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures no two users can have the same email
      lowercase: true, // Stores emails in lowercase
      trim: true, // Removes whitespace from both ends
      match: [/.+@.+\..+/, 'Please enter a valid email address'] // Basic email regex validation
    },
    password: {
      type: String,
      required: true,
    },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false, // Default to false, users are not admins by default
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Middleware to hash password before saving a user
// 'pre' hook runs before a save event
userSchema.pre('save', async function (next) {
  // 'this' refers to the user document being saved
  // Only hash the password if it's being modified (or is new)
  if (!this.isModified('password')) {       
    next(); // If password is not modified, move to the next middleware/save operation
    return;
  }

  // Generate a salt (random string) to add to the password for hashing
  const salt = await bcrypt.genSalt(10); // 10 is the number of rounds for hashing, a good balance

  // Hash the password using the generated salt
  this.password = await bcrypt.hash(this.password, salt);
  next(); // Move to the next middleware/save operation
});

// Method to compare entered password with hashed password in the database
// 'methods' allows us to add custom methods to the user schema instances
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Compare the entered plaintext password with the hashed password stored in 'this.password'
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;