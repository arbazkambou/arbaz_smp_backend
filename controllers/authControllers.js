import jwt from "jsonwebtoken";
import { appError } from "../helpers/appError.js";
import { Email } from "../helpers/sendEmail.js";
import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../helpers/generateToken.js";
import crypto from "crypto";

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    //1. check if user is already registered
    const user = await User.findOne({ email: email });

    if (user) {
      if (user.status === "inactive") {
        return next(
          appError(
            "You have registered already. Please confirm your email to activate your account!",
            401
          )
        );
      } else if (user.status === "block") {
        return next(
          appError(
            "Yur account is blocked. Please contact HR to activate your account!",
            401
          )
        );
      }
      throw new Error("User is already registered");
    }

    const newUser = await User.create({ email, password, name });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "10m",
    });

    const url = `${req.protocol}://${req.get(
      "host"
    )}/api/user/confirm-email/token/${token}/user/${newUser._id}`;

    await new Email(newUser, url).sendConfirmEmail();

    res.status(201).json({
      status: true,
      message: "Please confirm your email to activate acount",
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}

export async function confirmEmail(req, res, next) {
  const { token, id } = req.params;
  try {
    jwt.verify(token, process.env.JWT_SECRET);
    await User.findByIdAndUpdate(id, { status: "active" });
    res.redirect(`${process.env.FRONTEND_ORIGIN}/login`);
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      const token = jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: "10m",
      });

      const url = `${req.protocol}://${req.get(
        "host"
      )}/api/user/confirm-email/token/${token}/user/${req.params.id}`;

      const newUser = await User.findById(req.params.id);

      await new Email(newUser, url).sendConfirmEmail();

      next(
        appError(
          "Token has been expired! Please check your email to activate your account. .",
          401,
          error
        )
      );
    } else if (error.name === "JsonWebTokenError") {
      next(appError("Invalid Token! Please login again.", 401, error));
    } else {
      next(appError("Invalid Token! Please login again.", 401, error));
    }
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(appError("Please enter email and password", 401));
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(appError("Invalid credentials!", 401));
    }

    if (user.status === "inactive") {
      return next(
        appError("Please confirm your email to activate your account", 401)
      );
    }

    if (user.status === "blocked") {
      return next(
        appError(
          "Your account is blocked. Contact admin to unblock your account",
          401
        )
      );
    }
    const token = generateToken(user._id);

    const cookieOptions = {
      maxAge: process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      secure: false, //So that it can  be sent on https connection
      sameSite: "none",
      // secure: process.env.NODE_ENV === "production", //So that it can  be sent on https connection
      httpOnly: true, //So that browser can not modified it
    };

    res.cookie("token", token, cookieOptions);

    user.token = token;

    res.status(200).json({
      status: true,
      data: user,
    });
  } catch (error) {
    return next(appError(error.message, 401));
  }
}

export async function logout(req, res, next) {
  try {
    res.clearCookie("token", {
      // maxAge: process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
      secure: process.env.NODE_ENV === "production", //So that it can only be worked on https connection
      httpOnly: true,
    });

    res.status(200).json({
      status: true,
    });
  } catch (error) {
    return next(appError(error.message, 401));
  }
}

export async function protect(req, res, next) {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies) {
      token = req.cookies.token;
    }
    if (!token) {
      return next(
        appError("You are not logged in! Please login to gain access!", 403)
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(appError("User belongs to this token does not exist!", 403));
    }

    req.user = user;

    return next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      next(appError("Token Expired! Please login again.", 401, error));
    } else if (error.name === "JsonWebTokenError") {
      next(appError("Invalid Token! Please login again.", 401, error));
    } else {
      next(appError("Invalid Token! Please login again.", 401, error));
    }
  }
}
export const restrict = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        appError("You does not have permission to do this operation", 402)
      );
    }
    next();
  };
};

export async function isAuthenticated(req, res, next) {
  let token;
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies) {
      token = req.cookies.token;
    }
    if (!token) {
      return next(
        appError("You are not logged in! Please login to gain access!", 403)
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return next(appError("User belongs to this token does not exist!", 403));
    }

    user.token = token;

    res.status(200).json({
      status: true,
      data: user,
    });
  } catch (error) {
    res.status(403).json({ status: false });
  }
}

export async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;

    if (!email) {
      return next(appError("Please enter your email", 401));
    }

    const user = await User.findOne({ email });

    if (!user) {
      return next(appError("User does not exist!", 404));
    }

    const resetToken = crypto.randomBytes(30).toString("hex");

    const encryptedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.passwordResetToken = encryptedToken;

    user.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const url = `${process.env.FRONTEND_ORIGIN}/reset-password/${resetToken}`;

    try {
      await new Email(user, url).sendForgotPassword();
    } catch (error) {
      user.passwordResetExpires = undefined;

      user.passwordResetToken = undefined;

      await user.save({ validateBeforeSave: false });

      return next(appError("Can not send email", 500));
    }

    res.status(200).json({
      status: true,
      message:
        "A verifictaion token is sent to your email. Please check your email",
    });
  } catch (error) {
    return next(appError(error.message, 401));
  }
}

export async function resetPassword(req, res, next) {
  const { password } = req.body;
  const { token } = req.params;
  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return next(
        appError(
          "Invalid token or it has been expired! Please try again for password reset",
          401
        )
      );
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: true,
      message:
        "Your password has been reset. Please login again with your new credentials!",
    });
  } catch (error) {
    return next(appError(error.message, 401, error));
  }
}
