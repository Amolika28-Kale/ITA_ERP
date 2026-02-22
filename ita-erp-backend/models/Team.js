const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    members: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    memberCount: {
      type: Number,
      default: 0
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for getting all employees (leader + members)
teamSchema.virtual('allEmployees').get(function() {
  const employees = [];
  if (this.leader) employees.push(this.leader);
  if (this.members && this.members.length) {
    employees.push(...this.members);
  }
  return [...new Set(employees)]; // Remove duplicates
});

// Update memberCount before save
teamSchema.pre('save', function(next) {
  this.memberCount = this.members ? this.members.length : 0;
  next();
});

module.exports = mongoose.model("Team", teamSchema);