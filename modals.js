import mongoose from "mongoose";
import becrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      set: (value) => value.toLowerCase(),
    },
    password: {
      type: String,
      required: true,
    },
    profileImageURI: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save" , async function(){
   this.password = await becrypt.hash( this.password , 10 );
})

const userScheduleSchema = new mongoose.Schema(
  {
    period: {
      type: Number,
      required: true,
    },
    section: {
      type: String,
      required: true,
      set: (value) => value.toUpperCase(),
    },
    semester: {
      type: Number,
      required: true,
    },
    branch: {
      type: String,
      required: true,
      set: (value) => value.toLowerCase(),
    },
    subject: {
      type: String,
      required: true,
      set: (value) => value.toLowerCase(),
    },
    day: {
      type: String,
      required: true,
      set: (value) => value.toLowerCase(),
    },
    from_time: {
      type: String,
      required: true,
    },
    to_time: {
      type: String,
      required: true,
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const userInfoSchema = new mongoose.Schema(
  {
    original_name: {
      type: String,
      default: null,
    },
    phone_number: {
      type: Number,
      default: null,
    },
    bio: {
      type: String,
      default: null,
      set: (value) => value.toLowerCase(),
    },
    about: {
      type: String,
      default: null,
      set: (value) => value.toLowerCase(),
    },
    profession: {
      type: String,
      default: null,
      set: (value) => value.toLowerCase(),
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
const Schedule = mongoose.model("Schedule", userScheduleSchema);
const UserInfo = mongoose.model("UserInfo", userInfoSchema);

export { User, Schedule, UserInfo };
