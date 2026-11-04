// controllers/missionController.js
// Teachers assign real-world missions to a class. Students report them. Teachers approve for XP.

const mongoose = require('mongoose');
const Mission = require('../models/Mission');
const MissionSubmission = require('../models/MissionSubmission');
const ClassRoom = require('../models/ClassRoom');
const AppError = require('../utils/AppError');
const { requireString, requireObjectId, requireOneOf, requireInteger } = require('../utils/validators');
const { getTeacherClass } = require('../utils/ownership');
const { awardXp, checkBadges } = require('../services/gamification');

// POST /api/missions  (teacher)
async function createMission(req, res) {
  const body = req.body ?? {};
  const classRoom = await getTeacherClass(requireObjectId(body.classId, 'Class id'), req.user._id);
  const title = requireString(body.title, 'Title', { min: 3, max: 100 });
  const description = body.description === undefined ? '' : requireString(body.description, 'Description', { min: 0, max: 500 });
  const xpReward = requireInteger(body.xpReward ?? 30, 'XP reward', { min: 5, max: 200 });

  let dueDate;
  if (body.dueDate) {
    dueDate = new Date(body.dueDate);
    if (Number.isNaN(dueDate.getTime())) throw new AppError('Due date is not a valid date.', 400);
  }

  const mission = await Mission.create({ classRoom: classRoom._id, teacher: req.user._id, title, description, xpReward, dueDate });
  res.status(201).json({ success: true, message: 'Mission created.', data: { id: String(mission._id) } });
}

// GET /api/missions
//  teacher: missions of their classes, with the number of pending submissions
//  student: missions of classes they joined, with their own submission status
async function listMissions(req, res) {
  const isTeacher = req.user.role === 'teacher';
  const classes = isTeacher
    ? await ClassRoom.find({ teacher: req.user._id }).select('name')
    : await ClassRoom.find({ students: req.user._id }).select('name');

  const missions = await Mission.find({ classRoom: mongoose.trusted({ $in: classes.map((c) => c._id) }) })
    .sort({ createdAt: -1 })
    .populate('classRoom', 'name');
  const missionIds = missions.map((m) => m._id);

  if (isTeacher) {
    const counts = await MissionSubmission.aggregate([
      { $match: { mission: { $in: missionIds } } },
      { $group: { _id: { mission: '$mission', status: '$status' }, count: { $sum: 1 } } },
    ]);
    const countFor = (missionId, status) =>
      counts.find((c) => String(c._id.mission) === String(missionId) && c._id.status === status)?.count || 0;

    return res.json({
      success: true,
      data: {
        missions: missions.map((m) => ({
          id: String(m._id),
          title: m.title,
          description: m.description,
          xpReward: m.xpReward,
          dueDate: m.dueDate,
          className: m.classRoom?.name,
          pendingCount: countFor(m._id, 'pending'),
          approvedCount: countFor(m._id, 'approved'),
        })),
      },
    });
  }

  const mine = await MissionSubmission.find({ student: req.user._id, mission: mongoose.trusted({ $in: missionIds }) });
  const byMission = new Map(mine.map((s) => [String(s.mission), s.status]));
  res.json({
    success: true,
    data: {
      missions: missions.map((m) => ({
        id: String(m._id),
        title: m.title,
        description: m.description,
        xpReward: m.xpReward,
        dueDate: m.dueDate,
        className: m.classRoom?.name,
        myStatus: byMission.get(String(m._id)) || null,
      })),
    },
  });
}

// POST /api/missions/:id/submit  (student)  body: { note }
async function submitMission(req, res) {
  const mission = await Mission.findById(requireObjectId(req.params.id, 'Mission id'));
  if (!mission) throw new AppError('Mission not found.', 404);

  const inClass = await ClassRoom.exists({ _id: mission.classRoom, students: req.user._id });
  if (!inClass) throw new AppError('This mission is not for your classes.', 403);
  if (mission.dueDate && mission.dueDate < new Date()) throw new AppError('The due date for this mission has passed.', 400);

  const note = req.body?.note === undefined ? '' : requireString(req.body.note, 'Note', { min: 0, max: 500 });

  const existing = await MissionSubmission.findOne({ mission: mission._id, student: req.user._id });
  if (existing && existing.status !== 'rejected') {
    throw new AppError('You already submitted this mission.', 409);
  }
  if (existing) {
    // A rejected submission can be sent again
    existing.note = note;
    existing.status = 'pending';
    await existing.save();
  } else {
    await MissionSubmission.create({ mission: mission._id, student: req.user._id, note });
  }
  res.status(201).json({ success: true, message: 'Submitted. Your teacher will review it.' });
}

// GET /api/missions/:id/submissions  (teacher who owns the mission)
async function listSubmissions(req, res) {
  const mission = await Mission.findById(requireObjectId(req.params.id, 'Mission id'));
  if (!mission) throw new AppError('Mission not found.', 404);
  await getTeacherClass(mission.classRoom, req.user._id);

  const submissions = await MissionSubmission.find({ mission: mission._id }).sort({ createdAt: -1 }).populate('student', 'name email');
  res.json({
    success: true,
    data: {
      submissions: submissions.map((s) => ({
        id: String(s._id),
        studentName: s.student?.name,
        studentEmail: s.student?.email,
        note: s.note,
        status: s.status,
        submittedAt: s.updatedAt,
      })),
    },
  });
}

// PATCH /api/missions/submissions/:submissionId/review  (teacher)  body: { status: "approved" | "rejected" }
async function reviewSubmission(req, res) {
  const status = requireOneOf(req.body?.status, ['approved', 'rejected'], 'Status');
  const submission = await MissionSubmission.findById(requireObjectId(req.params.submissionId, 'Submission id')).populate('mission');
  if (!submission) throw new AppError('Submission not found.', 404);
  await getTeacherClass(submission.mission.classRoom, req.user._id);

  if (submission.status === 'approved') throw new AppError('This submission was already approved.', 400);

  submission.status = status;
  submission.reviewedAt = new Date();
  await submission.save();

  if (status === 'approved') {
    await awardXp(submission.student, submission.mission.xpReward);
    await checkBadges(submission.student);
  }
  res.json({ success: true, message: status === 'approved' ? 'Approved. XP awarded.' : 'Rejected.' });
}

module.exports = { createMission, listMissions, submitMission, listSubmissions, reviewSubmission };
