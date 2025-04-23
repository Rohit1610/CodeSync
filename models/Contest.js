import { Schema, models, model } from "mongoose";

const ContestSchema = new Schema(
  {
    users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    contestantType: {
      type: String,
      required: true,
    },
    problemList: [
      {
        type: Object,
      },
    ],
    team: {
      type: Schema.Types.ObjectId,
      ref: "Team",
    },
    contestants: [
      {
        type: String,
      },
    ],
    numberOfQuestions: {
      type: Number,
      required: true,
    },
    lowerLimit: {
      type: Number,
    },
    upperLimit: {
      type: Number,
    },
    timeLimit: {
      type: Number,
      required: true,
    },
    timeStart: {
      type: Date,
      required: true,
    },
    timeEnding: {
      type: Date,
      required: true,
    },
    distributeRandomly : {
      type : Boolean,
    },
    chooseDifficulty: {
      type: Boolean,
    },
    diffArr: [
      {
        type: Number,
      },
    ],
    startYear : {
      type : String
    }
  },
  {
    timestamps: true,
  }
);

ContestSchema.index({ timeStart : -1 })
ContestSchema.index({ contestants: 1, timeStart: -1 });


const Contest = models.Contest || model("Contest", ContestSchema);

export default Contest;
