import * as authService from './auth.service.js';

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: testuser
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request
 */
export const register = async (req, res) => {
  try {
    const user = await authService.register(req.body);
    res.json({ message: `User ${user.username} registered successfully` });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logged in, tokens set in cookies
 *       401:
 *         description: Invalid credentials
 */
export const login = async (req, res) => {
  try {
    const { accessToken, refreshToken } = await authService.login(req.body);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        // secure: true, // true for HTTPS
        secure: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60, // 1h
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        // secure: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7d
      })
      .json({ message: 'Logged in' });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Token refreshed
 *       401:
 *         description: No or invalid refresh token
 */
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies.refreshToken;

    if (!token) {
      return res.status(401).json({ message: 'No refresh token' });
    }

    const { accessToken, refreshToken } = authService.refreshToken(token);

    res
      .cookie('accessToken', accessToken, {
        httpOnly: true,
        // secure: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60,
      })
      .cookie('refreshToken', refreshToken, {
        httpOnly: true,
        // secure: true,
        secure: false,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 * 7,
      })
      .json({ message: 'Token refreshed' });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
};

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: Logged out successfully
 */
export const logout = (req, res) => {
  const cookiesOptions = {
    httpOnly: true,
    // secure: true,
    secure: false,
    sameSite: 'strict',
  };

  res
    .clearCookie('accessToken', cookiesOptions)
    .clearCookie('refreshToken', cookiesOptions)
    .json({ message: 'Logged out' });
};

/**
 * @openapi
 * /auth/status:
 *   get:
 *     summary: Get current user status
 *     tags:
 *       - Auth
 *     responses:
 *       200:
 *         description: User info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     username:
 *                       type: string
 *       401:
 *         description: Not authenticated
 */
export const status = async (req, res) => {
  const user = req.user; // Set by auth middleware

  if (!user) {
    return res.status(401).json({ message: 'User is not logged in' });
  }

  const { username } = user;

  res.json({
    user: {
      username,
    },
  });
};
