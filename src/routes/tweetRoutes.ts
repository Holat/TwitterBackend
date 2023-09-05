import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Tweet CRUD
router.post("/", async (req, res) => {
  const { content, userId, image } = req.body;
  try {
    const result = await prisma.tweet.create({
      data: {
        content,
        image,
        userId, // Manage based on the auth user
      },
    });
    res.json(result);
  } catch (e) {
    res.status(400).json({ error: "User name or email should be unique" });
  }
});

router.get("/", async (req, res) => {
  const result = await prisma.tweet.findMany();
  res.json(result);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;
  const tweet = await prisma.tweet.findUnique({ where: { id: Number(id) } });
  if (!tweet) {
    return res.status(404).json({ error: "Tweet not found" });
  }
  res.json(tweet);
});

router.put("/:id", (req, res) => {
  const { id } = req.params;
  // const {};
  res.status(501).json({ error: "Not implemented" + id });
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  await prisma.tweet.delete({ where: { id: Number(id) } });
  res.status(501).json({ error: "Not implemented" + id });
});

export default router;
