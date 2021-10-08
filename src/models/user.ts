import commonPasswordList from 'fxa-common-password-list';
import { Document, model, Model, Schema } from 'mongoose';
import passportLocalMongoose from 'passport-local-mongoose';

export interface IUser extends Document {
  _id?: string;
  username: string;
  password: string;
  hash: string;
  salt: string;
}

const UserSchema: Schema = new Schema({
  password: String,
  username: {
    required: true,
    type: String,
    unique: true
  }
});

/**
 * Make sure password matches requirements
 * 
 * - 6 char minimum
 * - uncommon password
 */ 
const passwordValidator = (password, cb) => {
  if (password.length < 8) {
    return cb('Password too short! Must be 6 chars in length');
  }

  if (commonPasswordList.test(password)) {
    return cb('Password is too common');
  }
  
  return cb();
};

UserSchema.plugin(passportLocalMongoose, {
  passwordValidator,
  selectFields: '_id username'
});

const User: Model<IUser> = model('User', UserSchema);

export default User;
