export const validateRegister = ({
  username,
  email,
  password,
}) => {
  if (!username || !email || !password) {
    throw new Error("All fields are required");
  }

  if (password.length < 6) {
    throw new Error(
      "Password must be at least 6 characters"
    );
  }

  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Invalid email");
  }
};

export const validateRole = (role) => {
  const allowedRoles = [
    "individual",
    "restaurant",
    "foodbank",
  ];

  if (!allowedRoles.includes(role)) {
    throw new Error("Invalid role");
  }
};