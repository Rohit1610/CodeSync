import { Schema , models , model } from 'mongoose'

const TeamSchema  = new Schema({
    teamName : {
        type : String,
        required : true
    },
    codeforcesHandles : [
        {
            type : String
        }
    ]
},{
    timestamps : true
})

TeamSchema.index({ teamName: 1, codeforcesHandles: 1 });
TeamSchema.index({ codeforcesHandles: 1 });

const Team = models.Team || model('Team' , TeamSchema)

export default Team