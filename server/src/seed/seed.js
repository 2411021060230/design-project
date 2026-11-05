// seed/seed.js
// Fills the database with lessons, quizzes and demo accounts so the website is not empty.
// Run it with:  npm run seed      (safe to run again: sample content is refreshed, not duplicated)

const env = require('../config/env');
const { connectDatabase, disconnectDatabase } = require('../config/db');
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const Lesson = require('../models/Lesson');
const ClassRoom = require('../models/ClassRoom');
const Mission = require('../models/Mission');
const { challenges, lessons } = require('./content');

const missions = [
  { title: 'Draw and label a plant cell', description: 'Draw a plant cell in your notebook, label the cell wall, nucleus, vacuole and chloroplasts, and describe what each part does.', xpReward: 40 },
  { title: 'Build a simple circuit', description: 'Use a battery, a bulb and wires to make a bulb glow. Describe what happens when you add a second battery.', xpReward: 40 },
];

// Finds an account by email or creates it. The password is only used when creating.
async function ensureUser({ name, email, role, institution }) {
  let user = await User.findOne({ email });
  if (!user) {
    user = new User({ name, email, role, institution });
    await user.setPassword('DemoPass123');
    await user.save();
  }
  return user;
}

async function run() {
  if (env.isProduction) {
    throw new Error('Seeding is for development only. Set NODE_ENV=development.');
  }
  await connectDatabase();

  // Refresh sample content (teacher-made content is left alone)
  await Lesson.deleteMany({ isSeed: true });
  await Challenge.deleteMany({ isSeed: true });
  const savedChallenges = await Challenge.insertMany(challenges.map((c) => ({ ...c, isSeed: true })));

  // Link each lesson to the quiz with the same subject, class and title
  const lessonDocs = lessons.map((lesson) => {
    const quiz = savedChallenges.find((c) => c.subject === lesson.subject && c.grade === lesson.grade && c.title === lesson.title);
    return { ...lesson, challenge: quiz?._id, isSeed: true };
  });
  await Lesson.insertMany(lessonDocs);

  const teacher = await ensureUser({ name: 'Demo Teacher', email: 'teacher@demo.edu', role: 'teacher', institution: 'Demo School' });
  const asha = await ensureUser({ name: 'Asha Rao', email: 'asha@demo.edu', role: 'student', institution: 'Demo School' });
  const ravi = await ensureUser({ name: 'Ravi Kumar', email: 'ravi@demo.edu', role: 'student', institution: 'Demo School' });

  let classRoom = await ClassRoom.findOne({ joinCode: 'SCI101' });
  if (!classRoom) {
    classRoom = await ClassRoom.create({ name: 'Class 9 Science and Maths', teacher: teacher._id, joinCode: 'SCI101' });
  }
  await ClassRoom.updateOne({ _id: classRoom._id }, { $addToSet: { students: { $each: [asha._id, ravi._id] } } });

  for (const mission of missions) {
    if (!(await Mission.exists({ classRoom: classRoom._id, title: mission.title }))) {
      await Mission.create({ ...mission, classRoom: classRoom._id, teacher: teacher._id });
    }
  }

  console.log(`Seeded ${lessons.length} lessons and ${challenges.length} quizzes (Physics, Chemistry, Biology, Maths for classes 8-10).`);
  console.log('Demo accounts (password for all: DemoPass123):');
  console.log('  Teacher: teacher@demo.edu');
  console.log('  Student: asha@demo.edu, ravi@demo.edu');
  console.log('  Class join code: SCI101');
  await disconnectDatabase();
}

run().catch(async (error) => {
  console.error('Seeding failed:', error.message);
  await disconnectDatabase().catch(() => {});
  process.exit(1);
});
