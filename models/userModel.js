const mongoose = require('mongoose');
const validator = require('validator'); // using validator packAge for custom validation
bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is mandatory'],
    maxlength: [30, 'A tour Name must have <= 40 characters'],
    minlength: [3, 'A tour Name must have >= 10 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is mandatory field'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Please provide valid email']
  },
  photo: {
    type: String
  },
  password: {
    type: String,
    required: [true, 'password is required'],
    minlength: [8, 'Min length is 8 symbols'],
    select: false // will not show the password in DB as we don't need to see it !!!!!!
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Please confirm your password'],
    //only create or save
    validate: {
      validator: function(val) {
        return val === this.password;
      },
      message: 'Password confirm ({VALUE}) is incorrect'
    }
  }
});

userSchema.pre('save', async function(next) {
  // check if password was modified
  if(!this.isModified('password')) return next();
  // encrypt
  this.password = await bcrypt.hash(this.password,12);
  // remove confirm password
  this.passwordConfirm = undefined;
  next();
})

// method below will be available everywhere in userSchema
userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {

  return await bcrypt.compare(candidatePassword, userPassword);
}


const User = mongoose.model('User', userSchema);
module.exports = User;
