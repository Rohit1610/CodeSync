import { Schema , models , model } from "mongoose";

const UserSchema = new Schema({
    name : {
        type : String,
        required : true
    },
    codeforcesId : {
        type : String,
    },
    email : {
        type : String,
        required : true
    },
    image : {
        type : String,
        required : true
    }
},{
    timestamps : true
})

UserSchema.index({ email : 1 })
UserSchema.index({ codeforcesId : 1 })

const User = models.User || model('User' , UserSchema)

export default User