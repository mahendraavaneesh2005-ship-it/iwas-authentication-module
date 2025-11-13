export default function healthAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader && authHeader.startsWith('Bearer ')
    ? authHeader.split(' ')[1]
    : null;
  const cookieToken = req.cookies?.iwastoken || req.cookies?.token;

  if (!bearerToken && !cookieToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
}
