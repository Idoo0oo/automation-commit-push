import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const body = req.body;
    const { repoOwner, repoName, commitMessage, scheduledTime, patToken, filesPayload } = body;

    // Validate inputs
    if (!repoOwner || !repoName || !commitMessage || !scheduledTime || !patToken || !filesPayload) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    // Insert into MySQL via Prisma
    const newSchedule = await prisma.scheduledCommit.create({
      data: {
        repoOwner,
        repoName,
        commitMessage,
        scheduledTime: new Date(scheduledTime),
        patToken,
        filesPayload,
        status: 'PENDING',
      }
    });

    res.json({ success: true, id: newSchedule.id });
  } catch (error: any) {
    console.error("Schedule API Error:", error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
