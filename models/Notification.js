import { Schema , models , model } from 'mongoose'

const NotificationSchema = new Schema({
    sender : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    receiver : {
        type : Schema.Types.ObjectId,
        ref : 'User'
    },
    body : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
    },
    toAdmin : {
        type : Boolean,
        default : true,
    },
    read : {
        type : Boolean,
        default : false,
    }
},{
    timestamps : true
})

NotificationSchema.index({ receiver: 1 , read: 1 , toAdmin: 1 });
NotificationSchema.index({ receiver: 1 , toAdmin: 1 , createdAt : -1 });
NotificationSchema.index({ createdAt : -1 })

const Notification = models.Notification || model('Notification' , NotificationSchema)

export default Notification