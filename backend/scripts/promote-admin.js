require('dotenv').config();
const connectDatabase = require('../db');
const User = require('../models/user');

async function main() {
  const email = String(process.argv[2] || '').trim().toLowerCase();
  if (!email) throw new Error('Usage: node scripts/promote-admin.js account@example.com');
  await connectDatabase();
  const user = await User.findOneAndUpdate(
    { email },
    { $set: { role: 'Admin', recruiterRequestStatus: 'None' } },
    { new: true }
  ).select('name role');
  if (!user) throw new Error('No account found for that email. Create the account first.');
  console.log(`Admin access enabled for ${user.name}.`);
  await require('mongoose').disconnect();
}

main().catch(async (error) => {
  console.error(error.message);
  await require('mongoose').disconnect();
  process.exitCode = 1;
});
