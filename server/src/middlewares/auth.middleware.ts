import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  let token: string | undefined;

  try {
    // Try to get token from cookie first (more secure)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // Fallback to Authorization header for API clients
    else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: "Access denied. No token provided." 
      });
      return;
    }

    // Verify JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET not set in environment variables");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET) as any;
    
    // Verify user still exists
    const user = await User.findById(decoded._id).select("-password");
    if (!user) {
      res.status(401).json({ 
        success: false, 
        message: "Access denied. User not found." 
      });
      return;
    }

    // Attach user to request object
    (req as AuthRequest).user = {
      _id: user._id,
      email: user.email
    };
    
    next();
  } catch (err) {
    console.error("Token verification failed:", err);
    res.status(401).json({ 
      success: false, 
      message: "Access denied. Invalid token." 
    });
    return;
  }
};
