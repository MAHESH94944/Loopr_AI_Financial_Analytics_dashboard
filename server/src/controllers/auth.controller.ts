import { Request, Response } from "express";
import asyncHandler from "express-async-handler";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

// Input validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters long" };
  }
  if (!/(?=.*[a-z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter" };
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter" };
  }
  if (!/(?=.*\d)/.test(password)) {
    return { valid: false, message: "Password must contain at least one number" };
  }
  return { valid: true };
};

// @route   POST /api/auth/register
export const registerUser = asyncHandler(
  async (req: Request, res: Response) => {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }

    if (!validateEmail(email)) {
      res.status(400);
      throw new Error("Please provide a valid email address");
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      res.status(400);
      throw new Error(passwordValidation.message || "Invalid password");
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      res.status(409);
      throw new Error("Email already registered");
    }

    // Hash password with higher salt rounds for better security
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user with normalized email
    const user = await User.create({ 
      email: email.toLowerCase(), 
      password: hashedPassword 
    });

    res.status(201).json({
      success: true,
      data: {
        _id: String(user._id),
        email: user.email,
      },
      message: "User registered successfully"
    });
  }
);

// @route   POST /api/auth/login
export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    res.status(400);
    throw new Error("Email and password are required");
  }

  if (!validateEmail(email)) {
    res.status(400);
    throw new Error("Please provide a valid email address");
  }

  // Find user with normalized email
  const user = await User.findOne({ email: email.toLowerCase() });
  
  // Check user exists and password is correct
  if (!user || !(await bcrypt.compare(password, user.password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  // Generate JWT token
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not set in environment variables");
  }

  const token = jwt.sign(
    { _id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // Extended to 7 days for better UX
  );

  // Set secure HTTP-only cookie
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  });

  res.json({
    success: true,
    data: {
      _id: user._id,
      email: user.email,
    },
    message: "Logged in successfully"
  });
});

// @route   GET /api/auth/me
export const getMe = asyncHandler(async (req: Request, res: Response) => {
  // req.user is set by protect middleware
  const user = (req as any).user;
  if (!user) {
    res.status(401);
    throw new Error("Not authenticated");
  }
  
  res.json({
    success: true,
    data: {
      _id: user._id,
      email: user.email,
    }
  });
});

// @route   POST /api/auth/logout
export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
  });
  
  res.json({
    success: true,
    message: "Logged out successfully"
  });
});
