import User from '../models/User';

export default async (req, res, next) => {
  const admin = await User.findOne({
    where: { id: req.userId, admin: true },
  });

  if (!admin) {
    return res.status(401).json({ error: 'Only Administrators are allowed!' });
  }

  return next();
};
