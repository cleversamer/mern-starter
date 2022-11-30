const { User } = require("../models/user/user.model");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { server } = require("../config/system");

const jwtOptions = {
  secretOrKey: process.env["JWT_PRIVATE_KEY"],
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
};

const jwtVerify = async (payload, done) => {
  try {
    // Check if user exists
    // Check if password is correct
    // Decoding user's password and comparing it with the old password
    // Check if email is correct
    // Check if phone is correct

    const user = await User.findById(payload.sub);
    const tokenPasswordSalt = payload.password.substring(user.password.length);

    const unauthorized =
      !user ||
      tokenPasswordSalt !== server.PASSWORD_SALT ||
      payload.email !== user.email ||
      payload.phone !== user.phone.full;

    return unauthorized ? done(null, false) : done(null, user);
  } catch (err) {
    done(err, false);
  }
};

const jwtStrategy = new JwtStrategy(jwtOptions, jwtVerify);

module.exports = {
  jwtStrategy,
};
