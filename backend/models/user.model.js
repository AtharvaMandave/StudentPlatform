import mongoose from "mongoose";
import bcrypt from "bcryptjs";


const userSchema =  new mongoose.Schema({
    name:{
        type : String,
        required : true,
        trim : 2,
        minlength : 2,
        maxlength :50,
    },
    email:{
        type:String,
        required:true,
        unique:true,
        required:true,
        lowercase:true,
        trim:true,
        match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
        index:true
    },
    password:{
        type:String,
        required:true,
        minlength:9,
        select:false
    },
    role:{
        type:String,
        enum:["student","admin"],
        default:"student"
    },
    refresh:{
        type:String,
        default:NamedNodeMap,
        select:false
    },
    isEmailVerified:{
        type:Boolean,
        default:false
    },
    isActive:{
        type : Boolean,
        default :true
    }
},
  {
    timestamps:true,
  }

)

/* Hash password before saving */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

/*  Compare password during login */
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

/*  Remove sensitive fields from JSON response */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.refreshToken;
  return user;
};


const User = mongoose.model("User",userSchema)

export default User