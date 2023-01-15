const { authService, emailService } = require("../../services");
const httpStatus = require("http-status");
const { clientSchema } = require("../../models/user/user.model");
const _ = require("lodash");

module.exports.register = async (req, res, next) => {
  try {
    const {
      lang,
      role,
      email,
      password,
      name,
      phone,
      authType,
      googleToken,
      deviceToken,
    } = req.body;

    // Asking service to register a new user
    const user = await authService.register(
      email,
      password,
      name,
      phone,
      role,
      deviceToken,
      authType,
      googleToken
    );

    // Asking email service to send a register email
    // to user's email
    await emailService.sendRegisterEmail(lang, email, user);

    // TODO: send phone activation code to user's phone.

    // Create the response object
    const response = {
      user: _.pick(user, clientSchema),
      token: user.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.CREATED).json(response);
  } catch (err) {
    next(err);
  }
};

module.exports.login = async (req, res, next) => {
  try {
    const { emailOrPhone, password, deviceToken } = req.body;

    // Asking service to login a user
    const user = await authService.login(emailOrPhone, password, deviceToken);

    // Create the response object
    const response = {
      user: _.pick(user, clientSchema),
      token: user.genAuthToken(),
    };

    // Send response back to the client
    res.status(httpStatus.OK).json(response);
  } catch (err) {
    next(err);
  }
};
